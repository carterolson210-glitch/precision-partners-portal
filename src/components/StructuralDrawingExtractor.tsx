import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, Loader2, CheckCircle2, AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.min.js?url";

GlobalWorkerOptions.workerSrc = pdfjsWorker;

type ExtractionKey = "slabThickness" | "unitWeight" | "superimposedDeadLoad" | "occupancyType" | "memberSizes";

interface ExtractionField {
  key: ExtractionKey;
  label: string;
  value: string;
  confidence: number;
  note: string;
  status: "pending" | "accepted" | "rejected";
  editValue: string;
}

interface HighlightBounds {
  fieldKey: ExtractionKey;
  page: number;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface StructuralDrawingExtractorProps {
  projectId?: string;
  onExtracted: (values: {
    slabThickness: string;
    unitWeight: string;
    superimposedDeadLoad: string;
    occupancyType: string;
    memberSizes: string;
  }) => void;
}

const DEFAULT_FIELDS: ExtractionField[] = [
  {
    key: "slabThickness",
    label: "Slab Thickness",
    value: "",
    confidence: 0,
    note: "AI will look for floor slab callouts and thickness notes.",
    status: "pending",
    editValue: "",
  },
  {
    key: "unitWeight",
    label: "Concrete Unit Weight",
    value: "",
    confidence: 0,
    note: "AI will extract the concrete unit weight callout if present.",
    status: "pending",
    editValue: "",
  },
  {
    key: "superimposedDeadLoad",
    label: "Superimposed Dead Load",
    value: "",
    confidence: 0,
    note: "AI will detect additional dead load notes from the floor plan.",
    status: "pending",
    editValue: "",
  },
  {
    key: "occupancyType",
    label: "Occupancy Type",
    value: "",
    confidence: 0,
    note: "AI will read the title block or room names to infer occupancy.",
    status: "pending",
    editValue: "",
  },
  {
    key: "memberSizes",
    label: "Structural Member Sizes",
    value: "",
    confidence: 0,
    note: "AI will summarize beam/column sizes called out on the plan.",
    status: "pending",
    editValue: "",
  },
];

const normalizeText = (value: string) => {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
};

const findTextItems = (items: any[], value: string) => {
  const needle = normalizeText(value);
  return items.filter((item) => {
    const text = normalizeText(item.str || "");
    return needle.length > 0 && text.includes(needle);
  });
};

const StructuralDrawingExtractor = ({ projectId, onExtracted }: StructuralDrawingExtractorProps) => {
  const [fields, setFields] = useState<ExtractionField[]>(DEFAULT_FIELDS);
  const [uploading, setUploading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [analysisHint, setAnalysisHint] = useState("Upload a plan set PDF and the AI will extract dead and live load inputs.");
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDimensions, setPageDimensions] = useState({ width: 0, height: 0 });
  const [pageTextItems, setPageTextItems] = useState<Record<number, any[]>>({});
  const [highlightBoxes, setHighlightBoxes] = useState<HighlightBounds[]>([]);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfDocument || !canvasRef.current) return;
    const renderPdf = async () => {
      const page = await pdfDocument.getPage(currentPage);
      const viewport = page.getViewport({ scale: 1.5 });
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      setPageDimensions({ width: viewport.width, height: viewport.height });
      await page.render({ canvasContext: context, viewport }).promise;
    };
    renderPdf().catch((error) => {
      console.error("PDF render failed:", error);
      toast.error("Unable to render the PDF preview.");
    });
  }, [pdfDocument, currentPage]);

  useEffect(() => {
    const updated = fields.flatMap((field) => {
      if (!pageTextItems[1] || !field.value) return [];
      const hits = findTextItems(pageTextItems[1], field.value);
      return hits.slice(0, 1).map((item) => {
        const [a, b, c, d, x, y] = item.transform || [];
        const width = item.width || 60;
        const height = item.height || 12;
        const top = pageDimensions.height - y;
        return {
          fieldKey: field.key,
          page: 1,
          left: x,
          top,
          width,
          height,
        };
      });
    });
    setHighlightBoxes(updated);
  }, [fields, pageTextItems, pageDimensions]);

  const updateField = (key: ExtractionKey, value: string) => {
    setFields((current) =>
      current.map((field) =>
        field.key === key
          ? { ...field, editValue: value, status: "pending" }
          : field
      )
    );
  };

  const setFieldStatus = (key: ExtractionKey, status: "accepted" | "rejected") => {
    setFields((current) =>
      current.map((field) =>
        field.key === key ? { ...field, status } : field
      )
    );
  };

  const applyValues = () => {
    const result = {
      slabThickness: fields.find((field) => field.key === "slabThickness")?.status === "rejected"
        ? ""
        : fields.find((field) => field.key === "slabThickness")?.editValue || "",
      unitWeight: fields.find((field) => field.key === "unitWeight")?.status === "rejected"
        ? ""
        : fields.find((field) => field.key === "unitWeight")?.editValue || "",
      superimposedDeadLoad: fields.find((field) => field.key === "superimposedDeadLoad")?.status === "rejected"
        ? ""
        : fields.find((field) => field.key === "superimposedDeadLoad")?.editValue || "",
      occupancyType: fields.find((field) => field.key === "occupancyType")?.status === "rejected"
        ? ""
        : fields.find((field) => field.key === "occupancyType")?.editValue || "",
      memberSizes: fields.find((field) => field.key === "memberSizes")?.status === "rejected"
        ? ""
        : fields.find((field) => field.key === "memberSizes")?.editValue || "",
    };
    onExtracted(result);
  };

  const analyzeDrawing = async (text: string, fileName: string) => {
    const trimmed = text.slice(0, 12000);
    const payload = {
      rawText: trimmed,
      fileName,
      projectId: projectId || null,
    };
    const { data, error } = await supabase.functions.invoke("extract-structural-drawing", { body: payload });

    if (error) {
      throw error;
    }

    if (!data?.analysis) {
      throw new Error("AI analysis failed to return structured values.");
    }

    return data.analysis;
  };

  const extractPdfText = async (buffer: ArrayBuffer) => {
    const pdf = await getDocument({ data: buffer }).promise;
    setPdfDocument(pdf);
    setPdfPageCount(pdf.numPages);
    const pageTextItems: Record<number, any[]> = {};
    const textContentByPage: string[] = [];

    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 3); pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      pageTextItems[pageNumber] = textContent.items;
      textContentByPage.push(
        `-- PAGE ${pageNumber} --\n${textContent.items.map((item: any) => item.str || "").join(" ")}`
      );
    }

    setPageTextItems(pageTextItems);
    return textContentByPage.join("\n\n");
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF structural drawing or plan set.");
      return;
    }

    setUploading(true);
    setDocumentName(file.name);
    setAnalysisHint("Scanning PDF and extracting text from the first pages...");
    setFields(DEFAULT_FIELDS.map((field) => ({ ...field, editValue: "", value: "", confidence: 0, status: "pending" })));

    try {
      const buffer = await file.arrayBuffer();
      const rawText = await extractPdfText(buffer);
      const result = await analyzeDrawing(rawText, file.name);

      const updatedFields = fields.map((field) => {
        const valueObject = result[field.key] || { value: "", confidence: 0, note: field.note };
        const normalizedValue = typeof valueObject === "string" ? valueObject : valueObject.value || "";
        return {
          ...field,
          value: normalizedValue,
          editValue: normalizedValue,
          confidence: valueObject.confidence || 0,
          note: valueObject.note || field.note,
          status: normalizedValue ? "pending" : "pending",
        };
      });

      setFields(updatedFields);
      setAnalysisHint("Review the AI-extracted values. Accept or edit any field before applying them to the calculator.");

      const acceptedValues = {
        slabThickness: updatedFields.find((field) => field.key === "slabThickness")?.editValue || "",
        unitWeight: updatedFields.find((field) => field.key === "unitWeight")?.editValue || "",
        superimposedDeadLoad: updatedFields.find((field) => field.key === "superimposedDeadLoad")?.editValue || "",
        occupancyType: updatedFields.find((field) => field.key === "occupancyType")?.editValue || "",
        memberSizes: updatedFields.find((field) => field.key === "memberSizes")?.editValue || "",
      };
      onExtracted(acceptedValues);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to extract information from the drawing.");
      setAnalysisHint("Upload a PDF drawing to extract dead and live load values.");
    } finally {
      setUploading(false);
    }
  };

  const displayScale = useMemo(() => {
    if (!pageDimensions.width || !canvasRef.current) return 1;
    return canvasRef.current.clientWidth / pageDimensions.width;
  }, [pageDimensions, canvasRef.current]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Structural Drawing Extraction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Label htmlFor="drawing-upload" className="font-semibold">Upload PDF Drawing</Label>
              <Badge variant="secondary">AI extraction</Badge>
            </div>
            <Input
              id="drawing-upload"
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
            />
            <p className="text-sm text-muted-foreground">AI scans floor dimensions, slab thickness, material callouts, member sizes, and recognizes occupancy type from the title block.</p>
            <div className="rounded-2xl border border-border p-4 bg-muted">
              <p className="text-sm text-muted-foreground">{analysisHint}</p>
              {documentName && <p className="mt-2 text-sm">Selected file: <strong>{documentName}</strong></p>}
            </div>
            <div className="space-y-3">
              {fields.map((field) => (
                <div key={field.key} className="rounded-2xl border border-border bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{field.label}</p>
                      <p className="text-xs text-muted-foreground">{field.note}</p>
                    </div>
                    <Badge variant={field.confidence >= 0.75 ? "secondary" : field.confidence >= 0.4 ? "outline" : "destructive"}>
                      {field.confidence ? `${Math.round(field.confidence * 100)}% confident` : "Review"}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                    <Input
                      value={field.editValue}
                      onChange={(e) => updateField(field.key, e.target.value)}
                      placeholder={`Extracted ${field.label.toLowerCase()}...`}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="secondary" onClick={() => setFieldStatus(field.key, "accepted")}>Accept</Button>
                      <Button size="sm" variant="outline" onClick={() => setFieldStatus(field.key, "rejected")}>Reject</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button onClick={applyValues} disabled={uploading}>
                {uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Applying values</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Apply to calculator</>}
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))} disabled={pdfPageCount <= 1}>
                <ChevronLeft className="w-4 h-4" /> Prev page
              </Button>
              <Button variant="outline" onClick={() => setCurrentPage((prev) => Math.min(pdfPageCount, prev + 1))} disabled={pdfPageCount <= currentPage}>
                Next page <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-border bg-background p-4">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-sm font-semibold">PDF Preview</p>
                  <p className="text-xs text-muted-foreground">Page {currentPage} of {pdfPageCount || 1}</p>
                </div>
                {uploading && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Rendering preview…</div>}
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-border bg-slate-950/90" style={{ minHeight: 320 }}>
                <canvas ref={canvasRef} className="w-full h-auto" aria-label="Drawing preview" />
                {highlightBoxes.map((box, index) => (
                  <div
                    key={`${box.fieldKey}-${index}`}
                    className="pointer-events-none absolute border-2 border-amber-400/80 bg-amber-400/10"
                    style={{
                      left: `${box.left * displayScale}px`,
                      top: `${box.top * displayScale}px`,
                      width: `${box.width * displayScale}px`,
                      height: `${box.height * displayScale}px`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StructuralDrawingExtractor;
