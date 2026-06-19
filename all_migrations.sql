CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  country text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'donor' CHECK (role IN ('donor', 'admin')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  age integer NOT NULL,
  grade text NOT NULL,
  photo_url text,
  bio text NOT NULL,
  family_background text,
  sponsorship_status text NOT NULL DEFAULT 'available' CHECK (sponsorship_status IN ('available', 'partially_sponsored', 'fully_sponsored')),
  sponsorship_amount integer NOT NULL DEFAULT 50,
  current_sponsorship integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE SET NULL,
  amount integer NOT NULL,
  frequency text NOT NULL DEFAULT 'one-time' CHECK (frequency IN ('one-time', 'monthly', 'annual')),
  status text NOT NULL DEFAULT 'pledged' CHECK (status IN ('pledged', 'received', 'cancelled')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS sponsorships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  start_date timestamptz DEFAULT now(),
  end_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (donor_id, student_id)
);
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'updates' CHECK (category IN ('updates', 'events', 'impact')),
  content text NOT NULL,
  excerpt text NOT NULL,
  image_url text,
  published boolean DEFAULT true,
  published_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('photo', 'video', 'testimonial')),
  title text NOT NULL,
  caption text,
  url text NOT NULL,
  thumbnail_url text,
  author text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE TABLE IF NOT EXISTS contact_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  subject text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE sponsorships ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Anyone can view students" ON students;
CREATE POLICY "Anyone can view students"
  ON students FOR SELECT
  TO authenticated
  USING (true);
DROP POLICY IF EXISTS "Anyone can view students anon" ON students;
CREATE POLICY "Anyone can view students anon"
  ON students FOR SELECT
  TO anon
  USING (true);
DROP POLICY IF EXISTS "Admins can insert students" ON students;
CREATE POLICY "Admins can insert students"
  ON students FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can update students" ON students;
CREATE POLICY "Admins can update students"
  ON students FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can delete students" ON students;
CREATE POLICY "Admins can delete students"
  ON students FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Donors can read own donations" ON donations;
CREATE POLICY "Donors can read own donations"
  ON donations FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "Admins can read all donations" ON donations;
CREATE POLICY "Admins can read all donations"
  ON donations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Donors can insert donations" ON donations;
CREATE POLICY "Donors can insert donations"
  ON donations FOR INSERT
  TO authenticated
  WITH CHECK (donor_id = auth.uid());
DROP POLICY IF EXISTS "Admins can update donations" ON donations;
CREATE POLICY "Admins can update donations"
  ON donations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Donors can read own sponsorships" ON sponsorships;
CREATE POLICY "Donors can read own sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "Admins can read all sponsorships" ON sponsorships;
CREATE POLICY "Admins can read all sponsorships"
  ON sponsorships FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can insert sponsorships" ON sponsorships;
CREATE POLICY "Admins can insert sponsorships"
  ON sponsorships FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can update sponsorships" ON sponsorships;
CREATE POLICY "Admins can update sponsorships"
  ON sponsorships FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Anyone can view published news" ON news;
CREATE POLICY "Anyone can view published news"
  ON news FOR SELECT
  TO authenticated
  USING (published = true);
DROP POLICY IF EXISTS "Anyone can view published news anon" ON news;
CREATE POLICY "Anyone can view published news anon"
  ON news FOR SELECT
  TO anon
  USING (published = true);
DROP POLICY IF EXISTS "Admins can insert news" ON news;
CREATE POLICY "Admins can insert news"
  ON news FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can update news" ON news;
CREATE POLICY "Admins can update news"
  ON news FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can delete news" ON news;
CREATE POLICY "Admins can delete news"
  ON news FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Anyone can view gallery" ON gallery_items;
CREATE POLICY "Anyone can view gallery"
  ON gallery_items FOR SELECT
  TO authenticated
  USING (true);
DROP POLICY IF EXISTS "Anyone can view gallery anon" ON gallery_items;
CREATE POLICY "Anyone can view gallery anon"
  ON gallery_items FOR SELECT
  TO anon
  USING (true);
DROP POLICY IF EXISTS "Admins can insert gallery items" ON gallery_items;
CREATE POLICY "Admins can insert gallery items"
  ON gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can update gallery items" ON gallery_items;
CREATE POLICY "Admins can update gallery items"
  ON gallery_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can delete gallery items" ON gallery_items;
CREATE POLICY "Admins can delete gallery items"
  ON gallery_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Admins can read contact submissions" ON contact_submissions;
CREATE POLICY "Admins can read contact submissions"
  ON contact_submissions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form"
  ON contact_submissions FOR INSERT
  TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can submit contact form anon" ON contact_submissions;
CREATE POLICY "Anyone can submit contact form anon"
  ON contact_submissions FOR INSERT
  TO anon
  WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can update contact submissions" ON contact_submissions;
CREATE POLICY "Admins can update contact submissions"
  ON contact_submissions FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sponsorships_updated_at
  BEFORE UPDATE ON sponsorships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_items_updated_at
  BEFORE UPDATE ON gallery_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX IF NOT EXISTS idx_students_status ON students(sponsorship_status);
CREATE INDEX IF NOT EXISTS idx_donations_donor ON donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_student ON donations(student_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_donor ON sponsorships(donor_id);
CREATE INDEX IF NOT EXISTS idx_sponsorships_student ON sponsorships(student_id);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_gallery_type ON gallery_items(type);
CREATE INDEX IF NOT EXISTS idx_contact_status ON contact_submissions(status);
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy Donor'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'donor'
    END
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    role = EXCLUDED.role,
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
CREATE OR REPLACE FUNCTION public.admin_toggle_role(target_user_id uuid, new_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calling_user_role text;
BEGIN
  SELECT role INTO calling_user_role
  FROM public.profiles
  WHERE id = auth.uid();
  IF calling_user_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;
  IF new_role NOT IN ('donor', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  UPDATE auth.users
  SET raw_user_meta_data =
    raw_user_meta_data || jsonb_build_object('role', new_role)
  WHERE id = target_user_id;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
END;
$$;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'finance_manager', 'sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'donor', 'volunteer', 'teacher_staff', 'public_user'));
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  level integer NOT NULL DEFAULT 0,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full platform access with system configuration', 100, true),
  ('admin', 'Admin', 'Manage donors, students, content, and moderate system', 90, true),
  ('finance_manager', 'Finance Manager', 'Manage donations, financial reports, receipts, payments', 80, true),
  ('sponsorship_manager', 'Sponsorship Manager', 'Manage student sponsorship lifecycle and donor relationships', 70, true),
  ('content_manager', 'Content Manager', 'Manage news, gallery, homepage content, and media uploads', 60, true),
  ('volunteer_coordinator', 'Volunteer Coordinator', 'Manage volunteer applications, events, scheduling', 50, true),
  ('donor', 'Donor', 'Personal dashboard, sponsorship access, donations, certificates', 40, true),
  ('volunteer', 'Volunteer', 'Volunteer dashboard, assigned tasks, events, attendance', 30, true),
  ('teacher_staff', 'Teacher/Staff', 'Student updates, class management, student progress', 20, true),
  ('public_user', 'Public User', 'Browse public content only', 10, true)
ON CONFLICT (name) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  group_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.permissions (code, name, description, group_name) VALUES
  ('users.read', 'Read Users', 'View user profiles and details', 'Users'),
  ('users.create', 'Create Users', 'Create new user accounts', 'Users'),
  ('users.update', 'Update Users', 'Edit user profile information', 'Users'),
  ('users.delete', 'Delete Users', 'Delete user accounts', 'Users'),
  ('users.manage_roles', 'Manage Roles', 'Assign and revoke user roles', 'Users'),
  ('users.invite', 'Invite Users', 'Send user invitations', 'Users'),
  ('users.suspend', 'Suspend Users', 'Suspend or ban user accounts', 'Users'),
  ('students.read', 'Read Students', 'View student profiles', 'Students'),
  ('students.create', 'Create Students', 'Add new students', 'Students'),
  ('students.update', 'Update Students', 'Edit student information', 'Students'),
  ('students.delete', 'Delete Students', 'Remove student records', 'Students'),
  ('donations.read', 'Read Donations', 'View donation records', 'Donations'),
  ('donations.create', 'Create Donations', 'Make new donations', 'Donations'),
  ('donations.update', 'Update Donations', 'Modify donation records', 'Donations'),
  ('donations.delete', 'Delete Donations', 'Delete donation records', 'Donations'),
  ('donations.export', 'Export Donations', 'Export donation data', 'Donations'),
  ('sponsorships.read', 'Read Sponsorships', 'View sponsorship records', 'Sponsorships'),
  ('sponsorships.create', 'Create Sponsorships', 'Start new sponsorships', 'Sponsorships'),
  ('sponsorships.update', 'Update Sponsorships', 'Modify sponsorship records', 'Sponsorships'),
  ('sponsorships.delete', 'Delete Sponsorships', 'Delete sponsorship records', 'Sponsorships'),
  ('sponsorships.renew', 'Renew Sponsorships', 'Process sponsorship renewals', 'Sponsorships'),
  ('news.read', 'Read News', 'View news articles', 'Content'),
  ('news.create', 'Create News', 'Create news articles', 'Content'),
  ('news.update', 'Update News', 'Edit news articles', 'Content'),
  ('news.delete', 'Delete News', 'Delete news articles', 'Content'),
  ('gallery.read', 'Read Gallery', 'View gallery items', 'Content'),
  ('gallery.create', 'Create Gallery', 'Add gallery items', 'Content'),
  ('gallery.update', 'Update Gallery', 'Edit gallery items', 'Content'),
  ('gallery.delete', 'Delete Gallery', 'Delete gallery items', 'Content'),
  ('contacts.read', 'Read Contacts', 'View contact submissions', 'Contacts'),
  ('contacts.update', 'Update Contacts', 'Update contact submission status', 'Contacts'),
  ('finances.read', 'Read Finances', 'View financial data and reports', 'Finance'),
  ('finances.export', 'Export Finances', 'Export financial reports', 'Finance'),
  ('finances.receipts', 'Manage Receipts', 'Generate and manage donation receipts', 'Finance'),
  ('volunteers.read', 'Read Volunteers', 'View volunteer profiles', 'Volunteers'),
  ('volunteers.create', 'Create Volunteers', 'Add volunteer records', 'Volunteers'),
  ('volunteers.update', 'Update Volunteers', 'Modify volunteer information', 'Volunteers'),
  ('volunteers.delete', 'Delete Volunteers', 'Remove volunteer records', 'Volunteers'),
  ('volunteers.assign', 'Assign Tasks', 'Assign tasks to volunteers', 'Volunteers'),
  ('events.read', 'Read Events', 'View events', 'Events'),
  ('events.create', 'Create Events', 'Create new events', 'Events'),
  ('events.update', 'Update Events', 'Edit event details', 'Events'),
  ('events.delete', 'Delete Events', 'Delete events', 'Events'),
  ('audit.read', 'Read Audit Logs', 'View audit log entries', 'Audit'),
  ('audit.export', 'Export Audit Logs', 'Export audit log data', 'Audit'),
  ('settings.read', 'Read Settings', 'View system settings', 'System'),
  ('settings.update', 'Update Settings', 'Modify system settings', 'System'),
  ('departments.manage', 'Manage Departments', 'Create and manage departments', 'System'),
  ('teams.manage', 'Manage Teams', 'Create and manage teams', 'System'),
  ('notifications.read', 'Read Notifications', 'View notifications', 'Notifications'),
  ('notifications.send', 'Send Notifications', 'Send system notifications', 'Notifications'),
  ('reports.generate', 'Generate Reports', 'Generate system reports', 'Reports'),
  ('reports.read', 'Read Reports', 'View generated reports', 'Reports'),
  ('profile.read', 'Read Profile', 'View own profile', 'Profile'),
  ('profile.update', 'Update Profile', 'Edit own profile', 'Profile'),
  ('profile.delete', 'Delete Account', 'Delete own account', 'Profile')
ON CONFLICT (code) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id uuid NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(role_id, permission_id)
);
CREATE OR REPLACE FUNCTION public.assign_role_permissions(p_role_name text, p_permission_codes text[])
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role_id uuid;
  v_permission_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = p_role_name;
  IF v_role_id IS NULL THEN
    RAISE EXCEPTION 'Role % not found', p_role_name;
  END IF;
  FOREACH v_permission_id IN ARRAY ARRAY(
    SELECT id FROM public.permissions WHERE code = ANY(p_permission_codes)
  )
  LOOP
    INSERT INTO public.role_permissions (role_id, permission_id)
    VALUES (v_role_id, v_permission_id)
    ON CONFLICT (role_id, permission_id) DO NOTHING;
  END LOOP;
END;
$$;
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, role_id)
);
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token text NOT NULL,
  ip_address text,
  user_agent text,
  device_info jsonb,
  location text,
  is_active boolean NOT NULL DEFAULT true,
  last_activity timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  expired_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON public.user_sessions(is_active);
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text,
  changes jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON public.audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at);
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  head_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.departments (name, description) VALUES
  ('Executive', 'Executive leadership and strategic direction'),
  ('Finance', 'Financial management and accounting'),
  ('Sponsorship', 'Student sponsorship programs and donor relations'),
  ('Content & Media', 'Content creation, news, and media management'),
  ('Volunteer Services', 'Volunteer coordination and event management'),
  ('Education', 'Teaching staff and educational programs'),
  ('IT & Systems', 'Information technology and systems administration')
ON CONFLICT (name) DO NOTHING;
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL,
  lead_user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.user_departments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id uuid NOT NULL REFERENCES public.departments(id) ON DELETE CASCADE,
  role_in_department text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, department_id)
);
CREATE TABLE IF NOT EXISTS public.user_teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, team_id)
);
CREATE TABLE IF NOT EXISTS public.invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role_id uuid REFERENCES public.roles(id) ON DELETE SET NULL,
  invited_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  message text,
  expires_at timestamptz NOT NULL,
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON public.invitations(email);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(token);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON public.invitations(status);
CREATE TABLE IF NOT EXISTS public.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_type text NOT NULL,
  requester_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  approver_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  data jsonb,
  notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON public.approvals(status);
CREATE INDEX IF NOT EXISTS idx_approvals_requester ON public.approvals(requester_id);
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  metadata jsonb,
  severity text NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'critical')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON public.security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON public.security_events(created_at);
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  data jsonb,
  read boolean NOT NULL DEFAULT false,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON public.notifications(created_at DESC);
CREATE TABLE IF NOT EXISTS public.volunteer_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  volunteer_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_name text NOT NULL,
  description text,
  role text,
  start_date timestamptz NOT NULL,
  end_date timestamptz,
  status text NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'completed', 'cancelled')),
  hours_logged numeric,
  notes text,
  assigned_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_user ON public.volunteer_assignments(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_assignments_status ON public.volunteer_assignments(status);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department_id uuid REFERENCES public.departments(id) ON DELETE SET NULL;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active'
  CHECK (status IN ('active', 'inactive', 'suspended', 'banned'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_login_at timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone_verified boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS two_factor_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS login_attempts integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS locked_until timestamptz;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_activity_at timestamptz;
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = role_name AND status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.has_permission(user_id uuid, permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = user_id AND perm.code = permission_code AND p.status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS text[]
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ARRAY(
    SELECT DISTINCT perm.code
    FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = user_id AND p.status = 'active'
    ORDER BY perm.code
  );
$$;
CREATE OR REPLACE FUNCTION public.get_role_level(user_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT r.level FROM public.profiles p
     JOIN public.roles r ON r.name = p.role
     WHERE p.id = user_id),
    0
  );
$$;
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  v_ip := current_setting('request.headers')::json->>'x-forwarded-for';
  v_ua := current_setting('request.headers')::json->>'user-agent';
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_changes, p_metadata, v_ip, v_ua)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  v_ip := current_setting('request.headers')::json->>'x-forwarded-for';
  v_ua := current_setting('request.headers')::json->>'user-agent';
  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, severity, metadata)
  VALUES (p_event_type, p_user_id, v_ip, v_ua, p_severity, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.track_user_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_activity_at = now()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text,
  p_assigner_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_level integer;
  target_level integer;
  new_role_level integer;
BEGIN
  IF target_user_id = COALESCE(p_assigner_id, auth.uid()) THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level
  INTO caller_role, caller_level
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = COALESCE(p_assigner_id, auth.uid());
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0) INTO target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  PERFORM public.log_audit_event(
    COALESCE(p_assigner_id, auth.uid()),
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role),
    jsonb_build_object('changed_by', COALESCE(p_assigner_id::text, auth.uid()::text))
  );
