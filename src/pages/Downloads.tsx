import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Download, FileText, CheckCircle, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Purchase {
  id: string;
  template_slug: string;
  template_name: string;
  amount_cents: number;
  status: string;
  created_at: string;
}

const Downloads = () => {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("template_purchases" as any)
        .select("id, template_slug, template_name, amount_cents, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setPurchases((data as any as Purchase[]) || []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <DashboardLayout title="Downloads">
      {loading ? (
        <p className="text-caption text-[14px]">Loading purchases…</p>
      ) : purchases.length === 0 ? (
        <DashboardCard title="Your Downloads">
          <div className="text-center py-10">
            <Package className="w-10 h-10 text-steel mx-auto mb-3" />
            <p className="text-body-text font-medium text-[15px] mb-1">No purchases yet</p>
            <p className="text-description text-[14px] mb-4">
              Browse the template marketplace to purchase premium engineering templates.
            </p>
            <Button variant="gold" asChild>
              <a href="/templates">Browse Templates</a>
            </Button>
          </div>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {purchases.map((p) => (
            <DashboardCard key={p.id} title="">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-navy/5 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-navy" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-semibold text-body-text">{p.template_name}</h3>
                    <p className="text-caption text-[13px]">
                      Purchased {new Date(p.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-[11px]">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {p.status === "completed" ? "Purchased" : p.status}
                  </Badge>
                  <span className="text-[14px] font-semibold text-body-text">
                    ${(p.amount_cents / 100).toFixed(0)}
                  </span>
                </div>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};

export default Downloads;
