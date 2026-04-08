import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const logStep = (step: string, details?: any) => {
  const d = details ? ` - ${JSON.stringify(details)}` : "";
  console.log(`[APPOINTMENT-EMAIL] ${step}${d}`);
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
    const { appointmentId, type } = await req.json();
    if (!appointmentId || !type) {
      return new Response(JSON.stringify({ error: "appointmentId and type are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    logStep("Processing email", { appointmentId, type });

    const { data: appointment, error: aptErr } = await supabaseClient
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (aptErr || !appointment) {
      logStep("Appointment not found", { error: aptErr?.message });
      return new Response(JSON.stringify({ error: "Appointment not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", appointment.engineer_id)
      .single();

    const engineerName = profile?.full_name || "Your Engineer";
    const engineerEmail = profile?.email || "";

    const dateStr = new Date(appointment.scheduled_date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const timeStr = `${appointment.start_time.slice(0, 5)} – ${appointment.end_time.slice(0, 5)}`;

    let subject = "";
    let bodyHtml = "";

    switch (type) {
      case "confirmation":
        subject = `Appointment Confirmed: ${dateStr}`;
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1f36;">Appointment Confirmed</h2>
            <p>Hi ${appointment.client_name},</p>
            <p>Your consultation has been confirmed with the following details:</p>
            <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${appointment.consultation_type}</p>
              <p style="margin: 4px 0;"><strong>Engineer:</strong> ${engineerName}</p>
              ${appointment.notes ? `<p style="margin: 4px 0;"><strong>Notes:</strong> ${appointment.notes}</p>` : ""}
            </div>
            <p style="color: #666; font-size: 13px;">If you need to reschedule or cancel, please contact us.</p>
          </div>
        `;
        break;

      case "cancellation":
        subject = `Appointment Cancelled: ${dateStr}`;
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #cc0000;">Appointment Cancelled</h2>
            <p>Hi ${appointment.client_name},</p>
            <p>Your appointment scheduled for <strong>${dateStr}</strong> at <strong>${timeStr}</strong> has been cancelled.</p>
            <p>If you'd like to rebook, please visit our scheduling page.</p>
          </div>
        `;
        break;

      case "reschedule":
        subject = `Appointment Rescheduled: ${dateStr}`;
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #b8860b;">Appointment Rescheduled</h2>
            <p>Hi ${appointment.client_name},</p>
            <p>Your appointment has been rescheduled to:</p>
            <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>New Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;"><strong>New Time:</strong> ${timeStr}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${appointment.consultation_type}</p>
              <p style="margin: 4px 0;"><strong>Engineer:</strong> ${engineerName}</p>
            </div>
            <p style="color: #666; font-size: 13px;">If this new time doesn't work for you, please contact us.</p>
          </div>
        `;
        break;

      case "reminder_48h":
        subject = `Reminder: Appointment in 2 Days – ${dateStr}`;
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1f36;">Appointment Reminder</h2>
            <p>Hi ${appointment.client_name},</p>
            <p>This is a friendly reminder that your consultation is in <strong>2 days</strong>.</p>
            <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${appointment.consultation_type}</p>
            </div>
          </div>
        `;
        break;

      case "reminder_24h":
        subject = `Reminder: Appointment Tomorrow – ${dateStr}`;
        bodyHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #1a1f36;">Appointment Tomorrow</h2>
            <p>Hi ${appointment.client_name},</p>
            <p>Just a reminder that your consultation is <strong>tomorrow</strong>.</p>
            <div style="background: #f7f7f7; border-radius: 8px; padding: 16px; margin: 16px 0;">
              <p style="margin: 4px 0;"><strong>Date:</strong> ${dateStr}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${timeStr}</p>
              <p style="margin: 4px 0;"><strong>Type:</strong> ${appointment.consultation_type}</p>
            </div>
          </div>
        `;
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown email type: ${type}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    logStep("Email prepared", {
      to: appointment.client_email,
      cc: engineerEmail,
      subject,
      type,
    });

    try {
      const sendResult = await supabaseClient.functions.invoke("send-transactional-email", {
        body: {
          templateName: `appointment-${type}`,
          recipientEmail: appointment.client_email,
          idempotencyKey: `appointment-${type}-${appointmentId}`,
          templateData: {
            clientName: appointment.client_name,
            date: dateStr,
            time: timeStr,
            consultationType: appointment.consultation_type,
            engineerName,
            notes: appointment.notes,
          },
        },
      });
      logStep("Transactional email sent", { result: sendResult.data });
    } catch (emailErr) {
      logStep("Transactional email not available, email logged only", { error: String(emailErr) });
    }

    if (engineerEmail) {
      try {
        await supabaseClient.functions.invoke("send-transactional-email", {
          body: {
            templateName: `appointment-${type}`,
            recipientEmail: engineerEmail,
            idempotencyKey: `appointment-${type}-${appointmentId}-engineer`,
            templateData: {
              clientName: appointment.client_name,
              date: dateStr,
              time: timeStr,
              consultationType: appointment.consultation_type,
              engineerName,
              notes: appointment.notes,
            },
          },
        });
      } catch {
        logStep("Engineer email fallback — logged only");
      }
    }

    return new Response(JSON.stringify({ success: true, type, subject }), {
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
