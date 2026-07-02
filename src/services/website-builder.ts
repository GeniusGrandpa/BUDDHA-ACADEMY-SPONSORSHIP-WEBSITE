import { supabase } from '../lib/supabase'
import type { WebsitePage, WebsiteSection, WebsiteContentBlock, WebsiteMedia, WebsitePageVersion, PageStatus, SectionSettings } from '../types/website-builder'

function db(table: string) {
  return supabase.from(table as never)
}

const PAGE_COLUMNS = 'id, slug, title, status, meta_title, meta_description, hero_background_image, hero_overlay_color, hero_overlay_opacity, layout_settings, is_draft, published_version_id, updated_by, created_at, updated_at'
const SECTION_COLUMNS = 'id, page_id, section_key, section_type, title, subtitle, description, content, settings, is_visible, is_draft, updated_by, sort_order, created_at, updated_at'
const BLOCK_COLUMNS = 'id, section_id, block_type, title, content, settings, sort_order, is_visible, created_at, updated_at'
const MEDIA_COLUMNS = 'id, file_url, file_name, file_size, mime_type, alt_text, width, height, uploaded_by, created_at'
const VERSION_COLUMNS = 'id, page_id, version_number, status, snapshot, created_by, created_at'

export async function fetchAllPages(): Promise<WebsitePage[]> {
  const { data, error } = await db('website_pages')
    .select(PAGE_COLUMNS)
    .order('updated_at' as never, { ascending: false } as never)
  if (error) throw error
  return (data || []) as unknown as WebsitePage[]
}

export async function fetchPageBySlug(slug: string): Promise<WebsitePage | null> {
  const { data, error } = await db('website_pages')
    .select(PAGE_COLUMNS)
    .eq('slug' as never, slug as never)
    .maybeSingle()
  if (error) throw error
  return data as unknown as WebsitePage | null
}

export async function fetchPageById(id: string): Promise<WebsitePage | null> {
  const { data, error } = await db('website_pages')
    .select(PAGE_COLUMNS)
    .eq('id' as never, id as never)
    .maybeSingle()
  if (error) throw error
  return data as unknown as WebsitePage | null
}

export async function createPage(page: Partial<WebsitePage>): Promise<WebsitePage> {
  const { data, error } = await db('website_pages')
    .insert(page as never)
    .select(PAGE_COLUMNS)
    .single()
  if (error) throw error
  return data as unknown as WebsitePage
}

