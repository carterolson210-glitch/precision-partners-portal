-- Run this SQL in your Supabase SQL editor to create the user_subscriptions table

-- Create user_subscriptions table for managing Stripe subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id text UNIQUE NOT NULL,
  stripe_customer_id text NOT NULL,
  product_id text NOT NULL,
  status text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  trial_start timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view own subscription"
  ON public.user_subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all subscriptions" ON public.user_subscriptions;
CREATE POLICY "Service role can manage all subscriptions"
  ON public.user_subscriptions FOR ALL
  TO service_role
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription_id ON public.user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);