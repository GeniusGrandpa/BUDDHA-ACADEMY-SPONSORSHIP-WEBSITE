import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getAllCmsStrings } from '../services/cms-content'
import { useLanguage } from './LanguageContext'
import type { CmsStringMap } from '../types/cms-content'

const DEFAULT_STRINGS: Record<string, string> = {
  about_cta_description: 'Every contribution makes a lasting impact on a child\'s future. Join us in providing education, meals, and hope to children in Nepal.',
  about_cta_heading: 'Make a Difference Today',
  about_donate_button: 'Donate Now',
  about_journey_description: 'For nearly five decades, Buddha Academy has been transforming lives through education in the Boudha community of Kathmandu.',
  about_journey_heading: 'Our Journey',
  about_mission_heading: 'Our Mission',
  about_sponsor_button: 'Sponsor a Child',
  about_values_description: 'Our work is guided by core values that reflect our commitment to education, community, and compassion.',
  about_values_heading: 'Our Values',
  auth_benefit_1: 'Track your sponsorship impact in real time',
  auth_benefit_2: 'Receive updates about your sponsored student',
  auth_benefit_3: 'Connect with a community of changemakers',
  auth_benefit_4: 'Manage your donations and payments',
  auth_create_account: 'Create Account',
  auth_description: 'Sign in to manage your sponsorships, donations, and account settings.',
  auth_heading: 'Welcome Back',
  auth_sign_in: 'Sign In',
  campaigns_active: 'Active Campaigns',
  campaigns_description: 'Every contribution brings us closer to our goals. See how your support is making a measurable impact.',
  campaigns_empty_description: 'Fundraising campaigns will appear here. Check back soon to see how you can contribute to specific causes.',
  campaigns_empty_title: 'No Campaigns Yet',
  campaigns_overall_progress: 'Overall Progress',
  campaigns_percentage_achieved: '{percentage}% of overall goal achieved',
  campaigns_title: 'Our Campaigns',
  campaigns_total_goal: 'Total Goal',
  campaigns_total_raised: 'Total Raised',
  contact_address_label: 'Address',
  contact_country_australia: 'Australia (+61)',
  contact_country_india: 'India (+91)',
  contact_country_nepal: 'Nepal (+977)',
  contact_country_uk: 'UK (+44)',
  contact_country_usa: 'USA (+1)',
  contact_email_label: 'Email',
  contact_email_label_form: 'Email',
  contact_error_text: 'Something went wrong. Please try again.',
  contact_form_title: 'Send us a Message',
  contact_inquiry_placeholder: 'What is your inquiry about?',
  contact_location_heading: 'Our Location',
  contact_map_button: 'View on Map',
  contact_map_link: 'https://maps.app.goo.gl/wXqnysvPTWyoiSLK7',
  contact_message_label: 'Message',
  contact_message_placeholder: 'Write your message here...',
  contact_name_label: 'Name',
  contact_phone_error: 'Please enter a valid phone number',
  contact_phone_label: 'Phone',
  contact_phone_label_form: 'Phone',
  contact_phone_placeholder: 'Your phone number',
  contact_send_another: 'Send another message',
  contact_send_message_heading: 'Send us a Message',
  contact_subject_donation: 'Donation Question',
  contact_subject_label: 'Subject',
  contact_subject_other: 'Other',
  contact_subject_partnership: 'Partnership Proposal',
  contact_subject_sponsorship: 'Sponsorship Inquiry',
  contact_subject_volunteer: 'Volunteer Opportunity',
  contact_submit_text: 'Send Message',
  contact_submitting_text: 'Sending...',
  contact_success_text: 'Thank you for your message. We will get back to you soon.',
  contact_success_title: 'Message Sent',
  cta_banner_primary_link: '/sponsor',
  cta_banner_primary_text: 'Sponsor a Child',
  cta_banner_secondary_link: '/donate',
  cta_banner_secondary_text: 'Donate Now',
  cta_banner_subtitle: 'Your support provides education, meals, and hope to children in Nepal. Join us in making a lasting difference.',
  cta_banner_title: 'Make a Difference Today',
  donate_amount_label: 'Amount',
  donate_button_text: 'Donate Now',
  donate_currency_label: 'All amounts in NPR',
  donate_custom_placeholder: 'Enter custom amount',
  donate_form_description: 'Your donation supports education and community programs for children in Nepal.',
  donate_form_heading: 'Make a Donation',
  donate_frequency_annual: 'Annual',
  donate_frequency_annual_desc: 'Yearly support commitment',
  donate_frequency_label: 'Frequency',
  donate_frequency_monthly: 'Monthly',
  donate_frequency_monthly_desc: 'Sustained monthly support',
  donate_frequency_one_time: 'One Time',
  donate_frequency_one_time_desc: 'Single donation',
  donate_general_desc: 'Support our general fund where it is needed most',
  donate_general_option: 'General Donation',
  donate_hero_badge: 'Buddha Academy Sponsorship Program',
  donate_hero_description: 'In rural Nepal, access to quality education remains a distant dream for many children. Your sponsorship bridges the gap between potential and opportunity, providing meals, materials, and mentorship to students who need it most.',
  donate_hero_highlight: 'Creates Opportunity',
  donate_hero_title: 'Every Contribution ',
  donate_how_it_works: 'How It Works',
  donate_loading_students: 'Loading students...',
  donate_message_label: 'Message (Optional)',
  donate_message_placeholder: 'Leave a message with your donation...',
  donate_processing_text: 'Processing...',
  donate_student_format: 'Grade {grade} • Age {age} • {career}',
  donate_student_label: 'Select Student',
  donate_transparent_desc: '100% of your donation goes directly to supporting our programs',
  donate_transparent_heading: 'Transparent Giving',
  donate_trust_secure: 'Secure Donations',
  donate_trust_secure_desc: 'Encrypted & verified transactions',
  donate_trust_transparent: 'Transparent Fund Usage',
  donate_trust_transparent_desc: '100% accountability reporting',
  donate_trust_verified: 'Verified NGO',
  donate_trust_verified_desc: 'Registered nonprofit organization',
  faq_empty: 'No frequently asked questions available at the moment.',
  gallery_close_image: 'Close image',
  gallery_close_video: 'Close video',
  gallery_empty: 'No media available at the moment.',
  gallery_open_youtube: 'Open in YouTube',
  gallery_tab_all: 'All',
  gallery_tab_photos: 'Photos',
  gallery_tab_testimonials: 'Testimonials',
  gallery_tab_videos: 'Videos',
  header_admin: 'Admin',
  header_dashboard: 'Dashboard',
  header_donate: 'Donate',
  header_sign_in: 'Sign In',
  header_sign_out: 'Sign Out',
  home_age_label: 'Age: {age}',
  home_grade_label: 'Grade: {grade}',
  home_learn_more: 'Learn More',
  home_students_description: 'Meet the children who need your support to continue their education.',
  home_students_heading: 'Our Students',
  home_view_all_profiles: 'View All Profiles',
  home_view_profile: 'View Profile',
  impact_cards_description: 'Select an amount below to see the real impact your donation makes for students at Buddha Academy.',
  impact_cards_highlight: 'Changes Lives',
  impact_cards_title: 'Your Contribution ',
  impact_duration_comprehensive: 'Comprehensive',
  impact_duration_essentials: 'Essentials',
  impact_duration_full: 'Full Support',
  impact_duration_label: 'Duration',
  impact_duration_targeted: 'Targeted',
  impact_heading: 'Your Impact',
  impact_metric_benefiting: 'Children Benefiting',
  impact_metric_education: 'Education Programs',
  impact_metric_meals: 'Meals Provided',
  impact_metric_supplies: 'School Supplies',
  impact_monthly_equivalent: 'Monthly equivalent',
  impact_see_funds: 'See where funds go',
  impact_sustained: 'Sustained',
  impact_why_donate: 'Why Donate?',
  impact_why_donate_desc: 'Your donation directly supports children\'s education and well-being in Nepal.',
  news_empty: 'No news articles available at the moment.',
  news_read_more: 'Read More',
  news_tab_all: 'All',
  news_tab_events: 'Events',
  news_tab_impact: 'Impact',
  news_tab_updates: 'Updates',
  notfound_home_button: 'Go Home',
  sponsorship_browse_button: 'Browse Students',
  sponsorship_impact_desc1: 'When you sponsor a child, you are not just providing financial support you are giving them hope, opportunity, and a chance to break the cycle of poverty.',
  sponsorship_impact_desc2: 'Together, we can break the cycle of poverty through education. Your support changes lives.',
  sponsorship_impact_heading: 'Your Impact',
  sponsorship_provides_heading: 'What Your Sponsorship Provides',
  stories_badge_featured: 'Featured',
  stories_badge_success: 'Success Story',
  stories_empty_description: 'We are collecting the inspiring journeys of our students. Check back soon to read their stories of growth and achievement.',
  stories_empty_title: 'Success Stories Coming Soon',
  student_about_heading: 'About {name}',
  student_age_label: 'Age: {age}',
  student_back: 'Back',
  student_back_to_list: 'Back to Students',
  student_current_support: 'Current Support',
  student_education_heading: 'Education',
  student_family_heading: 'Family',
  student_grade_label: 'Grade: {grade}',
  student_monthly_sponsorship: 'Monthly Sponsorship',
  student_not_found: 'Student not found',
  student_raised_of: '{raised} of {goal}',
  student_sponsor_button: 'Sponsor {name}',
  student_sponsorship_goal: 'Sponsorship Goal',
  student_story_dreams: 'Dreams of becoming a',
  student_story_grade_age: 'Grade {grade} | Age {age}',
  student_story_meet: 'Meet a Student You Could Support',
  student_story_sponsorship_text: 'Your sponsorship provides {name} with daily nutritious meals, quality learning materials, and the opportunity to attend school with dignity.',
  students_age_label: 'Age: {age}',
  students_empty: 'No students found.',
  students_grade_label: 'Grade: {grade}',
  students_raised_label: 'Raised: {amount}',
  students_sponsorship_label: 'Sponsored',
  students_tab_all: 'All Students',
  students_tab_available: 'Available for Sponsorship',
  students_tab_fully: 'Fully Sponsored',
  students_tab_partial: 'Partially Sponsored',
  students_view_profile: 'View Profile',
  transparency_programs_label: 'Our Programs',
  transparency_report_heading: 'Financial Transparency',
  volunteer_app_heading: 'Volunteer Application',
  volunteer_app_submitted_title: 'Application Submitted',
  volunteer_availability_label: 'Availability',
  volunteer_availability_placeholder: 'When are you available to volunteer?',
  volunteer_country_label: 'Country',
  volunteer_email_label: 'Email',
  volunteer_events_description: 'Join us at upcoming events and make a difference in person.',
  volunteer_events_heading: 'Upcoming Events',
  volunteer_expertise_label: 'Area of Expertise',
  volunteer_expertise_placeholder: 'What skills or experience can you bring?',
  volunteer_motivation_label: 'Motivation',
  volunteer_motivation_placeholder: 'Why do you want to volunteer with us?',
  volunteer_name_label: 'Full Name',
  volunteer_phone_label: 'Phone Number',
  volunteer_submit_text: 'Submit Application',
  volunteer_submitting_text: 'Submitting...',
  volunteer_success_message: 'Thank you for applying! We will be in touch soon.',
}

