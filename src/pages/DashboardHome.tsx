import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import LicenseExpirationBanner from "@/components/LicenseExpirationBanner";
import SubscriptionBadge from "@/components/SubscriptionBadge";
import {
  BarChart3, Calendar, ClipboardList, DollarSign,
  FolderOpen, Users, Bot, Stamp, Gift, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useTour } from "@/components/TourProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/* ─── Real data hooks ─── */

const useDashboardData = (userId: string | undefined) => {
  const [data, setData] = useState({
    peStampCount: 0,
    referralCount: 0,
    purchaseCount: 0,
    conversationCount: 0,
    recentReferrals: [] as { month: string; count: number }[],
    recentPurchases: [] as { template_name: string; created_at: string }[],
    expiringStamps: [] as { label: string; state: string; expiration_date: string }[],
    loading: true,
  });

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const [stamps, referrals, purchases, conversations] = await Promise.all([
        supabase.from("pe_stamps").select("id, label, state, expiration_date"),
        supabase.from("referrals").select("id, created_at"),
        supabase
          .from("template_purchases")
          .select("id, template_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase.from("ai_conversations").select("id"),
      ]);

      // Build referral chart data (last 6 months)
      const now = new Date();
      const months: { month: string; count: number }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("en-US", { month: "short" });
        const count = (referrals.data || []).filter((r) => {
          const rd = new Date(r.created_at!);
          return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
        }).length;
        months.push({ month: label, count });
      }

      // Stamps expiring within 90 days
      const expiring = (stamps.data || [])
        .filter((s) => {
          const days = Math.ceil((new Date(s.expiration_date).getTime() - Date.now()) / 86400000);
          return days >= 0 && days <= 90;
        })
        .sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

      setData({
        peStampCount: stamps.data?.length ?? 0,
        referralCount: referrals.data?.length ?? 0,
        purchaseCount: purchases.data?.length ?? 0,
        conversationCount: conversations.data?.length ?? 0,
        recentReferrals: months,
        recentPurchases: (purchases.data as any[]) || [],
        expiringStamps: expiring as any[],
        loading: false,
      });
    };
    load();
  }, [userId]);

  return data;
};

/* ─── Empty Chart State ─── */
const ChartEmptyState = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 bg-section-alt rounded-2xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-[16px] font-semibold text-body-text mb-1">{title}</h3>
    <p className="description-text text-[14px] max-w-xs">{description}</p>
  </div>
);

