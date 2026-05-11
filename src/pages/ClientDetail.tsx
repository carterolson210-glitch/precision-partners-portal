import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, ClipboardList, FileText, DollarSign, Phone, Mail, Users } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  project_name: string;
  client_name: string;
  status: string;
  start_date?: string;
  due_date?: string;
  estimated_value?: number;
  priority?: string;
  assigned_to?: string;
  notes?: string;
}

interface Client {
  id: string;
  name: string;
  company?: string;
  email?: string;
  phone?: string;
  address?: string;
  status: "Active" | "Prospect" | "On Hold" | "Inactive";
  notes?: string;
  created_at: string;
}

const normalizeClientId = (name: string) => {
  const trimmed = name.trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug ? `client-${slug}` : `client-${Math.random().toString(36).slice(2, 10)}`;
};

const ClientDetail = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!user || !clientId) return;
    loadClientDetail();
  }, [user, clientId]);

  const loadClientDetail = async () => {
    setLoading(true);

    const savedClients = loadSavedClients();

    try {
      const { data: projectData, error } = await supabase
        .from("projects")
        .select("id, project_name, client_name, status, start_date, due_date, estimated_value, priority, assigned_to, notes")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const projectList = (projectData || []) as Project[];
      setProjects(projectList);

      const derivedClients = projectList.reduce<Record<string, Client>>((map, project) => {
        const name = project.client_name || "Unknown client";
        const id = normalizeClientId(name);
        if (!map[id]) {
          map[id] = {
            id,
            name,
            company: "",
            email: "",
            phone: "",
            address: "",
            status: "Active",
            notes: "",
            created_at: project.start_date || new Date().toISOString(),
          };
        }
        return map;
      }, {} as Record<string, Client>);

      const allClients = [...savedClients];
      Object.values(derivedClients).forEach((derived) => {
        if (!allClients.find((item) => item.id === derived.id)) {
          allClients.push(derived);
        }
      });

      const found = allClients.find((item) => item.id === clientId);
      setClient(found || null);
    } catch (error) {
      console.error("Error loading client detail:", error);
      toast.error("Unable to load client data");
    } finally {
      setLoading(false);
    }
  };

  const loadSavedClients = (): Client[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem("precisionPortalClients");
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const relatedProjects = useMemo(() => {
    if (!client) return [];
    return projects.filter((project) => project.client_name === client.name);
  }, [client, projects]);

  const statusClass = client?.status === "Active"
    ? "bg-green-100 text-green-800"
    : client?.status === "Prospect"
      ? "bg-blue-100 text-blue-800"
      : client?.status === "On Hold"
        ? "bg-orange-100 text-orange-800"
        : "bg-slate-100 text-slate-800";

  if (loading) {
    return (
      <DashboardLayout title="Client Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading client record…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout title="Client Details">
        <div className="rounded-3xl border border-card-border bg-background p-8 text-center">
          <p className="text-lg font-semibold">Client not found</p>
          <p className="mt-3 text-sm text-muted-foreground">Check your client list or return to the client hub.</p>
          <div className="mt-6 flex justify-center">
            <Button onClick={() => navigate("/dashboard/clients")}>Back to Clients</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title={`Client: ${client.name}`}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard/clients")}> 
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-navy/5 px-3 py-1 text-sm font-semibold">{client.name}</div>
                <Badge className={statusClass}>{client.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{client.company || "No company assigned"}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/dashboard/projects`)}>View Projects</Button>
            <Button variant="outline" onClick={() => navigate(`/dashboard/projects`)}>
              Start New Project
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Contact</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="w-4 h-4" /> {client.email || "No email on file"}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Phone className="w-4 h-4" /> {client.phone || "No phone number"}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="w-4 h-4" /> {client.address || "No address provided"}</div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground"><Briefcase className="w-4 h-4" /> {client.company || "Company not set"}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Client Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Open projects</span>
                <span className="font-semibold">{relatedProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total value</span>
                <span className="font-semibold">${relatedProjects.reduce((sum, project) => sum + (project.estimated_value || 0), 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active since</span>
                <span className="font-semibold">{new Date(client.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{client.notes || "No notes yet. Add details from your client conversations, scope discussions, or billing preferences."}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="calculations">Calculations</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Client Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {client.company ? `${client.name} is currently an active ${client.status.toLowerCase()} client.` : `${client.name} is a ${client.status.toLowerCase()} relationship.`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Work</CardTitle>
                </CardHeader>
                <CardContent>
                  {relatedProjects.slice(0, 3).map((project) => (
                    <div key={project.id} className="space-y-1 py-2 border-b last:border-b-0">
                      <div className="font-medium">{project.project_name}</div>
                      <div className="text-xs text-muted-foreground">{project.status} • Due {project.due_date || "TBD"}</div>
                    </div>
                  ))}
                  {relatedProjects.length === 0 && <p className="text-sm text-muted-foreground">No active projects yet for this client.</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Next Steps</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Schedule follow ups for outstanding proposals.</p>
                  <p>Create a project estimate or upload permit documents.</p>
                  <p>Track invoicing milestones and payment windows.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>Client Projects</CardTitle>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Project</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.project_name}</TableCell>
                        <TableCell>{project.status}</TableCell>
                        <TableCell>{project.due_date || "TBD"}</TableCell>
                        <TableCell>${project.estimated_value?.toLocaleString() ?? "0"}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/projects/${project.id}`)}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {relatedProjects.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          There are no linked projects for this client yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculations">
            <Card>
              <CardHeader>
                <CardTitle>Attached Calculations</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Link saved estimates and load calculations directly to this client from the calculator workflows.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule">
            <Card>
              <CardHeader>
                <CardTitle>Schedule</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No appointments are scheduled for this client yet. Use the Scheduler to add consultations and field visits.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Upload contracts, submittals, and permit files for the client in the Documents area.
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Review invoices, track payment status, and connect billing to active projects.</div>
                <div className="flex items-center gap-2"><ClipboardList className="w-4 h-4" /> Send new proposals or convert an estimate into a billable project.</div>
                <div className="flex items-center gap-2"><Users className="w-4 h-4" /> Manage client permissions, access, and contact preferences from Settings.</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetail;
