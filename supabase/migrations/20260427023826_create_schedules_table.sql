-- Create schedules table for managing job appointments
CREATE TABLE public.schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  project_address TEXT NOT NULL,
  job_type TEXT NOT NULL CHECK (job_type IN ('inspection', 'installation', 'service_call', 'estimate_walkthrough')),
  assigned_to TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own schedules" ON public.schedules FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can insert own schedules" ON public.schedules FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own schedules" ON public.schedules FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users can delete own schedules" ON public.schedules FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();