import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Gift, Bot, Download, Stamp, DollarSign } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--accent))",
  "hsl(45, 93%, 47%)",
  "hsl(142, 76%, 36%)",
];

const ChartEmptyState = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
    <div className="w-16 h-16 bg-section-alt rounded-2xl flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-[16px] font-semibold text-body-text mb-1">{title}</h3>
    <p className="description-text text-[14px] max-w-xs">{description}</p>
  </div>
);

interface InvoiceRow {
  id: string;
  total: number;
  status: string;
  created_at: string;
  paid_at: string | null;
}

const Analytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ peStamps: 0, referrals: 0, purchases: 0, conversations: 0 });
  const [referralsByMonth, setReferralsByMonth] = useState<{ month: string; count: number }[]>([]);
  const [conversationsByMonth, setConversationsByMonth] = useState<{ month: string; count: number }[]>([]);
  const [stampsByDiscipline, setStampsByDiscipline] = useState<{ name: string; value: number }[]>([]);
  const [revenueByMonth, setRevenueByMonth] = useState<{ month: string; revenue: number; count: number }[]>([]);
  const [invoiceStats, setInvoiceStats] = useState({ totalRevenue: 0, totalInvoices: 0, paidCount: 0, overdueCount: 0 });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const [stamps, referrals, purchases, conversations, invoices] = await Promise.all([
        supabase.from("pe_stamps").select("id, discipline, created_at"),
        supabase.from("referrals").select("id, created_at"),
        supabase.from("template_purchases").select("id, created_at"),
        supabase.from("ai_conversations").select("id, created_at"),
        supabase.from("invoices").select("id, total, status, created_at, paid_at"),
      ]);

      setStats({
        peStamps: stamps.data?.length ?? 0,
        referrals: referrals.data?.length ?? 0,
        purchases: purchases.data?.length ?? 0,
        conversations: conversations.data?.length ?? 0,
      });

      const invoiceData = (invoices.data || []) as InvoiceRow[];
      const paidInvoices = invoiceData.filter(i => i.status === "paid");
      setInvoiceStats({
        totalRevenue: paidInvoices.reduce((s, i) => s + i.total, 0),
        totalInvoices: invoiceData.length,
        paidCount: paidInvoices.length,
        overdueCount: invoiceData.filter(i => i.status === "overdue").length,
      });

      // Monthly trends (last 6 months)
      const now = new Date();
      const refMonths: { month: string; count: number }[] = [];
      const convMonths: { month: string; count: number }[] = [];
      const revMonths: { month: string; revenue: number; count: number }[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const label = d.toLocaleDateString("en-US", { month: "short" });

        refMonths.push({
          month: label,
          count: (referrals.data || []).filter((r) => {
            const rd = new Date(r.created_at!);
            return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
          }).length,
        });
        convMonths.push({
          month: label,
          count: (conversations.data || []).filter((c) => {
            const cd = new Date(c.created_at!);
            return cd.getMonth() === d.getMonth() && cd.getFullYear() === d.getFullYear();
          }).length,
        });

        const monthPaid = paidInvoices.filter(inv => {
          const pd = new Date(inv.paid_at || inv.created_at);
          return pd.getMonth() === d.getMonth() && pd.getFullYear() === d.getFullYear();
        });
        revMonths.push({
          month: label,
          revenue: monthPaid.reduce((s, inv) => s + inv.total, 0) / 100,
          count: monthPaid.length,
        });
      }
      setReferralsByMonth(refMonths);
      setConversationsByMonth(convMonths);
      setRevenueByMonth(revMonths);

      // PE stamps by discipline
      const discMap = new Map<string, number>();
      (stamps.data || []).forEach((s) => {
        discMap.set(s.discipline, (discMap.get(s.discipline) || 0) + 1);
      });
      setStampsByDiscipline(Array.from(discMap.entries()).map(([name, value]) => ({ name, value })));

      setLoading(false);
    };
    load();
  }, [user]);

  const totalActivity = stats.referrals + stats.conversations + stats.purchases;
  const hasReferralData = referralsByMonth.some((m) => m.count > 0);
  const hasConversationData = conversationsByMonth.some((m) => m.count > 0);
  const hasRevenueData = revenueByMonth.some((m) => m.revenue > 0);

  const metricCards = [
    { label: "Total Revenue", value: `$${(invoiceStats.totalRevenue / 100).toFixed(2)}`, icon: DollarSign, hint: "From paid invoices" },
    { label: "Invoices", value: `${invoiceStats.paidCount}/${invoiceStats.totalInvoices}`, icon: DollarSign, hint: `${invoiceStats.overdueCount} overdue` },
    { label: "PE Stamps", value: stats.peStamps, icon: Stamp, hint: "Licenses stored on your account" },
    { label: "Referrals", value: stats.referrals, icon: Gift, hint: "Total referrals you've sent" },
    { label: "Copilot Chats", value: stats.conversations, icon: Bot, hint: "AI conversations started" },
    { label: "Templates", value: stats.purchases, icon: Download, hint: "Templates in your library" },
  ];

  return (
    <DashboardLayout title="Analytics & Business Intelligence">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        {metricCards.map((m) => (
          <DashboardCard key={m.label} title={m.label}>
            {loading ? (
              <div className="mt-2"><div className="h-8 w-16 bg-section-alt rounded animate-pulse" /></div>
            ) : (
              <>
                <p className="text-[28px] font-bold text-body-text font-display mt-2">{m.value}</p>
                <p className="caption-text text-[12px] mt-1">{m.hint}</p>
              </>
            )}
          </DashboardCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--card-gap)]">
        {/* Revenue Chart */}
        <DashboardCard title="Revenue (Last 6 Months)">
          {loading ? (
            <div className="h-[220px] bg-section-alt rounded animate-pulse" />
          ) : hasRevenueData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueByMonth} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" tickFormatter={v => `$${v}`} />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, "Revenue"]}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState
              icon={<DollarSign className="w-8 h-8 text-steel" />}
              title="No revenue data yet"
              description="Your monthly revenue chart will appear here once clients start paying invoices."
            />
          )}
        </DashboardCard>

        {/* Referral Trend */}
        <DashboardCard title="Referral Trend (Last 6 Months)">
          {loading ? (
            <div className="h-[220px] bg-section-alt rounded animate-pulse" />
          ) : hasReferralData ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={referralsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
                <Bar dataKey="count" name="Referrals" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState icon={<Gift className="w-8 h-8 text-steel" />} title="No referral data yet" description="Your monthly referral trend chart will appear here once you start sharing your referral link." />
          )}
        </DashboardCard>

        {/* Copilot Usage */}
        <DashboardCard title="Copilot Usage (Last 6 Months)">
          {loading ? (
            <div className="h-[220px] bg-section-alt rounded animate-pulse" />
          ) : hasConversationData ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={conversationsByMonth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: 13 }} />
                <Line type="monotone" dataKey="count" name="Conversations" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState icon={<Bot className="w-8 h-8 text-steel" />} title="No copilot data yet" description="Your AI copilot usage trend will appear here once you start conversations with the Engineering Copilot." />
          )}
        </DashboardCard>

        {/* PE Stamps by Discipline */}
        <DashboardCard title="PE Stamps by Discipline">
          {loading ? (
            <div className="h-[220px] bg-section-alt rounded animate-pulse" />
          ) : stampsByDiscipline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={stampsByDiscipline} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value" label={({ name, value }) => `${name} (${value})`}>
                  {stampsByDiscipline.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <ChartEmptyState icon={<Stamp className="w-8 h-8 text-steel" />} title="No PE stamp data" description="Add your PE stamps to see a breakdown by engineering discipline." />
          )}
        </DashboardCard>

        {/* Platform Activity */}
        <DashboardCard title="Platform Activity Summary">
          {loading ? (
            <div className="h-[220px] bg-section-alt rounded animate-pulse" />
          ) : totalActivity > 0 ? (
            <div className="space-y-4 py-4">
              {[
                { label: "Referrals", value: stats.referrals, color: "bg-primary" },
                { label: "Copilot Chats", value: stats.conversations, color: "bg-accent" },
                { label: "Purchases", value: stats.purchases, color: "bg-accent" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-description">{item.label}</span>
                    <span className="font-medium text-body-text">{item.value}</span>
                  </div>
                  <div className="h-2 bg-section-alt rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full transition-all`} style={{ width: `${totalActivity > 0 ? (item.value / totalActivity) * 100 : 0}%` }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ChartEmptyState icon={<BarChart3 className="w-8 h-8 text-steel" />} title="No activity yet" description="Your platform activity summary will show referral, copilot, and purchase metrics as you use the platform." />
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
