-- Fix RLS infinite recursion on profiles table
-- Root cause: profiles_select_all_admin policy calls get_my_role() (SECURITY INVOKER)
-- which queries profiles, triggering RLS -> same policy -> infinite loop
-- Fix: use a dedicated user_role_cache table (RLS disabled) as non-recursive side-channel

-- 1. Create a cache table for user roles (RLS disabled to avoid recursion)
CREATE TABLE IF NOT EXISTS public.user_role_cache (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'donor',
  role_level INTEGER NOT NULL DEFAULT 40,
  status TEXT NOT NULL DEFAULT 'active',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_role_cache DISABLE ROW LEVEL SECURITY;

GRANT SELECT ON public.user_role_cache TO authenticated, anon;

-- 2. Create a helper function to compute role level (used by the sync trigger)
CREATE OR REPLACE FUNCTION public.compute_role_level(p_role TEXT)
RETURNS INTEGER
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE p_role
    WHEN 'super_admin' THEN 100
    WHEN 'admin' THEN 90
    WHEN 'finance_manager' THEN 80
    WHEN 'teacher' THEN 60
    WHEN 'donor' THEN 40
    WHEN 'volunteer' THEN 30
    WHEN 'public_user' THEN 10
    ELSE 0
  END;
$$;

-- 3. Create a trigger to sync profiles -> user_role_cache
CREATE OR REPLACE FUNCTION public.sync_user_role_cache()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_role_cache (id, role, role_level, status, updated_at)
  VALUES (
    NEW.id,
    NEW.role,
    public.compute_role_level(NEW.role),
    NEW.status,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    role_level = EXCLUDED.role_level,
    status = EXCLUDED.status,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_role_cache ON public.profiles;
CREATE TRIGGER trg_sync_user_role_cache
  AFTER INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_cache();

-- 4. Populate existing profiles into the cache
INSERT INTO public.user_role_cache (id, role, role_level, status, updated_at)
SELECT id, role, public.compute_role_level(role), status, updated_at
FROM public.profiles
ON CONFLICT (id) DO NOTHING;

-- 5. Drop ALL policies on profiles that cause or could cause recursion
DROP POLICY IF EXISTS "profiles_select_all_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_staff" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_super_admin" ON public.profiles;

-- 6. Recreate policies using user_role_cache (no RLS -> no recursion)

-- Own profile: always visible to the user
CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff (role_level >= 60) can see all profiles (via cache, no recursion)
CREATE POLICY "profiles_read_staff"
  ON public.profiles FOR SELECT
  USING (
    COALESCE(
      (SELECT role_level >= 60 FROM public.user_role_cache WHERE id = auth.uid()),
      false
    )
  );

-- Admin/super_admin can also see all profiles (backward compat)
CREATE POLICY "profiles_select_all_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    COALESCE(
      (SELECT role IN ('super_admin', 'admin') FROM public.user_role_cache WHERE id = auth.uid()),
      false
    )
    OR id = auth.uid()
  );

-- Users can update their own profile but cannot change role or status
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role IS NOT DISTINCT FROM (
      SELECT role FROM public.user_role_cache WHERE id = auth.uid()
    )
    AND status IS NOT DISTINCT FROM (
      SELECT status FROM public.user_role_cache WHERE id = auth.uid()
    )
  );

-- Admins (role_level >= 90) can update any profile
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    COALESCE(
      (SELECT role_level >= 90 FROM public.user_role_cache WHERE id = auth.uid()),
      false
    )
  )
  WITH CHECK (
    COALESCE(
      (SELECT role_level >= 90 FROM public.user_role_cache WHERE id = auth.uid()),
      false
    )
  );

-- Only super_admin can delete profiles
CREATE POLICY "profiles_delete_super_admin"
  ON public.profiles FOR DELETE
  USING (
    COALESCE(
      (SELECT role = 'super_admin' FROM public.user_role_cache WHERE id = auth.uid()),
      false
    )
  );

-- 7. Also fix SECURITY INVOKER functions that query profiles:
--    Change them to query user_role_cache instead to prevent future recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_role_cache WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT role FROM public.user_role_cache WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_user_status()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT status FROM public.user_role_cache WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_role_cache WHERE id = auth.uid() AND status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_role(role_name text)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_role_cache WHERE id = auth.uid() AND role = role_name AND status = 'active');
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_role_cache
    WHERE id = auth.uid()
    AND role IN ('admin', 'super_admin')
    AND status = 'active'
  );
END;
$$;

-- 8. Make get_user_role_level also query the cache for consistency,
--    though it was already SECURITY DEFINER and shouldn't recurse
CREATE OR REPLACE FUNCTION public.get_user_role_level()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
BEGIN
  SELECT role INTO v_role FROM public.user_role_cache WHERE id = auth.uid();
  RETURN public.compute_role_level(v_role);
END;
$$;

-- 9. Grant execute on updated functions
GRANT EXECUTE ON FUNCTION public.get_my_role TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_active_user TO authenticated;
GRANT EXECUTE ON FUNCTION public.current_user_has_role TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_super_admin TO authenticated;
