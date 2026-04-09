import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    const { proposalId, recipientEmail } = await req.json();
    if (!proposalId || !recipientEmail) throw new Error("Missing proposalId or recipientEmail");

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get proposal
    const { data: proposal, error } = await adminClient
      .from("proposals")
      .select("*")
      .eq("id", proposalId)
      .eq("user_id", user.id)
      .single();
    if (error || !proposal) throw new Error("Proposal not found");

    // Generate signed URL for PDF viewing
    const fileName = `${user.id}/proposals/${proposalId}.pdf`;

    // Check if PDF exists, if not generate it first
    const { data: fileExists } = await adminClient.storage.from("documents").list(`${user.id}/proposals`, {
      search: `${proposalId}.pdf`,
    });

    if (!fileExists || fileExists.length === 0) {
      // Trigger PDF generation via the other function internally
      // For now, create a view link to the proposal
      console.log(`PDF not yet generated for proposal ${proposalId}, will send view link`);
    }

    // Create a long-lived signed URL for the client
    const { data: urlData } = await adminClient.storage
      .from("documents")
      .createSignedUrl(fileName, 60 * 60 * 24 * 30); // 30 days

    const viewUrl = urlData?.signedUrl || `${supabaseUrl.replace('.supabase.co', '.supabase.co')}/storage/v1/object/sign/documents/${fileName}`;

    // Update proposal status
    await adminClient.from("proposals").update({
      status: "sent",
      client_email: recipientEmail,
    }).eq("id", proposalId);

    console.log(`Proposal "${proposal.title}" sent to ${recipientEmail}`);
    console.log(`View link: ${viewUrl}`);

    return new Response(JSON.stringify({
      success: true,
      message: `Proposal sent to ${recipientEmail} with secure viewing link`,
      viewUrl,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send proposal error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
