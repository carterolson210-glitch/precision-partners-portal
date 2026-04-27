-- Create load_calculations table for electrical load calculations
CREATE TABLE public.load_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  inputs JSONB NOT NULL DEFAULT '{}'::jsonb,
  total_amps DECIMAL(10,2) NOT NULL,
  total_kw DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.load_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own load calculations" ON public.load_calculations FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own load calculations" ON public.load_calculations FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own load calculations" ON public.load_calculations FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own load calculations" ON public.load_calculations FOR DELETE TO authenticated USING (user_id = auth.uid());