ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.increment_event_volunteers(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.volunteer_event_signups
    WHERE event_id = p_event_id AND volunteer_id = auth.uid()
  ) AND NOT public.is_admin_or_super_admin() THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  UPDATE public.volunteer_events
  SET current_volunteers = LEAST(current_volunteers + 1, max_volunteers)
  WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.decrement_event_volunteers(p_event_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.volunteer_events
  SET current_volunteers = GREATEST(current_volunteers - 1, 0)
  WHERE id = p_event_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reset_design_settings()
RETURNS public.design_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row_id UUID;
  v_row public.design_settings;
BEGIN
  IF NOT public.is_admin_or_super_admin() THEN
    RAISE EXCEPTION 'Permission denied';
  END IF;

  SELECT id INTO v_row_id
  FROM public.design_settings
  WHERE is_published = true
  LIMIT 1;

  IF v_row_id IS NULL THEN
    SELECT id INTO v_row_id
    FROM public.design_settings
    LIMIT 1;
  END IF;

  IF v_row_id IS NULL THEN
    INSERT INTO public.design_settings (
      branding, colors, typography, layout, component_styles, tokens, config,
      is_published, published_at, updated_by
    ) VALUES (
      '{"organization_name":"Buddha Academy","tagline":"Boudha · Kathmandu","slogan":"Empowering Through Education","logo_url":"/src/assets/logo.jpg","secondary_logo_url":null,"favicon_url":null,"footer_branding":"Buddha Academy","email_branding":"Buddha Academy"}'::jsonb,
      '{"primary":"#f26b1d","primary_light":"#fcb375","primary_dark":"#b53f14","secondary":"#c49a4e","secondary_light":"#e3cc8e","secondary_dark":"#a37d3f","accent":"#f59e0b","background":"#fdfbf7","surface":"#ffffff","surface_hover":"#faf6ee","card":"#ffffff","card_hover":"#faf6ee","navbar_bg":"#ffffff","navbar_text":"#374151","navbar_active":"#d97706","navbar_hover":"#d97706","footer_bg":"#f9fafb","footer_text":"#6b7280","footer_heading":"#111827","sidebar_bg":"#fdfbf7","sidebar_text":"#6b7280","sidebar_active_bg":"#fff5ed","sidebar_active_text":"#ea580c","button_primary_bg":"#f26b1d","button_primary_text":"#ffffff","button_primary_hover":"#d95317","button_secondary_bg":"#c49a4e","button_secondary_text":"#ffffff","button_secondary_hover":"#a37d3f","button_outline_border":"#f26b1d","button_outline_text":"#f26b1d","button_outline_hover":"#fff5ed","text_primary":"#111827","text_secondary":"#4b5563","text_muted":"#9ca3af","text_on_primary":"#ffffff","text_on_secondary":"#ffffff","border":"#e5e7eb","border_light":"#f3f4f6","border_accent":"#fcd34d","divider":"#e5e7eb","success":"#10b981","success_light":"#d1fae5","warning":"#f59e0b","warning_light":"#fef3c7","error":"#ef4444","error_light":"#fee2e2","info":"#3b82f6","info_light":"#dbeafe","hero_overlay":"#000000","hero_overlay_opacity":"0.4"}'::jsonb,
      '{"heading_font":"Inter","body_font":"Inter","heading_font_url":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap","body_font_url":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap","base_size":"16","scale_ratio":"1.25","h1_size":"2.986","h2_size":"2.488","h3_size":"2.074","h4_size":"1.728","h5_size":"1.44","h6_size":"1.2","body_size":"1","small_size":"0.833","heading_weight":"700","body_weight":"400","heading_letter_spacing":"-0.025","body_letter_spacing":"0","heading_line_height":"1.2","body_line_height":"1.6","text_transform_heading":"none","text_transform_body":"none"}'::jsonb,
      '{"container_width":"1280","container_padding_x":"16","section_spacing_y":"16","section_spacing_x":"16","border_radius_sm":"0.375","border_radius_md":"0.5","border_radius_lg":"0.75","border_radius_xl":"1","border_radius_2xl":"1.5","border_radius_full":"9999","shadow_sm":"0 1px 2px 0 rgb(0 0 0 / 0.05)","shadow_md":"0 4px 6px -1px rgb(0 0 0 / 0.1)","shadow_lg":"0 10px 15px -3px rgb(0 0 0 / 0.1)","shadow_xl":"0 20px 25px -5px rgb(0 0 0 / 0.1)","card_style":"default","button_style":"rounded","navbar_layout":"default","footer_layout":"default","sidebar_behavior":"fixed","animation_enabled":true,"animation_duration":"0.3","hover_effects":true,"website_max_width":"100"}'::jsonb,
      '{"hero_default_style":"gradient","hero_default_bg":"linear-gradient(135deg, #f26b1d, #fcb375)","hero_default_overlay":true,"card_default_style":"elevated","card_default_border_radius":"0.75","cta_default_style":"gradient","banner_default_style":"default","testimonial_layout":"grid","student_spotlight_layout":"grid","donation_section_theme":"warm"}'::jsonb,
      '{"spacing_unit":"4","transition_duration":"300","transition_timing":"ease-in-out","z_index_dropdown":"50","z_index_sticky":"100","z_index_modal_backdrop":"200","z_index_modal":"300","z_index_popover":"400","z_index_tooltip":"500","z_index_toast":"600","breakpoint_sm":"640","breakpoint_md":"768","breakpoint_lg":"1024","breakpoint_xl":"1280","breakpoint_2xl":"1536"}'::jsonb,
      '{"homepage_layout":"default","featured_sections":["hero","stats","about","students","testimonials","news","cta","footer"],"announcement_bar_enabled":false,"announcement_bar_text":"","announcement_bar_type":"info","cta_placement":"bottom","donation_campaign_theme":"default","seasonal_theme_enabled":false,"seasonal_theme_name":"","dynamic_banners_enabled":true}'::jsonb,
      true,
      now(),
      auth.uid()
    )
    RETURNING id INTO v_row_id;
  ELSE
    UPDATE public.design_settings
    SET branding = '{"organization_name":"Buddha Academy","tagline":"Boudha · Kathmandu","slogan":"Empowering Through Education","logo_url":"/src/assets/logo.jpg","secondary_logo_url":null,"favicon_url":null,"footer_branding":"Buddha Academy","email_branding":"Buddha Academy"}'::jsonb,
        colors = '{"primary":"#f26b1d","primary_light":"#fcb375","primary_dark":"#b53f14","secondary":"#c49a4e","secondary_light":"#e3cc8e","secondary_dark":"#a37d3f","accent":"#f59e0b","background":"#fdfbf7","surface":"#ffffff","surface_hover":"#faf6ee","card":"#ffffff","card_hover":"#faf6ee","navbar_bg":"#ffffff","navbar_text":"#374151","navbar_active":"#d97706","navbar_hover":"#d97706","footer_bg":"#f9fafb","footer_text":"#6b7280","footer_heading":"#111827","sidebar_bg":"#fdfbf7","sidebar_text":"#6b7280","sidebar_active_bg":"#fff5ed","sidebar_active_text":"#ea580c","button_primary_bg":"#f26b1d","button_primary_text":"#ffffff","button_primary_hover":"#d95317","button_secondary_bg":"#c49a4e","button_secondary_text":"#ffffff","button_secondary_hover":"#a37d3f","button_outline_border":"#f26b1d","button_outline_text":"#f26b1d","button_outline_hover":"#fff5ed","text_primary":"#111827","text_secondary":"#4b5563","text_muted":"#9ca3af","text_on_primary":"#ffffff","text_on_secondary":"#ffffff","border":"#e5e7eb","border_light":"#f3f4f6","border_accent":"#fcd34d","divider":"#e5e7eb","success":"#10b981","success_light":"#d1fae5","warning":"#f59e0b","warning_light":"#fef3c7","error":"#ef4444","error_light":"#fee2e2","info":"#3b82f6","info_light":"#dbeafe","hero_overlay":"#000000","hero_overlay_opacity":"0.4"}'::jsonb,
        typography = '{"heading_font":"Inter","body_font":"Inter","heading_font_url":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap","body_font_url":"https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap","base_size":"16","scale_ratio":"1.25","h1_size":"2.986","h2_size":"2.488","h3_size":"2.074","h4_size":"1.728","h5_size":"1.44","h6_size":"1.2","body_size":"1","small_size":"0.833","heading_weight":"700","body_weight":"400","heading_letter_spacing":"-0.025","body_letter_spacing":"0","heading_line_height":"1.2","body_line_height":"1.6","text_transform_heading":"none","text_transform_body":"none"}'::jsonb,
        layout = '{"container_width":"1280","container_padding_x":"16","section_spacing_y":"16","section_spacing_x":"16","border_radius_sm":"0.375","border_radius_md":"0.5","border_radius_lg":"0.75","border_radius_xl":"1","border_radius_2xl":"1.5","border_radius_full":"9999","shadow_sm":"0 1px 2px 0 rgb(0 0 0 / 0.05)","shadow_md":"0 4px 6px -1px rgb(0 0 0 / 0.1)","shadow_lg":"0 10px 15px -3px rgb(0 0 0 / 0.1)","shadow_xl":"0 20px 25px -5px rgb(0 0 0 / 0.1)","card_style":"default","button_style":"rounded","navbar_layout":"default","footer_layout":"default","sidebar_behavior":"fixed","animation_enabled":true,"animation_duration":"0.3","hover_effects":true,"website_max_width":"100"}'::jsonb,
        component_styles = '{"hero_default_style":"gradient","hero_default_bg":"linear-gradient(135deg, #f26b1d, #fcb375)","hero_default_overlay":true,"card_default_style":"elevated","card_default_border_radius":"0.75","cta_default_style":"gradient","banner_default_style":"default","testimonial_layout":"grid","student_spotlight_layout":"grid","donation_section_theme":"warm"}'::jsonb,
        tokens = '{"spacing_unit":"4","transition_duration":"300","transition_timing":"ease-in-out","z_index_dropdown":"50","z_index_sticky":"100","z_index_modal_backdrop":"200","z_index_modal":"300","z_index_popover":"400","z_index_tooltip":"500","z_index_toast":"600","breakpoint_sm":"640","breakpoint_md":"768","breakpoint_lg":"1024","breakpoint_xl":"1280","breakpoint_2xl":"1536"}'::jsonb,
        config = '{"homepage_layout":"default","featured_sections":["hero","stats","about","students","testimonials","news","cta","footer"],"announcement_bar_enabled":false,"announcement_bar_text":"","announcement_bar_type":"info","cta_placement":"bottom","donation_campaign_theme":"default","seasonal_theme_enabled":false,"seasonal_theme_name":"","dynamic_banners_enabled":true}'::jsonb,
        draft = NULL,
        is_published = true,
        published_at = now(),
        updated_by = auth.uid()
    WHERE id = v_row_id;
  END IF;

  SELECT * INTO v_row
  FROM public.design_settings
  WHERE id = v_row_id;

  RETURN v_row;
END;
$$;
