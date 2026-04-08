import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import AvailabilityManager from "@/components/scheduling/AvailabilityManager";
import BookingCalendar from "@/components/scheduling/BookingCalendar";
import AppointmentList from "@/components/scheduling/AppointmentList";

const Scheduling = () => {
  const [key, setKey] = useState(0);

  return (
    <DashboardLayout title="Client Scheduling">
      <div className="space-y-[var(--card-gap)]">
        {/* Availability Configuration */}
        <DashboardCard title="Availability Settings">
          <AvailabilityManager onSlotsChange={() => setKey((k) => k + 1)} />
        </DashboardCard>

        {/* Booking Calendar */}
        <DashboardCard title="Booking Calendar">
          <BookingCalendar key={key} />
        </DashboardCard>

        {/* Appointment List */}
        <DashboardCard title="Appointments">
          <AppointmentList />
        </DashboardCard>
      </div>
    </DashboardLayout>
  );
};

export default Scheduling;
