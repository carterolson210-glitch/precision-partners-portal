import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-supabase-client-runtime",
};

const SYSTEM_PROMPT = `You are an AI-powered code compliance checker for licensed structural and electrical engineers.
Evaluate saved load calculations against the following building code references only: ASCE 7-22, ACI 318-19, AISC 360-22, and IBC 2021.

Instructions:
- Review every calculation provided for the selected project.
- Classify each calculation into one of three categories: PASS, REVIEW, or FLAG.
- REVIEW means the calculation is within 10% of a code limit or a required check is borderline and should be verified by a licensed engineer.
- FLAG means the calculation exceeds a code limit, is missing a required code check, or otherwise violates a specific code requirement.
- For each flag, include the exact code section triggered and a concise issue description.
- If a required value is missing or ambiguous, classify as REVIEW and say what additional information is needed.
- Use code section citations in the format: "ASCE 7-22 §2.3.4", "ACI 318-19 §1.4.1", "AISC 360-22 §B1", "IBC 2021 §1604.3".
- Do not include any markdown formatting in the output. Respond only with valid JSON.

Required JSON schema:
{
  "projectId": "string",
  "checkedAt": "string",
  "overallStatus": "PASS|REVIEW|FLAG",
  "summary": "string",
  "codeReferences": ["string"],
  "results": [
    {
      "calculationId": "string",
      "title": "string",
      "category": "PASS|REVIEW|FLAG",
      "summary": "string",
      "flags": [
        {
          "id": "string",
          "field": "string",
          "codeSection": "string",
          "issue": "string",
          "value": "string",
          "limit": "string",
          "status": "PASS|REVIEW|FLAG"
        }
      ]
    }
  ]
}

Use the following JSON array of calculations. Each calculation includes a title, inputs, and the computed load totals. Evaluate the saved calculation data and identify any code compliance concerns. Output clean JSON only.
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const projectId = body?.projectId;

    if (!projectId || typeof projectId !== "string") {
      return new Response(
        JSON.stringify({ error: "projectId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_ANON_KEY");
    const anthopicKey = Deno.env.get("ANTHROPIC_API_KEY");

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration is missing in function environment");
    }
    if (!anthopicKey) {
      throw new Error("Anthropic API key is not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });

    const { data: calculations, error } = await supabase
      .from("load_calculations")
      .select("id, inputs, total_amps, total_kw, created_at")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Supabase load_calculations error", error);
      throw error;
    }

    const parsedCalculations = (calculations || []).map((item: any) => ({
      id: item.id,
      title: item.inputs?.description || `Calculation ${item.id.slice(0, 8)}`,
      inputs: item.inputs || {},
      total_amps: item.total_amps ?? 0,
      total_kw: item.total_kw ?? 0,
    }));

    const prompt = `${SYSTEM_PROMPT}

Project ID: ${projectId}

Calculations:
${JSON.stringify(parsedCalculations, null, 2)}
`;

    const response = await fetch("https://api.anthropic.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthopicKey,
      },
      body: JSON.stringify({
        model: "claude-3.5-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Anthropic error", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = await response.json();
    const aiText = payload?.choices?.[0]?.message?.content || payload?.completion || "";

    let report = null;
    try {
      report = JSON.parse(aiText);
    } catch (error) {
      console.error("Failed to parse Anthropic output", aiText, error);
      return new Response(
        JSON.stringify({ error: "Unable to parse AI response as JSON", aiText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ report, projectId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("code-compliance-check error", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
