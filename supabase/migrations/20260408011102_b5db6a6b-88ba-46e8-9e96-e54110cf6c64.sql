-- Availability slots: recurring weekly time blocks an engineer makes available
CREATE TABLE public.availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  consultation_type text NOT NULL DEFAULT 'General Consultation',
  duration_minutes integer NOT NULL DEFAULT 60,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own availability"
  ON public.availability_slots FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Anyone can view active availability"
  ON public.availability_slots FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- Appointments: actual booked meetings
CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engineer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_name text NOT NULL,
  client_email text NOT NULL,
  scheduled_date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  consultation_type text NOT NULL DEFAULT 'General Consultation',
  status text NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed', 'rescheduled')),
  notes text,
  reminder_48h_sent boolean NOT NULL DEFAULT false,
  reminder_24h_sent boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Engineers can manage own appointments"
  ON public.appointments FOR ALL
  TO authenticated
  USING (engineer_id = auth.uid())
  WITH CHECK (engineer_id = auth.uid());

CREATE POLICY "Anon can insert appointments for booking"
  ON public.appointments FOR INSERT
  TO anon
  WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;