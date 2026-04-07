import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

interface FeatureGateProps {
  requiredTier: number;
  featureName: string;
  children: React.ReactNode;
}

const FeatureGate = ({ requiredTier, featureName, children }: FeatureGateProps) => {
  const { subscription } = useAuth();

  if (subscription.loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <span className="text-description">Checking access…</span>
      </div>
    );
  }

  if (subscription.tierLevel < requiredTier) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-section-alt flex items-center justify-center">
          <Lock className="w-8 h-8 text-steel" />
        </div>
        <h2 className="font-display font-bold text-[24px] text-body-text">
          {featureName} Requires an Upgrade
        </h2>
        <p className="text-description max-w-md">
          This feature is available on{" "}
          {requiredTier === 2 ? "Growing Firm" : "Enterprise"} plans and above.
          Upgrade your subscription to unlock it.
        </p>
        <Button variant="gold" size="lg" asChild>
          <Link to="/pricing">View Plans & Upgrade</Link>
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
