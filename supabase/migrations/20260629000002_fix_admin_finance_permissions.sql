DO $$
BEGIN
  PERFORM public.assign_role_permissions('admin', ARRAY[
    'finances.read'
  ]);
END $$;