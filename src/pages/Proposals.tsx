import { useState, useEffect, useCallback, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FileText, Plus, Download, Send, Trash2, Loader2, Save, ArrowLeft } from "lucide-react";

interface Section {
  title: string;
  content: string;
}

interface Proposal {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  status: string;
  sections: Section[];
  firm_name: string;
  firm_email: string;
  firm_phone: string;
  firm_address: string;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

const DEFAULT_SECTIONS: Section[] = [
  { title: "Executive Summary", content: "" },
  { title: "Scope of Work", content: "" },
  { title: "Methodology", content: "" },
  { title: "Team Qualifications", content: "" },
  { title: "Timeline", content: "" },
  { title: "Fee Schedule", content: "" },
  { title: "Terms & Conditions", content: "" },
];

const statusColor = (s: string) => {
  switch (s) {
    case "sent": return "secondary";
    case "accepted": return "default";
    case "declined": return "destructive";
    default: return "outline";
  }
};

const Proposals = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Proposal | null>(null);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [sendOpen, setSendOpen] = useState(false);
  const [sendEmail, setSendEmail] = useState("");
  const [sending, setSending] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const fetchProposals = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("proposals")
      .select("*")
      .order("updated_at", { ascending: false });
    if (data) setProposals(data as unknown as Proposal[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchProposals(); }, [fetchProposals]);

  // Debounced auto-save (1.5s after last edit)
  const autoSave = useCallback(async (proposal: Proposal) => {
    if (!user) return;
    const { error } = await supabase
      .from("proposals")
      .update({
        title: proposal.title,
        client_name: proposal.client_name,
        client_email: proposal.client_email,
        sections: proposal.sections as any,
        firm_name: proposal.firm_name,
        firm_email: proposal.firm_email,
        firm_phone: proposal.firm_phone,
        firm_address: proposal.firm_address,
        logo_url: proposal.logo_url,
      })
      .eq("id", proposal.id);
    if (!error) setLastSaved(new Date());
  }, [user]);