END;
$$;
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id uuid,
  p_type text,
  p_title text,
  p_message text DEFAULT NULL,
  p_data jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT status FROM public.profiles WHERE id = auth.uid();
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.rls_has_permission(permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.code = permission_code AND p.status = 'active'
  );
$$;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.volunteer_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "roles_read" ON public.roles;
CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "roles_insert" ON public.roles;
CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "roles_update" ON public.roles;
CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('settings.update'))
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "roles_delete" ON public.roles;
CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated
  USING (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "permissions_read" ON public.permissions;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "permissions_insert" ON public.permissions;
CREATE POLICY permissions_insert ON public.permissions FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "permissions_update" ON public.permissions;
CREATE POLICY permissions_update ON public.permissions FOR UPDATE TO authenticated
  USING (public.rls_has_permission('settings.update'))
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "permissions_delete" ON public.permissions;
CREATE POLICY permissions_delete ON public.permissions FOR DELETE TO authenticated
  USING (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "role_permissions_read" ON public.role_permissions;
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
CREATE POLICY role_permissions_insert ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;
CREATE POLICY role_permissions_delete ON public.role_permissions FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "user_roles_read_own" ON public.user_roles;
CREATE POLICY user_roles_read_own ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_roles_read_all" ON public.user_roles;
CREATE POLICY user_roles_read_all ON public.user_roles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "user_sessions_read_own" ON public.user_sessions;
CREATE POLICY user_sessions_read_own ON public.user_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_sessions_read_all" ON public.user_sessions;
CREATE POLICY user_sessions_read_all ON public.user_sessions FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "user_sessions_delete_own" ON public.user_sessions;
CREATE POLICY user_sessions_delete_own ON public.user_sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_sessions_delete_all" ON public.user_sessions;
CREATE POLICY user_sessions_delete_all ON public.user_sessions FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.suspend'));
DROP POLICY IF EXISTS "audit_logs_read" ON public.audit_logs;
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));
DROP POLICY IF EXISTS "departments_read" ON public.departments;
CREATE POLICY departments_read ON public.departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "departments_insert" ON public.departments;
CREATE POLICY departments_insert ON public.departments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "departments_update" ON public.departments;
CREATE POLICY departments_update ON public.departments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('departments.manage'))
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "departments_delete" ON public.departments;
CREATE POLICY departments_delete ON public.departments FOR DELETE TO authenticated
  USING (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "teams_read" ON public.teams;
CREATE POLICY teams_read ON public.teams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "teams_insert" ON public.teams;
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "teams_update" ON public.teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated
  USING (public.rls_has_permission('teams.manage'))
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "teams_delete" ON public.teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated
  USING (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "user_departments_read_own" ON public.user_departments;
CREATE POLICY user_departments_read_own ON public.user_departments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_departments_read_all" ON public.user_departments;
CREATE POLICY user_departments_read_all ON public.user_departments FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "user_departments_insert" ON public.user_departments;
CREATE POLICY user_departments_insert ON public.user_departments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "user_departments_delete" ON public.user_departments;
CREATE POLICY user_departments_delete ON public.user_departments FOR DELETE TO authenticated
  USING (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "user_teams_read_own" ON public.user_teams;
CREATE POLICY user_teams_read_own ON public.user_teams FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_teams_read_all" ON public.user_teams;
CREATE POLICY user_teams_read_all ON public.user_teams FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "user_teams_insert" ON public.user_teams;
CREATE POLICY user_teams_insert ON public.user_teams FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "user_teams_delete" ON public.user_teams;
CREATE POLICY user_teams_delete ON public.user_teams FOR DELETE TO authenticated
  USING (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "invitations_read_own" ON public.invitations;
CREATE POLICY invitations_read_own ON public.invitations FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
DROP POLICY IF EXISTS "invitations_read_all" ON public.invitations;
CREATE POLICY invitations_read_all ON public.invitations FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS "invitations_insert" ON public.invitations;
CREATE POLICY invitations_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS "invitations_update" ON public.invitations;
CREATE POLICY invitations_update ON public.invitations FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.invite'))
  WITH CHECK (public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS "approvals_read_own" ON public.approvals;
CREATE POLICY approvals_read_own ON public.approvals FOR SELECT TO authenticated
  USING (requester_id = auth.uid());
DROP POLICY IF EXISTS "approvals_read_all" ON public.approvals;
CREATE POLICY approvals_read_all ON public.approvals FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "approvals_insert" ON public.approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS "approvals_update" ON public.approvals;
CREATE POLICY approvals_update ON public.approvals FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS "security_events_read" ON public.security_events;
CREATE POLICY security_events_read ON public.security_events FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY notifications_read_own ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY notifications_insert_system ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('notifications.send'));
DROP POLICY IF EXISTS "volunteer_assignments_read_own" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_read_own ON public.volunteer_assignments FOR SELECT TO authenticated
  USING (volunteer_id = auth.uid());
DROP POLICY IF EXISTS "volunteer_assignments_read_all" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_read_all ON public.volunteer_assignments FOR SELECT TO authenticated
  USING (public.rls_has_permission('volunteers.read'));
DROP POLICY IF EXISTS "volunteer_assignments_insert" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_insert ON public.volunteer_assignments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('volunteers.create'));
DROP POLICY IF EXISTS "volunteer_assignments_update" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_update ON public.volunteer_assignments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('volunteers.update'))
  WITH CHECK (public.rls_has_permission('volunteers.update'));
DROP POLICY IF EXISTS "volunteer_assignments_delete" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_delete ON public.volunteer_assignments FOR DELETE TO authenticated
  USING (public.rls_has_permission('volunteers.delete'));
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.delete'));
DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can view students anon" ON public.students;
DROP POLICY IF EXISTS "Admins can insert/update/delete students" ON public.students;
DROP POLICY IF EXISTS "students_read_all" ON public.students;
CREATE POLICY students_read_all ON public.students FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "students_read_anon" ON public.students;
CREATE POLICY students_read_anon ON public.students FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "students_insert" ON public.students;
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('students.create'));
DROP POLICY IF EXISTS "students_update" ON public.students;
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated
  USING (public.rls_has_permission('students.update'))
  WITH CHECK (public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS "students_delete" ON public.students;
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));
DROP POLICY IF EXISTS "Donors can read own donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can read all donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;
DROP POLICY IF EXISTS "donations_read_own" ON public.donations;
CREATE POLICY donations_read_own ON public.donations FOR SELECT TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "donations_read_all" ON public.donations;
CREATE POLICY donations_read_all ON public.donations FOR SELECT TO authenticated
  USING (public.rls_has_permission('donations.read'));
DROP POLICY IF EXISTS "donations_insert" ON public.donations;
CREATE POLICY donations_insert ON public.donations FOR INSERT TO authenticated
  WITH CHECK (donor_id = auth.uid() OR public.rls_has_permission('donations.create'));
DROP POLICY IF EXISTS "donations_update" ON public.donations;
CREATE POLICY donations_update ON public.donations FOR UPDATE TO authenticated
  USING (public.rls_has_permission('donations.update'))
  WITH CHECK (public.rls_has_permission('donations.update'));
DROP POLICY IF EXISTS "Donors can read own sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Admins can read/insert/update sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "sponsorships_read_own" ON public.sponsorships;
CREATE POLICY sponsorships_read_own ON public.sponsorships FOR SELECT TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "sponsorships_read_all" ON public.sponsorships;
CREATE POLICY sponsorships_read_all ON public.sponsorships FOR SELECT TO authenticated
  USING (public.rls_has_permission('sponsorships.read'));
DROP POLICY IF EXISTS "sponsorships_insert" ON public.sponsorships;
CREATE POLICY sponsorships_insert ON public.sponsorships FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('sponsorships.create'));
DROP POLICY IF EXISTS "sponsorships_update" ON public.sponsorships;
CREATE POLICY sponsorships_update ON public.sponsorships FOR UPDATE TO authenticated
  USING (public.rls_has_permission('sponsorships.update'))
  WITH CHECK (public.rls_has_permission('sponsorships.update'));
DROP POLICY IF EXISTS "sponsorships_delete" ON public.sponsorships;
CREATE POLICY sponsorships_delete ON public.sponsorships FOR DELETE TO authenticated
  USING (public.rls_has_permission('sponsorships.delete'));
DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Anyone can view published news anon" ON public.news;
DROP POLICY IF EXISTS "Admins can insert/update/delete news" ON public.news;
DROP POLICY IF EXISTS "news_read_public" ON public.news;
CREATE POLICY news_read_public ON public.news FOR SELECT TO authenticated
  USING (published = true OR public.rls_has_permission('news.read'));
DROP POLICY IF EXISTS "news_read_anon" ON public.news;
CREATE POLICY news_read_anon ON public.news FOR SELECT TO anon
  USING (published = true);
DROP POLICY IF EXISTS "news_insert" ON public.news;
CREATE POLICY news_insert ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('news.create'));
DROP POLICY IF EXISTS "news_update" ON public.news;
CREATE POLICY news_update ON public.news FOR UPDATE TO authenticated
  USING (public.rls_has_permission('news.update'))
  WITH CHECK (public.rls_has_permission('news.update'));
DROP POLICY IF EXISTS "news_delete" ON public.news;
CREATE POLICY news_delete ON public.news FOR DELETE TO authenticated
  USING (public.rls_has_permission('news.delete'));
DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can view gallery anon" ON public.gallery_items;
DROP POLICY IF EXISTS "Admins can insert/update/delete gallery items" ON public.gallery_items;
DROP POLICY IF EXISTS "gallery_read_all" ON public.gallery_items;
CREATE POLICY gallery_read_all ON public.gallery_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "gallery_read_anon" ON public.gallery_items;
CREATE POLICY gallery_read_anon ON public.gallery_items FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS "gallery_insert" ON public.gallery_items;
CREATE POLICY gallery_insert ON public.gallery_items FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('gallery.create'));
DROP POLICY IF EXISTS "gallery_update" ON public.gallery_items;
CREATE POLICY gallery_update ON public.gallery_items FOR UPDATE TO authenticated
  USING (public.rls_has_permission('gallery.update'))
  WITH CHECK (public.rls_has_permission('gallery.update'));
DROP POLICY IF EXISTS "gallery_delete" ON public.gallery_items;
CREATE POLICY gallery_delete ON public.gallery_items FOR DELETE TO authenticated
  USING (public.rls_has_permission('gallery.delete'));
DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form anon" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "contacts_read" ON public.contact_submissions;
CREATE POLICY contacts_read ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.rls_has_permission('contacts.read'));
DROP POLICY IF EXISTS "contacts_insert" ON public.contact_submissions;
CREATE POLICY contacts_insert ON public.contact_submissions FOR INSERT TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contact_submissions;
CREATE POLICY contacts_insert_anon ON public.contact_submissions FOR INSERT TO anon
  WITH CHECK (true);
