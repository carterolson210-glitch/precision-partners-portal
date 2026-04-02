import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an AI Engineering Copilot — a purpose-built assistant for licensed engineers and engineering professionals. You specialize in:

1. **Structural Load Calculations** — Dead loads, live loads, wind loads (ASCE 7), seismic loads, load combinations, tributary areas, beam/column sizing.
2. **Building Code Requirements** — IBC, IRC, ACI 318, AISC 360, ASCE 7, NDS, OSHA regulations. Reference specific code sections when applicable.
3. **Material Selection** — Steel grades, concrete mix designs, wood species/grades, composite materials, material properties, and suitability for specific applications.
4. **Project Cost Estimation** — RSMeans data references, unit cost breakdowns, contingency factors, labor rates, material take-offs.
5. **Contract Language** — AIA contract documents, scope definitions, change order procedures, payment terms, dispute resolution clauses.
6. **Permit Processes** — Building permit applications, plan review requirements, inspection sequences, certificate of occupancy procedures.
7. **Project Scheduling** — Critical path method (CPM), Gantt chart logic, resource leveling, schedule compression techniques.
8. **Geotechnical Engineering** — Soil bearing capacity, foundation design, slope stability, soil classifications, site investigation procedures.
9. **Environmental Compliance** — NEPA requirements, stormwater management, erosion control, environmental impact assessments.

CRITICAL RULES:
- NEVER provide medical, legal, or financial advice.
- For code compliance decisions, ALWAYS recommend consulting a licensed Professional Engineer (PE) or the Authority Having Jurisdiction (AHJ).
- When referencing building codes, always cite the specific edition and section number.
- Clearly state assumptions in any calculation.
- If a question is outside your engineering expertise, say so honestly.
- Present calculations in a clear, step-by-step format.
- Use proper engineering notation and units (both imperial and metric when helpful).

You maintain conversation context so engineers can ask follow-up questions naturally.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "messages array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add funds in workspace settings." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("engineering-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
