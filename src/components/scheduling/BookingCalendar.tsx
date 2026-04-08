import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, ChevronLeft, ChevronRight, Clock } from "lucide-react";

type AvailSlot = {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  consultation_type: string;
  duration_minutes: number;
};

type ExistingAppt = {
  scheduled_date: string;
  start_time: string;
  end_time: string;
  status: string;
};

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const BookingCalendar = () => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<AvailSlot[]>([]);
  const [existingAppts, setExistingAppts] = useState<ExistingAppt[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string; type: string } | null>(null);

  // Booking form
  const [clientName, setClientName] = useState(user?.user_metadata?.full_name || "");
  const [clientEmail, setClientEmail] = useState(user?.email || "");
  const [notes, setNotes] = useState("");
  const [booking, setBooking] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const load = async () => {
      // Load availability for this user (or all if browsing)
      const query = user
        ? supabase.from("availability_slots").select("*").eq("user_id", user.id).eq("is_active", true)
        : supabase.from("availability_slots").select("*").eq("is_active", true);
      const { data: avail } = await query;
      setSlots((avail as any as AvailSlot[]) || []);

      // Load existing appointments to check conflicts
      if (user) {
        const { data: appts } = await supabase
          .from("appointments")
          .select("scheduled_date, start_time, end_time, status")
          .eq("engineer_id", user.id)
          .neq("status", "cancelled");
        setExistingAppts((appts as any as ExistingAppt[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d));
    return days;
  }, [currentMonth]);

  // Get available time slots for a selected date
  const timeSlots = useMemo(() => {
    if (!selectedDate) return [];
    const dow = selectedDate.getDay();
    const daySlots = slots.filter((s) => s.day_of_week === dow);
    const dateStr = selectedDate.toISOString().split("T")[0];

    const result: { start: string; end: string; type: string; available: boolean }[] = [];
    daySlots.forEach((slot) => {
      // Generate individual time blocks based on duration
      const startParts = slot.start_time.split(":").map(Number);
      const endParts = slot.end_time.split(":").map(Number);
      const startMin = startParts[0] * 60 + startParts[1];
      const endMin = endParts[0] * 60 + endParts[1];

      for (let t = startMin; t + slot.duration_minutes <= endMin; t += slot.duration_minutes) {
        const sh = Math.floor(t / 60);
        const sm = t % 60;
        const eh = Math.floor((t + slot.duration_minutes) / 60);
        const em = (t + slot.duration_minutes) % 60;
        const start = `${String(sh).padStart(2, "0")}:${String(sm).padStart(2, "0")}`;
        const end = `${String(eh).padStart(2, "0")}:${String(em).padStart(2, "0")}`;

        // Check for conflicts
        const conflict = existingAppts.some(
          (a) => a.scheduled_date === dateStr && a.start_time.slice(0, 5) === start
        );
        result.push({ start, end, type: slot.consultation_type, available: !conflict });
      }
    });

    return result;
  }, [selectedDate, slots, existingAppts]);

  const hasAvailability = (date: Date) => {
    const dow = date.getDay();
    return slots.some((s) => s.day_of_week === dow);
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const handleBook = async () => {
    if (!selectedDate || !selectedSlot || !clientName || !clientEmail || !user) return;
    setBooking(true);
    const dateStr = selectedDate.toISOString().split("T")[0];

    const { data, error } = await supabase.from("appointments").insert({
      engineer_id: user.id,
      client_name: clientName,
      client_email: clientEmail,
      scheduled_date: dateStr,
      start_time: selectedSlot.start,
      end_time: selectedSlot.end,
      consultation_type: selectedSlot.type,
      notes: notes || null,
    }).select("id").single();

    if (error) {
      toast.error(error.message);
      setBooking(false);
      return;
    }

    // Send confirmation email
    await supabase.functions.invoke("appointment-email", {
      body: { appointmentId: data.id, type: "confirmation" },
    });

    setBooking(false);
    setBooked(true);
    toast.success("Appointment booked successfully!");
  };

  if (booked) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-[18px] font-semibold text-body-text mb-2">Appointment Booked!</h3>
        <p className="text-description text-[14px] mb-4">
          A confirmation email has been sent to both you and the client.
        </p>
        <Button onClick={() => { setBooked(false); setSelectedDate(null); setSelectedSlot(null); setNotes(""); }}>
          Book Another
        </Button>
      </div>
    );
  }

  if (loading) {
    return <p className="caption-text text-[14px] py-8 text-center">Loading calendar…</p>;
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-10 h-10 text-steel mx-auto mb-3" />
        <p className="text-body-text font-medium text-[15px] mb-1">No availability set</p>
        <p className="text-description text-[14px]">
          Configure your availability in the settings above to start accepting bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Calendar Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h3 className="text-[15px] font-semibold text-body-text">
            {currentMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </h3>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
            <div key={d} className="text-center text-[12px] font-medium text-caption py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={`empty-${i}`} />;
            const isToday = date.toDateString() === new Date().toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();
            const hasSlots = hasAvailability(date);
            const past = isPast(date);

            return (
              <button
                key={date.toISOString()}
                disabled={past || !hasSlots}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                className={`aspect-square rounded-lg text-[13px] font-medium transition-colors relative
                  ${isSelected ? "bg-navy text-primary-foreground" :
                    isToday ? "bg-gold/20 text-body-text" :
                    hasSlots && !past ? "hover:bg-section-alt text-body-text cursor-pointer" :
                    "text-caption/40 cursor-not-allowed"}
                `}
              >
                {date.getDate()}
                {hasSlots && !past && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-gold rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Time Slots + Booking Form */}
      <div>
        {selectedDate ? (
          <>
            <h4 className="text-[14px] font-semibold text-body-text mb-3">
              {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </h4>
            {timeSlots.length === 0 ? (
              <p className="caption-text text-[14px]">No available time slots on this day.</p>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {timeSlots.map((slot, i) => (
                  <button
                    key={i}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-lg text-[13px] border transition-colors text-left ${
                      selectedSlot?.start === slot.start
                        ? "bg-navy text-primary-foreground border-navy"
                        : slot.available
                        ? "bg-card border-card-border hover:border-navy text-body-text"
                        : "bg-section-alt border-card-border text-caption line-through cursor-not-allowed"
                    }`}
                  >
                    <div className="font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {slot.start} – {slot.end}
                    </div>
                    <div className="text-[11px] mt-0.5 opacity-75">{slot.type}</div>
                  </button>
                ))}
              </div>
            )}

            {selectedSlot && (
              <div className="bg-section-alt border border-card-border rounded-xl p-4 space-y-3">
                <h4 className="text-[14px] font-semibold text-body-text">Book This Slot</h4>
                <div>
                  <Label className="text-[13px]">Client Name</Label>
                  <Input value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Full name" />
                </div>
                <div>
                  <Label className="text-[13px]">Client Email</Label>
                  <Input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="email@example.com" />
                </div>
                <div>
                  <Label className="text-[13px]">Notes (optional)</Label>
                  <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any details about this consultation…" rows={2} />
                </div>
                <Button onClick={handleBook} disabled={booking || !clientName || !clientEmail} className="w-full">
                  {booking ? "Booking…" : "Confirm Booking"}
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-center">
            <div>
              <Calendar className="w-8 h-8 text-steel mx-auto mb-2" />
              <p className="text-description text-[14px]">Select a date with a gold dot to see available time slots</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingCalendar;