DROP POLICY IF EXISTS "contacts_update" ON public.contact_submissions;
CREATE POLICY contacts_update ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.rls_has_permission('contacts.update'))
  WITH CHECK (public.rls_has_permission('contacts.update'));
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_volunteer_assignments_updated_at
  BEFORE UPDATE ON public.volunteer_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER track_session_activity
  AFTER INSERT ON public.user_sessions
  FOR EACH ROW EXECUTE FUNCTION public.track_user_session();
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_donations_donor_status ON public.donations(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_sponsorships_status ON public.sponsorships(status);
CREATE INDEX IF NOT EXISTS idx_students_name ON public.students(name);
DO $$
DECLARE
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'super_admin';
  INSERT INTO public.role_permissions (role_id, permission_id)
  SELECT v_role_id, id FROM public.permissions
  ON CONFLICT (role_id, permission_id) DO NOTHING;
END $$;
DO $$
DECLARE
  v_role_id uuid;
BEGIN
  SELECT id INTO v_role_id FROM public.roles WHERE name = 'admin';
  PERFORM public.assign_role_permissions('admin', ARRAY[
    'users.read', 'users.create', 'users.update', 'users.invite', 'users.suspend',
    'students.read', 'students.create', 'students.update', 'students.delete',
    'donations.read', 'donations.create',
    'sponsorships.read', 'sponsorships.create', 'sponsorships.update', 'sponsorships.renew',
    'news.read', 'news.create', 'news.update', 'news.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete',
    'contacts.read', 'contacts.update',
    'volunteers.read', 'volunteers.create', 'volunteers.update',
    'events.read',
    'audit.read',
    'notifications.read', 'notifications.send',
    'reports.read', 'reports.generate',
    'profile.read', 'profile.update'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('finance_manager', ARRAY[
    'users.read',
    'donations.read', 'donations.create', 'donations.update', 'donations.export',
    'finances.read', 'finances.export', 'finances.receipts',
    'students.read',
    'sponsorships.read',
    'audit.read',
    'reports.read', 'reports.generate',
    'notifications.read',
    'profile.read', 'profile.update',
    'contacts.read'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('sponsorship_manager', ARRAY[
    'users.read',
    'students.read', 'students.create', 'students.update',
    'sponsorships.read', 'sponsorships.create', 'sponsorships.update', 'sponsorships.renew',
    'donations.read',
    'news.read',
    'gallery.read',
    'notifications.read', 'notifications.send',
    'reports.read',
    'profile.read', 'profile.update',
    'contacts.read'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('content_manager', ARRAY[
    'news.read', 'news.create', 'news.update', 'news.delete',
    'gallery.read', 'gallery.create', 'gallery.update', 'gallery.delete',
    'students.read',
    'notifications.read',
    'profile.read', 'profile.update'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('volunteer_coordinator', ARRAY[
    'users.read',
    'volunteers.read', 'volunteers.create', 'volunteers.update', 'volunteers.delete', 'volunteers.assign',
    'events.read', 'events.create', 'events.update', 'events.delete',
    'notifications.read', 'notifications.send',
    'reports.read',
    'profile.read', 'profile.update',
    'contacts.read'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('donor', ARRAY[
    'students.read',
    'donations.read', 'donations.create',
    'sponsorships.read',
    'news.read',
    'gallery.read',
    'notifications.read',
    'profile.read', 'profile.update',
    'contacts.read'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('volunteer', ARRAY[
    'students.read',
    'news.read',
    'gallery.read',
    'events.read',
    'volunteers.read',
    'notifications.read',
    'profile.read', 'profile.update'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('teacher_staff', ARRAY[
    'students.read', 'students.update',
    'news.read',
    'gallery.read',
    'notifications.read',
    'profile.read', 'profile.update'
  ]);
END $$;
DO $$
BEGIN
  PERFORM public.assign_role_permissions('public_user', ARRAY[
    'students.read',
    'news.read',
    'gallery.read',
    'profile.read', 'profile.update'
  ]);
END $$;
UPDATE public.profiles SET role = 'super_admin' WHERE email = 'admin@buddhaacademy.test';
UPDATE public.profiles SET role = 'donor' WHERE email = 'donor@buddhaacademy.test';
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'
  );
$$;
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT status FROM public.profiles WHERE id = auth.uid()),
    'inactive'
  );
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.rls_has_permission(permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.code = permission_code AND p.status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy User'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    'donor', 
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now()
  WHERE
    public.profiles.status = 'active'; 
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text) CASCADE;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text,
  p_assigner_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
  new_role_level integer;
  target_status text;
BEGIN
  caller_id := COALESCE(p_assigner_id, auth.uid());
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, target_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF target_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0), p.status
  INTO target_level, target_status
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= 90 AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign admin-level roles' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role, 'previous_level', target_level),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_changes, p_metadata, v_ip, v_ua)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, severity, metadata)
  VALUES (p_event_type, p_user_id, v_ip, v_ua, p_severity, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND status = (SELECT p.status FROM public.profiles p WHERE p.id = auth.uid())
  );
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS "profiles_delete" ON public.profiles;
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.delete'));
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.gallery_items TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.donations FROM anon;
REVOKE ALL ON public.sponsorships FROM anon;
REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.permissions FROM anon;
REVOKE ALL ON public.role_permissions FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_sessions FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;
REVOKE ALL ON public.security_events FROM anon;
REVOKE ALL ON public.departments FROM anon;
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.invitations FROM anon;
REVOKE ALL ON public.approvals FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.volunteer_assignments FROM anon;
REVOKE ALL ON public.user_departments FROM anon;
REVOKE ALL ON public.user_teams FROM anon;
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS "approvals_insert" ON public.approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
CREATE OR REPLACE FUNCTION public.create_demo_user(
  p_email text,
  p_password text,
  p_full_name text,
  p_country text,
  p_role text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  IF v_caller_role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can create users' USING ERRCODE = '42501';
  END IF;
  SELECT id INTO v_user_id FROM auth.users WHERE email = p_email;
  IF v_user_id IS NOT NULL THEN
    RETURN v_user_id;
  END IF;
  v_user_id := gen_random_uuid();
  INSERT INTO auth.users (
    instance_id, id, aud, role,
    email, encrypted_password,
    email_confirmed_at, last_sign_in_at,
    raw_app_meta_data, raw_user_meta_data,
    is_super_admin, is_sso_user,
    created_at, updated_at,
    confirmation_token, recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id,
    'authenticated', 'authenticated',
    p_email,
    crypt(p_password, gen_salt('bf', 10)),
    now(), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p_full_name, 'country', p_country),
    false, false,
    now(), now(),
    '', ''
  );
  INSERT INTO auth.identities (
    id, user_id, provider_id, identity_data, provider,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_user_id, v_user_id,
    p_email,
    jsonb_build_object('sub', v_user_id::text, 'email', p_email),
    'email',
    now(), now(), now()
  );
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (v_user_id, p_email, p_full_name, p_country, 'donor', 'active')
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now();
  PERFORM public.log_audit_event(
    auth.uid(),
    'create_user',
    'auth.users',
    v_user_id::text,
    jsonb_build_object('email', p_email, 'role', p_role),
    NULL
  );
  RETURN v_user_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.validate_user_session()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('suspended', 'banned') THEN
    UPDATE public.user_sessions
    SET is_active = false, expired_at = now()
    WHERE user_id = NEW.id AND is_active = true;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_profile_status_change ON public.profiles;
CREATE TRIGGER on_profile_status_change
  AFTER UPDATE OF status ON public.profiles
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status AND NEW.status IN ('suspended', 'banned'))
  EXECUTE FUNCTION public.validate_user_session();
CREATE OR REPLACE FUNCTION public.log_failed_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.security_events (event_type, user_id, severity, metadata)
  VALUES (
    'role_change_attempt',
    auth.uid(),
    'warning',
    jsonb_build_object(
      'target_user', NEW.id,
      'attempted_role', NEW.role,
      'previous_role', OLD.role
    )
  );
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION public.check_suspicious_activity(
  p_user_id uuid,
  p_action text
)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recent_count integer;
  v_is_suspicious boolean := false;
BEGIN
  SELECT COUNT(*) INTO v_recent_count
  FROM public.audit_logs
  WHERE user_id = p_user_id
    AND action = p_action
    AND created_at > now() - interval '5 minutes';
  IF v_recent_count > 10 THEN
    v_is_suspicious := true;
  END IF;
  RETURN v_is_suspicious;
END;
$$;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
DROP POLICY IF EXISTS roles_insert ON public.roles;
DROP POLICY IF EXISTS roles_update ON public.roles;
DROP POLICY IF EXISTS roles_delete ON public.roles;
DROP POLICY IF EXISTS "roles_insert" ON public.roles;
CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "roles_update" ON public.roles;
CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "roles_delete" ON public.roles;
CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_insert ON public.permissions;
DROP POLICY IF EXISTS permissions_update ON public.permissions;
DROP POLICY IF EXISTS permissions_delete ON public.permissions;
DROP POLICY IF EXISTS "permissions_insert" ON public.permissions;
CREATE POLICY permissions_insert ON public.permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "permissions_update" ON public.permissions;
CREATE POLICY permissions_update ON public.permissions FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS "permissions_delete" ON public.permissions;
CREATE POLICY permissions_delete ON public.permissions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS role_permissions_insert ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_delete ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
CREATE POLICY role_permissions_insert ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;
CREATE POLICY role_permissions_delete ON public.role_permissions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_sessions_delete_own ON public.user_sessions;
DROP POLICY IF EXISTS user_sessions_delete_all ON public.user_sessions;
DROP POLICY IF EXISTS "user_sessions_delete_own" ON public.user_sessions;
CREATE POLICY user_sessions_delete_own ON public.user_sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS "user_sessions_delete_all" ON public.user_sessions;
CREATE POLICY user_sessions_delete_all ON public.user_sessions FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.suspend'));
DROP POLICY IF EXISTS departments_insert ON public.departments;
DROP POLICY IF EXISTS departments_update ON public.departments;
DROP POLICY IF EXISTS departments_delete ON public.departments;
DROP POLICY IF EXISTS "departments_insert" ON public.departments;
CREATE POLICY departments_insert ON public.departments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "departments_update" ON public.departments;
CREATE POLICY departments_update ON public.departments FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "departments_delete" ON public.departments;
CREATE POLICY departments_delete ON public.departments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS teams_insert ON public.teams;
DROP POLICY IF EXISTS teams_update ON public.teams;
DROP POLICY IF EXISTS teams_delete ON public.teams;
DROP POLICY IF EXISTS "teams_insert" ON public.teams;
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "teams_update" ON public.teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "teams_delete" ON public.teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS user_departments_insert ON public.user_departments;
DROP POLICY IF EXISTS user_departments_delete ON public.user_departments;
DROP POLICY IF EXISTS "user_departments_insert" ON public.user_departments;
CREATE POLICY user_departments_insert ON public.user_departments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS "user_departments_delete" ON public.user_departments;
CREATE POLICY user_departments_delete ON public.user_departments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS user_teams_insert ON public.user_teams;
DROP POLICY IF EXISTS user_teams_delete ON public.user_teams;
DROP POLICY IF EXISTS "user_teams_insert" ON public.user_teams;
CREATE POLICY user_teams_insert ON public.user_teams FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS "user_teams_delete" ON public.user_teams;
CREATE POLICY user_teams_delete ON public.user_teams FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS invitations_insert ON public.invitations;
DROP POLICY IF EXISTS invitations_update ON public.invitations;
DROP POLICY IF EXISTS "invitations_insert" ON public.invitations;
CREATE POLICY invitations_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS "invitations_update" ON public.invitations;
CREATE POLICY invitations_update ON public.invitations FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.invite'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS approvals_update ON public.approvals;
DROP POLICY IF EXISTS "approvals_insert" ON public.approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
DROP POLICY IF EXISTS "approvals_update" ON public.approvals;
CREATE POLICY approvals_update ON public.approvals FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('users.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS notifications_insert_system ON public.notifications;
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY notifications_insert_system ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('notifications.send'));
DROP POLICY IF EXISTS volunteer_assignments_insert ON public.volunteer_assignments;
DROP POLICY IF EXISTS volunteer_assignments_update ON public.volunteer_assignments;
DROP POLICY IF EXISTS volunteer_assignments_delete ON public.volunteer_assignments;
DROP POLICY IF EXISTS "volunteer_assignments_insert" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_insert ON public.volunteer_assignments FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('volunteers.create'));
DROP POLICY IF EXISTS "volunteer_assignments_update" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_update ON public.volunteer_assignments FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('volunteers.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('volunteers.update'));
DROP POLICY IF EXISTS "volunteer_assignments_delete" ON public.volunteer_assignments;
CREATE POLICY volunteer_assignments_delete ON public.volunteer_assignments FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('volunteers.delete'));
DROP POLICY IF EXISTS students_insert ON public.students;
DROP POLICY IF EXISTS students_update ON public.students;
DROP POLICY IF EXISTS students_delete ON public.students;
DROP POLICY IF EXISTS "students_insert" ON public.students;
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('students.create'));
DROP POLICY IF EXISTS "students_update" ON public.students;
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('students.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS "students_delete" ON public.students;
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('students.delete'));
DROP POLICY IF EXISTS donations_insert ON public.donations;
DROP POLICY IF EXISTS donations_update ON public.donations;
DROP POLICY IF EXISTS "donations_insert" ON public.donations;
CREATE POLICY donations_insert ON public.donations FOR INSERT TO authenticated
  WITH CHECK (
    public.is_active_user()
    AND (donor_id = auth.uid() OR public.rls_has_permission('donations.create'))
  );
DROP POLICY IF EXISTS "donations_update" ON public.donations;
CREATE POLICY donations_update ON public.donations FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('donations.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('donations.update'));
DROP POLICY IF EXISTS sponsorships_insert ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_update ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_delete ON public.sponsorships;
DROP POLICY IF EXISTS "sponsorships_insert" ON public.sponsorships;
CREATE POLICY sponsorships_insert ON public.sponsorships FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('sponsorships.create'));
DROP POLICY IF EXISTS "sponsorships_update" ON public.sponsorships;
CREATE POLICY sponsorships_update ON public.sponsorships FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('sponsorships.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('sponsorships.update'));
DROP POLICY IF EXISTS "sponsorships_delete" ON public.sponsorships;
CREATE POLICY sponsorships_delete ON public.sponsorships FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('sponsorships.delete'));
DROP POLICY IF EXISTS news_insert ON public.news;
DROP POLICY IF EXISTS news_update ON public.news;
DROP POLICY IF EXISTS news_delete ON public.news;
DROP POLICY IF EXISTS "news_insert" ON public.news;
CREATE POLICY news_insert ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('news.create'));
DROP POLICY IF EXISTS "news_update" ON public.news;
CREATE POLICY news_update ON public.news FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('news.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('news.update'));
DROP POLICY IF EXISTS "news_delete" ON public.news;
CREATE POLICY news_delete ON public.news FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('news.delete'));
DROP POLICY IF EXISTS gallery_insert ON public.gallery_items;
DROP POLICY IF EXISTS gallery_update ON public.gallery_items;
DROP POLICY IF EXISTS gallery_delete ON public.gallery_items;
DROP POLICY IF EXISTS "gallery_insert" ON public.gallery_items;
CREATE POLICY gallery_insert ON public.gallery_items FOR INSERT TO authenticated
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('gallery.create'));
DROP POLICY IF EXISTS "gallery_update" ON public.gallery_items;
CREATE POLICY gallery_update ON public.gallery_items FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('gallery.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('gallery.update'));
DROP POLICY IF EXISTS "gallery_delete" ON public.gallery_items;
CREATE POLICY gallery_delete ON public.gallery_items FOR DELETE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('gallery.delete'));
DROP POLICY IF EXISTS contacts_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_update ON public.contact_submissions;
DROP POLICY IF EXISTS "contacts_update" ON public.contact_submissions;
CREATE POLICY contacts_update ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.is_active_user() AND public.rls_has_permission('contacts.update'))
  WITH CHECK (public.is_active_user() AND public.rls_has_permission('contacts.update'));
DROP POLICY IF EXISTS security_events_read ON public.security_events;
DROP POLICY IF EXISTS "security_events_read" ON public.security_events;
CREATE POLICY security_events_read ON public.security_events FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_demo_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'Cannot change your own status' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level INTO caller_role, caller_level
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0) INTO target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'status_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_status', new_status),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;
DELETE FROM auth.identities
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_sessions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.audit_logs
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.security_events
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.notifications
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_roles
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_departments
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.user_teams
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test')
);
DELETE FROM public.profiles
WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test');
DELETE FROM auth.users
WHERE email IN ('admin@buddhaacademy.test', 'donor@buddhaacademy.test');
DELETE FROM auth.identities WHERE user_id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM public.profiles WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DROP FUNCTION IF EXISTS public.create_demo_user(uuid, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_demo_user(text, text, text, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.create_demo_user CASCADE;
DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text) CASCADE;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = public.get_user_role()
    AND status = public.get_user_status()
  );
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS profiles_update_all ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_all" ON public.profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'
  );
$$;
CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT status FROM public.profiles WHERE id = auth.uid()),
    'inactive'
  );
$$;
CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.rls_has_permission(permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.code = permission_code AND p.status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy User'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    'donor',
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now()
  WHERE
    public.profiles.status = 'active';
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.gallery_items TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.donations FROM anon;
REVOKE ALL ON public.sponsorships FROM anon;
REVOKE ALL ON public.roles FROM anon;
REVOKE ALL ON public.permissions FROM anon;
REVOKE ALL ON public.role_permissions FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_sessions FROM anon;
REVOKE ALL ON public.audit_logs FROM anon;
REVOKE ALL ON public.security_events FROM anon;
REVOKE ALL ON public.departments FROM anon;
REVOKE ALL ON public.teams FROM anon;
REVOKE ALL ON public.invitations FROM anon;
REVOKE ALL ON public.approvals FROM anon;
REVOKE ALL ON public.notifications FROM anon;
REVOKE ALL ON public.volunteer_assignments FROM anon;
REVOKE ALL ON public.user_departments FROM anon;
REVOKE ALL ON public.user_teams FROM anon;
GRANT EXECUTE ON FUNCTION public.has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION public.rls_has_permission TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_role_level TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_audit_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_security_event TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT USAGE ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  GRANT SELECT ON TABLES TO anon;
DO $$
DECLARE
  tbl text;
BEGIN
  FOR tbl IN
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
      AND tablename NOT IN ('schema_migrations', 'spatial_ref_sys')
  LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', tbl);
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text,
  p_assigner_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
  new_role_level integer;
  caller_status text;
BEGIN
  caller_id := COALESCE(p_assigner_id, auth.uid());
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0), p.status
  INTO target_level, caller_status
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= 90 AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign admin-level roles' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_role', new_role, 'previous_level', target_level),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id uuid;
  caller_role text;
  caller_level integer;
  target_level integer;
  caller_status text;
BEGIN
  caller_id := auth.uid();
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = caller_id THEN
    RAISE EXCEPTION 'Cannot change your own status' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = caller_id;
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_status IS DISTINCT FROM 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT COALESCE(r.level, 0) INTO target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    caller_id,
    'status_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_status', new_status),
    jsonb_build_object('changed_by', caller_id::text)
  );
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status TO authenticated;
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_user_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text DEFAULT NULL,
  p_changes jsonb DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata, ip_address, user_agent)
  VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_changes, p_metadata, v_ip, v_ua)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_event_type text,
  p_user_id uuid DEFAULT NULL,
  p_severity text DEFAULT 'info',
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_ip text;
  v_ua text;
