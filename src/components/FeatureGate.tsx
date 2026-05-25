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
          {featureName} is available on paid plans
        </h2>
        <p className="text-description max-w-md">
          Your current plan includes the core dashboard tools. Paid plans unlock advanced workflows,
          higher limits, and dedicated support. You can continue using the free plan without any pressure.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/pricing">View paid plans</Link>
          </Button>
          <Button variant="secondary" size="lg" asChild>
            <Link to="/dashboard">Return to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureGate;
