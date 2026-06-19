DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'gallery_items' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.gallery_items ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'media_library' AND column_name = 'is_published'
  ) THEN
    ALTER TABLE public.media_library ADD COLUMN is_published BOOLEAN DEFAULT true;
  END IF;
END $$;