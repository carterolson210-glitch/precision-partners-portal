import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Calendar } from "lucide-react";

const Scheduling = () => {
  return (
    <DashboardLayout title="Client Scheduling">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--card-gap)]">
        <div className="lg:col-span-2">
          <DashboardCard title="Availability Calendar">
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-steel" />}
              title="Set Up Your Availability"
              description="Configure your working hours, consultation types, meeting durations, and buffer times. Once set up, clients can book directly from your availability calendar."
              actionLabel="Configure Availability"
              onAction={() => {}}
            />
          </DashboardCard>
        </div>
        <div>
          <DashboardCard title="Upcoming Appointments">
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-steel" />}
              title="No appointments"
              description="Booked appointments will appear here with client details, meeting type, and join link."
            />
          </DashboardCard>
        </div>
      </div>

      <div className="mt-[var(--card-gap)]">
        <DashboardCard title="Consultation Types">
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-steel" />}
            title="No consultation types configured"
            description="Define your service offerings — Initial Assessment, Site Evaluation, Feasibility Study, Contract Discussion, Progress Check-In — with duration and pricing for each."
            actionLabel="Add Consultation Type"
            onAction={() => {}}
          />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Scheduling;
