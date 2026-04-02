import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Stamp, Upload, Trash2, Edit2, Star, ShieldCheck, AlertTriangle, Lock, Plus, Eye,
} from "lucide-react";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY",
  "LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND",
  "OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const DISCIPLINES = [
  "Civil", "Structural", "Mechanical", "Electrical", "Chemical", "Environmental",
  "Geotechnical", "Industrial", "Fire Protection", "Nuclear", "Petroleum",
];

type PEStamp = {
  id: string;
  label: string;
  license_number: string;
  state: string;
  discipline: string;
  expiration_date: string;
  stamp_file_path: string;
  is_default: boolean;
  created_at: string;
};

const getDaysUntilExpiry = (date: string) => {
  const diff = new Date(date).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

const getExpiryBadge = (date: string) => {
  const days = getDaysUntilExpiry(date);
  if (days < 0) return <Badge variant="destructive">Expired</Badge>;
  if (days <= 7) return <Badge variant="destructive">Expires in {days}d</Badge>;
  if (days <= 30) return <Badge className="bg-orange-500 text-white">Expires in {days}d</Badge>;
  if (days <= 90) return <Badge variant="secondary">Expires in {days}d</Badge>;
  return <Badge variant="outline" className="text-green-600 border-green-300">Active</Badge>;
};

const PEStampManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [stamps, setStamps] = useState<PEStamp[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStamp, setEditingStamp] = useState<PEStamp | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Form state
  const [label, setLabel] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [state, setState] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [expirationDate, setExpirationDate] = useState("");
  const [stampFile, setStampFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const loadStamps = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("pe_stamps")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    if (!error && data) setStamps(data as PEStamp[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadStamps(); }, [loadStamps]);

  const resetForm = () => {
    setLabel(""); setLicenseNumber(""); setState(""); setDiscipline("");
    setExpirationDate(""); setStampFile(null); setEditingStamp(null); setShowForm(false);
  };

  const openEditForm = (stamp: PEStamp) => {
    setEditingStamp(stamp);
    setLabel(stamp.label);
    setLicenseNumber(stamp.license_number);
    setState(stamp.state);
    setDiscipline(stamp.discipline);
    setExpirationDate(stamp.expiration_date);
    setStampFile(null);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !licenseNumber || !state || !discipline || !expirationDate) {
      toast({ title: "Missing fields", description: "Please fill all required fields.", variant: "destructive" });
      return;
    }
    if (!editingStamp && !stampFile) {
      toast({ title: "Missing stamp image", description: "Please upload your PE stamp image.", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      let filePath = editingStamp?.stamp_file_path || "";

      if (stampFile) {
        const ext = stampFile.name.split(".").pop()?.toLowerCase();
        if (!["png", "svg"].includes(ext || "")) {
          toast({ title: "Invalid format", description: "Only PNG and SVG files are accepted.", variant: "destructive" });
          setSaving(false);
          return;
        }
        const fileName = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadErr } = await supabase.storage
          .from("pe-stamps")
          .upload(fileName, stampFile, { contentType: stampFile.type, upsert: false });
        if (uploadErr) throw uploadErr;
        filePath = fileName;
      }

      const stampData = {
        user_id: user.id,
        label: label || `${state} PE Stamp`,
        license_number: licenseNumber,
        state,
        discipline,
        expiration_date: expirationDate,
        stamp_file_path: filePath,
        updated_at: new Date().toISOString(),
      };

      if (editingStamp) {
        const { error } = await supabase.from("pe_stamps").update(stampData).eq("id", editingStamp.id);
        if (error) throw error;
        toast({ title: "Stamp updated" });
      } else {
        const isFirst = stamps.length === 0;
        const { error } = await supabase.from("pe_stamps").insert({ ...stampData, is_default: isFirst });
        if (error) throw error;
        toast({ title: "Stamp added" });
      }
      resetForm();
      loadStamps();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    }
    setSaving(false);
  };

  const setDefault = async (id: string) => {
    if (!user) return;
    // unset all, then set this one
    await supabase.from("pe_stamps").update({ is_default: false }).eq("user_id", user.id);
    await supabase.from("pe_stamps").update({ is_default: true }).eq("id", id);
    loadStamps();
    toast({ title: "Default stamp updated" });
  };

  const deleteStamp = async (id: string) => {
    const stamp = stamps.find((s) => s.id === id);
    if (stamp) {
      await supabase.storage.from("pe-stamps").remove([stamp.stamp_file_path]);
    }
    await supabase.from("pe_stamps").delete().eq("id", id);
    setShowDeleteConfirm(null);
    loadStamps();
    toast({ title: "Stamp deleted" });
  };

  const viewStampPreview = async (path: string) => {
    const { data } = await supabase.storage.from("pe-stamps").createSignedUrl(path, 300);
    if (data?.signedUrl) setPreviewUrl(data.signedUrl);
  };

  return (
    <DashboardLayout title="PE Stamp & Seal">
      {/* Disclaimer */}
      <Alert className="mb-6 border-amber-200 bg-amber-50">
        <ShieldCheck className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>Disclaimer:</strong> This platform facilitates digital document management.
          The engineer is solely responsible for the legal validity of any applied stamp or seal
          under their state board rules and regulations. Consult your state PE board for requirements
          regarding digital seals and signatures.
        </AlertDescription>
      </Alert>

      {/* Action bar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          Manage your Professional Engineer stamps and licenses. You can store multiple stamps for different states.
        </p>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" /> Add Stamp
        </Button>
      </div>

      {/* Stamps grid */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading stamps…</div>
      ) : stamps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
              <Stamp className="w-7 h-7 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No PE Stamps Added</h3>
            <p className="text-sm text-muted-foreground max-w-sm mb-4">
              Upload your PE stamp image, enter your license details, and manage your professional seals securely.
            </p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Upload className="w-4 h-4" /> Upload Your First Stamp
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stamps.map((stamp) => (
            <Card key={stamp.id} className={stamp.is_default ? "border-primary/50 shadow-sm" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {stamp.label}
                      {stamp.is_default && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                    </CardTitle>
                    <CardDescription className="mt-1">{stamp.discipline} — {stamp.state}</CardDescription>
                  </div>
                  {getExpiryBadge(stamp.expiration_date)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License #</span>
                    <span className="font-mono text-foreground">{stamp.license_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="text-foreground">{new Date(stamp.expiration_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => viewStampPreview(stamp.stamp_file_path)}>
                    <Eye className="w-3.5 h-3.5" /> View
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={() => openEditForm(stamp)}>
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </Button>
                  {!stamp.is_default && (
                    <Button variant="ghost" size="sm" onClick={() => setDefault(stamp.id)} title="Set as default">
                      <Star className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(stamp.id)} className="text-destructive hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit dialog */}
      <Dialog open={showForm} onOpenChange={(o) => { if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStamp ? "Edit PE Stamp" : "Add PE Stamp"}</DialogTitle>
            <DialogDescription>
              Enter your license details and upload your official PE stamp image.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Label</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. California Structural PE" />
            </div>
            <div>
              <Label>License Number *</Label>
              <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} placeholder="e.g. S-12345" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>State *</Label>
                <Select value={state} onValueChange={setState}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {US_STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discipline *</Label>
                <Select value={discipline} onValueChange={setDiscipline}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {DISCIPLINES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Expiration Date *</Label>
              <Input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} />
            </div>
            <div>
              <Label>Stamp Image (PNG or SVG) {editingStamp ? "" : "*"}</Label>
              <Input
                type="file"
                accept=".png,.svg,image/png,image/svg+xml"
                onChange={(e) => setStampFile(e.target.files?.[0] || null)}
              />
              {editingStamp && <p className="text-xs text-muted-foreground mt-1">Leave empty to keep current image.</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : editingStamp ? "Update" : "Add Stamp"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview dialog */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Stamp Preview</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            <div className="flex items-center justify-center p-4 bg-muted rounded-lg">
              <img src={previewUrl} alt="PE Stamp" className="max-w-full max-h-80 object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Stamp</DialogTitle>
            <DialogDescription>
              Are you sure? This will permanently remove this PE stamp and its image.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => showDeleteConfirm && deleteStamp(showDeleteConfirm)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default PEStampManager;
