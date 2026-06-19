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

DROP POLICY IF EXISTS roles_read ON roles;
CREATE POLICY roles_read ON public.roles FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS roles_insert ON roles;
CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS roles_update ON roles;
CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('settings.update'))
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS roles_delete ON roles;
CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated
  USING (public.rls_has_permission('settings.update'));

DROP POLICY IF EXISTS permissions_read ON permissions;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS permissions_insert ON permissions;
CREATE POLICY permissions_insert ON public.permissions FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_update ON permissions;
CREATE POLICY permissions_update ON public.permissions FOR UPDATE TO authenticated
  USING (public.rls_has_permission('settings.update'))
  WITH CHECK (public.rls_has_permission('settings.update'));
DROP POLICY IF EXISTS permissions_delete ON permissions;
CREATE POLICY permissions_delete ON public.permissions FOR DELETE TO authenticated
  USING (public.rls_has_permission('settings.update'));

DROP POLICY IF EXISTS role_permissions_read ON role_permissions;
CREATE POLICY role_permissions_read ON public.role_permissions FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS role_permissions_insert ON role_permissions;
CREATE POLICY role_permissions_insert ON public.role_permissions FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS role_permissions_delete ON role_permissions;
CREATE POLICY role_permissions_delete ON public.role_permissions FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.manage_roles'));

DROP POLICY IF EXISTS user_roles_read_own ON user_roles;
CREATE POLICY user_roles_read_own ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_roles_read_all ON user_roles;
CREATE POLICY user_roles_read_all ON public.user_roles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS user_roles_insert ON user_roles;
CREATE POLICY user_roles_insert ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.manage_roles'));
DROP POLICY IF EXISTS user_roles_delete ON user_roles;
CREATE POLICY user_roles_delete ON public.user_roles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.manage_roles'));

DROP POLICY IF EXISTS user_sessions_read_own ON user_sessions;
CREATE POLICY user_sessions_read_own ON public.user_sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_sessions_read_all ON user_sessions;
CREATE POLICY user_sessions_read_all ON public.user_sessions FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS user_sessions_delete_own ON user_sessions;
CREATE POLICY user_sessions_delete_own ON public.user_sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_sessions_delete_all ON user_sessions;
CREATE POLICY user_sessions_delete_all ON public.user_sessions FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.suspend'));

DROP POLICY IF EXISTS audit_logs_read ON audit_logs;
CREATE POLICY audit_logs_read ON public.audit_logs FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));

DROP POLICY IF EXISTS departments_read ON departments;
CREATE POLICY departments_read ON public.departments FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS departments_insert ON departments;
CREATE POLICY departments_insert ON public.departments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS departments_update ON departments;
CREATE POLICY departments_update ON public.departments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('departments.manage'))
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS departments_delete ON departments;
CREATE POLICY departments_delete ON public.departments FOR DELETE TO authenticated
  USING (public.rls_has_permission('departments.manage'));

DROP POLICY IF EXISTS teams_read ON teams;
CREATE POLICY teams_read ON public.teams FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS teams_insert ON teams;
CREATE POLICY teams_insert ON public.teams FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS teams_update ON teams;
CREATE POLICY teams_update ON public.teams FOR UPDATE TO authenticated
  USING (public.rls_has_permission('teams.manage'))
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS teams_delete ON teams;
CREATE POLICY teams_delete ON public.teams FOR DELETE TO authenticated
  USING (public.rls_has_permission('teams.manage'));

DROP POLICY IF EXISTS user_departments_read_own ON user_departments;
CREATE POLICY user_departments_read_own ON public.user_departments FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_departments_read_all ON user_departments;
CREATE POLICY user_departments_read_all ON public.user_departments FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS user_departments_insert ON user_departments;
CREATE POLICY user_departments_insert ON public.user_departments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('departments.manage'));
DROP POLICY IF EXISTS user_departments_delete ON user_departments;
CREATE POLICY user_departments_delete ON public.user_departments FOR DELETE TO authenticated
  USING (public.rls_has_permission('departments.manage'));

