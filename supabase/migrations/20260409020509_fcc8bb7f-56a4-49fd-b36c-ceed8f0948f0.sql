
CREATE TABLE public.proposals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled Proposal',
  client_name TEXT NOT NULL DEFAULT '',
  client_email TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  sections JSONB NOT NULL DEFAULT '[
    {"title":"Executive Summary","content":""},
    {"title":"Scope of Work","content":""},
    {"title":"Methodology","content":""},
    {"title":"Team Qualifications","content":""},
    {"title":"Timeline","content":""},
    {"title":"Fee Schedule","content":""},
    {"title":"Terms & Conditions","content":""}
  ]'::jsonb,
  firm_name TEXT NOT NULL DEFAULT '',
  firm_email TEXT NOT NULL DEFAULT '',
  firm_phone TEXT NOT NULL DEFAULT '',
  firm_address TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  notes TEXT,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own proposals" ON public.proposals FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own proposals" ON public.proposals FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own proposals" ON public.proposals FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own proposals" ON public.proposals FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_proposals_updated_at BEFORE UPDATE ON public.proposals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Also add firm_name, firm_phone, firm_address to profiles for reuse
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS firm_name TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS firm_phone TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS firm_address TEXT DEFAULT '';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
