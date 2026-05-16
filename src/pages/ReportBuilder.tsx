import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, Download, Share2, CheckCircle2, ArrowLeftRight } from "lucide-react";

interface Project {
  id: string;
  project_name: string;
  client_name: string;
  address?: string;
  start_date?: string;
  due_date?: string;
}

interface ScopeItem {
  id: string;
  label: string;
  enabled: boolean;
}

const defaultScopeItems: ScopeItem[] = [
  { id: "scope-1", label: "Design assumptions and code compliance", enabled: true },
  { id: "scope-2", label: "Structural load calculations and summaries", enabled: true },
  { id: "scope-3", label: "Material specifications and installation notes", enabled: false },
  { id: "scope-4", label: "Site constraints and risk mitigation", enabled: false },
  { id: "scope-5", label: "Recommendations and next steps", enabled: true },
];

const steps = ["Project", "Scope", "Metadata", "Finalize"];

const ReportBuilder = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [reportTitle, setReportTitle] = useState("Engineering Report");
  const [engineerName, setEngineerName] = useState("");
  const [reportDate, setReportDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [includeSummary, setIncludeSummary] = useState(true);
  const [includeAttachments, setIncludeAttachments] = useState(true);
  const [includeRecommendations, setIncludeRecommendations] = useState(true);
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>(defaultScopeItems);
  const [notes, setNotes] = useState("Provide a short executive summary and key findings for the selected project.");

  useEffect(() => {
    if (!user) return;
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    setLoadingProjects(true);
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("id, project_name, client_name, address, start_date, due_date")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      console.error("Error loading projects for report builder:", error);
      toast.error("Unable to load projects for report builder.");
    } finally {
      setLoadingProjects(false);
    }
  };

  const selectedProject = useMemo(
    () => projects.find((project) => project.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const enabledScopeItems = useMemo(
    () => scopeItems.filter((item) => item.enabled),
    [scopeItems],
  );

  const reportPreview = useMemo(() => {
    const projectName = selectedProject?.project_name || "Unassigned Project";
    const clientName = selectedProject?.client_name || "Unknown Client";
    const address = selectedProject?.address || "No address provided";
    const dateRange = selectedProject?.start_date || selectedProject?.due_date
      ? `${selectedProject?.start_date || "TBD"} — ${selectedProject?.due_date || "TBD"}`
      : "TBD";

    return `Report Title: ${reportTitle}

Project: ${projectName}
Client: ${clientName}
Address: ${address}
Schedule: ${dateRange}
Engineer: ${engineerName || "TBD"}
Date: ${reportDate}

Scope of Work:
${enabledScopeItems.map((item) => `- ${item.label}`).join("\n")}

Include summary section: ${includeSummary ? "Yes" : "No"}
Include attachments summary: ${includeAttachments ? "Yes" : "No"}
Include recommendations: ${includeRecommendations ? "Yes" : "No"}

Executive Summary:
${notes.trim()}
`;
  }, [reportTitle, selectedProject, engineerName, reportDate, enabledScopeItems, includeSummary, includeAttachments, includeRecommendations, notes]);

  const setStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    setActiveStep(index);
  };

  const updateScopeItem = (id: string, enabled: boolean) => {
    setScopeItems((current) => current.map((item) => item.id === id ? { ...item, enabled } : item));
  };

  const downloadReportText = () => {
    const blob = new Blob([reportPreview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reportTitle.replace(/\s+/g, "-").toLowerCase() || "engineering-report"}.txt`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const downloadCsv = () => {
    const rows = [
      ["Field", "Value"],
      ["Report Title", reportTitle],
      ["Project", selectedProject?.project_name ?? ""],
      ["Client", selectedProject?.client_name ?? ""],
      ["Engineer", engineerName],
      ["Report Date", reportDate],
      ["Scope Items", enabledScopeItems.map((item) => item.label).join("; ")],
      ["Include Summary", includeSummary ? "Yes" : "No"],
      ["Include Attachments", includeAttachments ? "Yes" : "No"],
      ["Include Recommendations", includeRecommendations ? "Yes" : "No"],
      ["Notes", notes.replace(/\n/g, " ")],
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${reportTitle.replace(/\s+/g, "-").toLowerCase() || "engineering-report"}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report builder link copied to clipboard");
    } catch (error) {
      console.error("Unable to copy link", error);
      toast.error("Unable to copy share link");
    }
  };

  return (
    <DashboardLayout title="Report Builder">
      <div className="space-y-6">
        <div className="rounded-3xl border border-card-border bg-background p-5 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Engineering report workflow</p>
              <h2 className="text-2xl font-semibold">Build professional scope and deliverable reports</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setStep(0)} className={activeStep === 0 ? "bg-primary text-primary-foreground" : ""}>Project</Button>
              <Button variant="outline" size="sm" onClick={() => setStep(1)} className={activeStep === 1 ? "bg-primary text-primary-foreground" : ""}>Scope</Button>
              <Button variant="outline" size="sm" onClick={() => setStep(2)} className={activeStep === 2 ? "bg-primary text-primary-foreground" : ""}>Metadata</Button>
              <Button variant="outline" size="sm" onClick={() => setStep(3)} className={activeStep === 3 ? "bg-primary text-primary-foreground" : ""}>Finalize</Button>
            </div>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{steps[activeStep]} Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {activeStep === 0 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <Label htmlFor="project">Select a project</Label>
                        <Select value={selectedProjectId} onValueChange={(value) => setSelectedProjectId(value)}>
                          <SelectTrigger>
                            <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
                          </SelectTrigger>
                          <SelectContent>
                            {loadingProjects ? (
                              <SelectItem value="" disabled>
                                Loading projects...
                              </SelectItem>
                            ) : projects.length === 0 ? (
                              <SelectItem value="" disabled>
                                No projects available
                              </SelectItem>
                            ) : (
                              projects.map((project) => (
                                <SelectItem key={project.id} value={String(project.id)}>
                                  {project.project_name}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="reportTitle">Report Title</Label>
                        <Input
                          id="reportTitle"
                          value={reportTitle}
                          onChange={(event) => setReportTitle(event.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div>
                        <Label htmlFor="engineerName">Lead Engineer</Label>
                        <Input
                          id="engineerName"
                          value={engineerName}
                          onChange={(event) => setEngineerName(event.target.value)}
                          placeholder="e.g. Jordan Lee, PE"
                        />
                      </div>
                      <div>
                        <Label htmlFor="reportDate">Report Date</Label>
                        <Input
                          id="reportDate"
                          type="date"
                          value={reportDate}
                          onChange={(event) => setReportDate(event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      {scopeItems.map((item) => (
                        <label key={item.id} className="flex items-start gap-3 rounded-xl border border-card-border p-4 hover:border-primary">
                          <Checkbox
                            checked={item.enabled}
                            onCheckedChange={(checked) => updateScopeItem(item.id, Boolean(checked))}
                            className="mt-1"
                          />
                          <div>
                            <p className="font-medium">{item.label}</p>
                            <p className="text-sm text-muted-foreground">Enable or disable this section in your final report.</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {activeStep === 2 && (
                  <div className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-2">
                      <div className="flex items-center justify-between rounded-xl border border-card-border p-4">
                        <div>
                          <p className="font-medium">Executive summary</p>
                          <p className="text-sm text-muted-foreground">Add a summary section for stakeholders.</p>
                        </div>
                        <Switch checked={includeSummary} onCheckedChange={setIncludeSummary} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-card-border p-4">
                        <div>
                          <p className="font-medium">Attachments summary</p>
                          <p className="text-sm text-muted-foreground">Include drawings, CAD files, and specifications overview.</p>
                        </div>
                        <Switch checked={includeAttachments} onCheckedChange={setIncludeAttachments} />
                      </div>
                      <div className="flex items-center justify-between rounded-xl border border-card-border p-4">
                        <div>
                          <p className="font-medium">Recommendations</p>
                          <p className="text-sm text-muted-foreground">Add a concise recommendations section.</p>
                        </div>
                        <Switch checked={includeRecommendations} onCheckedChange={setIncludeRecommendations} />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="notes">Executive Summary</Label>
                      <Textarea
                        id="notes"
                        value={notes}
                        onChange={(event) => setNotes(event.target.value)}
                        rows={6}
                      />
                    </div>
                  </div>
                )}

                {activeStep === 3 && (
                  <div className="space-y-6">
                    <Card className="border border-card-border bg-slate-50">
                      <CardHeader>
                        <CardTitle>Report snapshot</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <p className="text-sm text-muted-foreground">Selected project</p>
                            <p className="font-medium">{selectedProject?.project_name ?? "No project selected"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Client</p>
                            <p className="font-medium">{selectedProject?.client_name ?? "Not set"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Sections</p>
                            <p className="font-medium">{enabledScopeItems.length} selected</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Exports</p>
                            <p className="font-medium">Text report + CSV data</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={downloadReportText}>
                        <Download className="w-4 h-4 mr-2" />
                        Download Report
                      </Button>
                      <Button variant="outline" onClick={downloadCsv}>
                        <ArrowLeftRight className="w-4 h-4 mr-2" />
                        Download CSV
                      </Button>
                      <Button variant="outline" onClick={copyShareLink}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Copy Builder Link
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" disabled={activeStep === 0} onClick={() => setStep(activeStep - 1)}>
                Back
              </Button>
              <Button disabled={activeStep === steps.length - 1} onClick={() => setStep(activeStep + 1)}>
                Next
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Live preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-3xl border border-card-border bg-background p-4 text-sm whitespace-pre-wrap font-mono">{reportPreview}</div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Ready to publish to stakeholders once the report is finalized.
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p><strong>Project status</strong>: {selectedProject ? "Ready to report" : "Select a project to continue"}</p>
                <p><strong>Primary deliverables</strong>: Scope, technical summary, recommendations.</p>
                <p><strong>Suggested next step</strong>: Review with the client and attach supporting documents in Documents.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ReportBuilder;
