import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock,
  XCircle, RefreshCw, CheckCircle,
} from "lucide-react";

type Appointment = {
  id: string;
  engineer_id: string;
  client_name: string;
  client_email: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  consultation_type: string;
  status: string;
  notes: string | null;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  rescheduled: "bg-amber-100 text-amber-800 border-amber-200",
};

const AppointmentList = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  // Action dialogs
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadAppointments = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("appointments")
      .select("*")
      .eq("engineer_id", user.id)
      .order("scheduled_date", { ascending: true })
      .order("start_time", { ascending: true });
    setAppointments((data as any as Appointment[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadAppointments(); }, [user]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("appointments-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "appointments" }, () => {
        loadAppointments();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const today = new Date().toISOString().split("T")[0];
  const filtered = useMemo(() => {
    switch (filter) {
      case "upcoming":
        return appointments.filter((a) => a.scheduled_date >= today && a.status !== "cancelled");
      case "past":
        return appointments.filter((a) => a.scheduled_date < today && a.status !== "cancelled");
      case "cancelled":
        return appointments.filter((a) => a.status === "cancelled");
    }
  }, [appointments, filter, today]);

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({ status: "cancelled", updated_at: new Date().toISOString() })
      .eq("id", cancelTarget.id);
    if (error) { toast.error(error.message); }
    else {
      toast.success("Appointment cancelled");
      // Send cancellation email
      await supabase.functions.invoke("appointment-email", {
        body: { appointmentId: cancelTarget.id, type: "cancellation" },
      });
    }
    setCancelTarget(null);
    setActionLoading(false);
    loadAppointments();
  };

  const handleReschedule = async () => {
    if (!rescheduleTarget || !newDate || !newStartTime || !newEndTime) return;
    setActionLoading(true);
    const { error } = await supabase
      .from("appointments")
      .update({
        scheduled_date: newDate,
        start_time: newStartTime,
        end_time: newEndTime,
        status: "rescheduled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", rescheduleTarget.id);
    if (error) { toast.error(error.message); }
    else {
      toast.success("Appointment rescheduled");
      // Send reschedule email
      await supabase.functions.invoke("appointment-email", {
        body: { appointmentId: rescheduleTarget.id, type: "reschedule" },
      });
    }
    setRescheduleTarget(null);
    setActionLoading(false);
    loadAppointments();
  };

  const markComplete = async (id: string) => {
    await supabase.from("appointments").update({ status: "completed", updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("Appointment marked as completed");
    loadAppointments();
  };

  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["upcoming", "past", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-[14px] font-medium transition-colors ${
              filter === f
                ? "bg-navy text-primary-foreground"
                : "bg-background text-body-text border border-card-border hover:bg-section-alt"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="caption-text text-[14px] py-8 text-center">Loading appointments…</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <CalendarIcon className="w-10 h-10 text-steel mx-auto mb-3" />
          <p className="text-body-text font-medium text-[15px] mb-1">
            {filter === "upcoming" ? "No upcoming appointments" : filter === "past" ? "No past appointments" : "No cancelled appointments"}
          </p>
          <p className="text-description text-[14px]">
            {filter === "upcoming"
              ? "When clients book through your availability calendar, appointments will appear here."
              : "Completed and past appointments will be listed here for your records."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((apt) => (
            <div key={apt.id} className="bg-card border border-card-border rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-[15px] font-semibold text-body-text">{apt.client_name}</h4>
                    <Badge className={`text-[11px] ${STATUS_COLORS[apt.status] || ""}`}>
                      {apt.status}
                    </Badge>
                  </div>
                  <p className="text-description text-[13px]">{apt.client_email}</p>
                  <div className="flex items-center gap-4 mt-2 text-[13px] text-body-text">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5 text-steel" />
                      {new Date(apt.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-steel" />
                      {apt.start_time.slice(0, 5)} – {apt.end_time.slice(0, 5)}
                    </span>
                    <span className="caption-text">{apt.consultation_type}</span>
                  </div>
                  {apt.notes && <p className="text-description text-[13px] mt-2 italic">"{apt.notes}"</p>}
                </div>
                {apt.status === "confirmed" && (
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" className="text-[12px] gap-1" onClick={() => markComplete(apt.id)}>
                      <CheckCircle className="w-3.5 h-3.5" /> Complete
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[12px] gap-1" onClick={() => {
                      setRescheduleTarget(apt);
                      setNewDate(apt.scheduled_date);
                      setNewStartTime(apt.start_time.slice(0, 5));
                      setNewEndTime(apt.end_time.slice(0, 5));
                    }}>
                      <RefreshCw className="w-3.5 h-3.5" /> Reschedule
                    </Button>
                    <Button variant="ghost" size="sm" className="text-[12px] gap-1 text-destructive" onClick={() => setCancelTarget(apt)}>
                      <XCircle className="w-3.5 h-3.5" /> Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel dialog */}
      <Dialog open={!!cancelTarget} onOpenChange={() => setCancelTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Appointment</DialogTitle>
            <DialogDescription>
              This will cancel the appointment with {cancelTarget?.client_name} and send them a cancellation email.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelTarget(null)}>Keep</Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading}>
              {actionLoading ? "Cancelling…" : "Cancel Appointment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={() => setRescheduleTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Choose a new date and time for {rescheduleTarget?.client_name}'s appointment. They'll receive an updated confirmation email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>New Date</Label>
              <Input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={newStartTime} onChange={(e) => setNewStartTime(e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={newEndTime} onChange={(e) => setNewEndTime(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleTarget(null)}>Cancel</Button>
            <Button onClick={handleReschedule} disabled={actionLoading}>
              {actionLoading ? "Updating…" : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppointmentList;
