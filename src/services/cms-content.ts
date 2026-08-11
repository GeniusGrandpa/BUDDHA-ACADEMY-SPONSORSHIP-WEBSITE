import { supabase } from '../lib/supabase'
import { isPreviewMode } from '../lib/preview-mode'
import { getLocalizedContent } from './content-localization'
import { sanitizeCmsText } from '../lib/sanitize-cms'
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

export async function getDonationContent(language?: string): Promise<DonationContent | null> {
  const fetchEnglish = async () => {
    let query = db('donation_content')
      .select('id, hero_title, hero_title_ne, hero_subtitle, hero_subtitle_ne, hero_background_image, currency_label, currency_label_ne, impact_cards, impact_cards_ne, impact_stories, impact_stories_ne, process_steps, process_steps_ne, sections, sections_ne, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as DonationContent | null
  }
  return getLocalizedContent('donation_content', 'main', language || 'en', fetchEnglish)
}

async function resolveContentRowId(table: string, contentId?: string): Promise<string | undefined> {
  const query = contentId
    ? db(table).select('id').eq('id', contentId as never).limit(1)
    : db(table).select('id').order('created_at', { ascending: false }).limit(1)
  const { data } = await query.maybeSingle()
  return (data as { id?: string } | null)?.id
}

export async function upsertDonationContent(content: Partial<DonationContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('donation_content', contentId)
  if (existingId) {
    const { error } = await db('donation_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('donation_content').insert(fields as never)
    if (error) throw error
  }
}

export async function getSponsorshipContent(language?: string): Promise<SponsorshipContent | null> {
  const fetchEnglish = async () => {
    let query = db('sponsorship_content')
      .select('id, hero_title, hero_title_ne, hero_subtitle, hero_subtitle_ne, hero_background_image, hero_image, section_title, section_title_ne, section_description, section_description_ne, steps, steps_ne, benefits, benefits_ne, cta_title, cta_title_ne, cta_description, cta_description_ne, cta_button_text, cta_button_text_ne, cta_button_link, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as SponsorshipContent | null
  }
  return getLocalizedContent('sponsorship_content', 'main', language || 'en', fetchEnglish)
}

export async function upsertSponsorshipContent(content: Partial<SponsorshipContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('sponsorship_content', contentId)
  if (existingId) {
    const { error } = await db('sponsorship_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('sponsorship_content').insert(fields as never)
    if (error) throw error
  }
}

export async function getVolunteerContent(language?: string): Promise<VolunteerContent | null> {
  const fetchEnglish = async () => {
    let query = db('volunteer_content')
      .select('id, hero_title, hero_title_ne, hero_subtitle, hero_subtitle_ne, hero_background_image, section_title, section_title_ne, section_description, section_description_ne, opportunities, opportunities_ne, skill_options, skill_options_ne, form_fields, form_fields_ne, success_message, success_message_ne, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as VolunteerContent | null
  }
  return getLocalizedContent('volunteer_content', 'main', language || 'en', fetchEnglish)
}

export async function upsertVolunteerContent(content: Partial<VolunteerContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('volunteer_content', contentId)
  if (existingId) {
    const { error } = await db('volunteer_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('volunteer_content').insert(fields as never)
    if (error) throw error
  }
}

export async function getTransparencyContent(language?: string): Promise<TransparencyContent | null> {
  const fetchEnglish = async () => {
    let query = db('transparency_content')
      .select('id, hero_title, hero_title_ne, hero_subtitle, hero_subtitle_ne, allocation_title, allocation_title_ne, allocation_description, allocation_description_ne, allocation_data, allocation_data_ne, verification_title, verification_title_ne, verification_description, verification_description_ne, verification_steps, verification_steps_ne, impact_report_title, impact_report_title_ne, impact_report_items, impact_report_items_ne, receipt_policy_title, receipt_policy_title_ne, receipt_policy_text, receipt_policy_text_ne, donor_privacy_title, donor_privacy_title_ne, donor_privacy_text, donor_privacy_text_ne, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as TransparencyContent | null
  }
  return getLocalizedContent('transparency_content', 'main', language || 'en', fetchEnglish)
}

export async function upsertTransparencyContent(content: Partial<TransparencyContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('transparency_content', contentId)
  if (existingId) {
    const { error } = await db('transparency_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('transparency_content').insert(fields as never)
    if (error) throw error
  }
}

export async function getHeroContent(language?: string): Promise<HeroContent | null> {
  const fetchEnglish = async () => {
    let query = db('hero_content')
      .select('id, title, title_ne, highlight, highlight_ne, description, description_ne, background_image, overlay_color, overlay_opacity, cta_primary_text, cta_primary_text_ne, cta_primary_link, cta_secondary_text, cta_secondary_text_ne, cta_secondary_link, statistics, statistics_ne, badges, badges_ne, layout, display_order, is_visible, animation_enabled')
      .order('display_order', { ascending: true })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_visible', true)
    const { data } = await query.maybeSingle()
    return data as HeroContent | null
  }
  return getLocalizedContent('hero_content', 'main', language || 'en', fetchEnglish)
}

export async function upsertHeroContent(content: Partial<HeroContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('hero_content', contentId)
  if (existingId) {
    const { error } = await db('hero_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('hero_content').insert(fields as never)
    if (error) throw error
  }
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
    .select('id, image_key, image_url, alt_text, alt_text_ne, section')
    .eq('image_key', imageKey)
    .maybeSingle()
  return data as SiteImage | null
}

export async function getSiteImagesBySection(section: string): Promise<SiteImage[]> {
  const { data } = await db('site_images')
    .select('id, image_key, image_url, alt_text, alt_text_ne, section')
    .eq('section', section)
  return (data || []) as SiteImage[]
}

export async function upsertSiteImage(image: Partial<SiteImage>): Promise<void> {
  if (!image.image_key) return
  const { data: existing } = await db('site_images')
    .select('id')
    .eq('image_key', image.image_key)
    .maybeSingle()
  if (existing) {
    const { error } = await db('site_images')
      .update({ ...image, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
  } else {
    const { error } = await db('site_images')
      .insert(image as never)
    if (error) throw error
  }
}

export async function deleteSiteImage(id: string): Promise<void> {
  const { error } = await db('site_images').delete().eq('id', id as never)
  if (error) throw error
}

export async function getFooterContent(language?: string): Promise<FooterContent | null> {
  const fetchEnglish = async () => {
    let query = db('footer_content')
      .select('id, description, description_ne, copyright_text, copyright_text_ne, nonprofit_text, nonprofit_text_ne, social_links, quick_links, quick_links_ne, contact_info, contact_info_ne, is_published, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as FooterContent | null
  }
  return getLocalizedContent('footer_content', 'main', language || 'en', fetchEnglish)
}

export async function upsertFooterContent(content: Partial<FooterContent>): Promise<void> {
  const { id: contentId, ...fields } = content
  const existingId = await resolveContentRowId('footer_content', contentId)
  if (existingId) {
    const { error } = await db('footer_content').update({ ...fields, updated_at: new Date().toISOString() } as never).eq('id', existingId as never)
    if (error) throw error
  } else {
    const { error } = await db('footer_content').insert(fields as never)
    if (error) throw error
  }
}

export async function getSeoContent(pageSlug: string, language?: string): Promise<SeoContent | null> {
  const fetchEnglish = async () => {
    let query = db('seo_content')
      .select('id, page_slug, meta_title, meta_title_ne, meta_description, meta_description_ne, is_published')
      .eq('page_slug', pageSlug)
    if (!isPreviewMode()) query = query.eq('is_published', true)
    const { data } = await query.maybeSingle()
    return data as SeoContent | null
  }
  return getLocalizedContent('seo_content', pageSlug, language || 'en', fetchEnglish)
}

export async function upsertSeoContent(content: Partial<SeoContent>): Promise<void> {
  if (!content.page_slug) return
  const { data: existing } = await db('seo_content')
    .select('id')
    .eq('page_slug', content.page_slug)
    .maybeSingle()
  if (existing) {
    const { error } = await db('seo_content')
      .update({ ...content, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
  } else {
    const { error } = await db('seo_content')
      .insert(content as never)
    if (error) throw error
  }
}

export async function getPageHeader(pageSlug: string, language?: string): Promise<PageHeader | null> {
  const fetchEnglish = async () => {
    let query = db('page_headers')
      .select('id, page_slug, title, title_ne, subtitle, subtitle_ne, is_visible')
      .eq('page_slug', pageSlug)
    if (!isPreviewMode()) query = query.eq('is_visible', true)
    const { data } = await query.maybeSingle()
    return data as PageHeader | null
  }
  return getLocalizedContent('page_headers', pageSlug, language || 'en', fetchEnglish)
}

export async function upsertPageHeader(header: Partial<PageHeader>): Promise<void> {
  if (!header.page_slug) return
  const { data: existing } = await db('page_headers')
    .select('id')
    .eq('page_slug', header.page_slug)
    .maybeSingle()
  if (existing) {
    const { error } = await db('page_headers')
      .update({ ...header, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
  } else {
    const { error } = await db('page_headers')
      .insert(header as never)
    if (error) throw error
  }
}

export async function getSectionContent(sectionKey: string, language?: string): Promise<SectionContent | null> {
  const fetchEnglish = async () => {
    const { data } = await db('section_content')
      .select('id, section_key, title, title_ne, subtitle, subtitle_ne, description, description_ne, content, content_ne, images, is_visible, sort_order')
      .eq('section_key', sectionKey)
      .maybeSingle()
    return data as SectionContent | null
  }
  return getLocalizedContent('section_content', sectionKey, language || 'en', fetchEnglish)
}

export async function upsertSectionContent(content: Partial<SectionContent>): Promise<void> {
  if (!content.section_key) return
  const { data: existing } = await db('section_content')
    .select('id')
    .eq('section_key', content.section_key)
    .maybeSingle()
  if (existing) {
    const { error } = await db('section_content')
      .update({ ...content, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
  } else {
    const { error } = await db('section_content')
      .insert(content as never)
    if (error) throw error
  }
}

export async function getAllCmsStrings(): Promise<CmsStringMap> {
  const { data } = await db('cms_strings')
    .select('key, value')
  const rows = (data || []) as { key: string; value: string }[]
  const map: CmsStringMap = {}
  for (const row of rows) {
    const value = sanitizeCmsText(row.value)
    if (value) map[row.key] = value
  }
  return map
}

export async function getCmsString(key: string): Promise<string | null> {
  let query = db('cms_strings')
    .select('value')
    .eq('key', key)
  if (!isPreviewMode()) query = query.eq('is_published', true)
  const { data } = await query.maybeSingle()
  if (!data) return null
  return sanitizeCmsText((data as { value: string }).value)
}

export async function upsertCmsString(stringData: { key: string; value: string; page_slug?: string; category?: string }): Promise<void> {
  const { data: existing } = await db('cms_strings')
    .select('id')
    .eq('key', stringData.key)
    .maybeSingle()
  if (existing) {
    const { error } = await db('cms_strings')
      .update({ ...stringData, updated_at: new Date().toISOString() } as never)
      .eq('id', (existing as { id: string }).id)
    if (error) throw error
  } else {
    const { error } = await db('cms_strings')
      .insert(stringData as never)
    if (error) throw error
  }
}
