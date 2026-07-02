DO $$
DECLARE
  v_page_id UUID;
BEGIN
  SELECT id INTO v_page_id FROM public.website_pages WHERE slug = 'home' LIMIT 1;
  IF v_page_id IS NULL THEN
    INSERT INTO public.website_pages (slug, title, status, meta_title, meta_description)
    VALUES ('home', 'Home', 'published', 'Home - Buddha Academy', 'Welcome to Buddha Academy')
    RETURNING id INTO v_page_id;
  END IF;

  UPDATE public.website_pages SET status = 'published' WHERE id = v_page_id;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, subtitle, description, content, settings, sort_order, is_visible)
  VALUES (
    v_page_id,
    'hero',
    'hero',
    'Empowering Nepal''s Future',
    'One Child at a Time',
    'Buddha Academy provides free education, meals, and healthcare to underprivileged children in Kathmandu, Nepal.',
    jsonb_build_object(
      'highlight',        'One Child at a Time',
      'background_image', 'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg',
      'layout',           'left',
      'cta_primary',      jsonb_build_object('text', 'Sponsor a Child', 'link', '/students'),
      'cta_secondary',    jsonb_build_object('text', 'Donate Now',      'link', '/donate'),
      'statistics', jsonb_build_array(
        jsonb_build_object('value', 'Since 1977', 'label', 'Trusted Service'),
        jsonb_build_object('value', '49+',        'label', 'Years of Service'),
        jsonb_build_object('value', '100%',       'label', 'Free Education'),
        jsonb_build_object('value', '2000+',      'label', 'Children Supported')
      ),
      'badges', jsonb_build_array()
    ),
    jsonb_build_object(
      'background_image',  'https://www.holistiquelearning.com/blog/wp-content/uploads/2020/01/Morning_assembly1.jpg',
      'overlay_color',     '#000000',
      'overlay_opacity',   0.5
    ),
    1,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    subtitle    = EXCLUDED.subtitle,
    description = EXCLUDED.description,
    content     = EXCLUDED.content,
    settings    = EXCLUDED.settings,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'stats',
    'stats',
    'Our Impact in Numbers',
    '',
    jsonb_build_object(
      'statistics', jsonb_build_array(
        jsonb_build_object('value', 'Since 1977', 'label', 'Trusted Service'),
        jsonb_build_object('value', '49+',        'label', 'Years of Service'),
        jsonb_build_object('value', '100%',       'label', 'Free Education'),
        jsonb_build_object('value', '2000+',      'label', 'Children Supported')
      )
    ),
    2,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title      = EXCLUDED.title,
    content    = EXCLUDED.content,
    sort_order = EXCLUDED.sort_order,
    is_visible = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'welcome',
    'welcome',
    'Welcome to Buddha Academy',
    'Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal. We believe every child deserves the opportunity to learn, grow, and build a better future.',
    jsonb_build_object(
      'content', 'Since 1977, Buddha Academy has provided free, quality education to underprivileged children in Kathmandu, Nepal. We believe every child deserves the opportunity to learn, grow, and build a better future.'
    ),
    3,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    content     = EXCLUDED.content,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'about_preview',
    'about_preview',
    'About Buddha Academy',
    'Founded in 1977, Buddha Academy is a nonprofit boarding school in Kathmandu, Nepal, dedicated to providing free education to underprivileged children.',
    jsonb_build_object(
      'milestones', jsonb_build_array(
        jsonb_build_object('year', '1977',  'event', 'Founded with 12 students'),
        jsonb_build_object('year', '1990s', 'event', 'Hostel expansion program'),
        jsonb_build_object('year', '2010s', 'event', 'Computer lab established'),
        jsonb_build_object('year', 'Today', 'event', 'Educating hundreds annually')
      )
    ),
    4,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    content     = EXCLUDED.content,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'featured_students',
    'featured_students',
    'Children Waiting for Sponsors',
    'Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.',
    '{}',
    5,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'sponsorship_steps',
    'sponsorship_steps',
    'How Sponsorship Works',
    'Your journey to changing a child''s life starts here.',
    jsonb_build_object(
      'steps', jsonb_build_array(
        jsonb_build_object('title', 'Browse Profiles',  'desc', 'Review children waiting for sponsors'),
        jsonb_build_object('title', 'Choose a Child',   'desc', 'Select a student to sponsor'),
        jsonb_build_object('title', 'Make Your Pledge', 'desc', 'Complete donation form securely'),
        jsonb_build_object('title', 'We Connect',       'desc', 'Link you with your sponsored child'),
        jsonb_build_object('title', 'Receive Updates',  'desc', 'Get progress reports and photos'),
        jsonb_build_object('title', 'Build Connection', 'desc', 'Exchange letters and messages'),
        jsonb_build_object('title', 'Track Impact',     'desc', 'See your contribution at work'),
        jsonb_build_object('title', 'Join Community',   'desc', 'Connect with other sponsors')
      )
    ),
    6,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    content     = EXCLUDED.content,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'testimonials',
    'testimonials',
    'What Our Supporters Say',
    '',
    '{}',
    7,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title      = EXCLUDED.title,
    sort_order = EXCLUDED.sort_order,
    is_visible = true;

  INSERT INTO public.website_sections (page_id, section_key, section_type, title, description, content, sort_order, is_visible)
  VALUES (
    v_page_id,
    'donation_cta',
    'donation_cta',
    'Make a Difference Today',
    'Every contribution brings hope and opportunity to a child in Nepal.',
    jsonb_build_object(
      'button_text', 'Donate Now',
      'button_link', '/donate'
    ),
    8,
    true
  )
  ON CONFLICT (page_id, section_key) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    content     = EXCLUDED.content,
    sort_order  = EXCLUDED.sort_order,
    is_visible  = true;

END $$;

GRANT SELECT ON public.website_pages TO anon, authenticated;
GRANT SELECT ON public.website_sections TO anon, authenticated;
GRANT SELECT ON public.website_content_blocks TO anon, authenticated;
