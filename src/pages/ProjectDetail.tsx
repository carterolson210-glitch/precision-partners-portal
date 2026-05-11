import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, Clock, MapPin, FileText, DollarSign, User } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  project_name: string;
  client_name: string;
  address?: string;
  status: string;
  job_type?: string;
  assigned_to?: string;
  priority?: string;
  start_date?: string;
  due_date?: string;
  estimated_value?: number;
  notes?: string;
}

const statusStyles: Record<string, string> = {
  leads: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
};

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user || !projectId) return;
    loadProject();
  }, [user, projectId]);

  const loadProject = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name, client_name, address, status, job_type, assigned_to, priority, start_date, due_date, estimated_value, notes")
        .eq("id", projectId)
        .single();

      if (error) throw error;
      setProject(data as Project);

      const related = await supabase
        .from("projects")
        .select("id, project_name, client_name, status, due_date, estimated_value")
        .eq("client_name", (data as Project).client_name)
        .order("created_at", { ascending: false });

      if (related.error) throw related.error;
      setRelatedProjects(((related.data || []) as Project[]).filter((item) => item.id !== projectId));
    } catch (error) {
      console.error("Error loading project detail:", error);
      toast.error("Unable to load project details");
    } finally {
      setLoading(false);
    }
  };

  const statusLabel = project ? project.status.replace("_", " ") : "Unknown";

  if (loading) {
    return (
      <DashboardLayout title="Project Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading project details…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout title="Project Details">
        <div className="rounded-3xl border border-card-border bg-background p-8 text-center">
          <p className="text-lg font-semibold">Project not found</p>
          <p className="mt-3 text-sm text-muted-foreground">Please check your project list or return to the projects hub.</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/dashboard/projects")}>Back to Projects</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Project: ${project.project_name}`}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/projects")}> 
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-2xl font-bold">{project.project_name}</div>
                <Badge className={statusStyles[project.status] || "bg-slate-100 text-slate-800"}>{statusLabel}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.client_name} • {project.job_type || "General"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/dashboard/clients`)}>
              View Client
            </Button>
            <Button variant="outline" onClick={() => navigate(`/dashboard/projects`)}>
              Edit Project
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Start</div>
              <div>{project.start_date || "TBD"}</div>
              <div className="text-sm text-muted-foreground">Due</div>
              <div>{project.due_date || "TBD"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Assigned To</div>
              <div>{project.assigned_to || "Unassigned"}</div>
              <div className="text-sm text-muted-foreground">Priority</div>
              <div>{project.priority || "Medium"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Budget</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">Estimated Value</div>
              <div>${project.estimated_value?.toLocaleString() ?? "0"}</div>
              <div className="text-sm text-muted-foreground">Location</div>
              <div>{project.address || "Not provided"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="client">Client</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Project Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{project.notes || "No notes have been added to this project yet."}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Workflow</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Clock className="w-4 h-4" /> Prepare scope and permits.</div>
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule field visits and inspections.</div>
                <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Finalize deliverables and handoff documentation.</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Attach plans, contracts, reports, and permit files to keep the project record centralized.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Create invoices and link this project to proposals, estimates, and payment tracking.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="client">
            <Card>
              <CardHeader>
                <CardTitle>Client Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">Client</div>
                <div className="font-medium">{project.client_name}</div>
                <Button onClick={() => navigate("/dashboard/clients")}>Open Client Record</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Related Projects</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatedProjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      There are no other projects for this client.
                    </TableCell>
                  </TableRow>
                ) : (
                  relatedProjects.map((related) => (
                    <TableRow key={related.id}>
                      <TableCell>{related.project_name}</TableCell>
                      <TableCell>{related.status}</TableCell>
                      <TableCell>{related.due_date || "TBD"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${related.id}`)}>
                          Open
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ProjectDetail;