DROP POLICY IF EXISTS user_teams_read_own ON user_teams;
CREATE POLICY user_teams_read_own ON public.user_teams FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS user_teams_read_all ON user_teams;
CREATE POLICY user_teams_read_all ON public.user_teams FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS user_teams_insert ON user_teams;
CREATE POLICY user_teams_insert ON public.user_teams FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('teams.manage'));
DROP POLICY IF EXISTS user_teams_delete ON user_teams;
CREATE POLICY user_teams_delete ON public.user_teams FOR DELETE TO authenticated
  USING (public.rls_has_permission('teams.manage'));

DROP POLICY IF EXISTS invitations_read_own ON invitations;
CREATE POLICY invitations_read_own ON public.invitations FOR SELECT TO authenticated
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
DROP POLICY IF EXISTS invitations_read_all ON invitations;
CREATE POLICY invitations_read_all ON public.invitations FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS invitations_insert ON invitations;
CREATE POLICY invitations_insert ON public.invitations FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('users.invite'));
DROP POLICY IF EXISTS invitations_update ON invitations;
CREATE POLICY invitations_update ON public.invitations FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.invite'))
  WITH CHECK (public.rls_has_permission('users.invite'));

DROP POLICY IF EXISTS approvals_read_own ON approvals;
CREATE POLICY approvals_read_own ON public.approvals FOR SELECT TO authenticated
  USING (requester_id = auth.uid());
DROP POLICY IF EXISTS approvals_read_all ON approvals;
CREATE POLICY approvals_read_all ON public.approvals FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS approvals_insert ON approvals;
CREATE POLICY approvals_insert ON public.approvals FOR INSERT TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS approvals_update ON approvals;
CREATE POLICY approvals_update ON public.approvals FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));

DROP POLICY IF EXISTS security_events_read ON security_events;
CREATE POLICY security_events_read ON public.security_events FOR SELECT TO authenticated
  USING (public.rls_has_permission('audit.read'));

DROP POLICY IF EXISTS notifications_read_own ON notifications;
CREATE POLICY notifications_read_own ON public.notifications FOR SELECT TO authenticated
  USING (user_id = auth.uid());
DROP POLICY IF EXISTS notifications_update_own ON notifications;
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS notifications_insert_system ON notifications;
CREATE POLICY notifications_insert_system ON public.notifications FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('notifications.send'));

DROP POLICY IF EXISTS volunteer_assignments_read_own ON volunteer_assignments;
CREATE POLICY volunteer_assignments_read_own ON public.volunteer_assignments FOR SELECT TO authenticated
  USING (volunteer_id = auth.uid());
DROP POLICY IF EXISTS volunteer_assignments_read_all ON volunteer_assignments;
CREATE POLICY volunteer_assignments_read_all ON public.volunteer_assignments FOR SELECT TO authenticated
  USING (public.rls_has_permission('volunteers.read'));
DROP POLICY IF EXISTS volunteer_assignments_insert ON volunteer_assignments;
CREATE POLICY volunteer_assignments_insert ON public.volunteer_assignments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('volunteers.create'));
DROP POLICY IF EXISTS volunteer_assignments_update ON volunteer_assignments;
CREATE POLICY volunteer_assignments_update ON public.volunteer_assignments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('volunteers.update'))
  WITH CHECK (public.rls_has_permission('volunteers.update'));
DROP POLICY IF EXISTS volunteer_assignments_delete ON volunteer_assignments;
CREATE POLICY volunteer_assignments_delete ON public.volunteer_assignments FOR DELETE TO authenticated
  USING (public.rls_has_permission('volunteers.delete'));

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

DROP POLICY IF EXISTS profiles_read_own ON profiles;
CREATE POLICY profiles_read_own ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid());
DROP POLICY IF EXISTS profiles_read_all ON profiles;
CREATE POLICY profiles_read_all ON public.profiles FOR SELECT TO authenticated
  USING (public.rls_has_permission('users.read'));
