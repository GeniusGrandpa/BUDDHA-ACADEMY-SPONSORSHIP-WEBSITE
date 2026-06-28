ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_code TEXT DEFAULT '+1';

UPDATE public.profiles SET phone_code = '+1' WHERE phone_code IS NULL;
