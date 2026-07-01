import { supabase } from '../lib/supabase'
import type {
  DonationContent,
  SponsorshipContent,
  VolunteerContent,
  TransparencyContent,
  HeroContent,
  SectionVisibility,
  SiteImage,
  FooterContent,
  SeoContent,
  PageHeader,
  SectionContent,
  CmsStringMap,
} from '../types/cms-content'

export function db(table: string) {
  return supabase.from(table as never)
}

export async function getDonationContent(): Promise<DonationContent | null> {
  const { data } = await db('donation_content')
    .select('id, hero_title, hero_subtitle, hero_background_image, currency_label, impact_cards, impact_stories, process_steps, sections, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as DonationContent | null
}

export async function upsertDonationContent(content: Partial<DonationContent>): Promise<void> {
  const { error } = await db('donation_content').upsert(content as never)
  if (error) throw error
}

export async function getSponsorshipContent(): Promise<SponsorshipContent | null> {
  const { data } = await db('sponsorship_content')
    .select('id, hero_title, hero_subtitle, hero_background_image, hero_image, section_title, section_description, steps, benefits, cta_title, cta_description, cta_button_text, cta_button_link, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as SponsorshipContent | null
}

export async function upsertSponsorshipContent(content: Partial<SponsorshipContent>): Promise<void> {
  const { error } = await db('sponsorship_content').upsert(content as never)
  if (error) throw error
}

export async function getVolunteerContent(): Promise<VolunteerContent | null> {
  const { data } = await db('volunteer_content')
    .select('id, hero_title, hero_subtitle, hero_background_image, section_title, section_description, opportunities, skill_options, form_fields, success_message, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as VolunteerContent | null
}

export async function upsertVolunteerContent(content: Partial<VolunteerContent>): Promise<void> {
  const { error } = await db('volunteer_content').upsert(content as never)
  if (error) throw error
}

export async function getTransparencyContent(): Promise<TransparencyContent | null> {
  const { data } = await db('transparency_content')
    .select('id, hero_title, hero_subtitle, allocation_title, allocation_description, allocation_data, verification_title, verification_description, verification_steps, impact_report_title, impact_report_items, receipt_policy_title, receipt_policy_text, donor_privacy_title, donor_privacy_text, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as TransparencyContent | null
}

export async function upsertTransparencyContent(content: Partial<TransparencyContent>): Promise<void> {
  const { error } = await db('transparency_content').upsert(content as never)
  if (error) throw error
}

export async function getHeroContent(): Promise<HeroContent | null> {
  const { data } = await db('hero_content')
    .select('id, title, highlight, description, background_image, overlay_color, overlay_opacity, cta_primary_text, cta_primary_link, cta_secondary_text, cta_secondary_link, statistics, badges, layout, display_order, is_visible, animation_enabled')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .maybeSingle()
  return data as HeroContent | null
}

export async function upsertHeroContent(content: Partial<HeroContent>): Promise<void> {
  const { error } = await db('hero_content').upsert(content as never)
  if (error) throw error
}

export async function getSectionVisibility(): Promise<SectionVisibility[]> {
  const { data } = await db('section_visibility')
    .select('id, section_key, section_name, is_visible, sort_order')
    .order('sort_order', { ascending: true })
  return (data || []) as SectionVisibility[]
}

export async function getSectionVisibilityByKey(key: string): Promise<boolean> {
  const { data } = await db('section_visibility')
    .select('is_visible')
    .eq('section_key', key as never)
    .maybeSingle()
  return (data as { is_visible: boolean } | null)?.is_visible ?? true
}

export async function updateSectionVisibility(key: string, isVisible: boolean): Promise<void> {
  const { error } = await db('section_visibility')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() } as never)
    .eq('section_key', key as never)
  if (error) throw error
}

export async function getSiteImage(imageKey: string): Promise<SiteImage | null> {
  const { data } = await db('site_images')
    .select('id, image_key, image_url, alt_text, section')
    .eq('image_key', imageKey)
    .maybeSingle()
  return data as SiteImage | null
}

export async function getSiteImagesBySection(section: string): Promise<SiteImage[]> {
  const { data } = await db('site_images')
    .select('id, image_key, image_url, alt_text, section')
    .eq('section', section)
  return (data || []) as SiteImage[]
}

export async function upsertSiteImage(image: Partial<SiteImage>): Promise<void> {
  const { error } = await db('site_images').upsert(image as never)
  if (error) throw error
}

export async function deleteSiteImage(id: string): Promise<void> {
  const { error } = await db('site_images').delete().eq('id', id as never)
  if (error) throw error
}

export async function getFooterContent(): Promise<FooterContent | null> {
  const { data } = await db('footer_content')
    .select('id, description, copyright_text, nonprofit_text, social_links, quick_links, contact_info, is_published, created_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data as FooterContent | null
}

export async function upsertFooterContent(content: Partial<FooterContent>): Promise<void> {
  const { error } = await db('footer_content').upsert(content as never)
  if (error) throw error
}

export async function getSeoContent(pageSlug: string): Promise<SeoContent | null> {
  const { data } = await db('seo_content')
    .select('id, page_slug, meta_title, meta_description, is_published')
    .eq('page_slug', pageSlug)
    .eq('is_published', true)
    .maybeSingle()
  return data as SeoContent | null
}

export async function upsertSeoContent(content: Partial<SeoContent>): Promise<void> {
  const { error } = await db('seo_content').upsert(content as never)
  if (error) throw error
}

export async function getPageHeader(pageSlug: string): Promise<PageHeader | null> {
  const { data } = await db('page_headers')
    .select('id, page_slug, title, subtitle, is_visible')
    .eq('page_slug', pageSlug)
    .eq('is_visible', true)
    .maybeSingle()
  return data as PageHeader | null
}

export async function upsertPageHeader(header: Partial<PageHeader>): Promise<void> {
  const { error } = await db('page_headers').upsert(header as never)
  if (error) throw error
}

export async function getSectionContent(sectionKey: string): Promise<SectionContent | null> {
  const { data } = await db('section_content')
    .select('id, section_key, title, subtitle, description, content, images, is_visible, sort_order')
    .eq('section_key', sectionKey)
    .maybeSingle()
  return data as SectionContent | null
}

export async function upsertSectionContent(content: Partial<SectionContent>): Promise<void> {
  const { error } = await db('section_content').upsert(content as never)
  if (error) throw error
}

export async function getAllCmsStrings(): Promise<CmsStringMap> {
  const { data } = await db('cms_strings')
    .select('key, value')
  const rows = (data || []) as { key: string; value: string }[]
  const map: CmsStringMap = {}
  for (const row of rows) {
    map[row.key] = row.value
  }
  return map
}

export async function getCmsString(key: string): Promise<string | null> {
  const { data } = await db('cms_strings')
    .select('value')
    .eq('key', key)
    .eq('is_published', true)
    .maybeSingle()
  if (!data) return null
  return (data as { value: string }).value
}

export async function upsertCmsString(stringData: { key: string; value: string; page_slug?: string; category?: string }): Promise<void> {
  const { error } = await db('cms_strings').upsert(stringData as never)
  if (error) throw error
}
