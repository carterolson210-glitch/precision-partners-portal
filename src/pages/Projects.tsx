import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { ClipboardList } from "lucide-react";

const Projects = () => {
  return (
    <DashboardLayout title="Project Management">
      {/* View toggle placeholder */}
      <div className="flex gap-2 mb-[var(--card-gap)]">
        <button className="bg-navy text-primary-foreground px-4 py-2 rounded-lg text-[14px] font-medium">
          Kanban Board
        </button>
        <button className="bg-background text-body-text border border-card-border px-4 py-2 rounded-lg text-[14px] font-medium hover:bg-section-alt transition-colors">
          Gantt Chart
        </button>
      </div>

      <DashboardCard title="Project Board">
        <EmptyState
          icon={<ClipboardList className="w-8 h-8 text-steel" />}
          title="Create Your First Project"
          description="Add a project with real tasks, assigned team members, due dates, and milestones. Your Kanban board will show projects across phases: Inquiry → Assessment → Design → Execution → Review → Completion."
          actionLabel="New Project"
          onAction={() => {}}
        />
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Projects;
