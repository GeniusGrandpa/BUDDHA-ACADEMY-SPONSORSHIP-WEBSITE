DROP POLICY IF EXISTS "donations_select_staff" ON donations;

CREATE POLICY "donations_select_staff"
  ON donations FOR SELECT
  TO authenticated
  USING (get_user_role_level() >= 80);

DROP POLICY IF EXISTS "payment_sessions_donor_select" ON payment_sessions;

CREATE POLICY "payment_sessions_donor_select"
  ON payment_sessions FOR SELECT
  TO authenticated
  USING (donor_id = auth.uid());

DROP POLICY IF EXISTS "activities_select_staff" ON activities;
DROP POLICY IF EXISTS "activities_insert_admin" ON activities;
DROP POLICY IF EXISTS "public_view_activities" ON activities;
DROP POLICY IF EXISTS "users_view_own_activities" ON activities;

CREATE POLICY "activities_select_public"
  ON activities FOR SELECT
  TO authenticated, anon
  USING (is_public = true);

CREATE POLICY "activities_select_own"
  ON activities FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "activities_select_staff"
  ON activities FOR SELECT
  TO authenticated
  USING (get_user_role_level() >= 60);

CREATE POLICY "activities_insert_admin"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (get_user_role_level() >= 90);

DROP POLICY IF EXISTS "user_sessions_read_all" ON public.user_sessions;

CREATE POLICY "user_sessions_read_all"
  ON public.user_sessions FOR SELECT
  TO authenticated
  USING (get_user_role_level() >= 60);

GRANT SELECT ON public.activities TO authenticated;
GRANT SELECT ON public.user_sessions TO authenticated;
GRANT SELECT ON public.donations TO authenticated;