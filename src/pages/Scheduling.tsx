import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, User, Plus, Edit, Trash2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, isToday, isFuture, startOfWeek, endOfWeek } from "date-fns";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface Schedule {
  id: string;
  client_name: string;
  project_address: string;
  job_type: 'inspection' | 'installation' | 'service_call' | 'estimate_walkthrough';
  assigned_to?: string;
  start_time: string;
  end_time: string;
  notes?: string;
  created_at: string;
}

const jobTypeColors = {
  inspection: "bg-blue-100 text-blue-800 border-blue-200",
  installation: "bg-green-100 text-green-800 border-green-200",
  service_call: "bg-orange-100 text-orange-800 border-orange-200",
  estimate_walkthrough: "bg-purple-100 text-purple-800 border-purple-200",
};

const jobTypeLabels = {
  inspection: "Inspection",
  installation: "Installation",
  service_call: "Service Call",
  estimate_walkthrough: "Estimate Walkthrough",
};

const Scheduling = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [showDialog, setShowDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);

  // Form state
  const [clientName, setClientName] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [jobType, setJobType] = useState<Schedule['job_type']>('inspection');
  const [assignedTo, setAssignedTo] = useState("");
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadSchedules();
    }
  }, [user]);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time", { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error("Error loading schedules:", error);
      toast.error("Failed to load schedules");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setClientName("");
    setProjectAddress("");
    setJobType('inspection');
    setAssignedTo("");
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setStartTime("09:00");
    setEndTime("10:00");
    setNotes("");
    setEditingSchedule(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const startDateTime = new Date(`${date}T${startTime}`);
    const endDateTime = new Date(`${date}T${endTime}`);

    if (endDateTime <= startDateTime) {
      toast.error("End time must be after start time");
      return;
    }

    setLoading(true);
    try {
      const scheduleData = {
        user_id: user.id,
        client_name: clientName,
        project_address: projectAddress,
        job_type: jobType,
        assigned_to: assignedTo || null,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString(),
        notes: notes || null,
      };

      if (editingSchedule) {
        const { error } = await supabase
          .from("schedules")
          .update(scheduleData)
          .eq("id", editingSchedule.id);

        if (error) throw error;
        toast.success("Schedule updated successfully!");
      } else {
        const { error } = await supabase
          .from("schedules")
          .insert(scheduleData);

        if (error) throw error;
        toast.success("Schedule created successfully!");
      }

      setShowDialog(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Failed to save schedule");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: Schedule) => {
    setEditingSchedule(schedule);
    setClientName(schedule.client_name);
    setProjectAddress(schedule.project_address);
    setJobType(schedule.job_type);
    setAssignedTo(schedule.assigned_to || "");
    setDate(format(parseISO(schedule.start_time), 'yyyy-MM-dd'));
    setStartTime(format(parseISO(schedule.start_time), 'HH:mm'));
    setEndTime(format(parseISO(schedule.end_time), 'HH:mm'));
    setNotes(schedule.notes || "");
    setShowDialog(true);
  };

  const handleDelete = async (scheduleId: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      const { error } = await supabase
        .from("schedules")
        .delete()
        .eq("id", scheduleId);

      if (error) throw error;
      toast.success("Schedule deleted successfully!");
      loadSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Failed to delete schedule");
    }
  };

  const calendarDays = useMemo(() => {
    if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      return eachDayOfInterval({ start: monthStart, end: monthEnd });
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      return [currentDate];
    }
  }, [currentDate, viewMode]);

  const getSchedulesForDate = (date: Date) => {
    return schedules.filter(schedule =>
      isSameDay(parseISO(schedule.start_time), date)
    );
  };

  const upcomingSchedules = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    return schedules
      .filter(schedule => {
        const scheduleDate = parseISO(schedule.start_time);
        return isFuture(scheduleDate) && scheduleDate <= nextWeek;
      })
      .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
      .slice(0, 10);
  }, [schedules]);

  const navigateDate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
    } else if (viewMode === 'week') {
      setCurrentDate(prev => {
        const days = direction === 'next' ? 7 : -7;
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + days);
        return newDate;
      });
    } else {
      setCurrentDate(prev => {
        const days = direction === 'next' ? 1 : -1;
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + days);
        return newDate;
      });
    }
  };

  return (
    <DashboardLayout title="Client Scheduling">
      <div className="space-y-6">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold">
              {format(currentDate, viewMode === 'month' ? 'MMMM yyyy' : viewMode === 'week' ? "'Week of' MMM d, yyyy" : 'MMM d, yyyy')}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border">
              {(['month', 'week', 'day'] as const).map((mode) => (
                <Button
                  key={mode}
                  variant={viewMode === mode ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode(mode)}
                  className="rounded-none first:rounded-l-lg last:rounded-r-lg"
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Button>
              ))}
            </div>

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Job
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingSchedule ? 'Edit Schedule' : 'Schedule New Job'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4">
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="projectAddress">Project Address</Label>
                      <Input
                        id="projectAddress"
                        value={projectAddress}
                        onChange={(e) => setProjectAddress(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="jobType">Job Type</Label>
                      <Select value={jobType} onValueChange={(value: Schedule['job_type']) => setJobType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="installation">Installation</SelectItem>
                          <SelectItem value="service_call">Service Call</SelectItem>
                          <SelectItem value="estimate_walkthrough">Estimate Walkthrough</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignedTo">Assigned Electrician (Optional)</Label>
                      <Input
                        id="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="Electrician name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? "Saving..." : editingSchedule ? "Update" : "Schedule"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {viewMode === 'month' ? (
                  <div className="grid grid-cols-7 gap-px bg-border">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="bg-muted p-3 text-center text-sm font-medium">
                        {day}
                      </div>
                    ))}
                    {calendarDays.map(day => {
                      const daySchedules = getSchedulesForDate(day);
                      return (
                        <div
                          key={day.toISOString()}
                          className={`bg-card min-h-[120px] p-2 ${
                            !isSameMonth(day, currentDate) ? 'bg-muted/50' : ''
                          } ${isToday(day) ? 'ring-2 ring-primary' : ''}`}
                        >
                          <div className="text-sm font-medium mb-2">
                            {format(day, 'd')}
                          </div>
                          <div className="space-y-1">
                            {daySchedules.slice(0, 3).map(schedule => (
                              <div
                                key={schedule.id}
                                className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 ${jobTypeColors[schedule.job_type]}`}
                                onClick={() => handleEdit(schedule)}
                              >
                                <div className="font-medium truncate">{schedule.client_name}</div>
                                <div className="text-xs opacity-75">
                                  {format(parseISO(schedule.start_time), 'HH:mm')}
                                </div>
                              </div>
                            ))}
                            {daySchedules.length > 3 && (
                              <div className="text-xs text-muted-foreground">
                                +{daySchedules.length - 3} more
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4">
                    {calendarDays.map(day => {
                      const daySchedules = getSchedulesForDate(day);
                      return (
                        <div key={day.toISOString()} className="mb-6">
                          <h3 className="font-semibold mb-3">
                            {format(day, 'EEEE, MMMM d, yyyy')}
                          </h3>
                          {daySchedules.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No appointments scheduled</p>
                          ) : (
                            <div className="space-y-2">
                              {daySchedules.map(schedule => (
                                <div
                                  key={schedule.id}
                                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${jobTypeColors[schedule.job_type]}`}
                                  onClick={() => handleEdit(schedule)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <div className="font-medium">{schedule.client_name}</div>
                                      <div className="text-sm opacity-75 flex items-center gap-4">
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {format(parseISO(schedule.start_time), 'HH:mm')} - {format(parseISO(schedule.end_time), 'HH:mm')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {schedule.project_address}
                                        </span>
                                        {schedule.assigned_to && (
                                          <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {schedule.assigned_to}
                                          </span>
                                        )}
                                      </div>
                                      {schedule.notes && (
                                        <div className="text-sm mt-1 opacity-75">{schedule.notes}</div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{jobTypeLabels[schedule.job_type]}</Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEdit(schedule);
                                        }}
                                      >
                                        <Edit className="w-4 h-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(schedule.id);
                                        }}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Appointments Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upcoming (7 days)</CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingSchedules.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No upcoming appointments</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingSchedules.map(schedule => (
                      <div
                        key={schedule.id}
                        className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${jobTypeColors[schedule.job_type]}`}
                        onClick={() => handleEdit(schedule)}
                      >
                        <div className="text-sm font-medium">{schedule.client_name}</div>
                        <div className="text-xs opacity-75">
                          {format(parseISO(schedule.start_time), 'MMM d, HH:mm')}
                        </div>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {jobTypeLabels[schedule.job_type]}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Scheduling;
