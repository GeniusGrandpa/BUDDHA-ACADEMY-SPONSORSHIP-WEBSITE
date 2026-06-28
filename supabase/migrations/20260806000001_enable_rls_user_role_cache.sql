-- user_role_cache was created with RLS disabled to break the profiles->RLS
-- recursion cycle. However, this means any role with SELECT (anon, authenticated)
-- can see EVERY user's role data.
--
-- Every consumer queries with WHERE id = auth.uid() — only the current user's
-- own row. Enable RLS with that same condition so it's still fully functional
-- but blocks bulk reads.

ALTER TABLE public.user_role_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "read_own_role"
  ON public.user_role_cache FOR SELECT
  USING (id = auth.uid());