BEGIN
  BEGIN
    v_ip := current_setting('request.headers', true)::json->>'x-forwarded-for';
  EXCEPTION WHEN OTHERS THEN
    v_ip := NULL;
  END;
  BEGIN
    v_ua := current_setting('request.headers', true)::json->>'user-agent';
  EXCEPTION WHEN OTHERS THEN
    v_ua := NULL;
  END;
  INSERT INTO public.security_events (event_type, user_id, ip_address, user_agent, severity, metadata)
  VALUES (p_event_type, p_user_id, v_ip, v_ua, p_severity, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS approvals_insert ON public.approvals;
DROP POLICY IF EXISTS "approvals_insert" ON public.approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (requester_id = auth.uid());
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE role = 'sponsorship_manager';
UPDATE public.profiles
SET role = 'admin', updated_at = now()
WHERE role = 'content_manager';
UPDATE public.profiles
SET role = 'volunteer', updated_at = now()
WHERE role = 'volunteer_coordinator';
UPDATE public.profiles
SET role = 'volunteer', updated_at = now()
WHERE role = 'teacher_staff';
DELETE FROM public.role_permissions
WHERE role_id IN (
  SELECT id FROM public.roles
  WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff')
);
DELETE FROM public.user_roles
WHERE role_id IN (
  SELECT id FROM public.roles
  WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff')
);
DELETE FROM public.roles
WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff');
INSERT INTO public.roles (name, display_name, description, level, is_system)
VALUES (
  'teacher',
  'Teacher',
  'Manage assigned students, upload grades, attendance tracking, student progress updates, report cards, achievements',
  60,
  true
)
ON CONFLICT (name) DO NOTHING;
WITH teacher_role AS (
  SELECT id FROM public.roles WHERE name = 'teacher' LIMIT 1
),
teacher_permissions AS (
  SELECT id FROM public.permissions
  WHERE code IN (
    'students.read', 'students.update',
    'news.read', 'gallery.read',
    'notifications.read',
    'profile.read', 'profile.update'
  )
)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT tr.id, tp.id
FROM teacher_role tr, teacher_permissions tp
ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, student_id, subject)
);
CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  grade text,
  attendance numeric(5,2),
  notes text,
  report_card_url text,
  achievement text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher
  ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_student
  ON public.teacher_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_teacher
  ON public.student_progress(teacher_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student
  ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_recorded
  ON public.student_progress(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_attendance_records_teacher
  ON public.attendance_records(teacher_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_student
  ON public.attendance_records(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date
  ON public.attendance_records(date DESC);
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teacher_assignments_select_own" ON public.teacher_assignments;
CREATE POLICY teacher_assignments_select_own
  ON public.teacher_assignments FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "teacher_assignments_select_admin" ON public.teacher_assignments;
CREATE POLICY teacher_assignments_select_admin
  ON public.teacher_assignments FOR SELECT TO authenticated
  USING (public.rls_has_permission('students.read'));
DROP POLICY IF EXISTS "teacher_assignments_insert_admin" ON public.teacher_assignments;
CREATE POLICY teacher_assignments_insert_admin
  ON public.teacher_assignments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS "teacher_assignments_update_admin" ON public.teacher_assignments;
CREATE POLICY teacher_assignments_update_admin
  ON public.teacher_assignments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('students.update'))
  WITH CHECK (public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS "teacher_assignments_delete_admin" ON public.teacher_assignments;
CREATE POLICY teacher_assignments_delete_admin
  ON public.teacher_assignments FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "student_progress_select_teacher" ON public.student_progress;
CREATE POLICY student_progress_select_teacher
  ON public.student_progress FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.teacher_assignments
      WHERE teacher_id = auth.uid()
      AND student_id = student_progress.student_id
    )
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "student_progress_insert_teacher" ON public.student_progress;
CREATE POLICY student_progress_insert_teacher
  ON public.student_progress FOR INSERT TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.teacher_assignments
      WHERE teacher_id = auth.uid()
      AND student_id = student_progress.student_id
    )
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "student_progress_update_teacher" ON public.student_progress;
CREATE POLICY student_progress_update_teacher
  ON public.student_progress FOR UPDATE TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "student_progress_delete_teacher" ON public.student_progress;
CREATE POLICY student_progress_delete_teacher
  ON public.student_progress FOR DELETE TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "student_progress_select_admin" ON public.student_progress;
CREATE POLICY student_progress_select_admin
  ON public.student_progress FOR SELECT TO authenticated
  USING (public.rls_has_permission('students.read'));
DROP POLICY IF EXISTS "student_progress_delete_admin" ON public.student_progress;
CREATE POLICY student_progress_delete_admin
  ON public.student_progress FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_records_select_teacher" ON public.attendance_records;
CREATE POLICY attendance_records_select_teacher
  ON public.attendance_records FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.teacher_assignments
      WHERE teacher_id = auth.uid()
      AND student_id = attendance_records.student_id
    )
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "attendance_records_insert_teacher" ON public.attendance_records;
CREATE POLICY attendance_records_insert_teacher
  ON public.attendance_records FOR INSERT TO authenticated
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.teacher_assignments
      WHERE teacher_id = auth.uid()
      AND student_id = attendance_records.student_id
    )
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "attendance_records_update_teacher" ON public.attendance_records;
CREATE POLICY attendance_records_update_teacher
  ON public.attendance_records FOR UPDATE TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  )
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );
DROP POLICY IF EXISTS "attendance_records_select_admin" ON public.attendance_records;
CREATE POLICY attendance_records_select_admin
  ON public.attendance_records FOR SELECT TO authenticated
  USING (public.rls_has_permission('students.read'));
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
REVOKE ALL ON public.teacher_assignments FROM anon;
REVOKE ALL ON public.student_progress FROM anon;
REVOKE ALL ON public.attendance_records FROM anon;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy User'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    'donor',
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    updated_at = now()
  WHERE
    public.profiles.status = 'active';
  RETURN NEW;
END;
$$;
DO $$
BEGIN
  DELETE FROM public.notifications
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.audit_logs
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.security_events
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.user_sessions
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.user_roles
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.user_departments
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.user_teams
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM public.profiles
  WHERE email LIKE '%test' OR email LIKE '%.test';
  DELETE FROM auth.identities
  WHERE user_id IN (
    SELECT id FROM auth.users
    WHERE email LIKE '%test' OR email LIKE '%.test'
  );
  DELETE FROM auth.users
  WHERE email LIKE '%test' OR email LIKE '%.test';
END $$;
CREATE OR REPLACE FUNCTION public.rls_has_permission(permission_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.roles r ON r.name = p.role
    JOIN public.role_permissions rp ON rp.role_id = r.id
    JOIN public.permissions perm ON perm.id = rp.permission_id
    WHERE p.id = auth.uid() AND perm.code = permission_code AND p.status = 'active'
  );
$$;
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'
  );
$$;
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN (
    'super_admin', 'admin', 'finance_manager', 'teacher',
    'donor', 'volunteer', 'public_user'
  ));
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('super_admin', 'admin', 'finance_manager', 'teacher', 'donor', 'volunteer', 'public_user'));
DROP TABLE IF EXISTS public.approvals CASCADE;
DROP TABLE IF EXISTS public.invitations CASCADE;
DROP TABLE IF EXISTS public.user_teams CASCADE;
DROP TABLE IF EXISTS public.user_departments CASCADE;
DROP TABLE IF EXISTS public.teams CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DELETE FROM public.role_permissions WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff')
);
DELETE FROM public.user_roles WHERE role_id IN (
  SELECT id FROM public.roles WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff')
);
DELETE FROM public.roles WHERE name IN ('sponsorship_manager', 'content_manager', 'volunteer_coordinator', 'teacher_staff');
UPDATE public.profiles SET role = 'teacher' WHERE role = 'teacher_staff';
UPDATE public.roles SET
  display_name = 'Teacher',
  description = 'Manage assigned students, upload grades, attendance, progress updates',
  level = 60
WHERE name = 'teacher'
  AND display_name = 'Teacher/Staff';
INSERT INTO public.roles (name, display_name, description, level, is_system) VALUES
  ('super_admin', 'Super Admin', 'Full platform access with system configuration', 100, true),
  ('admin', 'Admin', 'Manage donors, students, content, and moderate system', 90, true),
  ('finance_manager', 'Finance Manager', 'Manage donations, financial reports, receipts, payments', 80, true),
  ('teacher', 'Teacher', 'Manage assigned students, upload grades, attendance, progress updates', 60, true),
  ('donor', 'Donor', 'Personal dashboard, sponsorship access, donations, certificates', 40, true),
  ('volunteer', 'Volunteer', 'Volunteer dashboard, assigned tasks, events, attendance', 30, true),
  ('public_user', 'Public User', 'Browse public content only', 10, true)
ON CONFLICT (name) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  level = EXCLUDED.level;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS department_id CASCADE;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS phone_verified;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS two_factor_enabled;
ALTER TABLE public.profiles DROP COLUMN IF EXISTS locked_until;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_updated_at timestamptz;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hobbies text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dream_career text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS education_goals text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS achievements text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gallery_urls text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrolled_date date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_section text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hobbies text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS dream_career text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS education_goals text;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS achievements text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS gallery_urls text[];
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS date_of_birth date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS enrolled_date date;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_section text;
CREATE TABLE IF NOT EXISTS public.donation_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  target_amount numeric NOT NULL,
  raised_amount numeric NOT NULL DEFAULT 0,
  donor_count integer NOT NULL DEFAULT 0,
  icon text,
  color text,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  start_date timestamptz,
  end_date timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.donation_goals ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_name text NOT NULL,
  author_role text NOT NULL,
  content text NOT NULL,
  quote text,
  avatar_url text,
  is_published boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_type text NOT NULL DEFAULT 'activity'
    CHECK (event_type IN ('activity', 'celebration', 'program', 'sports', 'volunteer', 'function')),
  date date NOT NULL,
  time text,
  location text,
  image_url text,
  gallery_urls text[],
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.sponsorship_timeline (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsorship_id uuid NOT NULL REFERENCES public.sponsorships(id) ON DELETE CASCADE,
  event_type text NOT NULL
    CHECK (event_type IN ('started', 'donation', 'report', 'achievement', 'milestone', 'update', 'renewal')),
  title text NOT NULL,
  description text,
  icon text,
  event_date timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.sponsorship_timeline ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_type text NOT NULL
    CHECK (certificate_type IN ('donation_receipt', 'thank_you', 'sponsorship_appreciation', 'volunteer')),
  title text NOT NULL,
  amount numeric,
  donation_id uuid REFERENCES public.donations(id) ON DELETE SET NULL,
  sponsorship_id uuid REFERENCES public.sponsorships(id) ON DELETE SET NULL,
  pdf_url text,
  issued_date timestamptz NOT NULL DEFAULT now(),
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.login_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address text,
  user_agent text,
  device_info text,
  location text,
  status text NOT NULL DEFAULT 'success'
    CHECK (status IN ('success', 'failed', 'suspicious')),
  failure_reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.login_history ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.impact_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  month date NOT NULL,
  meals_funded integer NOT NULL DEFAULT 0,
  books_distributed integer NOT NULL DEFAULT 0,
  uniforms_provided integer NOT NULL DEFAULT 0,
  students_supported integer NOT NULL DEFAULT 0,
  attendance_rate numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(month)
);
ALTER TABLE public.impact_metrics ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.teacher_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  subject text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, student_id)
);
ALTER TABLE public.teacher_assignments ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.student_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject text NOT NULL,
  grade text,
  attendance numeric,
  notes text,
  report_card_url text,
  achievement text,
  recorded_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  status text NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(student_id, date)
);
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
DROP FUNCTION IF EXISTS public.rls_has_permission(text) CASCADE;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS profiles_read_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_update_all ON public.profiles;
DROP POLICY IF EXISTS profiles_delete ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT
  TO authenticated USING (id = auth.uid());
DROP POLICY IF EXISTS "profiles_read_admin" ON public.profiles;
CREATE POLICY profiles_read_admin ON public.profiles FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE
  TO authenticated USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS students_read_all ON public.students;
DROP POLICY IF EXISTS students_read_anon ON public.students;
DROP POLICY IF EXISTS students_insert ON public.students;
DROP POLICY IF EXISTS students_update ON public.students;
DROP POLICY IF EXISTS students_delete ON public.students;
DROP POLICY IF EXISTS "students_read_all" ON public.students;
CREATE POLICY students_read_all ON public.students FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "students_read_anon" ON public.students;
CREATE POLICY students_read_anon ON public.students FOR SELECT
  TO anon USING (true);
DROP POLICY IF EXISTS "students_insert" ON public.students;
CREATE POLICY students_insert ON public.students FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "students_update" ON public.students;
CREATE POLICY students_update ON public.students FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin', 'teacher')
  );
DROP POLICY IF EXISTS "students_delete" ON public.students;
CREATE POLICY students_delete ON public.students FOR DELETE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS donations_read_own ON public.donations;
DROP POLICY IF EXISTS donations_read_all ON public.donations;
DROP POLICY IF EXISTS donations_insert ON public.donations;
DROP POLICY IF EXISTS donations_update ON public.donations;
DROP POLICY IF EXISTS "donations_read_own" ON public.donations;
CREATE POLICY donations_read_own ON public.donations FOR SELECT
  TO authenticated USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "donations_read_admin" ON public.donations;
CREATE POLICY donations_read_admin ON public.donations FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin', 'finance_manager')
  );
DROP POLICY IF EXISTS "donations_insert" ON public.donations;
CREATE POLICY donations_insert ON public.donations FOR INSERT
  TO authenticated WITH CHECK (
    donor_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "donations_update" ON public.donations;
CREATE POLICY donations_update ON public.donations FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin', 'finance_manager')
  );
DROP POLICY IF EXISTS sponsorships_read_own ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_read_all ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_insert ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_update ON public.sponsorships;
DROP POLICY IF EXISTS sponsorships_delete ON public.sponsorships;
DROP POLICY IF EXISTS "sponsorships_read_own" ON public.sponsorships;
CREATE POLICY sponsorships_read_own ON public.sponsorships FOR SELECT
  TO authenticated USING (donor_id = auth.uid());
DROP POLICY IF EXISTS "sponsorships_read_admin" ON public.sponsorships;
CREATE POLICY sponsorships_read_admin ON public.sponsorships FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "sponsorships_insert" ON public.sponsorships;
CREATE POLICY sponsorships_insert ON public.sponsorships FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "sponsorships_update" ON public.sponsorships;
CREATE POLICY sponsorships_update ON public.sponsorships FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS news_read_public ON public.news;
DROP POLICY IF EXISTS news_read_anon ON public.news;
DROP POLICY IF EXISTS news_insert ON public.news;
DROP POLICY IF EXISTS news_update ON public.news;
DROP POLICY IF EXISTS news_delete ON public.news;
DROP POLICY IF EXISTS "news_read_public" ON public.news;
CREATE POLICY news_read_public ON public.news FOR SELECT
  TO authenticated USING (published = true OR public.get_my_role() IN ('super_admin', 'admin'));
DROP POLICY IF EXISTS "news_read_anon" ON public.news;
CREATE POLICY news_read_anon ON public.news FOR SELECT
  TO anon USING (published = true);
DROP POLICY IF EXISTS "news_insert" ON public.news;
CREATE POLICY news_insert ON public.news FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "news_update" ON public.news;
CREATE POLICY news_update ON public.news FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "news_delete" ON public.news;
CREATE POLICY news_delete ON public.news FOR DELETE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS gallery_read_all ON public.gallery_items;
DROP POLICY IF EXISTS gallery_read_anon ON public.gallery_items;
DROP POLICY IF EXISTS gallery_insert ON public.gallery_items;
DROP POLICY IF EXISTS gallery_update ON public.gallery_items;
DROP POLICY IF EXISTS gallery_delete ON public.gallery_items;
DROP POLICY IF EXISTS "gallery_read_all" ON public.gallery_items;
CREATE POLICY gallery_read_all ON public.gallery_items FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "gallery_read_anon" ON public.gallery_items;
CREATE POLICY gallery_read_anon ON public.gallery_items FOR SELECT
  TO anon USING (true);
DROP POLICY IF EXISTS "gallery_insert" ON public.gallery_items;
CREATE POLICY gallery_insert ON public.gallery_items FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "gallery_update" ON public.gallery_items;
CREATE POLICY gallery_update ON public.gallery_items FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "gallery_delete" ON public.gallery_items;
CREATE POLICY gallery_delete ON public.gallery_items FOR DELETE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS contacts_read ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_insert ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_insert_anon ON public.contact_submissions;
DROP POLICY IF EXISTS contacts_update ON public.contact_submissions;
DROP POLICY IF EXISTS "contacts_read" ON public.contact_submissions;
CREATE POLICY contacts_read ON public.contact_submissions FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "contacts_insert" ON public.contact_submissions;
CREATE POLICY contacts_insert ON public.contact_submissions FOR INSERT
  TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "contacts_insert_anon" ON public.contact_submissions;
CREATE POLICY contacts_insert_anon ON public.contact_submissions FOR INSERT
  TO anon WITH CHECK (true);
DROP POLICY IF EXISTS "contacts_update" ON public.contact_submissions;
CREATE POLICY contacts_update ON public.contact_submissions FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "donation_goals_read" ON public.donation_goals;
CREATE POLICY donation_goals_read ON public.donation_goals FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "donation_goals_read_anon" ON public.donation_goals;
CREATE POLICY donation_goals_read_anon ON public.donation_goals FOR SELECT
  TO anon USING (true);
DROP POLICY IF EXISTS "donation_goals_insert" ON public.donation_goals;
CREATE POLICY donation_goals_insert ON public.donation_goals FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "donation_goals_update" ON public.donation_goals;
CREATE POLICY donation_goals_update ON public.donation_goals FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "testimonials_read" ON public.testimonials;
CREATE POLICY testimonials_read ON public.testimonials FOR SELECT
  TO authenticated USING (is_published = true);
DROP POLICY IF EXISTS "testimonials_read_anon" ON public.testimonials;
CREATE POLICY testimonials_read_anon ON public.testimonials FOR SELECT
  TO anon USING (is_published = true);
DROP POLICY IF EXISTS "testimonials_insert" ON public.testimonials;
CREATE POLICY testimonials_insert ON public.testimonials FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "testimonials_update" ON public.testimonials;
CREATE POLICY testimonials_update ON public.testimonials FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "events_read" ON public.events;
CREATE POLICY events_read ON public.events FOR SELECT
  TO authenticated USING (is_published = true);
DROP POLICY IF EXISTS "events_read_anon" ON public.events;
CREATE POLICY events_read_anon ON public.events FOR SELECT
  TO anon USING (is_published = true);
