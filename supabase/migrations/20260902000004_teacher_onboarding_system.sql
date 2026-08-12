ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS position text,
  ADD COLUMN IF NOT EXISTS qualification text,
  ADD COLUMN IF NOT EXISTS photo_url text;

CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  name_ne text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teacher_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, subject_id)
);

CREATE TABLE IF NOT EXISTS public.teacher_class_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  class_section text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(teacher_id, class_section)
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_class_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS subjects_read_teacher ON public.subjects;
CREATE POLICY subjects_read_teacher
  ON public.subjects FOR SELECT TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin', 'teacher'));

DROP POLICY IF EXISTS subjects_manage_admin ON public.subjects;
CREATE POLICY subjects_manage_admin
  ON public.subjects FOR ALL TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin'))
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS teacher_subjects_select_own ON public.teacher_subjects;
CREATE POLICY teacher_subjects_select_own
  ON public.teacher_subjects FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.get_my_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS teacher_subjects_manage_admin ON public.teacher_subjects;
CREATE POLICY teacher_subjects_manage_admin
  ON public.teacher_subjects FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS teacher_subjects_delete_admin ON public.teacher_subjects;
CREATE POLICY teacher_subjects_delete_admin
  ON public.teacher_subjects FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS teacher_class_assignments_select_own ON public.teacher_class_assignments;
CREATE POLICY teacher_class_assignments_select_own
  ON public.teacher_class_assignments FOR SELECT TO authenticated
  USING (
    teacher_id = auth.uid()
    OR public.get_my_role() IN ('super_admin', 'admin')
  );

DROP POLICY IF EXISTS teacher_class_assignments_manage_admin ON public.teacher_class_assignments;
CREATE POLICY teacher_class_assignments_manage_admin
  ON public.teacher_class_assignments FOR INSERT TO authenticated
  WITH CHECK (public.get_my_role() IN ('super_admin', 'admin'));

DROP POLICY IF EXISTS teacher_class_assignments_delete_admin ON public.teacher_class_assignments;
CREATE POLICY teacher_class_assignments_delete_admin
  ON public.teacher_class_assignments FOR DELETE TO authenticated
  USING (public.get_my_role() IN ('super_admin', 'admin'));

CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher_id ON public.teacher_subjects(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_subject_id ON public.teacher_subjects(subject_id);
CREATE INDEX IF NOT EXISTS idx_teacher_class_assignments_teacher_id ON public.teacher_class_assignments(teacher_id);

CREATE OR REPLACE FUNCTION public.admin_create_teacher_account(
  p_email text,
  p_full_name text,
  p_position text DEFAULT NULL,
  p_qualification text DEFAULT NULL,
  p_bio text DEFAULT NULL,
  p_photo_url text DEFAULT NULL,
  p_status text DEFAULT 'active',
  p_subjects text[] DEFAULT ARRAY[]::text[],
  p_class_sections text[] DEFAULT ARRAY[]::text[]
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_role text;
  v_user_id uuid;
  v_subject_name text;
  v_subject_id uuid;
BEGIN
  SELECT role INTO caller_role
  FROM public.profiles
  WHERE id = auth.uid();

  IF caller_role NOT IN ('super_admin', 'admin') THEN
    RAISE EXCEPTION 'Permission denied' USING ERRCODE = '42501';
  END IF;

  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email
  LIMIT 1;

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role,
      email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      is_super_admin, is_sso_user, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      p_email,
      '',
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', p_full_name, 'role', 'teacher'),
      false,
      false,
      now(),
      now()
    );
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, role, status, bio, position, qualification, photo_url
  ) VALUES (
    v_user_id, p_email, p_full_name, 'teacher', COALESCE(NULLIF(p_status, ''), 'active'),
    p_bio, p_position, p_qualification, p_photo_url
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = 'teacher',
    status = EXCLUDED.status,
    bio = EXCLUDED.bio,
    position = EXCLUDED.position,
    qualification = EXCLUDED.qualification,
    photo_url = EXCLUDED.photo_url,
    updated_at = now();

  DELETE FROM public.teacher_subjects WHERE teacher_id = v_user_id;
  FOREACH v_subject_name IN ARRAY COALESCE(p_subjects, ARRAY[]::text[]) LOOP
    v_subject_name := NULLIF(trim(v_subject_name), '');
    IF v_subject_name IS NOT NULL THEN
      INSERT INTO public.subjects (name)
      VALUES (v_subject_name)
      ON CONFLICT (name) DO UPDATE SET updated_at = now()
      RETURNING id INTO v_subject_id;

      IF v_subject_id IS NULL THEN
        SELECT id INTO v_subject_id FROM public.subjects WHERE name = v_subject_name LIMIT 1;
      END IF;

      INSERT INTO public.teacher_subjects (teacher_id, subject_id)
      VALUES (v_user_id, v_subject_id)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;

  DELETE FROM public.teacher_class_assignments WHERE teacher_id = v_user_id;
  INSERT INTO public.teacher_class_assignments (teacher_id, class_section)
  SELECT v_user_id, trim(value)
  FROM unnest(COALESCE(p_class_sections, ARRAY[]::text[])) AS value
  WHERE trim(value) <> ''
  ON CONFLICT DO NOTHING;

  RETURN jsonb_build_object(
    'user_id', v_user_id,
    'email', p_email,
    'account_created', true
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_create_teacher_account(text, text, text, text, text, text, text, text[], text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_create_teacher_account(text, text, text, text, text, text, text, text[], text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.admin_create_teacher_account(text, text, text, text, text, text, text, text[], text[]) TO authenticated;
