CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, country, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Buddha Academy Donor'),
    COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      WHEN NEW.raw_user_meta_data->>'role' = 'super_admin' THEN 'super_admin'
      ELSE 'donor'
    END,
    'active'
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    country = EXCLUDED.country,
    role = EXCLUDED.role,
    status = 'active',
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
DELETE FROM auth.identities WHERE user_id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM auth.users WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
DELETE FROM public.profiles WHERE id IN (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000002'
);
