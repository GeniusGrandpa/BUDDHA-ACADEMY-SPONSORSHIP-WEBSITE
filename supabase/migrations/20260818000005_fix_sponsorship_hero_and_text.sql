UPDATE public.cms_strings
SET value = 'When you sponsor a child, you are not just providing financial support you are giving them hope, opportunity, and a chance to break the cycle of poverty.'
WHERE key = 'sponsorship_impact_desc1';

UPDATE public.cms_strings
SET value = 'Sponsor a Child''s Education'
WHERE key = 'sponsor_hero_title';

UPDATE public.cms_strings
SET value = 'For just NPR 5,000 per month, you can transform a child''s life through the power of education at Buddha Academy in Kathmandu.'
WHERE key = 'sponsor_hero_subtitle';

UPDATE public.sponsorship_content
SET hero_title = 'Sponsor a Child''s Education',
    hero_subtitle = 'For just NPR 5,000 per month, you can transform a child''s life through the power of education at Buddha Academy in Kathmandu.',
    updated_at = now()
WHERE is_published = true;
