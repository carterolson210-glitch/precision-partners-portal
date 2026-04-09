import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

const SignDocument = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [status, setStatus] = useState<"loading" | "ready" | "signing" | "signed" | "declined" | "error" | "already">("loading");
  const [sigData, setSigData] = useState<any>(null);
  const [docName, setDocName] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("error"); return; }
    (async () => {
      const { data, error } = await supabase
        .from("document_signatures")
        .select("*, documents(file_name)")
        .eq("signing_token", token)
        .single();
      if (error || !data) { setStatus("error"); return; }
      if (data.status === "signed") { setStatus("already"); return; }
      setSigData(data);
      setDocName((data as any).documents?.file_name || "Document");
      setStatus("ready");
    })();
  }, [token]);

  const startDraw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.strokeStyle = "#000";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasDrawn(true);
  };

  const stopDraw = () => setDrawing(false);

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) ctx.clearRect(0, 0, 500, 200);
    setHasDrawn(false);
  };

  const handleSign = async () => {
    if (!sigData || !token) return;
    setStatus("signing");
    try {
      // Update signature record
      const { error } = await supabase
        .from("document_signatures")
        .update({ status: "signed", signed_at: new Date().toISOString() })
        .eq("signing_token", token);
      if (error) throw error;

      // Notify via edge function
      await supabase.functions.invoke("document-signature-email", {
        body: { documentId: sigData.document_id, signerEmail: sigData.signer_email, signerName: sigData.signer_name, action: "completed" },
      });

      setStatus("signed");
    } catch {
      setStatus("error");
    }
  };

  const handleDecline = async () => {
    if (!sigData || !token) return;
    await supabase.from("document_signatures").update({ status: "declined" }).eq("signing_token", token);
    setStatus("declined");
  };

  if (status === "loading") return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  if (status === "error") return <div className="min-h-screen flex items-center justify-center"><Card className="max-w-md"><CardContent className="pt-6 text-center"><XCircle className="w-12 h-12 text-destructive mx-auto mb-4" /><p className="text-lg font-semibold">Invalid or expired signing link</p></CardContent></Card></div>;
  if (status === "already") return <div className="min-h-screen flex items-center justify-center"><Card className="max-w-md"><CardContent className="pt-6 text-center"><CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" /><p className="text-lg font-semibold">This document has already been signed</p></CardContent></Card></div>;
  if (status === "signed") return <div className="min-h-screen flex items-center justify-center"><Card className="max-w-md"><CardContent className="pt-6 text-center"><CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" /><p className="text-lg font-semibold">Document signed successfully!</p><p className="text-muted-foreground mt-2">Both parties will receive a confirmation email.</p></CardContent></Card></div>;
  if (status === "declined") return <div className="min-h-screen flex items-center justify-center"><Card className="max-w-md"><CardContent className="pt-6 text-center"><XCircle className="w-12 h-12 text-destructive mx-auto mb-4" /><p className="text-lg font-semibold">You have declined to sign this document</p></CardContent></Card></div>;

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle className="text-xl">Sign Document</CardTitle>
          <p className="text-sm text-muted-foreground">You've been asked to sign: <strong>{docName}</strong></p>
          <p className="text-sm text-muted-foreground">Signer: {sigData?.signer_name} ({sigData?.signer_email})</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Draw your signature below:</p>
            <canvas
              ref={canvasRef}
              width={460}
              height={180}
              className="border rounded-lg w-full cursor-crosshair bg-background"
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
            />
            <Button variant="ghost" size="sm" onClick={clearCanvas} className="mt-1">Clear</Button>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSign} disabled={!hasDrawn || status === "signing"} className="flex-1 bg-navy text-primary-foreground hover:bg-navy/90">
              {status === "signing" ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing…</> : "Sign Document"}
            </Button>
            <Button variant="outline" onClick={handleDecline} className="flex-1">Decline</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignDocument;
