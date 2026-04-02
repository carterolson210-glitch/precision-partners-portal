import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import LicenseExpirationBanner from "@/components/LicenseExpirationBanner";
import { BarChart3, Calendar, ClipboardList, DollarSign, FolderOpen, Users } from "lucide-react";

const DashboardHome = () => {
  return (
    <DashboardLayout title="Dashboard">
      <LicenseExpirationBanner />
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        {[
          { label: "Active Projects", icon: ClipboardList, emptyText: "No projects yet" },
          { label: "Upcoming Appointments", icon: Calendar, emptyText: "No appointments" },
          { label: "Outstanding Invoices", icon: DollarSign, emptyText: "No invoices" },
          { label: "Team Members", icon: Users, emptyText: "Just you" },
        ].map((stat) => (
          <DashboardCard key={stat.label} title={stat.label}>
            <div className="flex items-center gap-3 mt-2">
              <stat.icon className="w-8 h-8 text-steel" />
              <span className="caption-text text-[14px]">{stat.emptyText}</span>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--card-gap)]">
        <DashboardCard title="Recent Projects">
          <EmptyState
            icon={<ClipboardList className="w-8 h-8 text-steel" />}
            title="No projects yet"
            description="Create your first project to start tracking tasks, milestones, and team assignments."
            actionLabel="Create Project"
            onAction={() => {}}
          />
        </DashboardCard>

        <DashboardCard title="Upcoming Schedule">
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-steel" />}
            title="No appointments scheduled"
            description="Set up your availability and share your booking link with clients to start scheduling consultations."
            actionLabel="Set Up Scheduling"
            onAction={() => {}}
          />
        </DashboardCard>

        <DashboardCard title="Recent Documents">
          <EmptyState
            icon={<FolderOpen className="w-8 h-8 text-steel" />}
            title="No documents uploaded"
            description="Upload project files, contracts, and drawings to keep everything organized in one place."
            actionLabel="Upload Documents"
            onAction={() => {}}
          />
        </DashboardCard>

        <DashboardCard title="Revenue Overview">
          <EmptyState
            icon={<BarChart3 className="w-8 h-8 text-steel" />}
            title="No revenue data yet"
            description="Once you send invoices and receive payments, your revenue metrics will appear here automatically."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