DROP POLICY IF EXISTS "events_insert" ON public.events;
CREATE POLICY events_insert ON public.events FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "events_update" ON public.events;
CREATE POLICY events_update ON public.events FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "timeline_read_own" ON public.sponsorship_timeline;
CREATE POLICY timeline_read_own ON public.sponsorship_timeline FOR SELECT
  TO authenticated USING (
    sponsorship_id IN (
      SELECT id FROM public.sponsorships WHERE donor_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "timeline_read_admin" ON public.sponsorship_timeline;
CREATE POLICY timeline_read_admin ON public.sponsorship_timeline FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "timeline_insert" ON public.sponsorship_timeline;
CREATE POLICY timeline_insert ON public.sponsorship_timeline FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin', 'teacher')
  );
DROP POLICY IF EXISTS "certificates_read_own" ON public.certificates;
CREATE POLICY certificates_read_own ON public.certificates FOR SELECT
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "certificates_read_admin" ON public.certificates;
CREATE POLICY certificates_read_admin ON public.certificates FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "certificates_insert" ON public.certificates;
CREATE POLICY certificates_insert ON public.certificates FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "login_history_read_own" ON public.login_history;
CREATE POLICY login_history_read_own ON public.login_history FOR SELECT
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "login_history_read_admin" ON public.login_history;
CREATE POLICY login_history_read_admin ON public.login_history FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "login_history_insert" ON public.login_history;
CREATE POLICY login_history_insert ON public.login_history FOR INSERT
  TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "impact_metrics_read" ON public.impact_metrics;
CREATE POLICY impact_metrics_read ON public.impact_metrics FOR SELECT
  TO authenticated USING (true);
DROP POLICY IF EXISTS "impact_metrics_read_anon" ON public.impact_metrics;
CREATE POLICY impact_metrics_read_anon ON public.impact_metrics FOR SELECT
  TO anon USING (true);
DROP POLICY IF EXISTS "impact_metrics_insert" ON public.impact_metrics;
CREATE POLICY impact_metrics_insert ON public.impact_metrics FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "impact_metrics_update" ON public.impact_metrics;
CREATE POLICY impact_metrics_update ON public.impact_metrics FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "ta_read_teacher" ON public.teacher_assignments;
CREATE POLICY ta_read_teacher ON public.teacher_assignments FOR SELECT
  TO authenticated USING (teacher_id = auth.uid());
DROP POLICY IF EXISTS "ta_read_admin" ON public.teacher_assignments;
CREATE POLICY ta_read_admin ON public.teacher_assignments FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "ta_insert" ON public.teacher_assignments;
CREATE POLICY ta_insert ON public.teacher_assignments FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "sp_read_teacher" ON public.student_progress;
CREATE POLICY sp_read_teacher ON public.student_progress FOR SELECT
  TO authenticated USING (
    teacher_id = auth.uid()
  );
DROP POLICY IF EXISTS "sp_read_donor" ON public.student_progress;
CREATE POLICY sp_read_donor ON public.student_progress FOR SELECT
  TO authenticated USING (
    student_id IN (
      SELECT student_id FROM public.sponsorships WHERE donor_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "sp_read_admin" ON public.student_progress;
CREATE POLICY sp_read_admin ON public.student_progress FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "sp_insert_teacher" ON public.student_progress;
CREATE POLICY sp_insert_teacher ON public.student_progress FOR INSERT
  TO authenticated WITH CHECK (
    teacher_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "sp_update_teacher" ON public.student_progress;
CREATE POLICY sp_update_teacher ON public.student_progress FOR UPDATE
  TO authenticated USING (
    teacher_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "ar_read_teacher" ON public.attendance_records;
CREATE POLICY ar_read_teacher ON public.attendance_records FOR SELECT
  TO authenticated USING (
    teacher_id = auth.uid()
  );
DROP POLICY IF EXISTS "ar_read_donor" ON public.attendance_records;
CREATE POLICY ar_read_donor ON public.attendance_records FOR SELECT
  TO authenticated USING (
    student_id IN (
      SELECT student_id FROM public.sponsorships WHERE donor_id = auth.uid()
    )
  );
DROP POLICY IF EXISTS "ar_read_admin" ON public.attendance_records;
CREATE POLICY ar_read_admin ON public.attendance_records FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "ar_insert_teacher" ON public.attendance_records;
CREATE POLICY ar_insert_teacher ON public.attendance_records FOR INSERT
  TO authenticated WITH CHECK (
    teacher_id = auth.uid() OR public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "notifications_read_own" ON public.notifications;
CREATE POLICY notifications_read_own ON public.notifications FOR SELECT
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE
  TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "notifications_insert_system" ON public.notifications;
CREATE POLICY notifications_insert_system ON public.notifications FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin', 'teacher')
  );
DROP POLICY IF EXISTS "security_events_read" ON public.security_events;
CREATE POLICY security_events_read ON public.security_events FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "va_read_own" ON public.volunteer_assignments;
CREATE POLICY va_read_own ON public.volunteer_assignments FOR SELECT
  TO authenticated USING (volunteer_id = auth.uid());
DROP POLICY IF EXISTS "va_read_admin" ON public.volunteer_assignments;
CREATE POLICY va_read_admin ON public.volunteer_assignments FOR SELECT
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "va_insert" ON public.volunteer_assignments;
CREATE POLICY va_insert ON public.volunteer_assignments FOR INSERT
  TO authenticated WITH CHECK (
    public.get_my_role() IN ('super_admin', 'admin')
  );
DROP POLICY IF EXISTS "va_update" ON public.volunteer_assignments;
CREATE POLICY va_update ON public.volunteer_assignments FOR UPDATE
  TO authenticated USING (
    public.get_my_role() IN ('super_admin', 'admin')
  );
CREATE OR REPLACE FUNCTION public.admin_toggle_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_level integer;
  target_level integer;
  new_role_level integer;
BEGIN
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role';
  END IF;
  SELECT role INTO caller_role FROM public.profiles WHERE id = auth.uid();
  SELECT level INTO caller_level FROM public.roles WHERE name = caller_role;
  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;
  SELECT level INTO new_role_level FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  SELECT COALESCE(r.level, 0) INTO target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
END;
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Donor'),
    COALESCE(NEW.raw_user_meta_data->>'country', ''),
    'donor',
    'active'
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
CREATE INDEX IF NOT EXISTS idx_donation_goals_active ON public.donation_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_testimonials_published ON public.testimonials(is_published);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_timeline_sponsorship ON public.sponsorship_timeline(sponsorship_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user ON public.certificates(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_user ON public.login_history(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_impact_metrics_month ON public.impact_metrics(month DESC);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_teacher ON public.teacher_assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_assignments_student ON public.teacher_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON public.student_progress(student_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_date ON public.attendance_records(student_id, date);
INSERT INTO public.testimonials (author_name, author_role, content, quote, is_published, sort_order) VALUES
  (
    'Sarah Johnson',
    'Donor from Australia',
    'Sponsoring Rajesh has been the most rewarding experience of my life. Seeing his grades improve and knowing he now dreams of becoming a doctor fills my heart with joy.',
    'Every child deserves a chance to dream.',
    true, 1
  ),
  (
    'Rajendra Sharma',
    'Teacher at Buddha Academy',
    'The sponsorship program has transformed our classrooms. Students who once struggled to afford basic supplies now come to school with confidence and enthusiasm.',
    'Education is the most powerful weapon to change the world.',
    true, 2
  ),
  (
    'Emily Chen',
    'Volunteer from Singapore',
    'Spending a month teaching at Buddha Academy opened my eyes to the resilience and brilliance of these children. The community here is incredible.',
    'Small acts of kindness create ripples of change.',
    true, 3
  ),
  (
    'Priya K.',
    'Student (Class 8)',
    'I want to become a teacher when I grow up, just like the ones who help me every day. Thank you to my sponsor for believing in me.',
    'Dreams do come true with a little help.',
    true, 4
  )
ON CONFLICT DO NOTHING;
INSERT INTO public.donation_goals (title, description, target_amount, raised_amount, donor_count, icon, color, category, is_active) VALUES
  (
    'Library Fund',
    'Build a proper library with storybooks, textbooks, and reference materials for all students.',
    50000, 32500, 48, 'BookOpen', 'amber', 'education', true
  ),
  (
    'School Supplies',
    'Provide notebooks, pens, pencils, and art supplies for 200 students for the academic year.',
    30000, 18500, 36, 'Backpack', 'emerald', 'education', true
  ),
  (
    'Meal Program',
    'Fund nutritious meals for 150 students who come from families below the poverty line.',
    75000, 52000, 67, 'Apple', 'orange', 'welfare', true
  ),
  (
    'Classroom Renovation',
    'Repair and renovate 3 classrooms with proper furniture, whiteboards, and lighting.',
    100000, 41000, 29, 'Building2', 'blue', 'infrastructure', true
  ),
  (
    'Annual Sports Day',
    'Organize sports equipment, trophies, and transportation for our annual sports meet.',
    15000, 9800, 22, 'Trophy', 'purple', 'activities', true
  ),
  (
    'Art & Music Program',
    'Introduce art and music classes with basic instruments and supplies.',
    25000, 7200, 15, 'Music', 'pink', 'education', true
  )
ON CONFLICT DO NOTHING;
INSERT INTO public.impact_metrics (month, meals_funded, books_distributed, uniforms_provided, students_supported, attendance_rate) VALUES
  ('2026-01-01', 2850, 320, 45, 187, 94.5),
  ('2026-02-01', 3100, 280, 38, 192, 95.2),
  ('2026-03-01', 2950, 350, 52, 195, 93.8),
  ('2026-04-01', 3200, 300, 41, 198, 96.1),
  ('2026-05-01', 3400, 380, 55, 203, 95.7),
  ('2026-06-01', 3300, 340, 48, 200, 94.9)
ON CONFLICT (month) DO NOTHING;
INSERT INTO public.events (title, description, event_type, date, location, is_published) VALUES
  ('Annual Sports Day 2026', 'A day of athletic competitions, team games, and celebrations of physical education.', 'sports', '2026-03-15', 'School Ground', true),
  ('Nepali New Year Celebration', 'Cultural program featuring traditional music, dance, and food from all regions of Nepal.', 'celebration', '2026-04-13', 'School Hall', true),
  ('Art Exhibition', 'Showcasing paintings, crafts, and creative works by students from all grades.', 'activity', '2026-02-20', 'Community Hall', true),
  ('Parent-Teacher Meeting', 'Quarterly meeting to discuss student progress and school development.', 'program', '2026-05-10', 'School Auditorium', true),
  ('Volunteer Teaching Week', 'International volunteers join our classrooms for a week of collaborative learning.', 'volunteer', '2026-07-01', 'Buddha Academy', true),
  ('Annual Day Function', 'Year-end celebration with cultural performances, awards, and recognition ceremony.', 'function', '2026-12-20', 'School Ground', true)
ON CONFLICT DO NOTHING;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
DROP FUNCTION IF EXISTS public.admin_toggle_role(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_update_role(uuid, text, uuid) CASCADE;
CREATE OR REPLACE FUNCTION public.bootstrap_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_super_admin_count integer;
  v_current_role text;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  SELECT COUNT(*) INTO v_super_admin_count
  FROM public.profiles
  WHERE role = 'super_admin' AND status = 'active';
  IF v_super_admin_count > 0 THEN
    RAISE EXCEPTION 'A super admin already exists. Bootstrap is permanently disabled.'
      USING ERRCODE = '42501';
  END IF;
  SELECT role INTO v_current_role
  FROM public.profiles
  WHERE id = auth.uid();
  IF v_current_role NOT IN ('donor', 'public_user') THEN
    RAISE EXCEPTION 'Only regular users can become the first super admin'
      USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = 'super_admin',
      updated_at = now()
  WHERE id = auth.uid();
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, metadata)
  VALUES (
    auth.uid(),
    'super_admin_bootstrap',
    'profiles',
    auth.uid()::text,
    jsonb_build_object('event', 'first_super_admin_created')
  );
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    auth.uid(),
    'system',
    'Welcome Super Admin',
    'You are now the platform super admin. Please review system settings and user management.'
  );
END;
$$;
REVOKE ALL ON FUNCTION public.bootstrap_super_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.bootstrap_super_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin() TO authenticated;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_level integer;
  caller_status text;
  target_level integer;
  target_role text;
  new_role_level integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, r.level, p.status
  INTO caller_role, caller_level, caller_status
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  WHERE p.id = auth.uid();
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  IF caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, COALESCE(r.level, 0)
  INTO target_role, target_level
  FROM public.profiles p
  LEFT JOIN public.roles r ON r.name = p.role
  WHERE p.id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_level >= 100 THEN
    RAISE EXCEPTION 'Cannot modify super admin accounts' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot assign role at or above your own level' USING ERRCODE = '42501';
  END IF;
  IF target_level >= caller_level THEN
    RAISE EXCEPTION 'Cannot modify users at or above your role level' USING ERRCODE = '42501';
  END IF;
  IF new_role_level >= 90 AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can assign admin-level roles' USING ERRCODE = '42501';
  END IF;
  IF new_role = 'super_admin' AND caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can promote to super admin' USING ERRCODE = '42501';
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  INSERT INTO public.audit_logs (
    user_id, action, entity_type, entity_id, changes, metadata
  ) VALUES (
    auth.uid(),
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object(
      'previous_role', target_role,
      'new_role', new_role
    ),
    jsonb_build_object(
      'changed_by', auth.uid()::text,
      'caller_role', caller_role
    )
  );
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    target_user_id,
    'system',
    'Role Updated',
    format('Your role has been changed from %s to %s', target_role, new_role)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_role(uuid, text) TO authenticated;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.students TO anon;
GRANT SELECT ON public.news TO anon;
GRANT SELECT ON public.gallery_items TO anon;
GRANT SELECT ON public.donation_goals TO anon;
GRANT SELECT ON public.testimonials TO anon;
GRANT SELECT ON public.impact_metrics TO anon;
GRANT SELECT ON public.events TO anon;
GRANT INSERT ON public.contact_submissions TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.students TO authenticated;
GRANT SELECT, INSERT ON public.donations TO authenticated;
GRANT SELECT ON public.sponsorships TO authenticated;
GRANT SELECT ON public.news TO authenticated;
GRANT SELECT ON public.gallery_items TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.contact_submissions TO authenticated;
GRANT SELECT ON public.donation_goals TO authenticated;
GRANT SELECT ON public.testimonials TO authenticated;
GRANT SELECT ON public.impact_metrics TO authenticated;
GRANT SELECT ON public.events TO authenticated;
GRANT SELECT ON public.sponsorship_timeline TO authenticated;
GRANT SELECT ON public.certificates TO authenticated;
GRANT SELECT, INSERT ON public.login_history TO authenticated;
GRANT SELECT ON public.notifications TO authenticated;
GRANT SELECT ON public.teacher_assignments TO authenticated;
GRANT SELECT ON public.student_progress TO authenticated;
GRANT SELECT ON public.attendance_records TO authenticated;
GRANT SELECT ON public.volunteer_assignments TO authenticated;
GRANT SELECT ON public.security_events TO authenticated;
GRANT SELECT ON public.audit_logs TO authenticated;
GRANT EXECUTE ON FUNCTION public.bootstrap_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'public_user'::text
  );
$$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile_count integer;
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'profiles') THEN
    SELECT count(*) INTO v_profile_count FROM public.profiles;
    INSERT INTO public.profiles (id, email, full_name, country, role, status)
    VALUES (
      NEW.id,
      COALESCE(NEW.email, ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Donor'),
      COALESCE(NEW.raw_user_meta_data->>'country', ''),
      CASE WHEN v_profile_count = 0 THEN 'super_admin' ELSE 'donor' END,
      'active'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin'));

CREATE INDEX IF NOT EXISTS idx_profiles_role_status ON public.profiles(role, status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON public.audit_logs(user_id, action);
CREATE OR REPLACE FUNCTION public.has_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE role = 'super_admin' AND status = 'active'
  );
$$;
GRANT EXECUTE ON FUNCTION public.has_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_super_admin() TO anon;
ALTER TABLE donations DROP CONSTRAINT IF EXISTS donations_status_check;
ALTER TABLE donations ADD CONSTRAINT donations_status_check
  CHECK (status IN ('pending', 'processing', 'verified', 'completed', 'failed', 'rejected', 'cancelled'));
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS transaction_id TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS payment_method TEXT,
  ADD COLUMN IF NOT EXISTS payment_session_id UUID;
CREATE TABLE IF NOT EXISTS payment_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway_name TEXT NOT NULL,
  gateway_display_name TEXT NOT NULL DEFAULT '',
  gateway_description TEXT,
  qr_image_url TEXT,
  account_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  gateway TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  transaction_id TEXT UNIQUE,
  screenshots TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'verified', 'completed', 'failed', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  expires_at TIMESTAMPTZ DEFAULT (now() + interval '24 hours'),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES profiles(id),
  action TEXT NOT NULL
    CHECK (action IN ('submitted', 'processing', 'verified', 'rejected', 'failed', 'expired', 'cancelled')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID NOT NULL REFERENCES payment_sessions(id) ON DELETE CASCADE,
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  receipt_number TEXT UNIQUE NOT NULL,
  receipt_data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS payment_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_session_id UUID REFERENCES payment_sessions(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  actor_id UUID REFERENCES profiles(id),
  actor_role TEXT,
  details JSONB DEFAULT '{}',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "payment_settings_select_active" ON payment_settings;
CREATE POLICY "payment_settings_select_active"
  ON payment_settings FOR SELECT
  USING (is_active = true OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));
DROP POLICY IF EXISTS "payment_settings_admin_all" ON payment_settings;
CREATE POLICY "payment_settings_admin_all"
  ON payment_settings FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin')
  ));
DROP POLICY IF EXISTS "payment_sessions_donor_select" ON payment_sessions;
CREATE POLICY "payment_sessions_donor_select"
  ON payment_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = payment_sessions.donation_id AND d.donor_id = auth.uid()
  ));
DROP POLICY IF EXISTS "payment_sessions_finance_select" ON payment_sessions;
CREATE POLICY "payment_sessions_finance_select"
  ON payment_sessions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_sessions_donor_insert" ON payment_sessions;
CREATE POLICY "payment_sessions_donor_insert"
  ON payment_sessions FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = donation_id AND d.donor_id = auth.uid()
  ));
DROP POLICY IF EXISTS "payment_sessions_finance_update" ON payment_sessions;
CREATE POLICY "payment_sessions_finance_update"
  ON payment_sessions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_verifications_finance_all" ON payment_verifications;
CREATE POLICY "payment_verifications_finance_all"
  ON payment_verifications FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_verifications_donor_select" ON payment_verifications;
CREATE POLICY "payment_verifications_donor_select"
  ON payment_verifications FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM payment_sessions ps
    JOIN donations d ON d.id = ps.donation_id
    WHERE ps.id = payment_verifications.payment_session_id AND d.donor_id = auth.uid()
  ));
DROP POLICY IF EXISTS "payment_receipts_donor_select" ON payment_receipts;
CREATE POLICY "payment_receipts_donor_select"
  ON payment_receipts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = payment_receipts.donation_id AND d.donor_id = auth.uid()
  ));
