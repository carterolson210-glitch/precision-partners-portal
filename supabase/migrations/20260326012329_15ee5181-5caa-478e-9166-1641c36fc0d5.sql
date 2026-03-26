CREATE TABLE public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  referred_email text,
  signup_date timestamptz DEFAULT now(),
  conversion_date timestamptz,
  credit_applied boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals"
ON public.referrals FOR SELECT TO authenticated
USING (referrer_id = auth.uid());

CREATE POLICY "Users can insert referrals"
ON public.referrals FOR INSERT TO authenticated
WITH CHECK (referrer_id = auth.uid());

CREATE POLICY "Anon can insert referrals via signup"
ON public.referrals FOR INSERT TO anon
WITH CHECK (true);