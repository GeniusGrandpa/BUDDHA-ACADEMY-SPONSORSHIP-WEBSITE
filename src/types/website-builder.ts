export type PageStatus = 'draft' | 'published' | 'hidden'

export interface WebsitePage {
  id: string
  slug: string
  title: string
  status: PageStatus
  meta_title: string | null
  meta_description: string | null
  hero_background_image: string | null
  hero_overlay_color: string
  hero_overlay_opacity: number
  layout_settings: Record<string, unknown>
  is_draft: boolean
  published_version_id: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
  sections?: WebsiteSection[]
}

export interface WebsiteSection {
  id: string
  page_id: string
  section_key: string
  section_type: string
  title: string | null
  subtitle: string | null
  description: string | null
  content: Record<string, unknown>
  settings: SectionSettings
  sort_order: number
  is_visible: boolean
  is_draft: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
  blocks?: WebsiteContentBlock[]
}

export interface SectionSettings {
  text_color?: string
  background_color?: string
  background_image?: string
  overlay_color?: string
  overlay_opacity?: number
  button_color?: string
  button_text_color?: string
  border_radius?: string
  padding_top?: string
  padding_bottom?: string
  padding_left?: string
  padding_right?: string
  text_alignment?: 'left' | 'center' | 'right'
  font_size_preset?: 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl'
  layout_preset?: 'default' | 'wide' | 'narrow' | 'full_width'
  max_width?: string
  [key: string]: unknown
}

export interface WebsiteContentBlock {
  id: string
  section_id: string
  block_type: BlockType
  title: string | null
  content: Record<string, unknown>
  settings: Record<string, unknown>
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type BlockType = 'text' | 'image' | 'card' | 'button' | 'gallery' | 'video' | 'rich_text' | 'stat' | 'testimonial' | 'faq_item' | 'custom'

export interface WebsiteMedia {
  id: string
  file_url: string
  file_name: string
  file_size: number | null
  mime_type: string | null
  alt_text: string
  width: number | null
  height: number | null
  uploaded_by: string | null
  created_at: string
}

export interface WebsitePageVersion {
  id: string
  page_id: string
  version_number: number
  status: 'draft' | 'published' | 'archived'
  snapshot: Record<string, unknown>
  created_by: string | null
  created_at: string
}

export interface SectionContent {
  title?: string
  subtitle?: string
  description?: string
  content?: Record<string, unknown>
  settings?: SectionSettings
}

export interface DesignControlValues {
  textColor: string
  backgroundColor: string
  buttonColor: string
  buttonTextColor: string
  backgroundImage: string
  overlayColor: string
  overlayOpacity: number
  borderRadius: string
  paddingTop: string
  paddingBottom: string
  textAlignment: 'left' | 'center' | 'right'
  fontSizePreset: string
  layoutPreset: string
}

export const DEFAULT_DESIGN_CONTROLS: DesignControlValues = {
  textColor: '#111827',
  backgroundColor: '#ffffff',
  buttonColor: '#f59e0b',
  buttonTextColor: '#ffffff',
  backgroundImage: '',
  overlayColor: '#000000',
  overlayOpacity: 0.5,
  borderRadius: '0.5rem',
  paddingTop: '2rem',
  paddingBottom: '2rem',
  textAlignment: 'left',
  fontSizePreset: 'base',
  layoutPreset: 'default',
}

export const FONT_SIZE_OPTIONS = [
  { value: 'sm', label: 'Small' },
  { value: 'base', label: 'Normal' },
  { value: 'lg', label: 'Large' },
  { value: 'xl', label: 'Extra Large' },
  { value: '2xl', label: '2X Large' },
  { value: '3xl', label: '3X Large' },
  { value: '4xl', label: '4X Large' },
]

export const LAYOUT_PRESET_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'wide', label: 'Wide' },
  { value: 'narrow', label: 'Narrow' },
  { value: 'full_width', label: 'Full Width' },
]

export const PADDING_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '1rem', label: 'Small' },
  { value: '2rem', label: 'Medium' },
  { value: '3rem', label: 'Large' },
  { value: '4rem', label: 'Extra Large' },
  { value: '6rem', label: '2X Large' },
]

export const BORDER_RADIUS_OPTIONS = [
  { value: '0', label: 'None' },
  { value: '0.25rem', label: 'Small' },
  { value: '0.5rem', label: 'Medium' },
  { value: '0.75rem', label: 'Large' },
  { value: '1rem', label: 'Extra Large' },
  { value: '9999px', label: 'Full' },
]

export interface PageEditorState {
  page: WebsitePage | null
  sections: WebsiteSection[]
  activeSectionId: string | null
  isDirty: boolean
  isSaving: boolean
  previewDevice: 'desktop' | 'tablet' | 'mobile'
  activeTab: 'content' | 'design' | 'seo' | 'blocks'
  showMediaPicker: boolean
  mediaTarget: string | null
}

export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Banner',
  page_header: 'Page Header',
  welcome: 'Welcome Text',
  about_preview: 'About Preview',
  stats: 'Statistics',
  featured_students: 'Featured Students',
  sponsorship_steps: 'How Sponsorship Works',
  testimonials: 'Testimonials',
  donation_cta: 'Donation Call-to-Action',
  about_mission: 'Mission & Vision',
  about_values: 'Core Values',
  about_timeline: 'History Timeline',
  about_stats: 'About Statistics',
  about_cta: 'About CTA',
  sponsor_hero: 'Sponsorship Banner',
  sponsor_steps: 'How to Sponsor',
  sponsor_benefits: 'Sponsorship Benefits',
  sponsor_cta: 'Sponsorship CTA',
  donate_hero: 'Donation Banner',
  donate_impact: 'Impact Cards',
  donate_process: 'Donation Process',
  contact_details: 'Contact Information',
  contact_form: 'Contact Form',
  faq_list: 'FAQ List',
  gallery_grid: 'Photo Gallery',
  volunteer_hero: 'Volunteer Banner',
  volunteer_opps: 'Opportunities',
  volunteer_form: 'Application Form',
  privacy_content: 'Privacy Policy Text',
  terms_content: 'Terms of Service Text',
  news_grid: 'News Articles',
  students_grid: 'Student Profiles',
  activity_feed: 'Activity Feed',
  success_stories: 'Success Stories',
  transparency_content: 'Transparency Content',
  campaigns_list: 'Campaigns',
  cta_banner: 'CTA Banner',
  custom_content: 'Custom Content',
  events_grid: 'Events',
  impact_content: 'Impact Content',
  team_grid: 'Team Members',
  testimonials_list: 'Testimonials List',
  stories_grid: 'Stories Grid',
  donation_form: 'Donation Form',
  student_story: 'Student Story',
  map_location: 'Map Location',
}
