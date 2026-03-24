import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { BarChart3 } from "lucide-react";

const Analytics = () => {
  const metrics = [
    { label: "Active Projects", empty: "—", hint: "Start a project to track this" },
    { label: "Total Clients", empty: "—", hint: "Add clients via invoicing or scheduling" },
    { label: "Monthly Revenue", empty: "$0", hint: "Revenue appears when invoices are paid" },
    { label: "Outstanding Invoices", empty: "$0", hint: "Create and send invoices to track" },
  ];

  return (
    <DashboardLayout title="Analytics & Business Intelligence">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--card-gap)] mb-[var(--card-gap)]">
        {metrics.map((m) => (
          <DashboardCard key={m.label} title={m.label}>
            <p className="text-[32px] font-bold text-steel/40 font-display mt-2">{m.empty}</p>
            <p className="caption-text text-[12px] mt-1">{m.hint}</p>
          </DashboardCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--card-gap)]">
        <DashboardCard title="Revenue Trend">
          <EmptyState
            icon={<BarChart3 className="w-8 h-8 text-steel" />}
            title="No revenue data yet"
            description="A chart showing your monthly revenue trend will appear here once you begin receiving invoice payments through the platform."
          />
        </DashboardCard>

        <DashboardCard title="Project Performance">
          <EmptyState
            icon={<BarChart3 className="w-8 h-8 text-steel" />}
            title="No project data yet"
            description="Average project duration, on-time delivery rate, and most booked service types will populate as you manage projects on the platform."
          />
        </DashboardCard>

        <DashboardCard title="Client Retention">
          <EmptyState
            icon={<BarChart3 className="w-8 h-8 text-steel" />}
            title="No client data yet"
            description="Client retention rate and repeat engagement metrics will appear once you have active client relationships tracked in the system."
          />
        </DashboardCard>

        <DashboardCard title="Team Utilization">
          <EmptyState
            icon={<BarChart3 className="w-8 h-8 text-steel" />}
            title="No team data yet"
            description="Team utilization rates will show how much of each engineer's available time is booked across projects and consultations."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