DROP POLICY IF EXISTS profiles_update_own ON profiles;
CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
    AND status = (SELECT status FROM public.profiles WHERE id = auth.uid())
  );
DROP POLICY IF EXISTS profiles_update_all ON profiles;
CREATE POLICY profiles_update_all ON public.profiles FOR UPDATE TO authenticated
  USING (public.rls_has_permission('users.update'))
  WITH CHECK (public.rls_has_permission('users.update'));
DROP POLICY IF EXISTS profiles_delete ON profiles;
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
  USING (public.rls_has_permission('users.delete'));

DROP POLICY IF EXISTS "Anyone can view students" ON public.students;
DROP POLICY IF EXISTS "Anyone can view students anon" ON public.students;
DROP POLICY IF EXISTS "Admins can insert/update/delete students" ON public.students;

DROP POLICY IF EXISTS students_read_all ON students;
CREATE POLICY students_read_all ON public.students FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS students_read_anon ON students;
CREATE POLICY students_read_anon ON public.students FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS students_insert ON students;
CREATE POLICY students_insert ON public.students FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('students.create'));
DROP POLICY IF EXISTS students_update ON students;
CREATE POLICY students_update ON public.students FOR UPDATE TO authenticated
  USING (public.rls_has_permission('students.update'))
  WITH CHECK (public.rls_has_permission('students.update'));
DROP POLICY IF EXISTS students_delete ON students;
CREATE POLICY students_delete ON public.students FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));

DROP POLICY IF EXISTS "Donors can read own donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can read all donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Admins can update donations" ON public.donations;

DROP POLICY IF EXISTS donations_read_own ON donations;
CREATE POLICY donations_read_own ON public.donations FOR SELECT TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS donations_read_all ON donations;
CREATE POLICY donations_read_all ON public.donations FOR SELECT TO authenticated
  USING (public.rls_has_permission('donations.read'));
DROP POLICY IF EXISTS donations_insert ON donations;
CREATE POLICY donations_insert ON public.donations FOR INSERT TO authenticated
  WITH CHECK (donor_id = auth.uid() OR public.rls_has_permission('donations.create'));
DROP POLICY IF EXISTS donations_update ON donations;
CREATE POLICY donations_update ON public.donations FOR UPDATE TO authenticated
  USING (public.rls_has_permission('donations.update'))
  WITH CHECK (public.rls_has_permission('donations.update'));

DROP POLICY IF EXISTS "Donors can read own sponsorships" ON public.sponsorships;
DROP POLICY IF EXISTS "Admins can read/insert/update sponsorships" ON public.sponsorships;

DROP POLICY IF EXISTS sponsorships_read_own ON sponsorships;
CREATE POLICY sponsorships_read_own ON public.sponsorships FOR SELECT TO authenticated
  USING (donor_id = auth.uid());
DROP POLICY IF EXISTS sponsorships_read_all ON sponsorships;
CREATE POLICY sponsorships_read_all ON public.sponsorships FOR SELECT TO authenticated
  USING (public.rls_has_permission('sponsorships.read'));
DROP POLICY IF EXISTS sponsorships_insert ON sponsorships;
CREATE POLICY sponsorships_insert ON public.sponsorships FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('sponsorships.create'));
DROP POLICY IF EXISTS sponsorships_update ON sponsorships;
CREATE POLICY sponsorships_update ON public.sponsorships FOR UPDATE TO authenticated
  USING (public.rls_has_permission('sponsorships.update'))
  WITH CHECK (public.rls_has_permission('sponsorships.update'));
DROP POLICY IF EXISTS sponsorships_delete ON sponsorships;
CREATE POLICY sponsorships_delete ON public.sponsorships FOR DELETE TO authenticated
  USING (public.rls_has_permission('sponsorships.delete'));

DROP POLICY IF EXISTS "Anyone can view published news" ON public.news;
DROP POLICY IF EXISTS "Anyone can view published news anon" ON public.news;
DROP POLICY IF EXISTS "Admins can insert/update/delete news" ON public.news;

