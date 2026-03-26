import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Copy, Check, Gift, Users, TrendingUp, CreditCard } from "lucide-react";
import { toast } from "sonner";

interface Referral {
  id: string;
  referred_email: string | null;
  signup_date: string | null;
  conversion_date: string | null;
  credit_applied: boolean;
}

const Referrals = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const referralLink = user
    ? `${window.location.origin}/register?ref=${user.id}`
    : "";

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("referrals")
        .select("id, referred_email, signup_date, conversion_date, credit_applied")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });
      setReferrals((data as Referral[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const totalReferrals = referrals.length;
  const totalConversions = referrals.filter((r) => r.conversion_date).length;
  const totalCredits = referrals.filter((r) => r.credit_applied).length;

  const stats = [
    { label: "Referrals Sent", value: totalReferrals, icon: Users, color: "text-navy" },
    { label: "Conversions", value: totalConversions, icon: TrendingUp, color: "text-gold" },
    { label: "Credits Earned", value: totalCredits, icon: CreditCard, color: "text-green-600" },
  ];

  return (
    <DashboardLayout title="Referral Program">
      {/* Referral link card */}
      <DashboardCard title="Your Referral Link">
        <div className="flex flex-col gap-3">
          <p className="text-description text-[14px]">
            Share your unique link with other engineering firms. When they sign up and convert to a paid plan, you earn one free month of credit on your next billing cycle.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-section-alt border border-card-border rounded-lg px-4 py-2.5 text-[14px] text-body-text font-mono truncate">
              {referralLink || "Loading…"}
            </div>
            <Button variant="gold" size="default" onClick={handleCopy} disabled={!referralLink}>
              {copied ? (
                <><Check className="w-4 h-4 mr-1.5" /> Copied</>
              ) : (
                <><Copy className="w-4 h-4 mr-1.5" /> Copy Link</>
              )}
            </Button>
          </div>
        </div>
      </DashboardCard>

      {/* Stats */}
      <div className="mt-[var(--card-gap)] grid grid-cols-1 sm:grid-cols-3 gap-[var(--card-gap)]">
        {stats.map((stat) => (
          <DashboardCard key={stat.label} title={stat.label}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-section-alt flex items-center justify-center">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <span className="text-[28px] font-bold text-body-text font-display">{stat.value}</span>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Referral history */}
      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Referral History">
          {loading ? (
            <p className="text-caption text-[14px]">Loading referrals…</p>
          ) : referrals.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="w-8 h-8 text-steel mx-auto mb-3" />
              <p className="text-body-text font-medium text-[15px] mb-1">No referrals yet</p>
              <p className="text-description text-[14px]">
                Share your referral link to start earning credits.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14px]">
                <thead>
                  <tr className="border-b border-card-border">
                    <th className="text-left py-3 font-medium text-description">Referred Email</th>
                    <th className="text-left py-3 font-medium text-description">Signup Date</th>
                    <th className="text-left py-3 font-medium text-description">Status</th>
                    <th className="text-left py-3 font-medium text-description">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((ref) => (
                    <tr key={ref.id} className="border-b border-card-border">
                      <td className="py-3 text-body-text">{ref.referred_email || "—"}</td>
                      <td className="py-3 text-body-text">
                        {ref.signup_date
                          ? new Date(ref.signup_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ref.conversion_date ? "bg-green-500" : "bg-gold"
                            }`}
                          />
                          <span className="text-body-text">
                            {ref.conversion_date ? "Converted" : "Pending"}
                          </span>
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              ref.credit_applied ? "bg-green-500" : "bg-card-border"
                            }`}
                          />
                          <span className="text-body-text">
                            {ref.credit_applied ? "Applied" : ref.conversion_date ? "Pending" : "—"}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Referrals;
