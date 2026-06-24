CREATE TABLE IF NOT EXISTS public.cms_strings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  page_slug TEXT,
  category TEXT DEFAULT 'general',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_cms_strings_key ON public.cms_strings(key);
CREATE INDEX IF NOT EXISTS idx_cms_strings_page ON public.cms_strings(page_slug);
CREATE INDEX IF NOT EXISTS idx_cms_strings_category ON public.cms_strings(category);

ALTER TABLE public.cms_strings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cms_strings_select_public"
  ON cms_strings FOR SELECT
  USING (is_published = true);

CREATE POLICY "cms_strings_select_staff"
  ON cms_strings FOR SELECT
  USING (public.get_user_role_level() >= 60);

CREATE POLICY "cms_strings_insert_admin"
  ON cms_strings FOR INSERT
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "cms_strings_update_admin"
  ON cms_strings FOR UPDATE
  USING (public.get_user_role_level() >= 90)
  WITH CHECK (public.get_user_role_level() >= 90);

CREATE POLICY "cms_strings_delete_admin"
  ON cms_strings FOR DELETE
  USING (public.get_user_role_level() >= 90);

GRANT SELECT ON public.cms_strings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cms_strings TO authenticated;

CREATE OR REPLACE FUNCTION public.get_all_cms_strings()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_object_agg(key, value), '{}'::jsonb)
  INTO result
  FROM cms_strings
  WHERE is_published = true;
  RETURN result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_all_cms_strings() TO anon, authenticated;

