import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")!;
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });

    const body = await req.text();
    let event: Stripe.Event;

    if (webhookSecret) {
      const sig = req.headers.get("stripe-signature")!;
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoice_id;
      const templatePurchaseId = session.metadata?.template_purchase_id;

      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      if (invoiceId) {
        await supabase.from("invoices").update({
          status: "paid",
          paid_at: new Date().toISOString(),
          stripe_payment_intent_id: session.payment_intent as string,
        }).eq("id", invoiceId);

        console.log(`Invoice ${invoiceId} marked as paid via Stripe webhook`);
      }

      if (templatePurchaseId) {
        await supabase.from("template_purchases").update({
          status: "completed",
        }).eq("id", templatePurchaseId);

        console.log(`Template purchase ${templatePurchaseId} marked as completed via Stripe webhook`);
      }
    }

    // Handle subscription events
    if (event.type === "customer.subscription.created") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Get the product ID from the subscription
        const productId = subscription.items.data[0]?.price.product as string;

        await supabase.from("user_subscriptions").upsert({
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          product_id: productId,
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        });

        console.log(`Subscription created for user ${userId} with trial`);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.user_id;

      if (userId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        await supabase.from("user_subscriptions").update({
          status: subscription.status,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
          trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
          cancel_at_period_end: subscription.cancel_at_period_end,
        }).eq("stripe_subscription_id", subscription.id);

        console.log(`Subscription updated for user ${userId}`);
      }
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string;

      if (subscriptionId) {
        const supabase = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // Update subscription status when payment succeeds (trial to active)
        await supabase.from("user_subscriptions").update({
          status: "active",
        }).eq("stripe_subscription_id", subscriptionId);

        console.log(`Payment succeeded for subscription ${subscriptionId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Webhook error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
