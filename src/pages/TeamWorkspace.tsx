import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Users } from "lucide-react";

const TeamWorkspace = () => {
  return (
    <DashboardLayout title="Team Workspace">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--card-gap)]">
        <DashboardCard title="Team Members">
          <EmptyState
            icon={<Users className="w-8 h-8 text-steel" />}
            title="No team members yet"
            description="Invite engineers and staff to your firm account. Team members can be assigned to projects, share documents, and communicate through project-linked threads."
            actionLabel="Invite Team Member"
            onAction={() => {}}
          />
        </DashboardCard>

        <DashboardCard title="Team Activity">
          <EmptyState
            icon={<Users className="w-8 h-8 text-steel" />}
            title="No activity yet"
            description="Once your team starts working on projects, all actions — task updates, document reviews, comments, and status changes — will appear in this activity feed."
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default TeamWorkspace;
