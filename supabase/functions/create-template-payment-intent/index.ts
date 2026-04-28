import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-platform-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email || !user.id) {
      throw new Error("User must be authenticated to initiate payment");
    }

    const { templateSlug, templateName, amountCents } = await req.json();
    if (!templateSlug || !templateName || !amountCents) {
      throw new Error("Missing required payment fields");
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
    if (!stripeKey) {
      throw new Error("Stripe secret key is not configured");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId: string | undefined;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    }

    const purchaseId = crypto.randomUUID();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      customer: customerId,
      receipt_email: user.email,
      description: `Purchase of ${templateName}`,
      automatic_payment_methods: { enabled: true },
      metadata: {
        user_id: user.id,
        template_slug: templateSlug,
        template_name: templateName,
        template_purchase_id: purchaseId,
      },
    });

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await serviceClient.from("template_purchases").insert({
      id: purchaseId,
      user_id: user.id,
      template_slug: templateSlug,
      template_name: templateName,
      stripe_payment_intent_id: paymentIntent.id,
      currency: "usd",
      amount_cents: amountCents,
      status: "pending",
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret, purchaseId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});