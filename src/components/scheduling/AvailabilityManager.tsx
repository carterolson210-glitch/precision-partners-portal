import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Clock, Edit2 } from "lucide-react";

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const CONSULTATION_TYPES = [
  "General Consultation",
  "Initial Assessment",
  "Site Evaluation",
  "Feasibility Study",
  "Contract Discussion",
  "Progress Check-In",
  "Design Review",
];

type Slot = {
  id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  consultation_type: string;
  duration_minutes: number;
  is_active: boolean;
};

interface Props {
  onSlotsChange?: () => void;
}

const AvailabilityManager = ({ onSlotsChange }: Props) => {
  const { user } = useAuth();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSlot, setEditingSlot] = useState<Slot | null>(null);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState("1");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("17:00");
  const [consultationType, setConsultationType] = useState("General Consultation");
  const [duration, setDuration] = useState("60");

  const loadSlots = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("user_id", user.id)
      .order("day_of_week")
      .order("start_time");
    setSlots((data as any as Slot[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadSlots(); }, [loadSlots]);

  const resetForm = () => {
    setDayOfWeek("1"); setStartTime("09:00"); setEndTime("17:00");
    setConsultationType("General Consultation"); setDuration("60");
    setEditingSlot(null); setShowForm(false);
  };

  const openEdit = (slot: Slot) => {
    setEditingSlot(slot);
    setDayOfWeek(String(slot.day_of_week));
    setStartTime(slot.start_time.slice(0, 5));
    setEndTime(slot.end_time.slice(0, 5));
    setConsultationType(slot.consultation_type);
    setDuration(String(slot.duration_minutes));
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user) return;
    const slotData = {
      user_id: user.id,
      day_of_week: parseInt(dayOfWeek),
      start_time: startTime,
      end_time: endTime,
      consultation_type: consultationType,
      duration_minutes: parseInt(duration),
      updated_at: new Date().toISOString(),
    };

    if (editingSlot) {
      const { error } = await supabase.from("availability_slots").update(slotData).eq("id", editingSlot.id);
      if (error) { toast.error(error.message); return; }
      toast.success("Availability updated");
    } else {
      const { error } = await supabase.from("availability_slots").insert(slotData);
      if (error) { toast.error(error.message); return; }
      toast.success("Availability added");
    }
    resetForm();
    loadSlots();
    onSlotsChange?.();
  };

  const deleteSlot = async (id: string) => {
    await supabase.from("availability_slots").delete().eq("id", id);
    toast.success("Availability removed");
    loadSlots();
    onSlotsChange?.();
  };

  const toggleActive = async (slot: Slot) => {
    await supabase.from("availability_slots").update({ is_active: !slot.is_active }).eq("id", slot.id);
    loadSlots();
    onSlotsChange?.();
  };

  // Group by day
  const grouped = DAYS.map((name, idx) => ({
    name,
    idx,
    slots: slots.filter((s) => s.day_of_week === idx),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-description text-[14px]">
          Configure your weekly availability. Clients will only be able to book during these time windows.
        </p>
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }} className="gap-1.5">
          <Plus className="w-4 h-4" /> Add Hours
        </Button>
      </div>

      {loading ? (
        <p className="caption-text text-[14px] py-8 text-center">Loading availability…</p>
      ) : slots.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="w-10 h-10 text-steel mx-auto mb-3" />
          <p className="text-body-text font-medium text-[15px] mb-1">No availability configured</p>
          <p className="text-description text-[14px] mb-4">
            Add your working hours so clients can book consultations with you.
          </p>
          <Button onClick={() => setShowForm(true)} className="gap-1.5">
            <Plus className="w-4 h-4" /> Add Your First Time Block
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.filter((g) => g.slots.length > 0).map((g) => (
            <div key={g.idx} className="bg-section-alt border border-card-border rounded-lg p-4">
              <h4 className="text-[14px] font-semibold text-body-text mb-2">{g.name}</h4>
              <div className="space-y-2">
                {g.slots.map((slot) => (
                  <div key={slot.id} className="flex items-center justify-between bg-card rounded-lg px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[14px] font-mono text-body-text">
                        {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                      </span>
                      <Badge variant={slot.is_active ? "default" : "secondary"} className="text-[11px]">
                        {slot.consultation_type}
                      </Badge>
                      <span className="caption-text text-[12px]">{slot.duration_minutes}min</span>
                      {!slot.is_active && <Badge variant="outline" className="text-[11px] text-caption">Paused</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleActive(slot)} className="text-[12px]">
                        {slot.is_active ? "Pause" : "Resume"}
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(slot)}>
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => deleteSlot(slot.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSlot ? "Edit Availability" : "Add Availability"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Day of Week</Label>
              <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DAYS.map((d, i) => <SelectItem key={i} value={String(i)}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Consultation Type</Label>
              <Select value={consultationType} onValueChange={setConsultationType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONSULTATION_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duration (minutes)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[15, 30, 45, 60, 90, 120].map((m) => <SelectItem key={m} value={String(m)}>{m} min</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave}>{editingSlot ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AvailabilityManager;
