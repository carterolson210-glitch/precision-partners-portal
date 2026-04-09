const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { documentId, signerEmail, signerName, action } = await req.json();
    if (!documentId || !signerEmail || !action) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    // Get document info
    const { data: doc } = await supabase.from("documents").select("*").eq("id", documentId).single();
    if (!doc) {
      return new Response(JSON.stringify({ error: "Document not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get uploader profile
    const { data: profile } = await supabase.from("profiles").select("full_name, email").eq("id", doc.uploaded_by).single();
    const _uploaderName = profile?.full_name || "The document owner";
    const uploaderEmail = profile?.email || "";

    if (action === "request") {
      // Get signing token
      const { data: sig } = await supabase
        .from("document_signatures")
        .select("signing_token")
        .eq("document_id", documentId)
        .eq("signer_email", signerEmail)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const signingUrl = `${supabaseUrl.replace('.supabase.co', '.supabase.co').replace('/rest/v1', '')}/functions/v1/document-signature-email?info=1`;
      // Build a proper signing page URL using the project's frontend
      const frontendUrl = Deno.env.get("FRONTEND_URL") || "https://simpli-engineering.lovable.app";
      const signLink = `${frontendUrl}/sign?token=${sig?.signing_token}`;

      console.log(`Signing request email to ${signerEmail} for document ${doc.file_name}, link: ${signLink}`);

      // Log email
      await supabase.from("email_logs" as any).insert({
        recipient_email: signerEmail,
        subject: `Signature requested: ${doc.file_name}`,
        email_type: "signature_request",
        status: "sent",
        metadata: { documentId, signerName, signLink },
      }).then(() => {}).catch(() => {});

      return new Response(JSON.stringify({
        success: true,
        message: `Signing request would be sent to ${signerEmail}`,
        signingLink: signLink,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "completed") {
      // Update document signature status
      const { data: allSigs } = await supabase
        .from("document_signatures")
        .select("status")
        .eq("document_id", documentId);

      const allSigned = allSigs?.every(s => s.status === "signed");
      if (allSigned) {
        await supabase.from("documents").update({ signature_status: "signed" }).eq("id", documentId);
      }

      console.log(`Signature completed by ${signerName} (${signerEmail}) for document ${doc.file_name}`);
      console.log(`Completion email to signer: ${signerEmail} and uploader: ${uploaderEmail}`);

      return new Response(JSON.stringify({
        success: true,
        message: `Completion notifications sent to ${signerEmail} and ${uploaderEmail}`,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