/* ─── Main Component ─── */
const DashboardHome = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, subscription, refreshSubscription } = useAuth();
  const dashboard = useDashboardData(user?.id);
  const [showWelcomeBanner, setShowWelcomeBanner] = useState(false);
  const { startTour } = useTour();

  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      toast.success("Payment successful! Your subscription is now active.");
      if (user) {
        refreshSubscription();
      }
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, refreshSubscription, setSearchParams, user]);

  useEffect(() => {
    const welcomeFlag = location.state?.onboardingWelcome || sessionStorage.getItem("onboardingWelcome");
    if (welcomeFlag) {
      setShowWelcomeBanner(true);
      sessionStorage.removeItem("onboardingWelcome");
    }

    const tourFlag = sessionStorage.getItem("onboardingQuickTour");
    if (tourFlag) {
      startTour();
      sessionStorage.removeItem("onboardingQuickTour");
    }
  }, [location.state, startTour]);

  const greeting = user?.user_metadata?.full_name
    ? `Welcome back, ${user.user_metadata.full_name.split(" ")[0]}`
    : "Welcome back";

  return (
    <DashboardLayout title={greeting}>
      {showWelcomeBanner && (
        <div className="mb-[var(--card-gap)] rounded-3xl border border-amber-400/20 bg-amber-500/10 px-6 py-4 text-amber-100 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">Welcome aboard!</p>
              <p className="text-sm text-amber-100/80">Your workspace setup is complete and ready for use.</p>
            </div>
            <button
              type="button"
              className="text-amber-100 hover:text-white"
              onClick={() => setShowWelcomeBanner(false)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <LicenseExpirationBanner />
      <div className="mb-[var(--card-gap)]">
        <SubscriptionBadge />
      </div>


      {/* Quick Stats — real counts from Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        <DashboardCard title="PE Stamps">
          <div className="flex items-center gap-3 mt-2">
            <Stamp className="w-8 h-8 text-steel" />
            {dashboard.loading ? (
              <span className="caption-text text-[14px]">Loading…</span>
            ) : dashboard.peStampCount > 0 ? (
              <div>
                <span className="text-[28px] font-bold text-body-text font-display">{dashboard.peStampCount}</span>
                <span className="caption-text text-[13px] ml-2">license{dashboard.peStampCount !== 1 ? "s" : ""} on file</span>
              </div>
            ) : (
              <span className="caption-text text-[14px]">No stamps added yet</span>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Referrals Sent">
          <div className="flex items-center gap-3 mt-2">
            <Gift className="w-8 h-8 text-steel" />
            {dashboard.loading ? (
              <span className="caption-text text-[14px]">Loading…</span>
            ) : (
              <div>
                <span className="text-[28px] font-bold text-body-text font-display">{dashboard.referralCount}</span>
                <span className="caption-text text-[13px] ml-2">referral{dashboard.referralCount !== 1 ? "s" : ""}</span>
              </div>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Copilot Chats">
          <div className="flex items-center gap-3 mt-2">
            <Bot className="w-8 h-8 text-steel" />
            {dashboard.loading ? (
              <span className="caption-text text-[14px]">Loading…</span>
            ) : dashboard.conversationCount > 0 ? (
              <div>
                <span className="text-[28px] font-bold text-body-text font-display">{dashboard.conversationCount}</span>
                <span className="caption-text text-[13px] ml-2">conversation{dashboard.conversationCount !== 1 ? "s" : ""}</span>
              </div>
            ) : (
              <span className="caption-text text-[14px]">No conversations yet</span>
            )}
          </div>
        </DashboardCard>

        <DashboardCard title="Template Purchases">
          <div className="flex items-center gap-3 mt-2">
            <Download className="w-8 h-8 text-steel" />
            {dashboard.loading ? (
              <span className="caption-text text-[14px]">Loading…</span>
            ) : dashboard.purchaseCount > 0 ? (
              <div>
                <span className="text-[28px] font-bold text-body-text font-display">{dashboard.purchaseCount}</span>
                <span className="caption-text text-[13px] ml-2">template{dashboard.purchaseCount !== 1 ? "s" : ""}</span>
              </div>
            ) : (
              <span className="caption-text text-[14px]">No purchases yet</span>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--card-gap)]">
        {/* Referral Activity Chart */}
        <DashboardCard title="Referral Activity (Last 6 Months)">
          {dashboard.loading ? (
            <p className="caption-text text-[14px] py-8 text-center">Loading…</p>
          ) : dashboard.referralCount > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={dashboard.recentReferrals} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="count" name="Referrals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState
              icon={<Gift className="w-8 h-8 text-steel" />}
              title="No referrals yet"
              description="Share your referral link to invite other engineering firms and earn free billing credits."
            />
          )}
        </DashboardCard>

        {/* Recent Purchases */}
        <DashboardCard title="Recent Template Purchases">
          {dashboard.loading ? (
            <p className="caption-text text-[14px] py-8 text-center">Loading…</p>
          ) : dashboard.recentPurchases.length > 0 ? (
            <div className="divide-y divide-card-border">
              {dashboard.recentPurchases.map((p, i) => (
                <div key={i} className="flex items-center gap-3 py-3">
                  <Download className="w-4 h-4 text-steel flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] text-body-text font-medium truncate">{p.template_name}</p>
                    <p className="caption-text text-[12px]">
                      {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Download className="w-8 h-8 text-steel" />}
              title="No template purchases"
              description="Browse the template marketplace to purchase premium engineering calculation templates and project deliverables."
              actionLabel="Browse Templates"
              onAction={() => navigate("/templates")}
            />
          )}
        </DashboardCard>

        {/* Clients */}
        <DashboardCard title="Clients">
          <EmptyState
            icon={<Users className="w-8 h-8 text-steel" />}
            title="Manage Your Clients"
            description="Keep all client relationships, contact details, and project history in one place."
            actionLabel="View Clients"
            onAction={() => navigate("/dashboard/clients")}
          />
        </DashboardCard>

        {/* Projects */}
        <DashboardCard title="Projects">
          <EmptyState
            icon={<ClipboardList className="w-8 h-8 text-steel" />}
            title="Manage Your Projects"
            description="Track projects with tasks, milestones, and team assignments using a Kanban board or Gantt chart view."
            actionLabel="View Projects"
            onAction={() => navigate("/dashboard/projects")}
          />
        </DashboardCard>

        {/* Scheduling — feature not built yet */}
        <DashboardCard title="Upcoming Schedule">
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-steel" />}
            title="Scheduling coming soon"
            description="Set up your availability and let clients book consultations directly. This feature is currently being developed."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