DROP POLICY IF EXISTS news_read_public ON news;
CREATE POLICY news_read_public ON public.news FOR SELECT TO authenticated
  USING (published = true OR public.rls_has_permission('news.read'));
DROP POLICY IF EXISTS news_read_anon ON news;
CREATE POLICY news_read_anon ON public.news FOR SELECT TO anon
  USING (published = true);
DROP POLICY IF EXISTS news_insert ON news;
CREATE POLICY news_insert ON public.news FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('news.create'));
DROP POLICY IF EXISTS news_update ON news;
CREATE POLICY news_update ON public.news FOR UPDATE TO authenticated
  USING (public.rls_has_permission('news.update'))
  WITH CHECK (public.rls_has_permission('news.update'));
DROP POLICY IF EXISTS news_delete ON news;
CREATE POLICY news_delete ON public.news FOR DELETE TO authenticated
  USING (public.rls_has_permission('news.delete'));

DROP POLICY IF EXISTS "Anyone can view gallery" ON public.gallery_items;
DROP POLICY IF EXISTS "Anyone can view gallery anon" ON public.gallery_items;
DROP POLICY IF EXISTS "Admins can insert/update/delete gallery items" ON public.gallery_items;

DROP POLICY IF EXISTS gallery_read_all ON gallery_items;
CREATE POLICY gallery_read_all ON public.gallery_items FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS gallery_read_anon ON gallery_items;
CREATE POLICY gallery_read_anon ON public.gallery_items FOR SELECT TO anon USING (true);
DROP POLICY IF EXISTS gallery_insert ON gallery_items;
CREATE POLICY gallery_insert ON public.gallery_items FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('gallery.create'));
DROP POLICY IF EXISTS gallery_update ON gallery_items;
CREATE POLICY gallery_update ON public.gallery_items FOR UPDATE TO authenticated
  USING (public.rls_has_permission('gallery.update'))
  WITH CHECK (public.rls_has_permission('gallery.update'));
DROP POLICY IF EXISTS gallery_delete ON gallery_items;
CREATE POLICY gallery_delete ON public.gallery_items FOR DELETE TO authenticated
  USING (public.rls_has_permission('gallery.delete'));

DROP POLICY IF EXISTS "Admins can read contact submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form" ON public.contact_submissions;
DROP POLICY IF EXISTS "Anyone can submit contact form anon" ON public.contact_submissions;
DROP POLICY IF EXISTS "Admins can update contact submissions" ON public.contact_submissions;

DROP POLICY IF EXISTS contacts_read ON contact_submissions;
CREATE POLICY contacts_read ON public.contact_submissions FOR SELECT TO authenticated
  USING (public.rls_has_permission('contacts.read'));
DROP POLICY IF EXISTS contacts_insert ON contact_submissions;
CREATE POLICY contacts_insert ON public.contact_submissions FOR INSERT TO authenticated
  WITH CHECK (true);
DROP POLICY IF EXISTS contacts_insert_anon ON contact_submissions;
CREATE POLICY contacts_insert_anon ON public.contact_submissions FOR INSERT TO anon
  WITH CHECK (true);
DROP POLICY IF EXISTS contacts_update ON contact_submissions;
CREATE POLICY contacts_update ON public.contact_submissions FOR UPDATE TO authenticated
  USING (public.rls_has_permission('contacts.update'))
  WITH CHECK (public.rls_has_permission('contacts.update'));

DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_departments_updated_at ON departments;
CREATE TRIGGER update_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_teams_updated_at ON teams;
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_approvals_updated_at ON approvals;
CREATE TRIGGER update_approvals_updated_at
  BEFORE UPDATE ON public.approvals
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_volunteer_assignments_updated_at ON volunteer_assignments;
CREATE TRIGGER update_volunteer_assignments_updated_at
  BEFORE UPDATE ON public.volunteer_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS track_session_activity ON user_sessions;
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