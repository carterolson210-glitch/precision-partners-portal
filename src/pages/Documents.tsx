import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import DashboardCard from "@/components/DashboardCard";
import EmptyState from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { FolderOpen, Upload, Download, FileSignature, Trash2, Loader2 } from "lucide-react";

const CATEGORIES = ["Contracts", "Drawings", "Reports", "Invoices", "Proposals", "Other"];

interface DocumentRow {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  storage_path: string;
  category: string;
  signature_status: string;
  created_at: string;
}


const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [signOpen, setSignOpen] = useState(false);
  const [signDocId, setSignDocId] = useState<string | null>(null);
  const [signerName, setSignerName] = useState("");
  const [signerEmail, setSignerEmail] = useState("");
  const [sendingSign, setSendingSign] = useState(false);
  const [category, setCategory] = useState("Other");

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setDocuments(data as DocumentRow[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 50 * 1024 * 1024) {
          toast.error(`${file.name} exceeds 50MB limit`);
          continue;
        }
        const path = `${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
        if (uploadError) { toast.error(`Upload failed: ${uploadError.message}`); continue; }

        const { error: dbError } = await supabase.from("documents").insert({
          file_name: file.name,
          file_type: file.type || "application/octet-stream",
          file_size: file.size,
          storage_path: path,
          category,
          uploaded_by: user.id,
        });
        if (dbError) { toast.error(`Record failed: ${dbError.message}`); continue; }
      }
      toast.success("Files uploaded successfully");
      setUploadOpen(false);
      fetchDocuments();
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (doc: DocumentRow) => {
    const { data, error } = await supabase.storage.from("documents").createSignedUrl(doc.storage_path, 60);
    if (error || !data?.signedUrl) { toast.error("Download failed"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.download = doc.file_name;
    a.click();
  };

  const handleDelete = async (doc: DocumentRow) => {
    await supabase.storage.from("documents").remove([doc.storage_path]);
    await supabase.from("documents").delete().eq("id", doc.id);
    toast.success("Document deleted");
    fetchDocuments();
  };

  const handleSendForSignature = async () => {
    if (!signDocId || !signerEmail || !signerName) return;
    setSendingSign(true);
    try {
      const { error } = await supabase.from("document_signatures").insert({
        document_id: signDocId,
        signer_email: signerEmail,
        signer_name: signerName,
      });
      if (error) throw error;

      await supabase.from("documents").update({ signature_status: "pending" }).eq("id", signDocId);

      // Send signing request email via edge function
      await supabase.functions.invoke("document-signature-email", {
        body: { documentId: signDocId, signerEmail, signerName, action: "request" },
      });

      toast.success(`Signing request sent to ${signerEmail}`);
      setSignOpen(false);
      setSignerName("");
      setSignerEmail("");
      fetchDocuments();
    } catch (err: any) {
      toast.error(err.message || "Failed to send signing request");
    } finally {
      setSendingSign(false);
    }
  };

  const sigStatusColor = (s: string) => {
    if (s === "signed") return "default";
    if (s === "pending") return "secondary";
    return "outline";
  };

  return (
    <DashboardLayout title="Document Vault">
      <div className="flex items-center justify-between mb-6">
        <p className="description-text text-sm">Upload, manage, and send documents for e-signature.</p>
        <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
          <DialogTrigger asChild>
            <Button className="bg-navy text-primary-foreground hover:bg-navy/90">
              <Upload className="w-4 h-4 mr-2" /> Upload Documents
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload Documents</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Files (max 50MB each)</Label>
                <Input type="file" multiple onChange={handleUpload} disabled={uploading} accept=".pdf,.dwg,.dxf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg,.svg" />
              </div>
              {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Uploading…</div>}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <DashboardCard title="All Documents">
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-steel" /></div>
        ) : documents.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-8 h-8 text-steel" />}
            title="No documents uploaded"
            description="Upload project files (PDF, DWG, DXF, XLSX, images) up to 50MB each. Organize by project and category — Contracts, Drawings, Reports, Invoices, Proposals. Send documents for e-signature directly from here."
            actionLabel="Upload Documents"
            onAction={() => setUploadOpen(true)}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Signature</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.file_name}</TableCell>
                  <TableCell><Badge variant="outline">{doc.category}</Badge></TableCell>
                  <TableCell>{formatSize(doc.file_size)}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                  <TableCell><Badge variant={sigStatusColor(doc.signature_status)}>{doc.signature_status}</Badge></TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => handleDownload(doc)} title="Download">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => { setSignDocId(doc.id); setSignOpen(true); }} title="Send for signature">
                      <FileSignature className="w-4 h-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(doc)} title="Delete">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DashboardCard>

      {/* Send for Signature Dialog */}
      <Dialog open={signOpen} onOpenChange={setSignOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Send for E-Signature</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Signer Name</Label><Input value={signerName} onChange={e => setSignerName(e.target.value)} placeholder="Enter signer name" /></div>
            <div><Label>Signer Email</Label><Input type="email" value={signerEmail} onChange={e => setSignerEmail(e.target.value)} placeholder="Enter signer email" /></div>
            <Button onClick={handleSendForSignature} disabled={sendingSign || !signerName || !signerEmail} className="w-full bg-navy text-primary-foreground hover:bg-navy/90">
              {sendingSign ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending…</> : "Send Signing Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Documents;
