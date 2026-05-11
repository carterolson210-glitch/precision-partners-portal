import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import {
  Plus,
  Calendar,
  User,
  MapPin,
  DollarSign,
  Edit,
  Trash2,
  ClipboardList,
  KanbanSquare,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  PauseCircle,
  PlayCircle
} from "lucide-react";
import { format, parseISO, isToday, isThisWeek, isThisMonth, addDays, differenceInDays } from "date-fns";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

interface Project {
  id: string;
  user_id: string;
  project_name: string;
  client_name: string;
  address?: string;
  job_type: 'residential' | 'commercial' | 'industrial';
  assigned_to?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'leads' | 'in_progress' | 'on_hold' | 'completed';
  start_date?: string;
  due_date?: string;
  estimated_value?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

const statusConfig = {
  leads: {
    label: "Leads",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    icon: AlertCircle,
    bgColor: "bg-blue-50"
  },
  in_progress: {
    label: "In Progress",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: PlayCircle,
    bgColor: "bg-yellow-50"
  },
  on_hold: {
    label: "On Hold",
    color: "bg-orange-100 text-orange-800 border-orange-200",
    icon: PauseCircle,
    bgColor: "bg-orange-50"
  },
  completed: {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: CheckCircle2,
    bgColor: "bg-green-50"
  }
};

const priorityConfig = {
  low: { label: "Low", color: "bg-gray-100 text-gray-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" }
};

const jobTypeConfig = {
  residential: { label: "Residential", color: "bg-blue-100 text-blue-800" },
  commercial: { label: "Commercial", color: "bg-green-100 text-green-800" },
  industrial: { label: "Industrial", color: "bg-purple-100 text-purple-800" }
};

const Projects = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'gantt' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState("");
  const [ganttFilter, setGanttFilter] = useState<'today' | 'week' | 'month'>('month');
  const [showDialog, setShowDialog] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");
  const [address, setAddress] = useState("");
  const [jobType, setJobType] = useState<Project['job_type']>('residential');
  const [assignedTo, setAssignedTo] = useState("");
  const [priority, setPriority] = useState<Project['priority']>('medium');
  const [startDate, setStartDate] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      toast.error("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProjectName("");
    setClientName("");
    setAddress("");
    setJobType('residential');
    setAssignedTo("");
    setPriority('medium');
    setStartDate("");
    setDueDate("");
    setEstimatedValue("");
    setNotes("");
    setEditingProject(null);
  };

