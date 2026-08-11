

ALTER TABLE public.section_content 
ADD COLUMN IF NOT EXISTS description_ne TEXT;

CREATE INDEX IF NOT EXISTS idx_section_content_description_ne ON public.section_content(description_ne);