INSERT INTO public.cms_strings (key, value, page_slug, category) VALUES
  ('home_loading', 'Loading...', 'home', 'ui_state'),
  ('home_students_heading', 'Children Waiting for Sponsors', 'home', 'section_heading'),
  ('home_students_description', 'Meet some of the children currently waiting for sponsorship. Your support can change their lives forever.', 'home', 'section_description'),
  ('home_age_label', 'Age: {age}', 'home', 'label'),
  ('home_grade_label', 'Grade: {grade}', 'home', 'label'),
  ('home_view_profile', 'View Profile', 'home', 'button'),
  ('home_view_all_profiles', 'View all student profiles', 'home', 'button'),
  ('home_learn_more', 'Learn More About Us', 'home', 'button'),
  ('home_sponsored_by', 'Sponsored by {name}', 'home', 'label'),
  ('about_mission_heading', 'Our Mission', 'about', 'section_heading'),
  ('about_values_heading', 'Our Core Values', 'about', 'section_heading'),
  ('about_values_description', 'These principles guide everything we do at Buddha Academy.', 'about', 'section_description'),
  ('about_journey_heading', 'Our Journey', 'about', 'section_heading'),
  ('about_journey_description', 'From humble beginnings to a beacon of hope for hundreds of children.', 'about', 'section_description'),
  ('about_cta_heading', 'Join Our Mission', 'about', 'section_heading'),
  ('about_cta_description', 'Your support helps us continue providing free education and care to underprivileged children. Together, we can change lives.', 'about', 'section_description'),
  ('about_sponsor_button', 'Sponsor a Child', 'about', 'button'),
  ('about_donate_button', 'Make a Donation', 'about', 'button'),
  ('contact_form_title', 'Get in Touch', 'contact', 'section_heading'),
  ('contact_address_label', 'Address', 'contact', 'label'),
  ('contact_phone_label', 'Phone', 'contact', 'label'),
  ('contact_email_label', 'Email', 'contact', 'label'),
  ('contact_send_message_heading', 'Send a Message', 'contact', 'section_heading'),
  ('contact_success_title', 'Message Sent!', 'contact', 'success_state'),
  ('contact_success_text', 'Thank you for reaching out. We will get back to you soon.', 'contact', 'success_state'),
  ('contact_send_another', 'Send Another Message', 'contact', 'button'),
  ('contact_name_label', 'Full Name', 'contact', 'form_label'),
  ('contact_email_label_form', 'Email', 'contact', 'form_label'),
  ('contact_phone_label_form', 'Phone Number', 'contact', 'form_label'),
  ('contact_phone_placeholder', 'Phone number', 'contact', 'placeholder'),
  ('contact_subject_label', 'Subject', 'contact', 'form_label'),
  ('contact_message_label', 'Message', 'contact', 'form_label'),
  ('contact_message_placeholder', 'Enter your message', 'contact', 'placeholder'),
  ('contact_submit_text', 'Send Message', 'contact', 'button'),
  ('contact_submitting_text', 'Sending...', 'contact', 'button'),
  ('contact_error_text', 'Failed to send message. Please try again.', 'contact', 'error_state'),
  ('contact_phone_error', 'Phone number must contain exactly 10 digits', 'contact', 'error_state'),
  ('contact_location_heading', 'Located in Boudha, Kathmandu', 'contact', 'section_heading'),
  ('contact_map_button', 'View on Google Maps', 'contact', 'button'),
  ('contact_subject_options', '[{"value":"","label":"What is your inquiry about?"},{"value":"sponsorship","label":"Sponsorship Inquiry"},{"value":"donation","label":"Donation Question"},{"value":"volunteer","label":"Volunteer Opportunity"},{"value":"partnership","label":"Partnership Proposal"},{"value":"other","label":"Other"}]', 'contact', 'form_options'),
  ('contact_country_codes', '[{"value":"+977","label":"Nepal (+977)"},{"value":"+1","label":"USA (+1)"},{"value":"+44","label":"UK (+44)"},{"value":"+91","label":"India (+91)"},{"value":"+61","label":"Australia (+61)"}]', 'contact', 'form_options'),
  ('sponsorship_impact_heading', 'Make a Lasting Impact', 'sponsorship', 'section_heading'),
  ('sponsorship_impact_desc1', 'When you sponsor a child, you are not just providing financial support—you are giving them hope, opportunity, and a chance to break the cycle of poverty.', 'sponsorship', 'section_description'),
  ('sponsorship_impact_desc2', 'Your monthly contribution covers school fees, educational materials, nutritious meals, healthcare, and a safe learning environment.', 'sponsorship', 'section_description'),
  ('sponsorship_provides_heading', 'Your Sponsorship Provides:', 'sponsorship', 'section_heading'),
  ('sponsorship_browse_button', 'Browse Student Profiles', 'sponsorship', 'button'),
  ('students_tab_all', 'All', 'students', 'tab'),
  ('students_tab_available', 'Available', 'students', 'tab'),
  ('students_tab_partial', 'Partially Sponsored', 'students', 'tab'),
  ('students_tab_fully', 'Fully Sponsored', 'students', 'tab'),
  ('students_loading', 'Loading students...', 'students', 'ui_state'),
  ('students_age_label', 'Age: {age}', 'students', 'label'),
  ('students_grade_label', 'Grade: {grade}', 'students', 'label'),
  ('students_sponsorship_label', 'Sponsorship: {amount}/month', 'students', 'label'),
  ('students_raised_label', '{amount} raised', 'students', 'label'),
  ('students_view_profile', 'View Profile', 'students', 'button'),
  ('students_empty', 'No students found in this category.', 'students', 'ui_state'),
  ('student_loading', 'Loading...', 'student-detail', 'ui_state'),
  ('student_not_found', 'Student not found', 'student-detail', 'ui_state'),
  ('student_back_to_list', 'Back to Students', 'student-detail', 'button'),
  ('student_back', 'Back', 'student-detail', 'button'),
  ('student_age_label', 'Age: {age} years old', 'student-detail', 'label'),
  ('student_grade_label', 'Grade: {grade}', 'student-detail', 'label'),
  ('student_sponsorship_goal', 'Sponsorship Goal', 'student-detail', 'label'),
  ('student_raised_of', '{current} of {goal} raised', 'student-detail', 'label'),
  ('student_sponsor_button', 'Sponsor This Child', 'student-detail', 'button'),
  ('student_about_heading', 'About {name}', 'student-detail', 'section_heading'),
  ('student_family_heading', 'Family Background', 'student-detail', 'section_heading'),
  ('student_education_heading', 'Education Needs', 'student-detail', 'section_heading'),
  ('student_monthly_sponsorship', 'Monthly Sponsorship', 'student-detail', 'label'),
  ('student_current_support', 'Current Support', 'student-detail', 'label'),
  ('news_tab_all', 'All', 'news', 'tab'),
  ('news_tab_updates', 'Updates', 'news', 'tab'),
  ('news_tab_events', 'Events', 'news', 'tab'),
  ('news_tab_impact', 'Impact', 'news', 'tab'),
  ('news_loading', 'Loading news...', 'news', 'ui_state'),
  ('news_read_more', 'Read more &rarr;', 'news', 'link'),
  ('news_empty', 'No news in this category yet.', 'news', 'ui_state'),
  ('gallery_tab_all', 'All', 'gallery', 'tab'),
  ('gallery_tab_photos', 'Photos', 'gallery', 'tab'),
  ('gallery_tab_videos', 'Videos', 'gallery', 'tab'),
  ('gallery_tab_testimonials', 'Testimonials', 'gallery', 'tab'),
  ('gallery_loading', 'Loading gallery...', 'gallery', 'ui_state'),
  ('gallery_empty', 'No content in this category yet.', 'gallery', 'ui_state'),
  ('gallery_open_youtube', 'Open on YouTube', 'gallery', 'button'),
  ('gallery_close_image', 'Close image', 'gallery', 'aria_label'),
  ('gallery_close_video', 'Close video', 'gallery', 'aria_label'),
  ('faq_loading', 'Loading FAQs...', 'faq', 'ui_state'),
  ('faq_empty', 'No FAQs available at the moment.', 'faq', 'ui_state'),
  ('stories_badge_success', 'Success Story', 'success-stories', 'badge'),
  ('stories_badge_featured', 'Featured', 'success-stories', 'badge'),
  ('volunteer_events_heading', 'Upcoming Volunteer Events', 'volunteer', 'section_heading'),
  ('volunteer_events_description', 'Sign up for upcoming events and activities.', 'volunteer', 'section_description'),
  ('volunteer_app_submitted_title', 'Application Submitted!', 'volunteer', 'success_state'),
  ('volunteer_app_heading', 'Volunteer Application', 'volunteer', 'section_heading'),
  ('volunteer_name_label', 'Full Name', 'volunteer', 'form_label'),
  ('volunteer_email_label', 'Email', 'volunteer', 'form_label'),
  ('volunteer_phone_label', 'Phone Number', 'volunteer', 'form_label'),
  ('volunteer_country_label', 'Country', 'volunteer', 'form_label'),
  ('volunteer_expertise_label', 'Area of Expertise', 'volunteer', 'form_label'),
  ('volunteer_expertise_placeholder', 'Select your area of expertise', 'volunteer', 'placeholder'),
  ('volunteer_availability_label', 'Availability', 'volunteer', 'form_label'),
  ('volunteer_availability_placeholder', 'e.g., 2 weeks in summer, ongoing remote support', 'volunteer', 'placeholder'),
  ('volunteer_motivation_label', 'Tell us about yourself', 'volunteer', 'form_label'),
  ('volunteer_motivation_placeholder', 'Share your background, experience, and why you want to volunteer...', 'volunteer', 'placeholder'),
  ('volunteer_submit_text', 'Submit Application', 'volunteer', 'button'),
  ('volunteer_submitting_text', 'Submitting...', 'volunteer', 'button'),
  ('volunteer_success_message', 'Application submitted. Thank you for your interest.', 'volunteer', 'success_state'),
  ('transparency_programs_label', 'to Programs', 'transparency', 'label'),
  ('transparency_report_heading', 'We publish detailed annual reports showing:', 'transparency', 'section_description'),
  ('notfound_home_button', 'Back to Home', 'not-found', 'button'),
  ('block_donate_now', 'Donate Now', NULL, 'button'),
  ('block_watch_video', 'Watch Video', NULL, 'button'),
  ('block_learn_more', 'Learn more', NULL, 'link'),
  ('donate_form_heading', 'Make Your Contribution', 'donate', 'section_heading'),
  ('donate_form_description', 'Your generosity directly supports students in Nepal.', 'donate', 'section_description'),
  ('donate_frequency_label', 'Frequency', 'donate', 'form_label'),
  ('donate_amount_label', 'Select Amount', 'donate', 'form_label'),
  ('donate_currency_label', 'NPR', 'donate', 'label'),
  ('donate_custom_placeholder', 'Enter custom amount', 'donate', 'placeholder'),
  ('donate_student_label', 'Sponsor a Student', 'donate', 'form_label'),
  ('donate_general_option', 'General Donation', 'donate', 'label'),
  ('donate_general_desc', 'Support where it is needed most', 'donate', 'description'),
  ('donate_loading_students', 'Loading available students...', 'donate', 'ui_state'),
  ('donate_message_label', 'Message (Optional)', 'donate', 'form_label'),
  ('donate_message_placeholder', 'Share a message of encouragement for the students or community...', 'donate', 'placeholder'),
  ('donate_transparent_heading', '100% Transparent Giving', 'donate', 'section_heading'),
  ('donate_transparent_desc', 'Every rupee is tracked and verified by our finance team. You will receive a detailed receipt and impact report for your donation.', 'donate', 'section_description'),
  ('donate_button_text', 'Donate', 'donate', 'button'),
  ('donate_processing_text', 'Processing...', 'donate', 'button'),
  ('impact_heading', 'Your Impact Preview', 'donate', 'section_heading'),
  ('impact_monthly_equivalent', '{amount} monthly equivalent', 'donate', 'label'),
  ('impact_sustained', 'Sustained monthly sponsorship', 'donate', 'label'),
  ('impact_duration_label', 'Estimated sponsorship duration:', 'donate', 'label'),
  ('impact_duration_full', 'Full monthly sponsorship for one student', 'donate', 'label'),
  ('impact_duration_comprehensive', 'Comprehensive support package', 'donate', 'label'),
  ('impact_duration_essentials', 'Essential supplies & materials', 'donate', 'label'),
  ('impact_duration_targeted', 'Targeted student assistance', 'donate', 'label'),
  ('impact_why_donate', 'Why Donate?', 'donate', 'section_heading'),
  ('impact_why_donate_desc', 'Every contribution, no matter the size, creates ripples of opportunity. Your support helps break the cycle of poverty through education.', 'donate', 'description'),
  ('impact_see_funds', 'See how funds are used', 'donate', 'link'),
  ('impact_metric_meals', 'of daily meals for a student', 'donate', 'metric'),
  ('impact_metric_supplies', 'of books, stationery & supplies', 'donate', 'metric'),
  ('impact_metric_education', 'of quality education support', 'donate', 'metric'),
  ('impact_metric_benefiting', 'directly benefiting from your support', 'donate', 'metric'),
  ('auth_heading', 'Join Our Community of Supporters', 'donate', 'section_heading'),
  ('auth_description', 'Creating an account lets you track your contributions, receive certificates, and stay connected with the students you support.', 'donate', 'description'),
  ('auth_benefit_1', 'Track your donation history and impact', 'donate', 'benefit'),
  ('auth_benefit_2', 'Receive official donation certificates', 'donate', 'benefit'),
  ('auth_benefit_3', 'Monitor your sponsored students progress', 'donate', 'benefit'),
  ('auth_benefit_4', 'Get updates on community achievements', 'donate', 'benefit'),
  ('auth_sign_in', 'Sign In', 'donate', 'button'),
  ('auth_create_account', 'Create an Account', 'donate', 'button'),
  ('donate_frequency_one_time', 'One Time', 'donate', 'frequency'),
  ('donate_frequency_one_time_desc', 'Single contribution', 'donate', 'frequency'),
  ('donate_frequency_monthly', 'Monthly', 'donate', 'frequency'),
  ('donate_frequency_monthly_desc', 'Sustained support', 'donate', 'frequency'),
  ('donate_frequency_annual', 'Annual', 'donate', 'frequency'),
  ('donate_frequency_annual_desc', 'Yearly commitment', 'donate', 'frequency'),
  ('donate_presets', '1000,2500,5000,10000,25000', 'donate', 'config'),
  ('header_admin', 'Admin', NULL, 'nav'),
  ('header_dashboard', 'Dashboard', NULL, 'nav'),
  ('header_sign_out', 'Sign Out', NULL, 'nav'),
  ('header_sign_in', 'Sign In', NULL, 'nav'),
  ('header_donate', 'Donate', NULL, 'nav')
ON CONFLICT (key) DO NOTHING;