DROP POLICY IF EXISTS "payment_receipts_finance_select" ON payment_receipts;
CREATE POLICY "payment_receipts_finance_select"
  ON payment_receipts FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_receipts_finance_insert" ON payment_receipts;
CREATE POLICY "payment_receipts_finance_insert"
  ON payment_receipts FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_audit_logs_select" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_select"
  ON payment_audit_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "payment_audit_logs_insert" ON payment_audit_logs;
CREATE POLICY "payment_audit_logs_insert"
  ON payment_audit_logs FOR INSERT
  WITH CHECK (true);
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-screenshots',
  'payment-screenshots',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
)
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS "payment_screenshots_insert" ON storage.objects;
CREATE POLICY "payment_screenshots_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'payment-screenshots'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
DROP POLICY IF EXISTS "payment_screenshots_select_own" ON storage.objects;
CREATE POLICY "payment_screenshots_select_own"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'payment-screenshots'
    AND auth.role() = 'authenticated'
    AND ((storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
      ))
  );
CREATE OR REPLACE FUNCTION generate_transaction_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 8));
    new_id := 'BA-' || year_part || '-' || random_part;
    IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE transaction_id = new_id) THEN
      RETURN new_id;
    END IF;
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique transaction ID';
    END IF;
  END LOOP;
END;
$$;
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  year_part TEXT;
  random_part TEXT;
  new_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    year_part := EXTRACT(YEAR FROM now())::TEXT;
    random_part := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 6));
    new_id := 'RCT-' || year_part || '-' || random_part;
    IF NOT EXISTS (SELECT 1 FROM payment_receipts WHERE receipt_number = new_id) THEN
      RETURN new_id;
    END IF;
    attempts := attempts + 1;
    IF attempts > 10 THEN
      RAISE EXCEPTION 'Could not generate unique receipt number';
    END IF;
  END LOOP;
END;
$$;
CREATE OR REPLACE FUNCTION create_payment_session(
  p_donation_id UUID,
  p_gateway TEXT,
  p_amount NUMERIC
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_session_id UUID;
  v_transaction_id TEXT;
  v_donor_id UUID;
BEGIN
  SELECT donor_id INTO v_donor_id FROM donations WHERE id = p_donation_id;
  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: donation does not belong to you';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM donations WHERE id = p_donation_id AND status IN ('pledged', 'pending')) THEN
    RAISE EXCEPTION 'Donation is not in a payable state';
  END IF;
  v_transaction_id := generate_transaction_id();
  INSERT INTO payment_sessions (donation_id, gateway, amount, transaction_id, status)
  VALUES (p_donation_id, p_gateway, p_amount, v_transaction_id, 'pending')
  RETURNING id INTO v_session_id;
  UPDATE donations
  SET status = 'pending',
      payment_session_id = v_session_id,
      payment_method = p_gateway,
      updated_at = now()
  WHERE id = p_donation_id;
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (v_session_id, 'submitted', 'Payment session created');
  RETURN v_session_id;
END;
$$;
CREATE OR REPLACE FUNCTION submit_payment_confirmation(
  p_session_id UUID,
  p_screenshots TEXT[] DEFAULT '{}'
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donor_id UUID;
BEGIN
  SELECT d.donor_id INTO v_donor_id
  FROM payment_sessions ps
  JOIN donations d ON d.id = ps.donation_id
  WHERE ps.id = p_session_id;
  IF v_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you do not own this payment session';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM payment_sessions WHERE id = p_session_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Payment session is not in pending state';
  END IF;
  UPDATE payment_sessions
  SET status = 'processing',
      screenshots = array_cat(screenshots, p_screenshots),
      updated_at = now()
  WHERE id = p_session_id;
  INSERT INTO payment_verifications (payment_session_id, action, notes)
  VALUES (p_session_id, 'submitted', 'Donor submitted payment confirmation');
  UPDATE donations SET status = 'processing', updated_at = now()
  WHERE id = (SELECT donation_id FROM payment_sessions WHERE id = p_session_id);
  RETURN true;
END;
$$;
CREATE OR REPLACE FUNCTION verify_payment(
  p_session_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation_id UUID;
  v_receipt_number TEXT;
  v_actor_role TEXT;
  v_amount NUMERIC;
  v_gateway TEXT;
  v_transaction_id TEXT;
BEGIN
  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can verify payments';
  END IF;
  IF p_status NOT IN ('verified', 'rejected', 'failed') THEN
    RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or failed';
  END IF;
  SELECT donation_id, amount, gateway, transaction_id
  INTO v_donation_id, v_amount, v_gateway, v_transaction_id
  FROM payment_sessions WHERE id = p_session_id;
  IF v_donation_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  UPDATE payment_sessions
  SET status = CASE WHEN p_status = 'verified' THEN 'completed' ELSE p_status END,
      verified_by = auth.uid(),
      verified_at = now(),
      verification_notes = p_notes,
      updated_at = now()
  WHERE id = p_session_id;
  IF p_status = 'verified' THEN
    v_receipt_number := generate_receipt_number();
    UPDATE donations
    SET status = 'completed',
        transaction_id = v_transaction_id,
        updated_at = now()
    WHERE id = v_donation_id;
    INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
    VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
      'generated_at', now(),
      'amount', v_amount,
      'gateway', v_gateway,
      'transaction_id', v_transaction_id,
      'currency', 'NPR'
    ));
  END IF;
  IF p_status = 'rejected' THEN
    UPDATE donations SET status = 'rejected', updated_at = now() WHERE id = v_donation_id;
  END IF;
  IF p_status = 'failed' THEN
    UPDATE donations SET status = 'failed', updated_at = now() WHERE id = v_donation_id;
  END IF;
  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, auth.uid(), p_status, p_notes);
  RETURN true;
END;
$$;
INSERT INTO payment_settings (gateway_name, gateway_display_name, gateway_description, account_name, account_number, instructions, is_active, sort_order)
VALUES
  ('khalti', 'Khalti', 'Pay via Khalti digital wallet', 'Buddha Academy', '9800000000', 'Send payment to this Khalti ID. Include your name in the transaction note so we can verify your donation.', true, 1),
  ('esewa', 'eSewa', 'Pay via eSewa online wallet', 'Buddha Academy', '9800000000', 'Send payment to this eSewa ID. Include your name in the transaction note so we can verify your donation.', true, 2),
  ('mobile_banking', 'Mobile Banking / Fonepay', 'Bank transfer or Fonepay', 'Buddha Academy', '1234567890123456', 'Transfer to our bank account. Use "Donation" as reference and include your name.', true, 3)
ON CONFLICT DO NOTHING;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_verifications;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE payment_receipts;
ALTER TABLE donations
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES profiles(id);
CREATE TABLE IF NOT EXISTS donation_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID NOT NULL REFERENCES donations(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN (
    'Educational Materials',
    'Student Meals',
    'School Supplies',
    'Uniform Support',
    'Events & Activities',
    'Operations'
  )),
  allocation_percentage NUMERIC(5,2) NOT NULL CHECK (allocation_percentage > 0 AND allocation_percentage <= 100),
  amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_donation_allocations_donation_id ON donation_allocations(donation_id);
ALTER TABLE donation_allocations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "donation_allocations_donor_select" ON donation_allocations;
CREATE POLICY "donation_allocations_donor_select"
  ON donation_allocations FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM donations d WHERE d.id = donation_allocations.donation_id AND d.donor_id = auth.uid()
  ));
DROP POLICY IF EXISTS "donation_allocations_finance_all" ON donation_allocations;
CREATE POLICY "donation_allocations_finance_all"
  ON donation_allocations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
DROP POLICY IF EXISTS "donations_donor_select_verified_by" ON donations;
CREATE POLICY "donations_donor_select_verified_by"
  ON donations FOR SELECT
  USING (donor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'finance_manager')
  ));
