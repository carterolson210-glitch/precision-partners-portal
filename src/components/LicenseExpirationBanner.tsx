import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const LicenseExpirationBanner = () => {
  const { user } = useAuth();
  const [warnings, setWarnings] = useState<{ label: string; state: string; days: number }[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("pe_stamps")
      .select("label, state, expiration_date")
      .then(({ data }) => {
        if (!data) return;
        const now = Date.now();
        const w = data
          .map((s) => {
            const days = Math.ceil((new Date(s.expiration_date).getTime() - now) / 86400000);
            return { label: s.label, state: s.state, days };
          })
          .filter((s) => s.days <= 90 && s.days >= 0)
          .sort((a, b) => a.days - b.days);
        setWarnings(w);
      });
  }, [user]);

  if (warnings.length === 0) return null;

  return (
    <div className="space-y-2 mb-6">
      {warnings.map((w, i) => {
        const urgent = w.days <= 7;
        const warning = w.days <= 30;
        return (
          <Alert
            key={i}
            className={
              urgent
                ? "border-destructive/50 bg-destructive/10"
                : warning
                ? "border-orange-300 bg-orange-50"
                : "border-amber-200 bg-amber-50"
            }
          >
            {urgent ? (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            ) : (
              <Clock className="h-4 w-4 text-amber-600" />
            )}
            <AlertDescription className={`text-sm ${urgent ? "text-destructive" : "text-amber-800"}`}>
              <strong>{w.label} ({w.state})</strong> — PE license expires in{" "}
              <strong>{w.days} day{w.days !== 1 ? "s" : ""}</strong>.{" "}
              <Link to="/dashboard/pe-stamps" className="underline font-medium">
                Manage stamps →
              </Link>
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
};

export default LicenseExpirationBanner;
