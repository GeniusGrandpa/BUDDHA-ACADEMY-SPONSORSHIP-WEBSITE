DELETE FROM public.donation_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_published DESC, created_at DESC) AS rn
    FROM public.donation_content
  ) ranked WHERE rn = 1
);

DELETE FROM public.sponsorship_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_published DESC, created_at DESC) AS rn
    FROM public.sponsorship_content
  ) ranked WHERE rn = 1
);

DELETE FROM public.volunteer_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_published DESC, created_at DESC) AS rn
    FROM public.volunteer_content
  ) ranked WHERE rn = 1
);

DELETE FROM public.transparency_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_published DESC, created_at DESC) AS rn
    FROM public.transparency_content
  ) ranked WHERE rn = 1
);

DELETE FROM public.hero_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_visible DESC, created_at DESC) AS rn
    FROM public.hero_content
  ) ranked WHERE rn = 1
);

DELETE FROM public.footer_content
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, row_number() OVER (ORDER BY is_published DESC, created_at DESC) AS rn
    FROM public.footer_content
  ) ranked WHERE rn = 1
);
