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

DROP POLICY IF EXISTS teacher_assignments_select_own ON teacher_assignments;
CREATE POLICY teacher_assignments_select_own
  ON public.teacher_assignments FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );

DROP POLICY IF EXISTS teacher_assignments_select_admin ON teacher_assignments;
CREATE POLICY teacher_assignments_select_admin
  ON public.teacher_assignments FOR SELECT TO authenticated
  USING (public.rls_has_permission('students.read'));

DROP POLICY IF EXISTS teacher_assignments_insert_admin ON teacher_assignments;
CREATE POLICY teacher_assignments_insert_admin
  ON public.teacher_assignments FOR INSERT TO authenticated
  WITH CHECK (public.rls_has_permission('students.update'));

DROP POLICY IF EXISTS teacher_assignments_update_admin ON teacher_assignments;
CREATE POLICY teacher_assignments_update_admin
  ON public.teacher_assignments FOR UPDATE TO authenticated
  USING (public.rls_has_permission('students.update'))
  WITH CHECK (public.rls_has_permission('students.update'));

DROP POLICY IF EXISTS teacher_assignments_delete_admin ON teacher_assignments;
CREATE POLICY teacher_assignments_delete_admin
  ON public.teacher_assignments FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));

ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS student_progress_select_teacher ON student_progress;
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

DROP POLICY IF EXISTS student_progress_insert_teacher ON student_progress;
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

DROP POLICY IF EXISTS student_progress_update_teacher ON student_progress;
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

DROP POLICY IF EXISTS student_progress_delete_teacher ON student_progress;
CREATE POLICY student_progress_delete_teacher
  ON public.student_progress FOR DELETE TO authenticated
  USING (
    teacher_id = auth.uid()
    AND public.is_active_user()
  );

DROP POLICY IF EXISTS student_progress_select_admin ON student_progress;
CREATE POLICY student_progress_select_admin
  ON public.student_progress FOR SELECT TO authenticated
  USING (public.rls_has_permission('students.read'));

DROP POLICY IF EXISTS student_progress_delete_admin ON student_progress;
CREATE POLICY student_progress_delete_admin
  ON public.student_progress FOR DELETE TO authenticated
  USING (public.rls_has_permission('students.delete'));

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS attendance_records_select_teacher ON attendance_records;
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

DROP POLICY IF EXISTS attendance_records_insert_teacher ON attendance_records;
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

DROP POLICY IF EXISTS attendance_records_update_teacher ON attendance_records;
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

DROP POLICY IF EXISTS attendance_records_select_admin ON attendance_records;
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