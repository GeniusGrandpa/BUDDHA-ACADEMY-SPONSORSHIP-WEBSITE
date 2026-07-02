ALTER TABLE public.user_role_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_role"
  ON public.user_role_cache FOR SELECT
  USING (id = auth.uid());