interface CmsStringsContextValue {
  strings: CmsStringMap
  t: (key: string, replacements?: Record<string, string | number>) => string
  loading: boolean
  refresh: () => Promise<void>
}

const CmsStringsContext = createContext<CmsStringsContextValue>({
  strings: {},
  t: (key: string) => DEFAULT_STRINGS[key] ?? key,
  loading: true,
  refresh: async () => {},
})

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const [strings, setStrings] = useState<CmsStringMap>({})
  const [loading, setLoading] = useState(true)
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({})
  const { language, trBatch } = useLanguage()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCmsStrings()
      setStrings(data)
    } catch {
      setStrings({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const merged = useMemo(() => ({ ...DEFAULT_STRINGS, ...strings }), [strings])

  useEffect(() => {
    if (language === 'en') {
      setTranslatedMap({})
      return
    }
    let cancelled = false
    const unique = Array.from(new Set(Object.values(merged)))
    trBatch(unique).then((results) => {
      if (cancelled) return
      const map: Record<string, string> = {}
      unique.forEach((value, index) => {
        const translated = results[index]
        if (translated && translated !== value) map[value] = translated
      })
      setTranslatedMap(map)
    }).catch(() => {
      if (!cancelled) setTranslatedMap({})
    })
    return () => { cancelled = true }
  }, [language, merged, trBatch])

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    let value = translatedMap[merged[key]] || merged[key] || key
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replaceAll(`{${k}}`, String(v))
      }
    }
    return value
  }, [merged, translatedMap])

  return (
    <CmsStringsContext.Provider value={{ strings, t, loading, refresh: load }}>
      {children}
    </CmsStringsContext.Provider>
  )
}

export function useCmsStrings() {
  return useContext(CmsStringsContext)
}
