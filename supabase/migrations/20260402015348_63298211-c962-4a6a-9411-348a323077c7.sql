
-- PE stamps metadata table
CREATE TABLE public.pe_stamps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL DEFAULT 'My PE Stamp',
  license_number text NOT NULL,
  state text NOT NULL,
  discipline text NOT NULL,
  expiration_date date NOT NULL,
  stamp_file_path text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.pe_stamps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own stamps" ON public.pe_stamps
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can insert own stamps" ON public.pe_stamps
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own stamps" ON public.pe_stamps
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can delete own stamps" ON public.pe_stamps
  FOR DELETE TO authenticated USING (user_id = auth.uid());

-- Storage bucket for stamp images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pe-stamps', 'pe-stamps', false, 5242880, ARRAY['image/png', 'image/svg+xml']);

-- Storage RLS: users can manage their own folder
CREATE POLICY "Users can upload own stamps" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pe-stamps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view own stamps" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'pe-stamps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update own stamps" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'pe-stamps' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete own stamps" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'pe-stamps' AND (storage.foldername(name))[1] = auth.uid()::text);
