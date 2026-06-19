GRANT INSERT, UPDATE, DELETE ON public.testimonials TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;

DROP POLICY IF EXISTS testimonials_read ON public.testimonials;
DROP POLICY IF EXISTS testimonials_read ON testimonials;
CREATE POLICY testimonials_read ON public.testimonials FOR SELECT
  TO authenticated
  USING (is_published = true OR public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS testimonials_update ON public.testimonials;
DROP POLICY IF EXISTS testimonials_update ON testimonials;
CREATE POLICY testimonials_update ON public.testimonials FOR UPDATE
  TO authenticated
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS testimonials_insert ON public.testimonials;
DROP POLICY IF EXISTS testimonials_insert ON testimonials;
CREATE POLICY testimonials_insert ON public.testimonials FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role_level() >= 90);

DROP POLICY IF EXISTS testimonials_delete ON public.testimonials;
DROP POLICY IF EXISTS testimonials_delete ON testimonials;
CREATE POLICY testimonials_delete ON public.testimonials FOR DELETE
  TO authenticated
  USING (public.get_user_role_level() >= 90);