import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple PDF generation using raw PDF syntax (no external lib needed in Deno)
function buildPDF(proposal: any): Uint8Array {
  const sections: { title: string; content: string }[] = proposal.sections || [];
  const lines: string[] = [];

  // Helper to escape PDF text
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

  // Calculate pages - we'll put content on pages with simple wrapping
  const pageWidth = 595; // A4
  const pageHeight = 842;
  const margin = 50;
  const lineHeight = 14;
  const maxLineWidth = 70; // chars per line approx

  // Build content lines for all pages
  const contentLines: { text: string; fontSize: number; bold: boolean; y?: number }[] = [];

  // Header: firm info
  if (proposal.firm_name) contentLines.push({ text: proposal.firm_name, fontSize: 16, bold: true });
  if (proposal.firm_address) contentLines.push({ text: proposal.firm_address, fontSize: 10, bold: false });
  const contactParts: string[] = [];
  if (proposal.firm_email) contactParts.push(proposal.firm_email);
  if (proposal.firm_phone) contactParts.push(proposal.firm_phone);
  if (contactParts.length) contentLines.push({ text: contactParts.join(" | "), fontSize: 10, bold: false });
  contentLines.push({ text: "", fontSize: 10, bold: false }); // spacer

  // Title
  contentLines.push({ text: proposal.title || "Proposal", fontSize: 20, bold: true });
  contentLines.push({ text: "", fontSize: 10, bold: false });

  // Client info
  if (proposal.client_name) contentLines.push({ text: `Prepared for: ${proposal.client_name}`, fontSize: 11, bold: false });
  if (proposal.client_email) contentLines.push({ text: `Email: ${proposal.client_email}`, fontSize: 10, bold: false });
  contentLines.push({ text: `Date: ${new Date().toLocaleDateString()}`, fontSize: 10, bold: false });
  contentLines.push({ text: "", fontSize: 10, bold: false });

  // Sections
  for (const section of sections) {
    if (!section.content && !section.title) continue;
    contentLines.push({ text: "", fontSize: 8, bold: false });
    contentLines.push({ text: section.title, fontSize: 14, bold: true });
    contentLines.push({ text: "", fontSize: 6, bold: false });

    // Word-wrap section content
    const paragraphs = section.content.split("\n");
    for (const para of paragraphs) {
      if (!para.trim()) {
        contentLines.push({ text: "", fontSize: 10, bold: false });
        continue;
      }
      const words = para.split(" ");
      let currentLine = "";
      for (const word of words) {
        if ((currentLine + " " + word).length > maxLineWidth) {
          contentLines.push({ text: currentLine.trim(), fontSize: 10, bold: false });
          currentLine = word;
        } else {
          currentLine += " " + word;
        }
      }
      if (currentLine.trim()) contentLines.push({ text: currentLine.trim(), fontSize: 10, bold: false });
    }
  }

  // Paginate
  const pages: { text: string; fontSize: number; bold: boolean; x: number; y: number }[][] = [];
  let currentPage: typeof pages[0] = [];
  let y = pageHeight - margin;

  for (const line of contentLines) {
    const lh = line.fontSize * 1.4;
    y -= lh;
    if (y < margin + 30) {
      pages.push(currentPage);
      currentPage = [];
      y = pageHeight - margin;
      y -= lh;
    }
    currentPage.push({ ...line, x: margin, y });
  }
  if (currentPage.length > 0) pages.push(currentPage);
  if (pages.length === 0) pages.push([{ text: "Empty Proposal", fontSize: 14, bold: false, x: margin, y: pageHeight - margin - 20 }]);

  // Build PDF
  const objects: string[] = [];
  let objCount = 0;
  const newObj = () => { objCount++; return objCount; };

  // Obj 1: Catalog
  const catalogId = newObj();
  // Obj 2: Pages
  const pagesId = newObj();

  // Font objects
  const fontId = newObj(); // Helvetica
  const fontBoldId = newObj(); // Helvetica-Bold

  // Page objects
  const pageObjIds: number[] = [];
  const contentObjIds: number[] = [];

  for (let i = 0; i < pages.length; i++) {
    pageObjIds.push(newObj());
    contentObjIds.push(newObj());
  }

  // Build object strings
  const objStrings: string[] = [];

  // Catalog
  objStrings.push(`${catalogId} 0 obj\n<< /Type /Catalog /Pages ${pagesId} 0 R >>\nendobj`);

  // Pages
  const kids = pageObjIds.map(id => `${id} 0 R`).join(" ");
  objStrings.push(`${pagesId} 0 obj\n<< /Type /Pages /Kids [${kids}] /Count ${pages.length} >>\nendobj`);

  // Fonts
  objStrings.push(`${fontId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj`);
  objStrings.push(`${fontBoldId} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj`);

  // Pages and content streams
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    let stream = "";
    stream += "BT\n";
    for (const item of page) {
      const fRef = item.bold ? "F2" : "F1";
      stream += `/${fRef} ${item.fontSize} Tf\n`;
      stream += `${item.x} ${item.y} Td\n`;
      stream += `(${esc(item.text)}) Tj\n`;
      stream += `${-item.x} ${-item.y} Td\n`;
    }
    stream += "ET\n";

    // Page footer
    stream += `BT /F1 8 Tf ${margin} 25 Td (Page ${i + 1} of ${pages.length}) Tj ET\n`;

    const streamBytes = new TextEncoder().encode(stream);

    objStrings.push(`${contentObjIds[i]} 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n${stream}endstream\nendobj`);
    objStrings.push(`${pageObjIds[i]} 0 obj\n<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentObjIds[i]} 0 R /Resources << /Font << /F1 ${fontId} 0 R /F2 ${fontBoldId} 0 R >> >> >>\nendobj`);
  }

  // Build final PDF
  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];

  for (const obj of objStrings) {
    offsets.push(pdf.length);
    pdf += obj + "\n";
  }

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objCount + 1}\n`;
  pdf += "0000000000 65535 f \n";

  // We need to map object IDs to offsets properly
  const offsetMap = new Map<number, number>();
  for (let i = 0; i < objStrings.length; i++) {
    const match = objStrings[i].match(/^(\d+) 0 obj/);
    if (match) offsetMap.set(parseInt(match[1]), offsets[i]);
  }

  for (let i = 1; i <= objCount; i++) {
    const off = offsetMap.get(i) || 0;
    pdf += `${String(off).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objCount + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Auth
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, supabaseAnon);
    const { data: { user } } = await anonClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { proposalId } = await req.json();
    if (!proposalId) throw new Error("Missing proposalId");

    const adminClient = createClient(supabaseUrl, serviceKey);

    const { data: proposal, error } = await adminClient
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single();
    if (error || !proposal) throw new Error("Proposal not found");

    // Generate PDF
    const pdfBytes = buildPDF(proposal);

    // Store in storage
    const fileName = `${user.id}/proposals/${proposalId}.pdf`;
    await adminClient.storage.from("documents").upload(fileName, pdfBytes, {
      contentType: "application/pdf",
      upsert: true,
    });

    // Get signed URL
    const { data: urlData } = await adminClient.storage
      .from("documents")
      .createSignedUrl(fileName, 3600); // 1 hour

    return new Response(JSON.stringify({ success: true, url: urlData?.signedUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("PDF Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
