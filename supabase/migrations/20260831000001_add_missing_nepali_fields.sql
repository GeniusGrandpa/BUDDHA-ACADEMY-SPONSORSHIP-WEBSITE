
ALTER TABLE public.page_headers 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ne TEXT;

ALTER TABLE public.section_content 
ADD COLUMN IF NOT EXISTS title_ne TEXT,
ADD COLUMN IF NOT EXISTS subtitle_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne JSONB DEFAULT '{}'::jsonb;


ALTER TABLE public.footer_content 
ADD COLUMN IF NOT EXISTS description_ne TEXT,
ADD COLUMN IF NOT EXISTS copyright_text_ne TEXT,
ADD COLUMN IF NOT EXISTS nonprofit_text_ne TEXT,
ADD COLUMN IF NOT EXISTS quick_links_ne JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS contact_info_ne JSONB DEFAULT '{}'::jsonb;


ALTER TABLE public.seo_content 
ADD COLUMN IF NOT EXISTS meta_title_ne TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ne TEXT;


ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS primary_color_ne TEXT,
ADD COLUMN IF NOT EXISTS secondary_color_ne TEXT,
ADD COLUMN IF NOT EXISTS accent_color_ne TEXT;

ALTER TABLE public.site_images 
ADD COLUMN IF NOT EXISTS alt_text_ne TEXT;

ALTER TABLE public.legal_pages 
ADD COLUMN IF NOT EXISTS meta_title_ne TEXT,
ADD COLUMN IF NOT EXISTS meta_description_ne TEXT;

ALTER TABLE public.legal_page_sections 
ADD COLUMN IF NOT EXISTS heading_ne TEXT,
ADD COLUMN IF NOT EXISTS content_ne TEXT;

CREATE INDEX IF NOT EXISTS idx_page_headers_title_ne ON public.page_headers(title_ne);
CREATE INDEX IF NOT EXISTS idx_section_content_title_ne ON public.section_content(title_ne);
CREATE INDEX IF NOT EXISTS idx_footer_content_description_ne ON public.footer_content(description_ne);