  const scheduleAutoSave = useCallback((proposal: Proposal) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => autoSave(proposal), 1500);
  }, [autoSave]);

  const updateEditing = (updates: Partial<Proposal>) => {
    if (!editing) return;
    const updated = { ...editing, ...updates };
    setEditing(updated);
    scheduleAutoSave(updated);
  };

  const updateSection = (index: number, content: string) => {
    if (!editing) return;
    const sections = [...editing.sections];
    sections[index] = { ...sections[index], content };
    const updated = { ...editing, sections };
    setEditing(updated);
    scheduleAutoSave(updated);
  };

  const handleCreate = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // Fetch profile for firm defaults
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, email, firm_name, firm_phone, firm_address, logo_url")
        .eq("id", user.id)
        .single();

      const { data, error } = await supabase.from("proposals").insert({
        user_id: user.id,
        firm_name: (profile as any)?.firm_name || "",
        firm_email: (profile as any)?.email || user.email || "",
        firm_phone: (profile as any)?.firm_phone || "",
        firm_address: (profile as any)?.firm_address || "",
        logo_url: (profile as any)?.logo_url || null,
        sections: DEFAULT_SECTIONS as any,
      }).select().single();

      if (error) throw error;
      setEditing(data as unknown as Proposal);
      fetchProposals();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!editing) return;
    setExporting(true);
    try {
      // Force save first
      await autoSave(editing);

      const { data, error } = await supabase.functions.invoke("generate-proposal-pdf", {
        body: { proposalId: editing.id },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      // Download from signed URL
      if (data?.url) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = `${editing.title || "Proposal"}.pdf`;
        a.click();
        toast.success("PDF downloaded");
      }
    } catch (err: any) {
      toast.error(err.message || "PDF export failed");
    } finally {
      setExporting(false);
    }
  };

  const handleSend = async () => {
    if (!editing || !sendEmail) return;
    setSending(true);
    try {
      await autoSave(editing);
      await supabase.from("proposals").update({
        status: "sent",
        client_email: sendEmail,
      }).eq("id", editing.id);

      // Send via edge function
      const { data, error } = await supabase.functions.invoke("send-proposal", {
        body: { proposalId: editing.id, recipientEmail: sendEmail },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(`Proposal sent to ${sendEmail}`);
      setSendOpen(false);
      setEditing({ ...editing, status: "sent", client_email: sendEmail });
      fetchProposals();
    } catch (err: any) {
      toast.error(err.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("proposals").delete().eq("id", id);
    toast.success("Proposal deleted");
    fetchProposals();
  };

  // Editor view
  if (editing) {
    return (
      <DashboardLayout title="Proposal Builder">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" onClick={() => { setEditing(null); fetchProposals(); }}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Proposals
          </Button>
          <div className="flex items-center gap-2">
            {lastSaved && (
              <span className="text-xs text-muted-foreground">
                <Save className="w-3 h-3 inline mr-1" />
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" onClick={handleExportPDF} disabled={exporting}>
              {exporting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
              Export PDF
            </Button>
            <Button className="bg-navy text-primary-foreground hover:bg-navy/90" onClick={() => { setSendEmail(editing.client_email); setSendOpen(true); }}>
              <Send className="w-4 h-4 mr-2" /> Send to Client
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[var(--card-gap)] mb-[var(--card-gap)]">
          <DashboardCard title="Proposal Details">
            <div className="space-y-3">
              <div><Label className="text-xs">Proposal Title</Label><Input value={editing.title} onChange={e => updateEditing({ title: e.target.value })} /></div>
              <div><Label className="text-xs">Client Name</Label><Input value={editing.client_name} onChange={e => updateEditing({ client_name: e.target.value })} /></div>
              <div><Label className="text-xs">Client Email</Label><Input type="email" value={editing.client_email} onChange={e => updateEditing({ client_email: e.target.value })} /></div>
            </div>
          </DashboardCard>
          <DashboardCard title="Firm Details" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Firm Name</Label><Input value={editing.firm_name} onChange={e => updateEditing({ firm_name: e.target.value })} /></div>
              <div><Label className="text-xs">Firm Email</Label><Input value={editing.firm_email} onChange={e => updateEditing({ firm_email: e.target.value })} /></div>
              <div><Label className="text-xs">Phone</Label><Input value={editing.firm_phone} onChange={e => updateEditing({ firm_phone: e.target.value })} /></div>
              <div><Label className="text-xs">Address</Label><Input value={editing.firm_address} onChange={e => updateEditing({ firm_address: e.target.value })} /></div>
              <div className="col-span-2"><Label className="text-xs">Logo URL</Label><Input value={editing.logo_url || ""} onChange={e => updateEditing({ logo_url: e.target.value || null })} placeholder="https://... or leave blank" /></div>
            </div>
          </DashboardCard>
        </div>

        <DashboardCard title="Proposal Sections">
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="flex flex-wrap h-auto gap-1">
              {editing.sections.map((s, i) => (
                <TabsTrigger key={i} value={String(i)} className="text-xs">{s.title}</TabsTrigger>
              ))}
            </TabsList>
            {editing.sections.map((s, i) => (
              <TabsContent key={i} value={String(i)}>
                <div className="mt-3">
                  <Label className="text-sm font-semibold">{s.title}</Label>
                  <Textarea
                    className="mt-2 min-h-[300px] font-mono text-sm"
                    value={s.content}
                    onChange={e => updateSection(i, e.target.value)}
                    placeholder={`Enter ${s.title.toLowerCase()} content here…`}
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </DashboardCard>

        {/* Send Dialog */}
        <Dialog open={sendOpen} onOpenChange={setSendOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Send Proposal to Client</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Recipient Email</Label><Input type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} /></div>
              <Button onClick={handleSend} disabled={sending || !sendEmail} className="w-full bg-navy text-primary-foreground hover:bg-navy/90">
                {sending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Send Proposal"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    );
  }

  // List view
  return (
    <DashboardLayout title="Proposal Builder">
      <div className="flex items-center justify-between mb-4">
        <div />
        <Button className="bg-navy text-primary-foreground hover:bg-navy/90" onClick={handleCreate} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
          New Proposal
        </Button>
      </div>

      <DashboardCard title="Your Proposals">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-steel" /></div>
        ) : proposals.length === 0 ? (
          <EmptyState
            icon={<FileText className="w-8 h-8 text-steel" />}
            title="Create Your First Proposal"
            description="Build professional proposals with structured sections — Executive Summary, Scope of Work, Methodology, Team Qualifications, Timeline, Fee Schedule, and Terms. Export as a branded PDF with your firm's logo and contact details."
            actionLabel="New Proposal"
            onAction={handleCreate}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proposals.map(p => (
                <TableRow key={p.id} className="cursor-pointer" onClick={() => setEditing(p)}>
                  <TableCell className="font-medium">{p.title}</TableCell>
                  <TableCell>{p.client_name || <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell><Badge variant={statusColor(p.status)}>{p.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(p.updated_at).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    {p.status === "draft" && (
                      <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardCard>
    </DashboardLayout>
  );
};

export default Proposals;
