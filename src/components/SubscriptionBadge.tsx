import { useAuth } from "@/hooks/useAuth";
import { SUBSCRIPTION_TIERS } from "@/config/subscriptions";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { Crown, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const SubscriptionBadge = () => {
  const { subscription, refreshSubscription } = useAuth();
  const [portalLoading, setPortalLoading] = useState(false);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Failed to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  if (subscription.loading) return null;

  if (!subscription.subscribed) {
    return (
      <div className="bg-section-alt border border-card-border rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-5 h-5 text-gold" />
          <div>
            <p className="text-[14px] font-medium text-body-text">Free Plan</p>
            <p className="text-[12px] text-description">Upgrade to unlock all features</p>
          </div>
        </div>
        <Button variant="gold" size="sm" asChild>
          <Link to="/pricing">Upgrade</Link>
        </Button>
      </div>
    );
  }

  const tierConfig = subscription.tierKey ? SUBSCRIPTION_TIERS[subscription.tierKey] : null;
  const isTrialing = subscription.status === "trialing";
  const trialDaysLeft = subscription.trialEnd
    ? Math.ceil((new Date(subscription.trialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="bg-section-alt border border-card-border rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Crown className="w-5 h-5 text-gold" />
        <div>
          <p className="text-[14px] font-medium text-body-text">
            {isTrialing ? "Free Trial" : (tierConfig?.name ?? "Active")} Plan
          </p>
          {isTrialing && subscription.trialEnd && (
            <p className="text-[12px] text-description">
              {trialDaysLeft > 0 ? `${trialDaysLeft} days left` : "Trial ending soon"}
            </p>
          )}
          {!isTrialing && subscription.subscriptionEnd && (
            <p className="text-[12px] text-description">
              Renews {new Date(subscription.subscriptionEnd).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleManageSubscription}
          disabled={portalLoading}
        >
          {portalLoading ? "Loading…" : "Manage Billing"}
          <ExternalLink className="w-3 h-3 ml-1" />
        </Button>
        <Button variant="ghost" size="sm" onClick={refreshSubscription}>
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default SubscriptionBadge;
