import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Mail, Phone, MapPin, Briefcase, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Project {
  id: string;
  project_name: string;
  client_name: string;
  status: string;
  due_date?: string;
  priority: string;
  estimated_value?: number;
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

const CLIENT_STORAGE_KEY = "precisionPortalClients";

const normalizeClientId = (name: string) => {
  const trimmed = name.trim().toLowerCase();
  const slug = trimmed.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug ? `client-${slug}` : `client-${Math.random().toString(36).slice(2, 10)}`;
};

const statusStyles: Record<Client["status"], string> = {
  Active: "bg-green-100 text-green-800",
  Prospect: "bg-blue-100 text-blue-800",
  "On Hold": "bg-orange-100 text-orange-800",
  Inactive: "bg-slate-100 text-slate-800",
};

const Clients = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState<Client["status"]>("Active");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (!user) return;
    loadClients();
  }, [user]);

  const loadSavedClients = (): Client[] => {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(CLIENT_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const persistClients = (nextClients: Client[]) => {
    setClients(nextClients);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(nextClients));
    }
  };

  const loadClients = async () => {
    setLoading(true);
    const savedClients = loadSavedClients();

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("client_name, project_name, status, due_date, priority, estimated_value");

      const projectList = (data || []) as Project[];
      setProjects(projectList);

      const derivedClients: Client[] = projectList
        .reduce<Record<string, Client>>((result, project) => {
          if (!project.client_name) return result;
          const key = normalizeClientId(project.client_name);
          if (!result[key]) {
            result[key] = {
              id: key,
              name: project.client_name,
              company: "",
              email: "",
              phone: "",
              address: "",
              status: "Active",
              notes: "",
              created_at: project.due_date || new Date().toISOString(),
            };
          }
          return result;
        }, {} as Record<string, Client>)
        .reduce<Client[]>((acc, client) => [...acc, client], []);

      const merged = [...savedClients];
      derivedClients.forEach((client) => {
        if (!merged.find((item) => item.id === client.id)) {
          merged.push(client);
        }
      });
      persistClients(merged);
    } catch (error) {
      console.error("Error loading clients:", error);
      toast.error("Failed to load clients");
      persistClients(savedClients);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCompany("");
    setEmail("");
    setPhone("");
    setAddress("");
    setStatus("Active");
    setNotes("");
    setEditingClient(null);
  };

  const handleOpenNewClient = () => {
    resetForm();
    setShowDialog(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company || "");
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setAddress(client.address || "");
    setStatus(client.status);
    setNotes(client.notes || "");
    setShowDialog(true);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      toast.error("Client name is required");
      return;
    }

    const clientId = normalizeClientId(name);
    const nextClient: Client = {
      id: clientId,
      name: name.trim(),
      company: company.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      status,
      notes: notes.trim(),
      created_at: editingClient?.created_at || new Date().toISOString(),
    };

    const nextClients = clients.some((client) => client.id === clientId)
      ? clients.map((client) => (client.id === clientId ? nextClient : client))
      : [...clients, nextClient];

    persistClients(nextClients);
    toast.success(editingClient ? "Client updated" : "Client added");
    setShowDialog(false);
    resetForm();
  };

  const handleDelete = (clientId: string) => {
    setDeleteConfirm(clientId);
  };

  const confirmDelete = () => {
    if (!deleteConfirm) return;
    const nextClients = clients.filter((client) => client.id !== deleteConfirm);
    persistClients(nextClients);
    toast.success("Client removed");
    setDeleteConfirm(null);
  };

  const clientProjects = useMemo(() => {
    return projects.reduce<Record<string, Project[]>>((acc, project) => {
      const key = normalizeClientId(project.client_name || "");
      acc[key] = acc[key] || [];
      acc[key].push(project);
      return acc;
    }, {} as Record<string, Project[]>);
  }, [projects]);

  const filteredClients = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return clients;
    return clients.filter((client) =>
      client.name.toLowerCase().includes(query) ||
      client.company?.toLowerCase().includes(query) ||
      client.email?.toLowerCase().includes(query) ||
      client.phone?.toLowerCase().includes(query)
    );
  }, [clients, searchQuery]);

  if (loading) {
    return (
      <DashboardLayout title="Client Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-muted-foreground">Loading clients…</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Client Management">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 bg-background border border-card-border rounded-lg px-4 py-3 shadow-sm">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients, companies, email, phone"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="border-0 p-0 bg-transparent focus-visible:ring-0"
            />
          </div>
          <Button onClick={handleOpenNewClient}>
            <Plus className="w-4 h-4 mr-2" />
            New Client
          </Button>
        </div>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Active Projects</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No clients found. Add a new client to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.address || "No address"}</div>
                      </TableCell>
                      <TableCell>{client.company || <span className="text-muted-foreground">Unknown</span>}</TableCell>
                      <TableCell>
                        <Badge className={statusStyles[client.status]}>{client.status}</Badge>
                      </TableCell>
                      <TableCell>{clientProjects[client.id]?.length ?? 0}</TableCell>
                      <TableCell>
                        {client.email ? <div className="truncate">{client.email}</div> : "—"}
                        {client.phone ? <div className="text-xs text-muted-foreground">{client.phone}</div> : null}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/dashboard/clients/${client.id}`)}>
                          View
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleEditClient(client)}>
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(client.id)}>
                          <Trash2 className="w-4 h-4" />
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingClient ? "Edit Client" : "Add Client"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name *</Label>
                  <Input id="clientName" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value as Client["status"])}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Active">Active</option>
                    <option value="Prospect">Prospect</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingClient ? "Save Changes" : "Create Client"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {deleteConfirm ? (
        <Dialog open onOpenChange={(open) => !open && setDeleteConfirm(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Client</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-muted-foreground">This will remove the client from your local client registry. Projects associated with this client will remain available.</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      ) : null}
    </DashboardLayout>
  );
};

export default Clients;
