import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY is not set");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");

    // First check our database for subscription status
    const { data: subData, error: subError } = await supabaseClient
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (!subError && subData && subData.length > 0) {
      const subscription = subData[0];
      const isActive = subscription.status === "active" || subscription.status === "trialing";
      const now = new Date();
      const periodEnd = new Date(subscription.current_period_end);

      return new Response(JSON.stringify({
        subscribed: isActive,
        product_id: subscription.product_id,
        subscription_end: periodEnd.toISOString(),
        status: subscription.status,
        trial_end: subscription.trial_end,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Fallback to Stripe API if no database record exists
    const stripe = new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" });
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });

    if (customers.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const customerId = customers.data[0].id;
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = subscriptions.data[0];
    const hasActiveSub = subscription.status === "active" || subscription.status === "trialing";
    const productId = subscription.items.data[0]?.price.product as string;
    const subscriptionEnd = new Date(subscription.current_period_end * 1000).toISOString();
    const trialEnd = subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null;

    return new Response(JSON.stringify({
      subscribed: hasActiveSub,
      product_id: productId,
      subscription_end: subscriptionEnd,
      status: subscription.status,
      trial_end: trialEnd,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ error: msg }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