CREATE OR REPLACE FUNCTION verify_payment(
  p_session_id UUID,
  p_status TEXT,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_donation_id UUID;
  v_receipt_number TEXT;
  v_actor_role TEXT;
  v_amount NUMERIC;
  v_gateway TEXT;
  v_transaction_id TEXT;
BEGIN
  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can verify payments';
  END IF;
  IF p_status NOT IN ('verified', 'rejected', 'failed') THEN
    RAISE EXCEPTION 'Invalid status. Must be verified, rejected, or failed';
  END IF;
  SELECT donation_id, amount, gateway, transaction_id
  INTO v_donation_id, v_amount, v_gateway, v_transaction_id
  FROM payment_sessions WHERE id = p_session_id;
  IF v_donation_id IS NULL THEN
    RAISE EXCEPTION 'Payment session not found';
  END IF;
  UPDATE payment_sessions
  SET status = CASE WHEN p_status = 'verified' THEN 'completed' ELSE p_status END,
      verified_by = auth.uid(),
      verified_at = now(),
      verification_notes = p_notes,
      updated_at = now()
  WHERE id = p_session_id;
  IF p_status = 'verified' THEN
    v_receipt_number := generate_receipt_number();
    UPDATE donations
    SET status = 'completed',
        transaction_id = v_transaction_id,
        verified_at = now(),
        verified_by = auth.uid(),
        updated_at = now()
    WHERE id = v_donation_id;
    INSERT INTO payment_receipts (payment_session_id, donation_id, receipt_number, receipt_data)
    VALUES (p_session_id, v_donation_id, v_receipt_number, jsonb_build_object(
      'generated_at', now(),
      'amount', v_amount,
      'gateway', v_gateway,
      'transaction_id', v_transaction_id,
      'currency', 'NPR'
    ));
    INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
    VALUES
      (v_donation_id, 'Educational Materials', 30.00, v_amount * 0.30),
      (v_donation_id, 'Student Meals', 25.00, v_amount * 0.25),
      (v_donation_id, 'School Supplies', 15.00, v_amount * 0.15),
      (v_donation_id, 'Uniform Support', 15.00, v_amount * 0.15),
      (v_donation_id, 'Events & Activities', 10.00, v_amount * 0.10),
      (v_donation_id, 'Operations', 5.00, v_amount * 0.05);
  END IF;
  IF p_status = 'rejected' THEN
    UPDATE donations SET status = 'rejected', updated_at = now() WHERE id = v_donation_id;
  END IF;
  IF p_status = 'failed' THEN
    UPDATE donations SET status = 'failed', updated_at = now() WHERE id = v_donation_id;
  END IF;
  INSERT INTO payment_verifications (payment_session_id, verified_by, action, notes)
  VALUES (p_session_id, auth.uid(), p_status, p_notes);
  RETURN true;
END;
$$;
CREATE OR REPLACE FUNCTION assign_donation_allocations(
  p_donation_id UUID,
  p_allocations JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_actor_role TEXT;
  v_allocation RECORD;
  v_total_percentage NUMERIC;
  v_donation_amount NUMERIC;
BEGIN
  SELECT role INTO v_actor_role FROM profiles WHERE id = auth.uid();
  IF v_actor_role NOT IN ('super_admin', 'admin', 'finance_manager') THEN
    RAISE EXCEPTION 'Unauthorized: only finance managers can assign allocations';
  END IF;
  SELECT amount INTO v_donation_amount FROM donations WHERE id = p_donation_id;
  IF v_donation_amount IS NULL THEN
    RAISE EXCEPTION 'Donation not found';
  END IF;
  SELECT SUM((value->>'percentage')::NUMERIC) INTO v_total_percentage
  FROM jsonb_array_elements(p_allocations) AS value;
  IF v_total_percentage != 100 THEN
    RAISE EXCEPTION 'Allocation percentages must total 100%%';
  END IF;
  DELETE FROM donation_allocations WHERE donation_id = p_donation_id;
  FOR v_allocation IN
    SELECT
      (value->>'category')::TEXT AS category,
      (value->>'percentage')::NUMERIC AS percentage
    FROM jsonb_array_elements(p_allocations) AS value
  LOOP
    INSERT INTO donation_allocations (donation_id, category, allocation_percentage, amount)
    VALUES (
      p_donation_id,
      v_allocation.category,
      v_allocation.percentage,
      v_donation_amount * (v_allocation.percentage / 100)
    );
  END LOOP;
  RETURN true;
END;
$$;
CREATE OR REPLACE FUNCTION get_donor_allocations(p_donor_id UUID)
RETURNS TABLE (
  donation_id UUID,
  category TEXT,
  allocation_percentage NUMERIC,
  amount NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: you can only view your own allocations';
  END IF;
  RETURN QUERY
  SELECT da.donation_id, da.category, da.allocation_percentage, da.amount, da.created_at
  FROM donation_allocations da
  JOIN donations d ON d.id = da.donation_id
  WHERE d.donor_id = p_donor_id
  ORDER BY da.created_at DESC;
END;
$$;
ALTER PUBLICATION supabase_realtime ADD TABLE donation_allocations;
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  published BOOLEAN DEFAULT false,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  section_key TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  subtitle TEXT,
  content JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'upload', 'vimeo')),
  thumbnail_url TEXT,
  description TEXT,
  category TEXT DEFAULT 'general',
  is_featured BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.student_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  quote TEXT,
  achievements TEXT[] DEFAULT '{}',
  is_published BOOLEAN DEFAULT false,
  featured BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.media_library (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  alt_text TEXT,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'category'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN category TEXT DEFAULT 'general';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'uploaded_by'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'slug'
  ) THEN
    ALTER TABLE public.news ADD COLUMN slug TEXT UNIQUE;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'tags'
  ) THEN
    ALTER TABLE public.news ADD COLUMN tags TEXT[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'news' AND column_name = 'updated_by'
  ) THEN
    ALTER TABLE public.news ADD COLUMN updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'is_featured'
  ) THEN
    ALTER TABLE public.testimonials ADD COLUMN is_featured BOOLEAN DEFAULT false;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'testimonials' AND column_name = 'testimonial_type'
  ) THEN
    ALTER TABLE public.testimonials ADD COLUMN testimonial_type TEXT DEFAULT 'donor' CHECK (testimonial_type IN ('donor', 'teacher', 'student', 'volunteer'));
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['pages', 'homepage_sections', 'videos', 'faqs', 'student_stories', 'gallery_items', 'news', 'testimonials'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_' || tbl || '_updated_at') THEN
        EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', tbl, tbl);
      END IF;
    END IF;
  END LOOP;
END $$;
CREATE OR REPLACE FUNCTION public.set_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.published = true AND OLD.published = false THEN
    NEW.published_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_news_published_at') THEN
    CREATE TRIGGER set_news_published_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.set_published_at();
  END IF;
END $$;
CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 1;
BEGIN
  base_slug := lower(regexp_replace(regexp_replace(title, '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'));
  base_slug := regexp_replace(base_slug, '-+', '-', 'g');
  base_slug := trim(BOTH '-' FROM base_slug);
  final_slug := base_slug;
  LOOP
    IF table_name = 'news' THEN
      IF NOT EXISTS (SELECT 1 FROM public.news WHERE slug = final_slug) THEN
        EXIT;
      END IF;
    END IF;
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql;
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
ALTER TABLE IF EXISTS public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.student_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_library ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can read published pages" ON public.pages;
CREATE POLICY "Anyone can read published pages"
  ON public.pages FOR SELECT
  USING (published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can insert pages" ON public.pages;
CREATE POLICY "Admins can insert pages"
  ON public.pages FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can update pages" ON public.pages;
CREATE POLICY "Admins can update pages"
  ON public.pages FOR UPDATE
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can delete pages" ON public.pages;
CREATE POLICY "Admins can delete pages"
  ON public.pages FOR DELETE
  USING (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read active homepage sections" ON public.homepage_sections;
CREATE POLICY "Anyone can read active homepage sections"
  ON public.homepage_sections FOR SELECT
  USING (is_active = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage homepage sections" ON public.homepage_sections;
CREATE POLICY "Admins can manage homepage sections"
  ON public.homepage_sections FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read videos" ON public.videos;
CREATE POLICY "Anyone can read videos"
  ON public.videos FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can manage videos" ON public.videos;
CREATE POLICY "Admins can manage videos"
  ON public.videos FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read published faqs" ON public.faqs;
CREATE POLICY "Anyone can read published faqs"
  ON public.faqs FOR SELECT
  USING (is_published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage faqs" ON public.faqs;
CREATE POLICY "Admins can manage faqs"
  ON public.faqs FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read published stories" ON public.student_stories;
CREATE POLICY "Anyone can read published stories"
  ON public.student_stories FOR SELECT
  USING (is_published = true OR public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can manage stories" ON public.student_stories;
CREATE POLICY "Admins can manage stories"
  ON public.student_stories FOR ALL
  USING (public.is_admin_or_super_admin())
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Anyone can read media" ON public.media_library;
CREATE POLICY "Anyone can read media"
  ON public.media_library FOR SELECT
  USING (true);
DROP POLICY IF EXISTS "Admins can upload media" ON public.media_library;
CREATE POLICY "Admins can upload media"
  ON public.media_library FOR INSERT
  WITH CHECK (public.is_admin_or_super_admin());
DROP POLICY IF EXISTS "Admins can delete media" ON public.media_library;
CREATE POLICY "Admins can delete media"
  ON public.media_library FOR DELETE
  USING (public.is_admin_or_super_admin());
CREATE OR REPLACE FUNCTION public.log_content_change()
RETURNS TRIGGER AS $$
DECLARE
  entity_name TEXT;
  action_type TEXT;
  changes_json JSONB;
BEGIN
  entity_name := TG_TABLE_NAME;
  IF TG_OP = 'INSERT' THEN
    action_type := 'created';
    changes_json := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    action_type := 'updated';
    changes_json := jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    );
  ELSIF TG_OP = 'DELETE' THEN
    action_type := 'deleted';
    changes_json := to_jsonb(OLD);
  END IF;
  INSERT INTO public.audit_logs (user_id, action, entity_type, entity_id, changes, metadata)
  VALUES (
    auth.uid(),
    action_type || ' ' || entity_name,
    entity_name,
    COALESCE(NEW.id, OLD.id)::TEXT,
    changes_json,
    jsonb_build_object('table', entity_name, 'op', TG_OP)
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DO $$
DECLARE
  tbl TEXT;
  tables TEXT[] := ARRAY['pages', 'homepage_sections', 'videos', 'faqs', 'student_stories', 'media_library'];
BEGIN
  FOREACH tbl IN ARRAY tables
  LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = tbl) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'audit_' || tbl || '_changes') THEN
        EXECUTE format('CREATE TRIGGER audit_%I_changes AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.log_content_change()', tbl, tbl);
      END IF;
    END IF;
  END LOOP;
END $$;
CREATE INDEX IF NOT EXISTS idx_pages_slug ON public.pages(slug);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_key ON public.homepage_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON public.homepage_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_videos_featured ON public.videos(is_featured);
CREATE INDEX IF NOT EXISTS idx_videos_category ON public.videos(category);
CREATE INDEX IF NOT EXISTS idx_faqs_published ON public.faqs(is_published);
CREATE INDEX IF NOT EXISTS idx_faqs_sort ON public.faqs(sort_order);
CREATE INDEX IF NOT EXISTS idx_student_stories_published ON public.student_stories(is_published);
CREATE INDEX IF NOT EXISTS idx_student_stories_featured ON public.student_stories(featured);
CREATE INDEX IF NOT EXISTS idx_gallery_items_category ON public.gallery_items(category);
CREATE INDEX IF NOT EXISTS idx_gallery_items_featured ON public.gallery_items(is_featured);
CREATE INDEX IF NOT EXISTS idx_media_library_type ON public.media_library(mime_type);
INSERT INTO public.pages (slug, title, content, published) VALUES
  ('home', 'Homepage', '{"hero_title": "Empowering Nepal''s Future", "hero_subtitle": "One Child at a Time", "hero_description": "Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.", "cta_primary_text": "Sponsor a Child", "cta_primary_link": "/students", "cta_secondary_text": "Donate Now", "cta_secondary_link": "/donate"}', true),
  ('about', 'About Us', '{"mission": "Provide free quality education to underprivileged children", "vision": "Break the cycle of poverty through education", "founded": 1977, "location": "Kathmandu, Nepal"}', true),
  ('transparency', 'Transparency', '{"title": "Transparency & Accountability", "subtitle": "Built on Trust", "description": "We believe complete transparency is the foundation of lasting trust."}', true)
ON CONFLICT (slug) DO NOTHING;
INSERT INTO public.homepage_sections (section_key, title, subtitle, content, sort_order, is_active) VALUES
  ('hero', 'Hero Section', 'Main hero banner', '{"title": "Empowering Nepal''s Future", "highlight": "One Child at a Time", "description": "Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.", "cta_primary_text": "Sponsor a Child", "cta_primary_link": "/students", "cta_secondary_text": "Donate Now", "cta_secondary_link": "/donate", "background_image": "https://images.pexels.com/photos/358482/pexels-photo-358482.jpeg?auto=compress&cs=tinysrgb&w=1920"}', 1, true),
  ('stats', 'Statistics Bar', 'Key impact numbers', '{"items": [{"value": "Since 1977", "label": "Trusted Service"}, {"value": "49+", "label": "Years of Service"}, {"value": "100%", "label": "Free Education"}, {"value": "250+", "label": "Children Supported"}]}', 2, true),
  ('about_preview', 'About Preview', 'Brief about section with timeline', '{"title": "About Buddha Academy", "description": "Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.", "milestones": [{"year": "1977", "event": "Founded with 12 students"}, {"year": "1990s", "event": "Hostel expansion program"}, {"year": "2010s", "event": "Computer lab established"}, {"year": "Today", "event": "Educating hundreds annually"}]}', 3, true),
  ('sponsorship_steps', 'How Sponsorship Works', 'Step-by-step sponsorship guide', '{"title": "How Sponsorship Works", "description": "Your journey to changing a child''s life starts here.", "steps": [{"num": "01", "title": "Browse Profiles", "desc": "Review children waiting for sponsors"}, {"num": "02", "title": "Choose a Child", "desc": "Select a student to sponsor"}, {"num": "03", "title": "Make Your Pledge", "desc": "Complete donation form securely"}, {"num": "04", "title": "We Connect", "desc": "Link you with your sponsored child"}, {"num": "05", "title": "Receive Updates", "desc": "Get progress reports & photos"}, {"num": "06", "title": "Build Connection", "desc": "Exchange letters & messages"}, {"num": "07", "title": "Track Impact", "desc": "See your contribution at work"}, {"num": "08", "title": "Join Community", "desc": "Connect with other sponsors"}]}', 4, true),
  ('transparency_highlight', 'Transparency Highlight', 'Trust and accountability messaging', '{"title": "Your Trust Is Our Foundation", "description": "We are committed to honoring every donation with integrity, transparency, and a deep sense of responsibility."}', 5, true)
ON CONFLICT (section_key) DO NOTHING;
INSERT INTO public.faqs (question, answer, category, sort_order, is_published) VALUES
  ('How do I sponsor a child?', 'To sponsor a child, browse our Students page to view profiles of children waiting for sponsorship. Select a child whose story resonates with you, then click "Sponsor this child" to begin the process.', 'Sponsorship', 1, true),
  ('How is my donation used?', 'Your donation goes directly to supporting our students'' education and welfare. We maintain complete transparency in our financial reporting.', 'Donations', 2, true),
  ('Can I choose a specific student to sponsor?', 'Yes! You can browse through our student profiles and select a specific child you''d like to sponsor. Each profile includes their background and sponsorship needs.', 'Sponsorship', 3, true),
  ('Can I track my sponsored child''s progress?', 'Absolutely! As a sponsor, you''ll have access to your Donor Dashboard where you can view updates on your sponsored child''s academic progress and personal development.', 'Sponsorship', 4, true),
  ('Can donors visit the school?', 'Yes, we welcome donors to visit Buddha Academy and see our work firsthand. Please contact us in advance to arrange a visit.', 'General', 5, true),
  ('Is a small donation accepted?', 'Yes! Every donation, no matter the size, makes a difference. Small donations add up and help provide meals, books, and educational materials.', 'Donations', 6, true),
  ('How do I volunteer?', 'We welcome volunteers from around the world! Visit our Volunteer page to learn about opportunities and how to apply.', 'Volunteering', 7, true),
  ('How does corporate partnership work?', 'Corporate partners can support Buddha Academy through sponsorship programs, matching gift programs, or in-kind donations. Contact us to discuss opportunities.', 'Partnerships', 8, true)
ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS teacher_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  summary TEXT,
  subject TEXT,
  grade_achieved TEXT,
  attendance_rate NUMERIC(5,2),
  achievements TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  teacher_notes TEXT,
  report_card_url TEXT,
  report_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_student ON teacher_reports(student_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_teacher ON teacher_reports(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_reports_date ON teacher_reports(report_date DESC);
ALTER TABLE teacher_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teacher_reports_teacher_insert" ON teacher_reports;
CREATE POLICY "teacher_reports_teacher_insert"
  ON teacher_reports FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('teacher', 'super_admin', 'admin'))
  );
DROP POLICY IF EXISTS "teacher_reports_teacher_select" ON teacher_reports;
CREATE POLICY "teacher_reports_teacher_select"
  ON teacher_reports FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = auth.uid() AND ta.student_id = teacher_reports.student_id)
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );
DROP POLICY IF EXISTS "teacher_reports_donor_select" ON teacher_reports;
CREATE POLICY "teacher_reports_donor_select"
  ON teacher_reports FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1 FROM sponsorships s
      WHERE s.student_id = teacher_reports.student_id AND s.donor_id = auth.uid()
    )
  );
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'donation_received', 'donation_verified', 'sponsorship_started',
    'report_uploaded', 'student_progress', 'achievement',
    'volunteer_signup', 'new_student', 'impact_update',
    'payment_verified', 'receipt_generated', 'milestone'
  )),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  entity_type TEXT,
  entity_id UUID,
  is_public BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activities_user ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_public ON activities(is_public, created_at DESC);
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activities_select_own" ON activities;
CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  USING (
    user_id = auth.uid()
    OR is_public = true
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );
DROP POLICY IF EXISTS "activities_insert_admin" ON activities;
CREATE POLICY "activities_insert_admin"
  ON activities FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE student_progress ADD COLUMN IF NOT EXISTS title TEXT;
DROP POLICY IF EXISTS "student_progress_select" ON student_progress;
DROP POLICY IF EXISTS "student_progress_select_enhanced" ON student_progress;
CREATE POLICY "student_progress_select_enhanced"
  ON student_progress FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM teacher_assignments ta WHERE ta.teacher_id = auth.uid() AND ta.student_id = student_progress.student_id)
    OR (
      is_public = true
      AND EXISTS (SELECT 1 FROM sponsorships s WHERE s.student_id = student_progress.student_id AND s.donor_id = auth.uid())
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin'))
  );
