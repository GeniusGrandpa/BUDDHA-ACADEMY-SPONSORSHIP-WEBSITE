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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (supabase as any).from(table)
}

export async function getDonationContent(): Promise<DonationContent | null> {
  const { data } = await db('donation_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as DonationContent | null
}

export async function upsertDonationContent(content: Partial<DonationContent>): Promise<void> {
  const { error } = await db('donation_content').upsert(content as never)
  if (error) throw error
}

export async function getSponsorshipContent(): Promise<SponsorshipContent | null> {
  const { data } = await db('sponsorship_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as SponsorshipContent | null
}

export async function upsertSponsorshipContent(content: Partial<SponsorshipContent>): Promise<void> {
  const { error } = await db('sponsorship_content').upsert(content as never)
  if (error) throw error
}

export async function getVolunteerContent(): Promise<VolunteerContent | null> {
  const { data } = await db('volunteer_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as VolunteerContent | null
}

export async function upsertVolunteerContent(content: Partial<VolunteerContent>): Promise<void> {
  const { error } = await db('volunteer_content').upsert(content as never)
  if (error) throw error
}

export async function getTransparencyContent(): Promise<TransparencyContent | null> {
  const { data } = await db('transparency_content')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as TransparencyContent | null
}

export async function upsertTransparencyContent(content: Partial<TransparencyContent>): Promise<void> {
  const { error } = await db('transparency_content').upsert(content as never)
  if (error) throw error
}

export async function getHeroContent(): Promise<HeroContent | null> {
  const { data } = await db('hero_content')
    .select('*')
    .eq('is_visible', true)
    .order('display_order', { ascending: true })
    .limit(1)
    .single()
  return data as HeroContent | null
}

export async function upsertHeroContent(content: Partial<HeroContent>): Promise<void> {
  const { error } = await db('hero_content').upsert(content as never)
  if (error) throw error
}

export async function getSectionVisibility(): Promise<SectionVisibility[]> {
  const { data } = await db('section_visibility')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data || []) as SectionVisibility[]
}

export async function getSectionVisibilityByKey(key: string): Promise<boolean> {
  const { data } = await db('section_visibility')
    .select('is_visible')
    .eq('section_key', key as never)
    .single()
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
    .select('*')
    .eq('image_key', imageKey)
    .single()
  return data as SiteImage | null
}

export async function getSiteImagesBySection(section: string): Promise<SiteImage[]> {
  const { data } = await db('site_images')
    .select('*')
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
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data as FooterContent | null
}

export async function upsertFooterContent(content: Partial<FooterContent>): Promise<void> {
  const { error } = await db('footer_content').upsert(content as never)
  if (error) throw error
}

export async function getSeoContent(pageSlug: string): Promise<SeoContent | null> {
  const { data } = await db('seo_content')
    .select('*')
    .eq('page_slug', pageSlug)
    .eq('is_published', true)
    .single()
  return data as SeoContent | null
}

export async function upsertSeoContent(content: Partial<SeoContent>): Promise<void> {
  const { error } = await db('seo_content').upsert(content as never)
  if (error) throw error
}

export async function getPageHeader(pageSlug: string): Promise<PageHeader | null> {
  const { data } = await db('page_headers')
    .select('*')
    .eq('page_slug', pageSlug)
    .eq('is_visible', true)
    .single()
  return data as PageHeader | null
}

export async function upsertPageHeader(header: Partial<PageHeader>): Promise<void> {
  const { error } = await db('page_headers').upsert(header as never)
  if (error) throw error
}

export async function getSectionContent(sectionKey: string): Promise<SectionContent | null> {
  const { data } = await db('section_content')
    .select('*')
    .eq('section_key', sectionKey)
    .eq('is_visible', true)
    .single()
  return data as SectionContent | null
}

export async function upsertSectionContent(content: Partial<SectionContent>): Promise<void> {
  const { error } = await db('section_content').upsert(content as never)
  if (error) throw error
}

export async function getAllCmsStrings(): Promise<CmsStringMap> {
  const { data } = await db('cms_strings')
    .select('key, value')
    .eq('is_published', true)
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
    .single()
  if (!data) return null
  return (data as { value: string }).value
}

export async function upsertCmsString(stringData: { key: string; value: string; page_slug?: string; category?: string }): Promise<void> {
  const { error } = await db('cms_strings').upsert(stringData as never)
  if (error) throw error
}
