import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Wrench } from "lucide-react";

const LoadCalculator = () => {
  return (
    <DashboardLayout title="Structural Load Calculator">
      <DashboardCard title="Load Calculations">
        <EmptyState
          icon={<Wrench className="w-8 h-8 text-steel" />}
          title="Run Your First Calculation"
          description="Input building geometry, material properties, occupancy type, and location to calculate dead, live, wind, seismic, and snow loads per ASCE 7. Results include code-referenced load combinations downloadable as a calculation sheet."
          actionLabel="New Calculation"
          onAction={() => {}}
        />
      </DashboardCard>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Calculation History">
          <EmptyState
            icon={<Wrench className="w-8 h-8 text-steel" />}
            title="No calculations saved"
            description="Your completed load calculations will appear here, ready for review, download, or attachment to permit applications."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default LoadCalculator;