CREATE INDEX IF NOT EXISTS idx_donations_donor_status ON donations(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_donations_created ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sponsorships_donor_status ON sponsorships(donor_id, status);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_progress_student ON student_progress(student_id, recorded_at DESC);
CREATE OR REPLACE FUNCTION log_activity(
  p_activity_type TEXT,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_entity_type TEXT DEFAULT NULL,
  p_entity_id UUID DEFAULT NULL,
  p_is_public BOOLEAN DEFAULT false,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_activity_id UUID;
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO activities (user_id, activity_type, title, description, entity_type, entity_id, is_public, metadata)
  VALUES (v_user_id, p_activity_type, p_title, p_description, p_entity_type, p_entity_id, p_is_public, p_metadata)
  RETURNING id INTO v_activity_id;
  RETURN v_activity_id;
END;
$$;
CREATE OR REPLACE FUNCTION get_donor_dashboard_stats(p_donor_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
  v_total_donated NUMERIC;
  v_active_sponsorships INTEGER;
  v_total_students INTEGER;
  v_last_donation_date TIMESTAMPTZ;
  v_pending_notifications INTEGER;
BEGIN
  IF p_donor_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;
  SELECT COALESCE(SUM(amount), 0) INTO v_total_donated
  FROM donations WHERE donor_id = p_donor_id AND status IN ('completed', 'verified');
  SELECT COUNT(*) INTO v_active_sponsorships
  FROM sponsorships WHERE donor_id = p_donor_id AND status = 'active';
  SELECT COUNT(DISTINCT student_id) INTO v_total_students
  FROM sponsorships WHERE donor_id = p_donor_id;
  SELECT MAX(created_at) INTO v_last_donation_date
  FROM donations WHERE donor_id = p_donor_id AND status IN ('completed', 'verified');
  SELECT COUNT(*) INTO v_pending_notifications
  FROM notifications WHERE user_id = p_donor_id AND read = false;
  result := jsonb_build_object(
    'total_donated', v_total_donated,
    'active_sponsorships', v_active_sponsorships,
    'total_students', v_total_students,
    'last_donation_date', v_last_donation_date,
    'unread_notifications', v_pending_notifications
  );
  RETURN result;
END;
$$;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER PUBLICATION supabase_realtime ADD TABLE teacher_reports;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
CREATE OR REPLACE FUNCTION public.admin_update_role(
  target_user_id uuid,
  new_role text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_status text;
  target_role text;
  new_role_level integer;
  super_admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'You cannot change your own role' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, p.status
  INTO caller_role, caller_status
  FROM public.profiles p
  WHERE p.id = auth.uid();
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied: caller not found' USING ERRCODE = '42501';
  END IF;
  IF caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  IF caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can manage roles. Your role: %', caller_role
      USING ERRCODE = '42501';
  END IF;
  SELECT p.role INTO target_role
  FROM public.profiles p
  WHERE p.id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  SELECT level INTO new_role_level
  FROM public.roles WHERE name = new_role;
  IF new_role_level IS NULL THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;
  IF target_role = 'super_admin' THEN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.profiles
    WHERE role = 'super_admin' AND status = 'active' AND id != target_user_id;
    IF super_admin_count = 0 THEN
      RAISE EXCEPTION 'Cannot remove the last super admin. Promote another user first.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
  INSERT INTO public.audit_logs (
    user_id, action, entity_type, entity_id, changes, metadata
  ) VALUES (
    auth.uid(),
    'role_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object(
      'previous_role', target_role,
      'new_role', new_role
    ),
    jsonb_build_object(
      'changed_by', auth.uid()::text,
      'caller_role', caller_role
    )
  );
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    target_user_id,
    'system',
    'Role Updated',
    format('Your role has been changed from %s to %s', target_role, new_role)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_role(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_role(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.admin_update_role IS 'Super admin only: change a user role. Enforces last-super-admin protection and full audit logging.';
CREATE OR REPLACE FUNCTION public.admin_update_user_status(
  target_user_id uuid,
  new_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  caller_status text;
  target_role text;
  super_admin_count integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
  END IF;
  IF target_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot change your own status' USING ERRCODE = '42501';
  END IF;
  SELECT p.role, p.status INTO caller_role, caller_status
  FROM public.profiles p
  WHERE p.id = auth.uid();
  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  IF caller_status != 'active' THEN
    RAISE EXCEPTION 'Account is not active' USING ERRCODE = '42501';
  END IF;
  IF caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Only super admins can manage user status. Your role: %', caller_role
      USING ERRCODE = '42501';
  END IF;
  SELECT p.role INTO target_role
  FROM public.profiles p
  WHERE p.id = target_user_id;
  IF target_role IS NULL THEN
    RAISE EXCEPTION 'Target user not found' USING ERRCODE = '42501';
  END IF;
  IF target_role = 'super_admin' AND new_status IN ('suspended', 'banned') THEN
    SELECT COUNT(*) INTO super_admin_count
    FROM public.profiles
    WHERE role = 'super_admin' AND status = 'active' AND id != target_user_id;
    IF super_admin_count = 0 THEN
      RAISE EXCEPTION 'Cannot suspend the last super admin.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  UPDATE public.profiles
  SET status = new_status, updated_at = now()
  WHERE id = target_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found' USING ERRCODE = '42501';
  END IF;
  PERFORM public.log_audit_event(
    auth.uid(),
    'status_change',
    'profiles',
    target_user_id::text,
    jsonb_build_object('new_status', new_status, 'previous_role', target_role),
    jsonb_build_object('changed_by', auth.uid()::text, 'caller_role', caller_role)
  );
END;
$$;
REVOKE ALL ON FUNCTION public.admin_update_user_status(uuid, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_update_user_status(uuid, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_update_user_status(uuid, text) TO authenticated;
COMMENT ON FUNCTION public.admin_update_user_status IS 'Super admin only: suspend/restore user accounts. Enables last-super-admin protection.';
DROP POLICY IF EXISTS audit_logs_select ON public.audit_logs;
DROP POLICY IF EXISTS "audit_logs_select" ON public.audit_logs;
CREATE POLICY audit_logs_select ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS security_events_read ON public.security_events;
DROP POLICY IF EXISTS "security_events_read" ON public.security_events;
CREATE POLICY security_events_read ON public.security_events
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS profiles_update_admin ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
CREATE POLICY profiles_update_admin ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS roles_select ON public.roles;
DROP POLICY IF EXISTS "roles_select" ON public.roles;
CREATE POLICY roles_select ON public.roles
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS roles_insert ON public.roles;
DROP POLICY IF EXISTS "roles_insert" ON public.roles;
CREATE POLICY roles_insert ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS roles_update ON public.roles;
DROP POLICY IF EXISTS "roles_update" ON public.roles;
CREATE POLICY roles_update ON public.roles
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS roles_delete ON public.roles;
DROP POLICY IF EXISTS "roles_delete" ON public.roles;
CREATE POLICY roles_delete ON public.roles
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS permissions_select ON public.permissions;
DROP POLICY IF EXISTS "permissions_select" ON public.permissions;
CREATE POLICY permissions_select ON public.permissions
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS permissions_insert ON public.permissions;
DROP POLICY IF EXISTS "permissions_insert" ON public.permissions;
CREATE POLICY permissions_insert ON public.permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS permissions_update ON public.permissions;
DROP POLICY IF EXISTS "permissions_update" ON public.permissions;
CREATE POLICY permissions_update ON public.permissions
  FOR UPDATE
  TO authenticated
  USING (public.get_my_role() = 'super_admin')
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS permissions_delete ON public.permissions;
DROP POLICY IF EXISTS "permissions_delete" ON public.permissions;
CREATE POLICY permissions_delete ON public.permissions
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS role_permissions_insert ON public.role_permissions;
DROP POLICY IF EXISTS role_permissions_delete ON public.role_permissions;
DROP POLICY IF EXISTS "role_permissions_select" ON public.role_permissions;
CREATE POLICY role_permissions_select ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "role_permissions_insert" ON public.role_permissions;
CREATE POLICY role_permissions_insert ON public.role_permissions
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "role_permissions_delete" ON public.role_permissions;
CREATE POLICY role_permissions_delete ON public.role_permissions
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS user_roles_insert ON public.user_roles;
DROP POLICY IF EXISTS user_roles_delete ON public.user_roles;
DROP POLICY IF EXISTS "user_roles_select" ON public.user_roles;
CREATE POLICY user_roles_select ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "user_roles_insert" ON public.user_roles;
CREATE POLICY user_roles_insert ON public.user_roles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.get_my_role() = 'super_admin');
DROP POLICY IF EXISTS "user_roles_delete" ON public.user_roles;
CREATE POLICY user_roles_delete ON public.user_roles
  FOR DELETE
  TO authenticated
  USING (public.get_my_role() = 'super_admin');
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id uuid)
RETURNS text[]
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_permissions text[];
  v_caller_role text;
BEGIN
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE id = auth.uid();
  IF user_id != auth.uid() AND v_caller_role != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  SELECT ARRAY_AGG(DISTINCT perm.code ORDER BY perm.code)
  INTO v_permissions
  FROM public.profiles p
  JOIN public.roles r ON r.name = p.role
  JOIN public.role_permissions rp ON rp.role_id = r.id
  JOIN public.permissions perm ON perm.id = rp.permission_id
  WHERE p.id = user_id AND p.status = 'active';
  RETURN COALESCE(v_permissions, ARRAY[]::text[]);
END;
$$;
REVOKE ALL ON FUNCTION public.get_user_permissions(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_user_permissions(uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_user_permissions(uuid) TO authenticated;
CREATE OR REPLACE FUNCTION public.get_audit_logs_with_users(
  p_limit integer DEFAULT 100,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  action text,
  entity_type text,
  entity_id text,
  changes jsonb,
  metadata jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz,
  actor_name text,
  actor_email text,
  actor_role text
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.get_my_role() != 'super_admin' THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;
  RETURN QUERY
  SELECT
    al.id,
    al.action,
    al.entity_type,
    al.entity_id,
    al.changes,
    al.metadata,
    al.ip_address,
    al.user_agent,
    al.created_at,
    p.full_name AS actor_name,
    p.email AS actor_email,
    p.role AS actor_role
  FROM public.audit_logs al
  LEFT JOIN public.profiles p ON p.id = al.user_id
  ORDER BY al.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;
REVOKE ALL ON FUNCTION public.get_audit_logs_with_users(integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_audit_logs_with_users(integer, integer) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_audit_logs_with_users(integer, integer) TO authenticated;
COMMENT ON FUNCTION public.get_audit_logs_with_users IS 'Super admin only: query audit logs with user details.';
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'admin_update_role'
      AND p.pronargs = 2
  ) THEN
    RAISE EXCEPTION 'admin_update_role function not found';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname = 'admin_update_user_status'
      AND p.pronargs = 2
  ) THEN
    RAISE EXCEPTION 'admin_update_user_status function not found';
  END IF;
  RAISE NOTICE 'Super admin only RBAC migration applied successfully';
END $$;
CREATE TABLE IF NOT EXISTS email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email_to TEXT NOT NULL,
  email_type TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at DESC);
DROP POLICY IF EXISTS "super_admin_view_email_logs" ON email_logs;
CREATE POLICY "super_admin_view_email_logs"
  ON email_logs FOR SELECT
  TO authenticated
  USING (get_user_role() = 'super_admin');
DROP POLICY IF EXISTS "system_insert_email_logs" ON email_logs;
CREATE POLICY "system_insert_email_logs"
  ON email_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
CREATE TABLE IF NOT EXISTS volunteer_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_time TEXT,
  location TEXT,
  max_volunteers INTEGER DEFAULT 20,
  current_volunteers INTEGER DEFAULT 0,
  required_skills TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE volunteer_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_volunteer_events_date ON volunteer_events(event_date);
CREATE INDEX idx_volunteer_events_active ON volunteer_events(is_active);
DROP POLICY IF EXISTS "public_view_active_volunteer_events" ON volunteer_events;
CREATE POLICY "public_view_active_volunteer_events"
  ON volunteer_events FOR SELECT
  TO authenticated, anon
  USING (is_active = true);
DROP POLICY IF EXISTS "admin_manage_volunteer_events" ON volunteer_events;
CREATE POLICY "admin_manage_volunteer_events"
  ON volunteer_events FOR ALL
  TO authenticated
  USING (get_user_role() IN ('super_admin', 'admin'))
  WITH CHECK (get_user_role() IN ('super_admin', 'admin'));
CREATE TABLE IF NOT EXISTS volunteer_event_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES volunteer_events(id) ON DELETE CASCADE,
  volunteer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'registered',
  attended BOOLEAN DEFAULT false,
  hours_logged NUMERIC(5,1),
  notes TEXT,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, volunteer_id)
);
ALTER TABLE volunteer_event_signups ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_volunteer_signups_event ON volunteer_event_signups(event_id);
CREATE INDEX idx_volunteer_signups_volunteer ON volunteer_event_signups(volunteer_id);
DROP POLICY IF EXISTS "volunteer_view_own_signups" ON volunteer_event_signups;
CREATE POLICY "volunteer_view_own_signups"
  ON volunteer_event_signups FOR SELECT
  TO authenticated
  USING (volunteer_id = auth.uid());
DROP POLICY IF EXISTS "volunteer_register_self" ON volunteer_event_signups;
CREATE POLICY "volunteer_register_self"
  ON volunteer_event_signups FOR INSERT
  TO authenticated
  WITH CHECK (volunteer_id = auth.uid() AND get_user_role() = 'volunteer');
DROP POLICY IF EXISTS "admin_manage_signups" ON volunteer_event_signups;
CREATE POLICY "admin_manage_signups"
  ON volunteer_event_signups FOR ALL
  TO authenticated
  USING (get_user_role() IN ('super_admin', 'admin'))
  WITH CHECK (get_user_role() IN ('super_admin', 'admin'));
ALTER TABLE student_stories 
  ADD COLUMN IF NOT EXISTS before_description TEXT,
  ADD COLUMN IF NOT EXISTS after_description TEXT,
  ADD COLUMN IF NOT EXISTS before_image_url TEXT,
  ADD COLUMN IF NOT EXISTS after_image_url TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_quote TEXT,
  ADD COLUMN IF NOT EXISTS testimonial_author TEXT,
  ADD COLUMN IF NOT EXISTS story_type TEXT DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_activities_is_public ON activities(is_public);
CREATE INDEX IF NOT EXISTS idx_activities_type ON activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_user_status ON login_history(user_id, status);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE user_sessions
  SET is_active = false
  WHERE expired_at < now() AND is_active = true;
END;
$$;
CREATE OR REPLACE FUNCTION log_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO activities (
    user_id,
    activity_type,
    title,
    description,
    metadata,
    entity_type,
    entity_id,
    is_public
  ) VALUES (
    COALESCE(NEW.user_id, auth.uid()),
    TG_ARGV[0],
    COALESCE(NEW.title, TG_ARGV[1]),
    NEW.description,
    NEW.metadata,
    TG_TABLE_NAME,
    NEW.id,
    COALESCE(NEW.is_public, false)
  );
  RETURN NEW;
END;
$$;
CREATE OR REPLACE FUNCTION log_donation_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO activities (
    user_id,
    activity_type,
    title,
    description,
    entity_type,
    entity_id,
    is_public,
    metadata
  ) VALUES (
    NEW.donor_id,
    'donation_completed',
    CASE 
      WHEN NEW.status = 'verified' THEN 'Donation Verified'
      ELSE 'Donation Received'
    END,
    CASE 
      WHEN NEW.status = 'verified' THEN format('Donation of NPR %s has been verified.', NEW.amount::text)
      ELSE format('A donation of NPR %s has been received.', NEW.amount::text)
    END,
    'donations',
    NEW.id,
    CASE WHEN NEW.status = 'verified' THEN true ELSE false END,
    jsonb_build_object('amount', NEW.amount, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_donation_verified ON donations;
CREATE TRIGGER on_donation_verified
  AFTER UPDATE OF status ON donations
  FOR EACH ROW
  WHEN (NEW.status = 'verified' OR NEW.status = 'completed')
  EXECUTE FUNCTION log_donation_activity();
CREATE OR REPLACE FUNCTION log_sponsorship_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_name TEXT;
BEGIN
  SELECT name INTO student_name FROM students WHERE id = NEW.student_id;
  INSERT INTO activities (
    user_id,
    activity_type,
    title,
    description,
    entity_type,
    entity_id,
    is_public,
    metadata
  ) VALUES (
    NEW.donor_id,
    'sponsorship_started',
    'New Sponsorship Begins',
    format('%s has been sponsored. Welcome to the Buddha Academy family!', student_name),
    'sponsorships',
    NEW.id,
    true,
    jsonb_build_object('student_id', NEW.student_id, 'student_name', student_name, 'amount', NEW.amount)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_sponsorship_created ON sponsorships;
CREATE TRIGGER on_sponsorship_created
  AFTER INSERT ON sponsorships
  FOR EACH ROW
  EXECUTE FUNCTION log_sponsorship_activity();
CREATE OR REPLACE FUNCTION log_teacher_report_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  student_name TEXT;
BEGIN
  SELECT name INTO student_name FROM students WHERE id = NEW.student_id;
  INSERT INTO activities (
    user_id,
    activity_type,
    title,
    description,
    entity_type,
    entity_id,
    is_public,
    metadata
  ) VALUES (
    NEW.teacher_id,
    'teacher_report',
    format('Progress Report: %s', student_name),
    format('A new progress report has been submitted for %s.', student_name),
    'teacher_reports',
    NEW.id,
    true,
    jsonb_build_object('student_id', NEW.student_id, 'student_name', student_name, 'subject', NEW.subject)
  );
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS on_teacher_report ON teacher_reports;
CREATE TRIGGER on_teacher_report
  AFTER INSERT ON teacher_reports
  FOR EACH ROW
  EXECUTE FUNCTION log_teacher_report_activity();
CREATE OR REPLACE FUNCTION record_login_attempt(
  p_user_id UUID,
  p_status TEXT,
  p_failure_reason TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO login_history (
    user_id,
    ip_address,
    user_agent,
    device_info,
    status,
    failure_reason
  ) VALUES (
    p_user_id,
    current_setting('request.headers')::json->>'x-forwarded-for',
    current_setting('request.headers')::json->>'user-agent',
    jsonb_build_object(
      'ip', current_setting('request.headers')::json->>'x-forwarded-for',
      'agent', current_setting('request.headers')::json->>'user-agent'
    ),
    p_status,
    p_failure_reason
  );
  IF p_status = 'success' THEN
    UPDATE profiles 
    SET last_login_at = now(), login_attempts = 0
    WHERE id = p_user_id;
  END IF;
END;
$$;
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT DEFAULT NULL,
  p_data JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data)
  VALUES (p_user_id, p_type, p_title, p_message, p_data)
  RETURNING id INTO v_notification_id;
  RETURN v_notification_id;
END;
$$;
CREATE INDEX IF NOT EXISTS idx_donation_goals_active ON donation_goals(is_active);
CREATE INDEX IF NOT EXISTS idx_donation_goals_category ON donation_goals(category);
CREATE INDEX IF NOT EXISTS idx_students_sponsorship_status ON students(sponsorship_status);
CREATE INDEX IF NOT EXISTS idx_students_age ON students(age);
CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
DROP POLICY IF EXISTS "volunteer_view_own_assignments" ON volunteer_assignments;
DROP POLICY IF EXISTS "volunteer_view_own_assignments" ON volunteer_assignments;
CREATE POLICY "volunteer_view_own_assignments"
  ON volunteer_assignments FOR SELECT
  TO authenticated
  USING (volunteer_id = auth.uid());
DROP POLICY IF EXISTS "public_view_activities" ON activities;
DROP POLICY IF EXISTS "public_view_activities" ON activities;
CREATE POLICY "public_view_activities"
  ON activities FOR SELECT
  TO authenticated, anon
  USING (is_public = true);
DROP POLICY IF EXISTS "users_view_own_activities" ON activities;
DROP POLICY IF EXISTS "users_view_own_activities" ON activities;
CREATE POLICY "users_view_own_activities"
  ON activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);