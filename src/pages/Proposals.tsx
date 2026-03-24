import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { FileText } from "lucide-react";

const Proposals = () => {
  return (
    <DashboardLayout title="Proposal Builder">
      <DashboardCard title="Your Proposals">
        <EmptyState
          icon={<FileText className="w-8 h-8 text-steel" />}
          title="Create Your First Proposal"
          description="Build professional proposals with structured sections — Executive Summary, Scope of Work, Methodology, Team Qualifications, Timeline, Fee Schedule, and Terms. Export as a branded PDF with your firm's logo and contact details."
          actionLabel="New Proposal"
          onAction={() => {}}
        />
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Proposals;
