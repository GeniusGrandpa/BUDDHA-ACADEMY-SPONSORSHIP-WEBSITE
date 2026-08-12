
DROP FUNCTION IF EXISTS public.admin_create_teacher_account(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text[],
  text[]
);

-- Remove teacher-specific subject policy.
DROP POLICY IF EXISTS subjects_read_teacher ON public.subjects;

-- Remove the old general subject policy if it already exists,
-- so the replacement can be created safely.
DROP POLICY IF EXISTS subjects_read_all ON public.subjects;

-- Only admins/super admins can read subjects.
CREATE POLICY subjects_read_all
ON public.subjects
FOR SELECT
TO authenticated
USING (
  public.get_my_role() IN ('super_admin', 'admin')
);

