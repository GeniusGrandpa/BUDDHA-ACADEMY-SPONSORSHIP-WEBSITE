DO $$
DECLARE
  v_teacher_id uuid;
  v_student_id uuid;
  v_student_count integer := 0;
BEGIN
  SELECT id INTO v_teacher_id
  FROM public.profiles
  WHERE role = 'teacher' AND status = 'active'
  LIMIT 1;

  IF v_teacher_id IS NULL THEN
    RAISE NOTICE 'No teacher found with active status. Skipping teacher assignments seed.';
    RETURN;
  END IF;

  RAISE NOTICE 'Found teacher: %', v_teacher_id;

  FOR v_student_id IN
    SELECT id FROM public.students
  LOOP
    v_student_count := v_student_count + 1;

    INSERT INTO public.teacher_assignments (teacher_id, student_id, subject)
    VALUES
      (v_teacher_id, v_student_id, 'Math'),
      (v_teacher_id, v_student_id, 'English'),
      (v_teacher_id, v_student_id, 'Science')
    ON CONFLICT (teacher_id, student_id, subject) DO NOTHING;

    INSERT INTO public.student_progress (student_id, teacher_id, subject, grade, notes, achievement, recorded_at)
    VALUES
      (v_student_id, v_teacher_id, 'Math', '85%', 'Good improvement in algebra', 'Completed all homework assignments', NOW() - INTERVAL '1 week'),
      (v_student_id, v_teacher_id, 'English', '78%', 'Needs improvement in writing', 'Participated in debate competition', NOW() - INTERVAL '2 weeks'),
      (v_student_id, v_teacher_id, 'Science', '92%', 'Excellent performance', 'Won science fair project', NOW() - INTERVAL '3 days')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.attendance_records (student_id, teacher_id, date, status, notes)
    SELECT
      v_student_id,
      v_teacher_id,
      CURRENT_DATE - (n || ' days')::interval,
      CASE
        WHEN n % 7 = 0 THEN 'absent'
        WHEN n % 5 = 0 THEN 'late'
        ELSE 'present'
      END,
      CASE
        WHEN n % 7 = 0 THEN 'Sick leave'
        WHEN n % 5 = 0 THEN 'Traffic delay'
        ELSE NULL
      END
    FROM generate_series(0, 19) AS n
    ON CONFLICT (student_id, date) DO NOTHING;

    RAISE NOTICE 'Created assignments and progress for student %', v_student_id;
  END LOOP;

  RAISE NOTICE 'Created assignments for % students', v_student_count;
END $$;