  const filteredProjects = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return projects;
    return projects.filter((project) =>
      project.project_name.toLowerCase().includes(query) ||
      project.client_name.toLowerCase().includes(query) ||
      project.address?.toLowerCase().includes(query) ||
      project.assigned_to?.toLowerCase().includes(query)
    );
  }, [projects, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const projectData = {
        user_id: user.id,
        project_name: projectName,
        client_name: clientName,
        address: address || null,
        job_type: jobType,
        assigned_to: assignedTo || null,
        priority: priority,
        status: editingProject?.status || 'leads',
        start_date: startDate || null,
        due_date: dueDate || null,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
        notes: notes || null,
      };

      if (editingProject) {
        const { error } = await supabase
          .from("projects")
          .update(projectData)
          .eq("id", editingProject.id);

        if (error) throw error;
        toast.success("Project updated successfully!");
      } else {
        const { error } = await supabase
          .from("projects")
          .insert(projectData);

        if (error) throw error;
        toast.success("Project created successfully!");
      }

      setShowDialog(false);
      resetForm();
      loadProjects();
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setProjectName(project.project_name);
    setClientName(project.client_name);
    setAddress(project.address || "");
    setJobType(project.job_type);
    setAssignedTo(project.assigned_to || "");
    setPriority(project.priority);
    setStartDate(project.start_date || "");
    setDueDate(project.due_date || "");
    setEstimatedValue(project.estimated_value?.toString() || "");
    setNotes(project.notes || "");
    setShowDialog(true);
  };

  const handleDelete = async (projectId: string) => {
    setDeleteConfirm(projectId);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", deleteConfirm);

      if (error) throw error;
      toast.success("Project deleted successfully!");
      loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    if (source.droppableId === destination.droppableId) return;

    const newStatus = destination.droppableId as Project['status'];

    try {
      const { error } = await supabase
        .from("projects")
        .update({ status: newStatus })
        .eq("id", draggableId);

      if (error) throw error;

      setProjects(prev => prev.map(project =>
        project.id === draggableId
          ? { ...project, status: newStatus }
          : project
      ));

      toast.success(`Project moved to ${statusConfig[newStatus].label}`);
    } catch (error) {
      console.error("Error updating project status:", error);
      toast.error("Failed to update project status");
    }
  };

  const projectsByStatus = useMemo(() => {
    return {
      leads: projects.filter(p => p.status === 'leads'),
      in_progress: projects.filter(p => p.status === 'in_progress'),
      on_hold: projects.filter(p => p.status === 'on_hold'),
      completed: projects.filter(p => p.status === 'completed'),
    };
  }, [projects]);

  const ganttData = useMemo(() => {
    const today = new Date();
    let filteredProjects = projects;

    switch (ganttFilter) {
      case 'today':
        filteredProjects = projects.filter(p =>
          p.due_date && isToday(parseISO(p.due_date))
        );
        break;
      case 'week':
        filteredProjects = projects.filter(p =>
          p.due_date && isThisWeek(parseISO(p.due_date))
        );
        break;
      case 'month':
        filteredProjects = projects.filter(p =>
          p.due_date && isThisMonth(parseISO(p.due_date))
        );
        break;
    }

    return filteredProjects
      .filter(p => p.start_date && p.due_date)
      .map(project => {
        const start = parseISO(project.start_date!);
        const end = parseISO(project.due_date!);
        const duration = differenceInDays(end, start) + 1;
        const daysFromToday = differenceInDays(start, today);

        return {
          name: project.project_name,
          client: project.client_name,
          start: daysFromToday,
          duration: Math.max(duration, 1),
          status: project.status,
          priority: project.priority,
          jobType: project.job_type,
          assignedTo: project.assigned_to,
          value: project.estimated_value,
        };
      });
  }, [projects, ganttFilter]);

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      payload: {
        name: string;
        client: string;
        assignedTo?: string;
        value?: number;
      };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-muted-foreground">Client: {data.client}</p>
          <p className="text-sm text-muted-foreground">Assigned: {data.assignedTo || 'Unassigned'}</p>
          <p className="text-sm text-muted-foreground">
            Value: {data.value ? `$${data.value.toLocaleString()}` : 'Not set'}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <DashboardLayout title="Project Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading projects...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Project Management">
      <div className="space-y-6">
        {/* Header with view toggle and add button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'kanban' | 'list' | 'gantt')}>
            <TabsList>
              <TabsTrigger value="kanban" className="flex items-center gap-2">
                <KanbanSquare className="w-4 h-4" />
                Kanban Board
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4" />
                Project List
              </TabsTrigger>
              <TabsTrigger value="gantt" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Gantt Chart
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search projects, clients, or addresses"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xl"
            />
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => { resetForm(); setShowDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Project
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProject ? 'Edit Project' : 'Create New Project'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="projectName">Project Name *</Label>
                      <Input
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="clientName">Client Name *</Label>
                      <Input
                        id="clientName"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">Project Address</Label>
                    <Input
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="jobType">Job Type *</Label>
                      <Select value={jobType} onValueChange={(value: Project['job_type']) => setJobType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">Residential</SelectItem>
                          <SelectItem value="commercial">Commercial</SelectItem>
                          <SelectItem value="industrial">Industrial</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="priority">Priority *</Label>
                      <Select value={priority} onValueChange={(value: Project['priority']) => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="assignedTo">Assigned Electrician</Label>
                      <Input
                        id="assignedTo"
                        value={assignedTo}
                        onChange={(e) => setAssignedTo(e.target.value)}
                        placeholder="Electrician name"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="estimatedValue">Estimated Value ($)</Label>
                      <Input
                        id="estimatedValue"
                        type="number"
                        step="0.01"
                        value={estimatedValue}
                        onChange={(e) => setEstimatedValue(e.target.value)}
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
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
                    {loading ? "Saving..." : editingProject ? "Update Project" : "Create Project"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Kanban Board View */}
        {viewMode === 'kanban' && (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(projectsByStatus).map(([status, statusProjects]) => {
                const config = statusConfig[status as keyof typeof statusConfig];
                const Icon = config.icon;

                return (
                  <div key={status} className="space-y-4">
                    <div className={`p-4 rounded-lg ${config.bgColor} border`}>
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <h3 className="font-semibold">{config.label}</h3>
                        <Badge variant="secondary" className="ml-auto">
                          {statusProjects.length}
                        </Badge>
                      </div>
                    </div>

                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[400px] p-4 rounded-lg border-2 border-dashed transition-colors ${
                            snapshot.isDraggingOver
                              ? 'border-primary bg-primary/5'
                              : 'border-gray-200'
                          }`}
                        >
                          {statusProjects.map((project, index) => (
                            <Draggable key={project.id} draggableId={project.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`cursor-pointer transition-shadow hover:shadow-md ${
                                    snapshot.isDragging ? 'shadow-lg rotate-2' : ''
                                  }`}
                                  onClick={() => handleEdit(project)}
                                >
                                  <CardContent className="p-4">
                                    <div className="space-y-3">
                                      <div>
                                        <h4 className="font-medium text-sm line-clamp-2">
                                          {project.project_name}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {project.client_name}
                                        </p>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <Badge className={jobTypeConfig[project.job_type].color}>
                                          {jobTypeConfig[project.job_type].label}
                                        </Badge>
                                        <Badge className={priorityConfig[project.priority].color}>
                                          {priorityConfig[project.priority].label}
                                        </Badge>
                                      </div>

                                      <div className="space-y-1 text-xs text-muted-foreground">
                                        {project.due_date && (
                                          <div className="flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            Due: {format(parseISO(project.due_date), 'MMM d, yyyy')}
                                          </div>
                                        )}
                                        {project.assigned_to && (
                                          <div className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {project.assigned_to}
                                          </div>
                                        )}
                                        {project.address && (
                                          <div className="flex items-center gap-1">
                                            <MapPin className="w-3 h-3" />
                                            {project.address}
                                          </div>
                                        )}
                                        {project.estimated_value && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="w-3 h-3" />
                                            ${project.estimated_value.toLocaleString()}
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex justify-end gap-1">
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(project);
                                          }}
                                        >
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(project.id);
                                          }}
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
            </div>
          </DragDropContext>
        )}

        {/* Project List View */}
        {viewMode === 'list' && (
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Project Directory</CardTitle>
                  <p className="text-sm text-muted-foreground">Browse all projects, filter by client, and jump directly to project detail pages.</p>
                </div>
                <Input
                  placeholder="Filter projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No projects match your search. Try a different term or create a new project.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="font-medium">{project.project_name}</div>
                          <div className="text-xs text-muted-foreground">{project.address || "No address"}</div>
                        </TableCell>
                        <TableCell>{project.client_name}</TableCell>
                        <TableCell>
                          <Badge className={statusConfig[project.status].color}>{statusConfig[project.status].label}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={priorityConfig[project.priority].color}>{priorityConfig[project.priority].label}</Badge>
                        </TableCell>
                        <TableCell>{project.due_date ? format(parseISO(project.due_date), 'MMM d, yyyy') : 'TBD'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Gantt Chart View */}
        {viewMode === 'gantt' && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Project Timeline</CardTitle>
                <div className="flex gap-2">
                  {(['today', 'week', 'month'] as const).map((filter) => (
                    <Button
                      key={filter}
                      variant={ganttFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setGanttFilter(filter)}
                    >
                      {filter === 'today' ? 'Today' : filter === 'week' ? 'This Week' : 'This Month'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {ganttData.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No projects with dates in the selected timeframe
                  </p>
                </div>
              ) : (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ganttData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="name"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis label={{ value: 'Days from Today', angle: -90, position: 'insideLeft' }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar
                        dataKey="duration"
                        fill="#3b82f6"
                        name="Duration (days)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this project?</p>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Projects;
