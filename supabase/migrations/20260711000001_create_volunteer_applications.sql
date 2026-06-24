-- Create volunteer_applications table for VolunteerPage form submissions
-- The form was previously a stub that discarded data silently

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  country TEXT DEFAULT '',
  expertise TEXT DEFAULT '',
  availability TEXT DEFAULT '',
  motivation TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.volunteer_applications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can insert their own applications
CREATE POLICY "Users can insert volunteer applications"
  ON public.volunteer_applications FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Admins can view all applications
CREATE POLICY "Admins can view all volunteer applications"
  ON public.volunteer_applications FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- Anon can insert (public form)
CREATE POLICY "Anon can submit volunteer applications"
  ON public.volunteer_applications FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.volunteer_applications TO authenticated;
GRANT INSERT ON public.volunteer_applications TO anon;
