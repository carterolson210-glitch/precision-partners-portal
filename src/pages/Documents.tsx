import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { FolderOpen } from "lucide-react";

const Documents = () => {
  return (
    <DashboardLayout title="Document Vault">
      <DashboardCard title="All Documents">
        <EmptyState
          icon={<FolderOpen className="w-8 h-8 text-steel" />}
          title="No documents uploaded"
          description="Upload project files (PDF, DWG, DXF, XLSX, images) up to 50MB each. Organize by project and category — Contracts, Drawings, Reports, Invoices, Proposals. Send documents for e-signature directly from here."
          actionLabel="Upload Documents"
          onAction={() => {}}
        />
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Documents;
