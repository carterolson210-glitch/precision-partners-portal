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
          <div className="space-y-6">
            {/* content removed */}
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
