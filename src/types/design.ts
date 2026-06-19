export interface DesignBranding {
  organization_name: string
  tagline: string
  slogan: string
  logo_url: string | null
  secondary_logo_url: string | null
  favicon_url: string | null
  footer_branding: string
  email_branding: string
}

export interface DesignColors {
  primary: string
  primary_light: string
  primary_dark: string
  secondary: string
  secondary_light: string
  secondary_dark: string
  accent: string
  background: string
  surface: string
  surface_hover: string
  card: string
  card_hover: string
  navbar_bg: string
  navbar_text: string
  navbar_active: string
  navbar_hover: string
  footer_bg: string
  footer_text: string
  footer_heading: string
  sidebar_bg: string
  sidebar_text: string
  sidebar_active_bg: string
  sidebar_active_text: string
  button_primary_bg: string
  button_primary_text: string
  button_primary_hover: string
  button_secondary_bg: string
  button_secondary_text: string
  button_secondary_hover: string
  button_outline_border: string
  button_outline_text: string
  button_outline_hover: string
  text_primary: string
  text_secondary: string
  text_muted: string
  text_on_primary: string
  text_on_secondary: string
  border: string
  border_light: string
  border_accent: string
  divider: string
  success: string
  success_light: string
  warning: string
  warning_light: string
  error: string
  error_light: string
  info: string
  info_light: string
  hero_overlay: string
  hero_overlay_opacity: string
}

export interface DesignTypography {
  heading_font: string
  body_font: string
  heading_font_url: string
  body_font_url: string
  base_size: string
  scale_ratio: string
  h1_size: string
  h2_size: string
  h3_size: string
  h4_size: string
  h5_size: string
  h6_size: string
  body_size: string
  small_size: string
  heading_weight: string
  body_weight: string
  heading_letter_spacing: string
  body_letter_spacing: string
  heading_line_height: string
  body_line_height: string
  text_transform_heading: string
  text_transform_body: string
}

export interface DesignLayout {
  container_width: string
  container_padding_x: string
  section_spacing_y: string
  section_spacing_x: string
  border_radius_sm: string
  border_radius_md: string
  border_radius_lg: string
  border_radius_xl: string
  border_radius_2xl: string
  border_radius_full: string
  shadow_sm: string
  shadow_md: string
  shadow_lg: string
  shadow_xl: string
  card_style: string
  button_style: string
  navbar_layout: string
  footer_layout: string
  sidebar_behavior: string
  animation_enabled: boolean
  animation_duration: string
  hover_effects: boolean
  website_max_width: string
}

export interface DesignComponentStyles {
  hero_default_style: string
  hero_default_bg: string
  hero_default_overlay: boolean
  card_default_style: string
  card_default_border_radius: string
  cta_default_style: string
  banner_default_style: string
  testimonial_layout: string
  student_spotlight_layout: string
  donation_section_theme: string
  [key: string]: unknown
}

export interface DesignTokens {
  spacing_unit: string
  transition_duration: string
  transition_timing: string
  z_index_dropdown: string
  z_index_sticky: string
  z_index_modal_backdrop: string
  z_index_modal: string
  z_index_popover: string
  z_index_tooltip: string
  z_index_toast: string
  breakpoint_sm: string
  breakpoint_md: string
  breakpoint_lg: string
  breakpoint_xl: string
  breakpoint_2xl: string
}

