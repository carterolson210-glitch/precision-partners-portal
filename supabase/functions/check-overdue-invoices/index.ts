import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

Deno.serve(async (_req) => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const today = new Date().toISOString().split("T")[0];

    // Mark overdue invoices
    const { data: overdueInvoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, client_email, client_name, due_date, total")
      .eq("status", "sent")
      .lt("due_date", today);

    if (overdueInvoices && overdueInvoices.length > 0) {
      for (const inv of overdueInvoices) {
        await supabase.from("invoices").update({ status: "overdue" }).eq("id", inv.id);
        console.log(`Invoice ${inv.invoice_number} marked overdue. Reminder email to ${inv.client_email}`);
      }
    }

    // Send reminders for invoices overdue by 7+ days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const reminderDate = sevenDaysAgo.toISOString().split("T")[0];

    const { data: reminderInvoices } = await supabase
      .from("invoices")
      .select("id, invoice_number, client_email, client_name, total, stripe_payment_link_url")
      .eq("status", "overdue")
      .lt("due_date", reminderDate);

    if (reminderInvoices && reminderInvoices.length > 0) {
      for (const inv of reminderInvoices) {
        console.log(`7-day overdue reminder for ${inv.invoice_number} sent to ${inv.client_email}`);
      }
    }

    return new Response(JSON.stringify({
      markedOverdue: overdueInvoices?.length || 0,
      remindersSent: reminderInvoices?.length || 0,
    }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("Overdue check error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