export async function updatePage(id: string, updates: Partial<WebsitePage>): Promise<void> {
  const { error } = await db('website_pages')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function updatePageStatus(id: string, status: PageStatus): Promise<void> {
  const { error } = await db('website_pages')
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await db('website_pages').delete().eq('id' as never, id as never)
  if (error) throw error
}

export async function fetchSectionsByPage(pageId: string): Promise<WebsiteSection[]> {
  const { data, error } = await db('website_sections')
    .select(SECTION_COLUMNS)
    .eq('page_id' as never, pageId as never)
    .order('sort_order' as never, { ascending: true } as never)
  if (error) throw error
  return (data || []) as unknown as WebsiteSection[]
}

export async function fetchSectionById(id: string): Promise<WebsiteSection | null> {
  const { data, error } = await db('website_sections')
    .select(SECTION_COLUMNS)
    .eq('id' as never, id as never)
    .maybeSingle()
  if (error) throw error
  return data as unknown as WebsiteSection | null
}

export async function upsertSection(section: Partial<WebsiteSection>): Promise<WebsiteSection> {
  const { data, error } = await db('website_sections')
    .upsert(section as never)
    .select(SECTION_COLUMNS)
    .single()
  if (error) throw error
  return data as unknown as WebsiteSection
}

export async function updateSection(id: string, updates: Partial<WebsiteSection>): Promise<void> {
  const { error } = await db('website_sections')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function updateSectionSettings(id: string, settings: SectionSettings): Promise<void> {
  const { error } = await db('website_sections')
    .update({ settings: settings as never, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function updateSectionVisibility(id: string, isVisible: boolean): Promise<void> {
  const { error } = await db('website_sections')
    .update({ is_visible: isVisible, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function reorderSections(_pageId: string, sectionIds: string[]): Promise<void> {
  for (let i = 0; i < sectionIds.length; i++) {
    const { error } = await db('website_sections')
      .update({ sort_order: i, updated_at: new Date().toISOString() } as never)
      .eq('id' as never, sectionIds[i] as never)
    if (error) throw error
  }
}

export async function deleteSection(id: string): Promise<void> {
  const { error } = await db('website_sections').delete().eq('id' as never, id as never)
  if (error) throw error
}

export async function fetchBlocksBySection(sectionId: string): Promise<WebsiteContentBlock[]> {
  const { data, error } = await db('website_content_blocks')
    .select(BLOCK_COLUMNS)
    .eq('section_id' as never, sectionId as never)
    .order('sort_order' as never, { ascending: true } as never)
  if (error) throw error
  return (data || []) as unknown as WebsiteContentBlock[]
}

export async function upsertBlock(block: Partial<WebsiteContentBlock>): Promise<WebsiteContentBlock> {
  const { data, error } = await db('website_content_blocks')
    .upsert(block as never)
    .select(BLOCK_COLUMNS)
    .single()
  if (error) throw error
  return data as unknown as WebsiteContentBlock
}

export async function updateBlock(id: string, updates: Partial<WebsiteContentBlock>): Promise<void> {
  const { error } = await db('website_content_blocks')
    .update({ ...updates, updated_at: new Date().toISOString() } as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function deleteBlock(id: string): Promise<void> {
  const { error } = await db('website_content_blocks').delete().eq('id' as never, id as never)
  if (error) throw error
}

export async function reorderBlocks(_sectionId: string, blockIds: string[]): Promise<void> {
  for (let i = 0; i < blockIds.length; i++) {
    const { error } = await db('website_content_blocks')
      .update({ sort_order: i, updated_at: new Date().toISOString() } as never)
      .eq('id' as never, blockIds[i] as never)
    if (error) throw error
  }
}

export async function fetchMedia(page = 1, perPage = 50): Promise<WebsiteMedia[]> {
  const from = (page - 1) * perPage
  const to = from + perPage - 1
  const { data, error } = await db('website_media')
    .select(MEDIA_COLUMNS)
    .order('created_at' as never, { ascending: false } as never)
    .range(from, to)
  if (error) throw error
  return (data || []) as unknown as WebsiteMedia[]
}

export async function fetchMediaById(id: string): Promise<WebsiteMedia | null> {
  const { data, error } = await db('website_media')
    .select(MEDIA_COLUMNS)
    .eq('id' as never, id as never)
    .maybeSingle()
  if (error) throw error
  return data as unknown as WebsiteMedia | null
}

export async function createMedia(media: Partial<WebsiteMedia>): Promise<WebsiteMedia> {
  const { data, error } = await db('website_media')
    .insert(media as never)
    .select(MEDIA_COLUMNS)
    .single()
  if (error) throw error
  return data as unknown as WebsiteMedia
}

export async function updateMedia(id: string, updates: Partial<WebsiteMedia>): Promise<void> {
  const { error } = await db('website_media')
    .update(updates as never)
    .eq('id' as never, id as never)
  if (error) throw error
}

export async function deleteMedia(id: string): Promise<void> {
  const { error } = await db('website_media').delete().eq('id' as never, id as never)
  if (error) throw error
}

export async function uploadImage(file: File, _onProgress?: (pct: number) => void): Promise<WebsiteMedia> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`
  const filePath = `website/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    })

  if (uploadError) {
    if (uploadError.message.includes('bucket')) {
      await supabase.storage.createBucket('media', { public: true })
      const { error: retryError } = await supabase.storage
        .from('media')
        .upload(filePath, file)
      if (retryError) throw retryError
    } else {
      throw uploadError
    }
  }

  const { data: urlData } = supabase.storage
    .from('media')
    .getPublicUrl(filePath)

  const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || ''
  const publicUrl = urlData?.publicUrl || `${supabaseUrl}/storage/v1/object/public/media/${filePath}`

  const mediaItem = await createMedia({
    file_url: publicUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    alt_text: file.name,
  })

  if (_onProgress) _onProgress(100)
  return mediaItem
}

export async function fetchVersionsByPage(pageId: string): Promise<WebsitePageVersion[]> {
  const { data, error } = await db('website_page_versions')
    .select(VERSION_COLUMNS)
    .eq('page_id' as never, pageId as never)
    .order('version_number' as never, { ascending: false } as never)
  if (error) throw error
  return (data || []) as unknown as WebsitePageVersion[]
}

export async function createVersion(pageId: string): Promise<WebsitePageVersion> {
  const page = await fetchPageById(pageId)
  if (!page) throw new Error('Page not found')
  const sections = await fetchSectionsByPage(pageId)
  for (const section of sections) {
    const blocks = await fetchBlocksBySection(section.id)
    section.blocks = blocks
  }

  const { data: maxVer } = await db('website_page_versions')
    .select('version_number')
    .eq('page_id' as never, pageId as never)
    .order('version_number' as never, { ascending: false } as never)
    .limit(1)

  const versionNumber = (maxVer?.[0] as { version_number: number } | undefined)?.version_number ?? 0

  const snapshot = {
    page: { ...page, sections: undefined },
    sections: JSON.parse(JSON.stringify(sections)),
  }

  const { data, error } = await db('website_page_versions')
    .insert({
      page_id: pageId,
      version_number: versionNumber + 1,
      status: 'draft',
      snapshot: snapshot as never,
    } as never)
    .select(VERSION_COLUMNS)
    .single()

  if (error) throw error
  return data as unknown as WebsitePageVersion
}

export async function publishPage(pageId: string): Promise<void> {
  const version = await createVersion(pageId)
  await db('website_page_versions')
    .update({ status: 'published' } as never)
    .eq('id' as never, version.id as never)
  await updatePage(pageId, { status: 'published', is_draft: false, published_version_id: version.id })
}

export interface PageWithSections {
  page: WebsitePage
  sections: WebsiteSection[]
}

export interface FetchPageOptions {

  publicOnly?: boolean
}

function filterPublicSections(sections: WebsiteSection[]): WebsiteSection[] {
  return sections
    .filter(s => s.is_visible && !s.is_draft)
    .map(s => ({
      ...s,
      blocks: (s.blocks || []).filter(b => b.is_visible),
    }))
}

async function loadPageSections(pageId: string): Promise<WebsiteSection[]> {
  const sections = await fetchSectionsByPage(pageId)
  for (const section of sections) {
    const blocks = await fetchBlocksBySection(section.id)
    section.blocks = blocks
  }
  return sections
}

export async function fetchFullPageBySlug(slug: string, options: FetchPageOptions = {}): Promise<PageWithSections | null> {
  const page = await fetchPageBySlug(slug)
  if (!page) return null
  if (options.publicOnly && page.status !== 'published') return null

  let sections = await loadPageSections(page.id)
  if (options.publicOnly) {
    sections = filterPublicSections(sections)
  }
  return { page, sections }
}

export async function fetchPublicPageBySlug(slug: string): Promise<PageWithSections | null> {
  return fetchFullPageBySlug(slug, { publicOnly: true })
}

export async function fetchFullPageById(id: string): Promise<PageWithSections | null> {
  const page = await fetchPageById(id)
  if (!page) return null
  const sections = await loadPageSections(page.id)
  return { page, sections }
}

export async function fetchAllFullPages(): Promise<PageWithSections[]> {
  const pages = await fetchAllPages()
  const result: PageWithSections[] = []
  for (const page of pages) {
    const sections = await fetchSectionsByPage(page.id)
    result.push({ page, sections })
  }
  return result
}

const DEFAULT_SECTIONS: Record<string, { section_key: string; section_type: string; title: string; subtitle?: string }[]> = {
  home: [
    { section_key: 'hero', section_type: 'hero', title: 'Hero Banner' },
    { section_key: 'welcome', section_type: 'welcome', title: 'Welcome', subtitle: 'Welcome to Buddha Academy' },
    { section_key: 'stats', section_type: 'stats', title: 'Statistics' },
    { section_key: 'featured_students', section_type: 'featured_students', title: 'Featured Students' },
    { section_key: 'testimonials', section_type: 'testimonials', title: 'Testimonials' },
    { section_key: 'donation_cta', section_type: 'donation_cta', title: 'Donation Call to Action' },
  ],
  about: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'about_mission', section_type: 'about_mission', title: 'Mission & Vision' },
    { section_key: 'about_values', section_type: 'about_values', title: 'Core Values' },
    { section_key: 'about_timeline', section_type: 'about_timeline', title: 'History Timeline' },
    { section_key: 'about_stats', section_type: 'about_stats', title: 'About Statistics' },
    { section_key: 'about_cta', section_type: 'about_cta', title: 'About CTA' },
  ],
  sponsor: [
    { section_key: 'sponsor_hero', section_type: 'sponsor_hero', title: 'Sponsorship Banner' },
    { section_key: 'sponsor_steps', section_type: 'sponsor_steps', title: 'How to Sponsor' },
    { section_key: 'sponsor_benefits', section_type: 'sponsor_benefits', title: 'Sponsorship Benefits' },
    { section_key: 'sponsor_cta', section_type: 'sponsor_cta', title: 'Sponsorship CTA' },
  ],
  students: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'students_grid', section_type: 'students_grid', title: 'Student Profiles' },
  ],
  donate: [
    { section_key: 'donate_hero', section_type: 'donate_hero', title: 'Donation Banner' },
    { section_key: 'donate_impact', section_type: 'donate_impact', title: 'Impact Cards' },
    { section_key: 'donate_process', section_type: 'donate_process', title: 'Donation Process' },
    { section_key: 'donation_form', section_type: 'donation_form', title: 'Donation Form' },
  ],
  gallery: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'gallery_grid', section_type: 'gallery_grid', title: 'Photo Gallery' },
  ],
  news: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'news_grid', section_type: 'news_grid', title: 'News Articles' },
  ],
  contact: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'contact_details', section_type: 'contact_details', title: 'Contact Information' },
    { section_key: 'contact_form', section_type: 'contact_form', title: 'Contact Form' },
  ],
  faq: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'faq_list', section_type: 'faq_list', title: 'FAQ List' },
  ],
  volunteer: [
    { section_key: 'volunteer_hero', section_type: 'volunteer_hero', title: 'Volunteer Banner' },
    { section_key: 'volunteer_opps', section_type: 'volunteer_opps', title: 'Opportunities' },
    { section_key: 'volunteer_form', section_type: 'volunteer_form', title: 'Application Form' },
  ],
  campaigns: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'campaigns_list', section_type: 'campaigns_list', title: 'Campaigns' },
  ],
  'success-stories': [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'success_stories', section_type: 'success_stories', title: 'Success Stories' },
  ],
  activity: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'activity_feed', section_type: 'activity_feed', title: 'Activity Feed' },
  ],
  transparency: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'transparency_content', section_type: 'transparency_content', title: 'Transparency Content' },
  ],
  privacy: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'privacy_content', section_type: 'privacy_content', title: 'Privacy Policy Text' },
  ],
  terms: [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'terms_content', section_type: 'terms_content', title: 'Terms of Service Text' },
  ],
}

export async function createDefaultSections(pageId: string, slug: string): Promise<WebsiteSection[]> {
  const configs = DEFAULT_SECTIONS[slug] || [
    { section_key: 'page_header', section_type: 'page_header', title: 'Page Header' },
    { section_key: 'custom_content', section_type: 'custom_content', title: 'Content' },
  ]

  const sections: WebsiteSection[] = []
  for (let i = 0; i < configs.length; i++) {
    const cfg = configs[i]
    const { data, error } = await db('website_sections')
      .insert({
        page_id: pageId,
        section_key: cfg.section_key,
        section_type: cfg.section_type,
        title: cfg.title,
        subtitle: cfg.subtitle || null,
        sort_order: i,
        is_visible: true,
        settings: {} as never,
      } as never)
      .select(SECTION_COLUMNS)
      .single()

    if (!error && data) {
      const section = data as unknown as WebsiteSection
      section.blocks = []
      sections.push(section)
    }
  }

  return sections
}