export interface WebsiteConfigEntry {
  id: string
  key: string
  label: string
  value: Record<string, unknown>
  is_active: boolean
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface SectionVisibilityEntry {
  id: string
  section_key: string
  section_name: string
  is_visible: boolean
  description: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface DesignSettings {
  id: string
  branding: DesignBranding
  colors: DesignColors
  typography: DesignTypography
  layout: DesignLayout
  component_styles: DesignComponentStyles
  tokens: DesignTokens
  config: Record<string, unknown>
  draft: Record<string, unknown> | null
  is_published: boolean
  published_at: string | null
  updated_by: string | null
  created_at: string
  updated_at: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string | null
  preview_url: string | null
  branding: DesignBranding
  colors: DesignColors
  typography: DesignTypography
  layout: DesignLayout
  component_styles: DesignComponentStyles
  tokens: DesignTokens
  config: Record<string, unknown>
  is_default: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export type DesignSettingsCategory =
  | 'branding'
  | 'colors'
  | 'typography'
  | 'layout'
  | 'component_styles'
  | 'tokens'
  | 'config'

export type ColorKey = keyof DesignColors
export type BrandingKey = keyof DesignBranding

export const DEFAULT_COLORS: DesignColors = {
  primary: '#f26b1d',
  primary_light: '#fcb375',
  primary_dark: '#b53f14',
  secondary: '#c49a4e',
  secondary_light: '#e3cc8e',
  secondary_dark: '#a37d3f',
  accent: '#f59e0b',
  background: '#fdfbf7',
  surface: '#ffffff',
  surface_hover: '#faf6ee',
  card: '#ffffff',
  card_hover: '#faf6ee',
  navbar_bg: '#ffffff',
  navbar_text: '#374151',
  navbar_active: '#d97706',
  navbar_hover: '#d97706',
  footer_bg: '#f9fafb',
  footer_text: '#6b7280',
  footer_heading: '#111827',
  sidebar_bg: '#fdfbf7',
  sidebar_text: '#6b7280',
  sidebar_active_bg: '#fff5ed',
  sidebar_active_text: '#ea580c',
  button_primary_bg: '#f26b1d',
  button_primary_text: '#ffffff',
  button_primary_hover: '#d95317',
  button_secondary_bg: '#c49a4e',
  button_secondary_text: '#ffffff',
  button_secondary_hover: '#a37d3f',
  button_outline_border: '#f26b1d',
  button_outline_text: '#f26b1d',
  button_outline_hover: '#fff5ed',
  text_primary: '#111827',
  text_secondary: '#4b5563',
  text_muted: '#9ca3af',
  text_on_primary: '#ffffff',
  text_on_secondary: '#ffffff',
  border: '#e5e7eb',
  border_light: '#f3f4f6',
  border_accent: '#fcd34d',
  divider: '#e5e7eb',
  success: '#10b981',
  success_light: '#d1fae5',
  warning: '#f59e0b',
  warning_light: '#fef3c7',
  error: '#ef4444',
  error_light: '#fee2e2',
  info: '#3b82f6',
  info_light: '#dbeafe',
  hero_overlay: '#000000',
  hero_overlay_opacity: '0.4',
}

export const DEFAULT_BRANDING: DesignBranding = {
  organization_name: 'Buddha Academy',
  tagline: 'Boudha · Kathmandu',
  slogan: 'Empowering Through Education',
  logo_url: '/src/assets/logo.jpg',
  secondary_logo_url: null,
  favicon_url: null,
  footer_branding: 'Buddha Academy',
  email_branding: 'Buddha Academy',
}

export const DEFAULT_TYPOGRAPHY: DesignTypography = {
  heading_font: 'Inter',
  body_font: 'Inter',
  heading_font_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap',
  body_font_url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
  base_size: '16',
  scale_ratio: '1.25',
  h1_size: '2.986',
  h2_size: '2.488',
  h3_size: '2.074',
  h4_size: '1.728',
  h5_size: '1.44',
  h6_size: '1.2',
  body_size: '1',
  small_size: '0.833',
  heading_weight: '700',
  body_weight: '400',
  heading_letter_spacing: '-0.025',
  body_letter_spacing: '0',
  heading_line_height: '1.2',
  body_line_height: '1.6',
  text_transform_heading: 'none',
  text_transform_body: 'none',
}

export const DEFAULT_LAYOUT: DesignLayout = {
  container_width: '1280',
  container_padding_x: '16',
  section_spacing_y: '16',
  section_spacing_x: '16',
  border_radius_sm: '0.375',
  border_radius_md: '0.5',
  border_radius_lg: '0.75',
  border_radius_xl: '1',
  border_radius_2xl: '1.5',
  border_radius_full: '9999',
  shadow_sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  shadow_md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  shadow_lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  shadow_xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  card_style: 'default',
  button_style: 'rounded',
  navbar_layout: 'default',
  footer_layout: 'default',
  sidebar_behavior: 'fixed',
  animation_enabled: true,
  animation_duration: '0.3',
  hover_effects: true,
  website_max_width: '100',
}

export const DEFAULT_COMPONENT_STYLES: DesignComponentStyles = {
  hero_default_style: 'gradient',
  hero_default_bg: 'linear-gradient(135deg, #f26b1d, #fcb375)',
  hero_default_overlay: true,
  card_default_style: 'elevated',
  card_default_border_radius: '0.75',
  cta_default_style: 'gradient',
  banner_default_style: 'default',
  testimonial_layout: 'grid',
  student_spotlight_layout: 'grid',
  donation_section_theme: 'warm',
}

export const DEFAULT_TOKENS: DesignTokens = {
  spacing_unit: '4',
  transition_duration: '300',
  transition_timing: 'ease-in-out',
  z_index_dropdown: '50',
  z_index_sticky: '100',
  z_index_modal_backdrop: '200',
  z_index_modal: '300',
  z_index_popover: '400',
  z_index_tooltip: '500',
  z_index_toast: '600',
  breakpoint_sm: '640',
  breakpoint_md: '768',
  breakpoint_lg: '1024',
  breakpoint_xl: '1280',
  breakpoint_2xl: '1536',
}
