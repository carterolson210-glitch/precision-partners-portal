import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@18.5.0";

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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;

    // Auth user
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, supabaseAnon);
    const { data: { user } } = await anonClient.auth.getUser(token);
    if (!user) throw new Error("Not authenticated");

    const { invoiceId } = await req.json();
    if (!invoiceId) throw new Error("Missing invoiceId");

    const adminClient = createClient(supabaseUrl, serviceKey);

    // Get invoice
    const { data: invoice, error: invErr } = await adminClient
      .from("invoices")
      .select("*")
      .eq("id", invoiceId)
      .eq("user_id", user.id)
      .single();
    if (invErr || !invoice) throw new Error("Invoice not found");

    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    // Create a Stripe product + price for this invoice
    const product = await stripe.products.create({
      name: `Invoice ${invoice.invoice_number}`,
      metadata: { invoice_id: invoice.id, user_id: user.id },
    });

    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: invoice.total,
      currency: invoice.currency,
    });

    // Create checkout session
    const origin = req.headers.get("origin") || "https://simpli-engineering.lovable.app";
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: price.id, quantity: 1 }],
      mode: "payment",
      customer_email: invoice.client_email,
      success_url: `${origin}/invoice-paid?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/dashboard/invoicing`,
      metadata: { invoice_id: invoice.id, user_id: user.id },
    });

    // Update invoice with Stripe info
    await adminClient.from("invoices").update({
      status: "sent",
      stripe_checkout_session_id: session.id,
      stripe_payment_link_url: session.url,
    }).eq("id", invoice.id);

    // Log email action
    console.log(`Invoice ${invoice.invoice_number} sent to ${invoice.client_email} with payment link: ${session.url}`);

    return new Response(JSON.stringify({ success: true, url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
