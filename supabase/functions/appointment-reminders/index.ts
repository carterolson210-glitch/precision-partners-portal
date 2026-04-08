import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[APPOINTMENT-REMINDERS] ${step}${d}`);
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Reminder cron started");

    const now = new Date();

    // 48-hour reminders: appointments between 47-49 hours from now
    const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const date48 = in48h.toISOString().split("T")[0];

    const { data: appts48 } = await supabaseClient
      .from("appointments")
      .select("id, client_name, client_email, scheduled_date, start_time")
      .eq("status", "confirmed")
      .eq("reminder_48h_sent", false)
      .eq("scheduled_date", date48);

    logStep("48h candidates found", { count: appts48?.length || 0 });

    for (const apt of appts48 || []) {
      // Check if appointment time is within the next 47-49 hours
      const aptDateTime = new Date(`${apt.scheduled_date}T${apt.start_time}`);
      const hoursUntil = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil >= 47 && hoursUntil <= 49) {
        logStep("Sending 48h reminder", { id: apt.id, client: apt.client_name });
        await supabaseClient.functions.invoke("appointment-email", {
          body: { appointmentId: apt.id, type: "reminder_48h" },
        });
        await supabaseClient
          .from("appointments")
          .update({ reminder_48h_sent: true })
          .eq("id", apt.id);
      }
    }

    // 24-hour reminders: appointments between 23-25 hours from now
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const date24 = in24h.toISOString().split("T")[0];

    const { data: appts24 } = await supabaseClient
      .from("appointments")
      .select("id, client_name, client_email, scheduled_date, start_time")
      .eq("status", "confirmed")
      .eq("reminder_24h_sent", false)
      .eq("scheduled_date", date24);

    logStep("24h candidates found", { count: appts24?.length || 0 });

    for (const apt of appts24 || []) {
      const aptDateTime = new Date(`${apt.scheduled_date}T${apt.start_time}`);
      const hoursUntil = (aptDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil >= 23 && hoursUntil <= 25) {
        logStep("Sending 24h reminder", { id: apt.id, client: apt.client_name });
        await supabaseClient.functions.invoke("appointment-email", {
          body: { appointmentId: apt.id, type: "reminder_24h" },
        });
        await supabaseClient
          .from("appointments")
          .update({ reminder_24h_sent: true })
          .eq("id", apt.id);
      }
    }

    const totalSent = (appts48?.length || 0) + (appts24?.length || 0);
    logStep("Reminder cron completed", { totalProcessed: totalSent });

    return new Response(JSON.stringify({ success: true, reminders_processed: totalSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: msg });
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
