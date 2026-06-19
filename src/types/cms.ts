export type PageContentItem = Record<string, string | number>
export type PageContentValue = string | string[] | PageContentItem[]
export type PageContentRecord = Record<string, PageContentValue>

export type HomepageSectionContentItem = Record<string, string>
export type HomepageSectionContent = Record<string, string | boolean | HomepageSectionContentItem[]>

export interface TransparencyAllocation {
  name: string
  value: number
}

export interface TransparencyImpactStat {
  label: string
  value: string
}

export interface TransparencyContent {
  title: string
  subtitle: string
  description: string
  allocationData: TransparencyAllocation[]
  impactStats: TransparencyImpactStat[]
  trustMessage: string
}

export type NavigationLocation = 'header' | 'footer_get_involved' | 'footer_information' | 'footer_contact' | 'mobile' | 'quick_links'

export type AnnouncementType = 'info' | 'warning' | 'success' | 'error' | 'event'

export type PartnerType = 'sponsor' | 'donor' | 'partner' | 'media' | 'community' | 'government'

export type PageBlockType =
  | 'hero'
  | 'text'
  | 'rich_content'
  | 'image'
  | 'gallery'
  | 'cta'
  | 'donation'
  | 'student_cards'
  | 'testimonials'
  | 'faq'
  | 'stats'
  | 'timeline'
  | 'video'
  | 'sponsors'
  | 'partners'
  | 'announcements'
  | 'custom_section'

export interface PageBlock {
  id: string
  type: PageBlockType
  title?: string
  content: Record<string, unknown>
  is_visible: boolean
  settings?: {
    background_color?: string
    background_image?: string
    padding_top?: string
    padding_bottom?: string
    text_alignment?: 'left' | 'center' | 'right'
    max_width?: string
  }
}

export interface SeoMetadata {
  title?: string
  description?: string
  og_image?: string
  og_title?: string
  og_description?: string
  canonical_url?: string
  no_index?: boolean
  keywords?: string[]
}

export interface SiteSettings {
  id: string
  site_name: string
  tagline: string
  logo_url: string | null
  favicon_url: string | null
  theme_primary_color: string
  theme_secondary_color: string
  contact_email: string
  contact_phone: string
  contact_address: string
  social_facebook: string | null
  social_instagram: string | null
  social_twitter: string | null
  social_youtube: string | null
  social_linkedin: string | null
  seo_default_title: string
  seo_default_description: string
  seo_default_image: string | null
  announcement_enabled: boolean
  announcement_text: string | null
  announcement_type: 'info' | 'warning' | 'success' | 'error'
  maintenance_mode: boolean
  maintenance_message: string | null
  donation_default_currency: string
  donation_min_amount: number
  donation_max_amount: number
  footer_description: string
  footer_copyright: string
  footer_nonprofit_text: string
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface NavigationItem {
  id: string
  parent_id: string | null
  location: NavigationLocation
  label: string
  url: string | null
  route: string | null
  icon: string | null
  target: '_self' | '_blank'
  sort_order: number
  is_visible: boolean
  is_cta: boolean
  cta_style: 'primary' | 'secondary' | 'glass' | 'outline' | null
  requires_auth: boolean
  roles: string[]
  created_at: string
  updated_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: AnnouncementType
  link_url: string | null
  link_text: string | null
  is_active: boolean
  is_dismissible: boolean
  starts_at: string | null
  ends_at: string | null
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Partner {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  partner_type: PartnerType
  description: string | null
  sort_order: number
  is_visible: boolean
  is_featured: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}
