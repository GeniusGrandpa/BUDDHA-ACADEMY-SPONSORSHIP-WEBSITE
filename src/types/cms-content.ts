export interface DonationContent {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  currency_label: string
  impact_cards: ImpactCard[]
  impact_stories: ImpactStory[]
  process_steps: ProcessStep[]
  sections: DonationSection[]
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ImpactCard {
  amount: number
  label: string
  description: string
  icon: string
}

export interface ImpactStory {
  name: string
  quote: string
  image: string
}

export interface ProcessStep {
  title: string
  desc: string
}

export interface DonationSection {
  type: string
  title: string
  content: string
}

export interface SponsorshipContent {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  hero_image: string
  section_title: string
  section_description: string
  steps: SponsorshipStep[]
  benefits: SponsorshipBenefit[]
  cta_title: string
  cta_description: string
  cta_button_text: string
  cta_button_link: string
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface SponsorshipStep {
  num: string
  title: string
  desc: string
}

export interface SponsorshipBenefit {
  text: string
}

export interface VolunteerContent {
  id: string
  hero_title: string
  hero_subtitle: string
  hero_background_image: string
  section_title: string
  section_description: string
  opportunities: VolunteerOpportunity[]
  skill_options: SkillOption[]
  form_fields: FormField[]
  success_message: string
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface VolunteerOpportunity {
  title: string
  description: string
  icon: string
}

export interface SkillOption {
  value: string
  label: string
}

export interface FormField {
  name: string
  label: string
  type: string
  required: boolean
  placeholder?: string
}

export interface TransparencyContent {
  id: string
  hero_title: string
  hero_subtitle: string
  allocation_title: string
  allocation_description: string
  allocation_data: AllocationItem[]
  verification_title: string
  verification_description: string
  verification_steps: string[]
  impact_report_title: string
  impact_report_items: string[]
  receipt_policy_title: string
  receipt_policy_text: string
  donor_privacy_title: string
  donor_privacy_text: string
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface AllocationItem {
  label: string
  value: number
  color: string
  description: string
}

export interface HeroContent {
  id: string
  title: string
  highlight: string
  description: string
  background_image: string
  overlay_color: string
  overlay_opacity: number
  cta_primary_text: string
  cta_primary_link: string
  cta_secondary_text: string
  cta_secondary_link: string
  statistics: StatItem[]
  badges: BadgeItem[]
  layout: string
  display_order: number
  is_visible: boolean
  animation_enabled: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface StatItem {
  value: string
  label: string
}

export interface BadgeItem {
  text: string
}

export interface SectionVisibility {
  id: string
  section_key: string
  section_name: string
  is_visible: boolean
  sort_order: number
  updated_at: string
}

export interface SiteImage {
  id: string
  image_key: string
  image_url: string
  alt_text: string
  title: string
  position: string
  is_featured: boolean
  section: string
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface FooterContent {
  id: string
  description: string
  copyright_text: string
  nonprofit_text: string
  quick_links: FooterLink[]
  social_links: SocialLink[]
  contact_info: ContactInfo
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface FooterLink {
  label: string
  url: string
}

export interface SocialLink {
  platform: string
  url: string
  label: string
}

export interface ContactInfo {
  address: string
  phone: string
  email: string
}

export interface SeoContent {
  id: string
  page_slug: string
  meta_title: string
  meta_description: string
  og_image: string
  keywords: string
  og_title: string
  og_description: string
  twitter_title: string
  twitter_description: string
  canonical_url: string
  is_published: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface PageHeader {
  id: string
  page_slug: string
  title: string
  subtitle: string
  background_image: string
  overlay_enabled: boolean
  is_visible: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface SectionContent {
  id: string
  section_key: string
  title: string
  subtitle: string
  description: string
  content: Record<string, unknown>
  images: SectionImage[]
  is_visible: boolean
  sort_order: number
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface SectionImage {
  url: string
  alt: string
}

export interface CmsString {
  id: string
  key: string
  value: string
  page_slug: string | null
  category: string
  is_published: boolean
  created_at: string
  updated_at: string
}

export type CmsStringMap = Record<string, string>
