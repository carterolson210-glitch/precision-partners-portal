-- Add optional project_id to saved load calculations so extracted drawing values can be linked to a project
ALTER TABLE public.load_calculations
  ADD COLUMN project_id UUID NULL REFERENCES public.projects(id) ON DELETE SET NULL;
