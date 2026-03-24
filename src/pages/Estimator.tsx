import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Calculator } from "lucide-react";

const Estimator = () => {
  return (
    <DashboardLayout title="Project Estimator">
      <DashboardCard title="Cost Estimation">
        <EmptyState
          icon={<Calculator className="w-8 h-8 text-steel" />}
          title="Create Your First Estimate"
          description="Input real project parameters — type, location, materials, labor rates, equipment, and contingency — to generate an itemized cost breakdown exportable as a PDF proposal."
          actionLabel="New Estimate"
          onAction={() => {}}
        />
      </DashboardCard>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Saved Estimates">
          <EmptyState
            icon={<Calculator className="w-8 h-8 text-steel" />}
            title="No saved estimates"
            description="Your completed estimates will appear here. Each estimate can be downloaded as a PDF or sent directly to a client."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Estimator;
