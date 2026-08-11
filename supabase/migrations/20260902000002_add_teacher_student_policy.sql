DROP POLICY IF EXISTS "students_select_teacher" ON public.students;
CREATE POLICY "students_select_teacher"
  ON students FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.teacher_assignments
      WHERE teacher_assignments.teacher_id = auth.uid()
      AND teacher_assignments.student_id = students.id
    )
    OR public.get_user_role_level() >= 60
  );
