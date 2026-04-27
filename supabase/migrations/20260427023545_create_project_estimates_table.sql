-- Create project_estimates table for storing project cost estimates
CREATE TABLE public.project_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  client_name TEXT NOT NULL,
  location TEXT,
  project_type TEXT NOT NULL CHECK (project_type IN ('residential', 'commercial', 'industrial')),
  labor_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  materials_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  overhead DECIMAL(12,2) NOT NULL DEFAULT 0,
  profit DECIMAL(12,2) NOT NULL DEFAULT 0,
  grand_total DECIMAL(12,2) NOT NULL DEFAULT 0,
  line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project estimates" ON public.project_estimates FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own project estimates" ON public.project_estimates FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own project estimates" ON public.project_estimates FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own project estimates" ON public.project_estimates FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_project_estimates_updated_at BEFORE UPDATE ON public.project_estimates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();