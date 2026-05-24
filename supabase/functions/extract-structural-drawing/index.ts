import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version, x-supabase-client-runtime",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { rawText, fileName } = body;

    if (!rawText || typeof rawText !== "string") {
      return new Response(
        JSON.stringify({ error: "rawText is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthopicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthopicKey) {
      throw new Error("No Anthropic API key configured in the environment");
    }

    const prompt = `You are an AI assistant for licensed engineers. The text below has been extracted from a PDF structural drawing or plan set. Respond ONLY with valid JSON and no additional commentary.\n\nFile: ${fileName}\n\nExtract the following values from the drawing text:\n- slab thickness (in inches or millimeters)\n- concrete unit weight (e.g. 150 pcf or 24 kN/m3)\n- superimposed dead load (in psf or kN/m2)\n- occupancy type or use from the title block\n- structural member sizes (beams, columns, slabs, even if summarized)\n\nIf a value is not present, return \"unknown\" and confidence 0.1.\nReturn JSON exactly in this format:\n{\n  "slabThickness": { "value": "", "confidence": 0.0, "note": "" },\n  "unitWeight": { "value": "", "confidence": 0.0, "note": "" },\n  "superimposedDeadLoad": { "value": "", "confidence": 0.0, "note": "" },\n  "occupancyType": { "value": "", "confidence": 0.0, "note": "" },\n  "memberSizes": { "value": "", "confidence": 0.0, "note": "" }\n}\n\nText:\n${rawText}`;

    const response = await fetch("https://api.anthropic.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthopicKey,
      },
      body: JSON.stringify({
        model: "claude-3.5-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 800,
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

    let analysis = null;
    try {
      analysis = JSON.parse(aiText);
    } catch (error) {
      console.error("Failed to parse Anthropic output", aiText, error);
      return new Response(
        JSON.stringify({ error: "Unable to parse AI analysis result" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ analysis }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("extract-structural-drawing error", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
