import { useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type ComplianceStatus = "PASS" | "REVIEW" | "FLAG";

interface ComplianceFlag {
  id: string;
  field: string;
  codeSection: string;
  issue: string;
  value: string;
  limit: string;
  status: ComplianceStatus;
}

interface ComplianceResult {
  calculationId: string;
  title: string;
  category: ComplianceStatus;
  summary: string;
  flags: ComplianceFlag[];
}

interface ComplianceReport {
  projectId: string;
  checkedAt: string;
  overallStatus: ComplianceStatus;
  summary: string;
  codeReferences: string[];
  results: ComplianceResult[];
  aiNotes?: string;
}

interface ProjectComplianceCheckerProps {
  projectId?: string;
}

const formatStatusClass = (status: ComplianceStatus) => {
  switch (status) {
    case "PASS":
      return "bg-emerald-100 text-emerald-700";
    case "REVIEW":
      return "bg-amber-100 text-amber-700";
    case "FLAG":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-800";
  }
};

const escapePdfText = (value: string) => {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
};

const createPdf = (text: string) => {
  const lines = text.split("\n").map((line) => escapePdfText(line));
  const contentCommands = ["BT", "/F1 10 Tf", "12 TL", "50 750 Td"];

  lines.forEach((line, index) => {
    contentCommands.push(`(${line}) Tj`);
    if (index < lines.length - 1) {
      contentCommands.push("T*");
    }
  });

  contentCommands.push("ET");

  const content = contentCommands.join("\n");
  const objects: string[] = [];

  objects.push("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  objects.push(
    "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"
  );

  objects.push(
    "3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>\nendobj\n"
  );

  const contentStream = `4 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;
  objects.push(contentStream);
  objects.push(
    "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
  );

  let offset = 0;
  const xrefEntries = ["0000000000 65535 f \n"];
  const pdfParts: string[] = ["%PDF-1.3\n"];

  objects.forEach((object) => {
    const objectOffset = offset;
    const encoded = new TextEncoder().encode(object);
    const offsetStr = String(objectOffset).padStart(10, "0");
    xrefEntries.push(`${offsetStr} 00000 n \n`);
    pdfParts.push(object);
    offset += encoded.length;
  });

  const xrefPosition = offset;
  pdfParts.push("xref\n");
  pdfParts.push(`0 ${objects.length + 1}\n`);
  pdfParts.push(...xrefEntries);
  pdfParts.push("trailer\n");
  pdfParts.push(`<< /Size ${objects.length + 1} /Root 1 0 R >>\n`);
  pdfParts.push("startxref\n");
  pdfParts.push(`${xrefPosition}\n`);
  pdfParts.push("%%EOF\n");

  const pdfBytes = new TextEncoder().encode(pdfParts.join(""));
  return new Blob([pdfBytes], { type: "application/pdf" });
};

const buildComplianceSummary = (report: ComplianceReport, notesByFlag: Record<string, string>) => {
  const rows: string[] = [];
  rows.push(`Project Compliance Summary`);
  rows.push(`Project: ${report.projectId}`);
  rows.push(`Checked: ${new Date(report.checkedAt).toLocaleString()}`);
  rows.push(`Overall status: ${report.overallStatus}`);
  rows.push(`Code references: ${report.codeReferences.join(", ")}`);
  rows.push("\nSummary:");
  rows.push(report.summary);

  report.results.forEach((result) => {
    rows.push("\n------------------------------------");
    rows.push(`Calculation: ${result.title}`);
    rows.push(`Status: ${result.category}`);
    rows.push(`Summary: ${result.summary}`);

    if (result.flags.length === 0) {
      rows.push("No flags detected.");
    } else {
      result.flags.forEach((flag, index) => {
        rows.push(`Flag ${index + 1}: ${flag.field}`);
        rows.push(`  Code section: ${flag.codeSection}`);
        rows.push(`  Issue: ${flag.issue}`);
        rows.push(`  Value: ${flag.value}`);
        rows.push(`  Limit: ${flag.limit}`);
        rows.push(`  Response note: ${notesByFlag[flag.id] || "(none)"}`);
      });
    }
  });

  return rows.join("\n");
};

const ProjectComplianceChecker = ({ projectId }: ProjectComplianceCheckerProps) => {
  const { user } = useAuth();
  const [report, setReport] = useState<ComplianceReport | null>(null);
  const [running, setRunning] = useState(false);
  const [notesByFlag, setNotesByFlag] = useState<Record<string, string>>({});

  const pending = running || !user;

  const passCount = useMemo(
    () => report?.results.filter((item) => item.category === "PASS").length || 0,
    [report],
  );
  const reviewCount = useMemo(
    () => report?.results.filter((item) => item.category === "REVIEW").length || 0,
    [report],
  );
  const flagCount = useMemo(
    () => report?.results.filter((item) => item.category === "FLAG").length || 0,
    [report],
  );

  const handleRunCompliance = async () => {
    if (!projectId) {
      toast.error("No project selected for compliance review.");
      return;
    }
    setRunning(true);
    setReport(null);
    setNotesByFlag({});

    try {
      const { data, error } = await supabase.functions.invoke("code-compliance-check", {
        body: { projectId },
      });

      if (error) {
        throw error;
      }

      if (!data?.report) {
        throw new Error("Compliance check did not return a report.");
      }

      setReport(data.report as ComplianceReport);
      toast.success("Compliance check completed.");
    } catch (err: any) {
      console.error("Compliance check failed:", err);
      toast.error(err?.message || "Compliance check failed.");
    } finally {
      setRunning(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!report) return;
    const body = buildComplianceSummary(report, notesByFlag);
    const pdfBlob = createPdf(body);
    const url = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `project-${projectId}-compliance-summary.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success("Compliance summary PDF downloaded.");
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Code Compliance Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Review saved load calculations for this project against ASCE 7-22, ACI 318-19, AISC 360-22, and IBC 2021.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Run a compliance check for all linked calculations before permit submission.</p>
              <p className="text-sm text-muted-foreground">Flags include exact code sections and issues that need engineer attention.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleRunCompliance} disabled={pending}>
                {running ? "Running compliance check…" : "Run Compliance Check"}
              </Button>
              <Button variant="outline" onClick={handleDownloadPdf} disabled={!report || running}>
                Download Compliance PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {report ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-sm">Overall Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${formatStatusClass(report.overallStatus)}`}>{report.overallStatus}</div>
                <p className="mt-2 text-sm text-muted-foreground">Checked {new Date(report.checkedAt).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-sm">Calculations Reviewed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{report.results.length}</p>
                <p className="text-sm text-muted-foreground">Saved calculations analyzed for this project.</p>
              </CardContent>
            </Card>
            <Card className="p-4">
              <CardHeader>
                <CardTitle className="text-sm">Action Required</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="flex items-center justify-between text-sm"><span>PASS</span><span>{passCount}</span></div>
                <div className="flex items-center justify-between text-sm"><span>REVIEW</span><span>{reviewCount}</span></div>
                <div className="flex items-center justify-between text-sm"><span>FLAG</span><span>{flagCount}</span></div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{report.summary}</CardContent>
          </Card>

          {report.results.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No calculations found</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">There are no saved calculations linked to this project. Add a load calculation and run the compliance review again.</p>
              </CardContent>
            </Card>
          ) : (
            report.results.map((result) => (
              <Card key={result.calculationId}>
                <CardHeader>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle>{result.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{result.summary}</p>
                    </div>
                    <Badge className={formatStatusClass(result.category)}>{result.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {result.flags.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This calculation passed all checked code requirements.</p>
                  ) : (
                    <div className="space-y-4">
                      {result.flags.map((flag) => (
                        <Card key={flag.id} className="border border-border bg-slate-50">
                          <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm font-semibold">{flag.field}</p>
                                <p className="text-sm text-muted-foreground">{flag.issue}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={formatStatusClass(flag.status)}>{flag.status}</Badge>
                                <span className="text-xs text-muted-foreground">{flag.codeSection}</span>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="grid gap-3 sm:grid-cols-3">
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Value</p>
                                <p className="font-medium">{flag.value}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Limit</p>
                                <p className="font-medium">{flag.limit}</p>
                              </div>
                              <div>
                                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Response</p>
                                <p className="text-sm text-muted-foreground">Add a note for permit submission.</p>
                              </div>
                            </div>
                            <Textarea
                              value={notesByFlag[flag.id] || ""}
                              onChange={(event) => setNotesByFlag((current) => ({ ...current, [flag.id]: event.target.value }))}
                              placeholder="Verified with geotech report — acceptable"
                              className="min-h-[100px]"
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Ready to review</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Click Run Compliance Check to evaluate this project’s saved calculations against building code requirements.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProjectComplianceChecker;
