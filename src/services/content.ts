import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type {
  Page, HomepageSection, Video, Faq, StudentStory, MediaItem,
  GalleryItem, Testimonial, News, Json,
} from '../types/database'
import type { ContentVersion } from '../types/database'
import type { PageBlock, SeoMetadata } from '../types/cms'
const supabase = getSupabaseClient()

export async function getPages(): Promise<Page[]> {
  const { data, error } = await supabase.from('pages').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data
}

export async function upsertPage(page: {
  slug: string
  title: string
  content: Record<string, unknown>
  published?: boolean
  blocks?: PageBlock[]
  seo?: SeoMetadata
}): Promise<Page> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const existing = await getPageBySlug(page.slug)

  if (existing) {
    const { data, error } = await supabase
      .from('pages')
      .update({
        title: page.title,
        content: page.content as Json,
        published: page.published ?? existing?.published ?? false,
        updated_by: userId,
        ...(page.blocks ? { blocks: page.blocks as unknown as Json } : {}),
        ...(page.seo ? { seo: page.seo as unknown as Json } : {}),
      })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    await logAuditEvent({ action: `Updated page: ${page.slug}`, entityType: 'pages', entityId: existing.id })
    return data
  }

  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug: page.slug,
      title: page.title,
      content: page.content as Json,
      published: page.published ?? false,
      updated_by: userId,
      ...(page.blocks ? { blocks: page.blocks as unknown as Json } : {}),
      ...(page.seo ? { seo: page.seo as unknown as Json } : {}),
    })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created page: ${page.slug}`, entityType: 'pages', entityId: data.id })
  return data
}

export async function updatePagePublished(slug: string, published: boolean): Promise<Page> {
  const page = await getPageBySlug(slug)
  if (!page) throw new Error('Page not found')
  const { data, error } = await supabase
    .from('pages')
    .update({ published })
    .eq('id', page.id)
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `${published ? 'Published' : 'Unpublished'} page: ${slug}`, entityType: 'pages', entityId: page.id })
  return data
}

export async function deletePage(slug: string): Promise<void> {
  const page = await getPageBySlug(slug)
  if (!page) throw new Error('Page not found')
  const { error } = await supabase.from('pages').delete().eq('id', page.id)
  if (error) throw error
  await logAuditEvent({ action: `Deleted page: ${slug}`, entityType: 'pages', entityId: page.id })
}

export async function getHomepageSections(): Promise<HomepageSection[]> {
  const { data, error } = await supabase.from('homepage_sections').select('*').order('sort_order', { ascending: true })
  if (error) throw error
  return data || []
}

export async function getHomepageSection(key: string): Promise<HomepageSection | null> {
  const { data, error } = await supabase.from('homepage_sections').select('*').eq('section_key', key).maybeSingle()
  if (error) throw error
  return data
}

export async function updateHomepageSection(id: string, updates: Partial<HomepageSection>): Promise<HomepageSection> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('homepage_sections')
    .update({ ...updates, updated_by: userId })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Updated homepage section: ${data.section_key}`, entityType: 'homepage_sections', entityId: id })
  return data
}

export async function getVideos(featuredOnly?: boolean): Promise<Video[]> {
  let query = supabase.from('videos').select('*').order('created_at', { ascending: false })
  if (featuredOnly) query = query.eq('is_featured', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getVideoById(id: string): Promise<Video | null> {
  const { data, error } = await supabase.from('videos').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createVideo(video: Omit<Video, 'id' | 'created_at' | 'updated_at'>): Promise<Video> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('videos')
    .insert({ ...video, uploaded_by: userId })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created video: ${data.title}`, entityType: 'videos', entityId: data.id })
  return data
}

export async function updateVideo(id: string, updates: Partial<Video>): Promise<Video> {
  const { data, error } = await supabase.from('videos').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated video: ${data.title}`, entityType: 'videos', entityId: id })
  return data
}

export async function deleteGalleryItem(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted gallery item: ${id}`, entityType: 'gallery_items', entityId: id })
  const { error } = await supabase.from('gallery_items').delete().eq('id', id)
  if (error) throw error
}

export async function deleteVideo(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted video: ${id}`, entityType: 'videos', entityId: id })
  const { error } = await supabase.from('videos').delete().eq('id', id)
  if (error) throw error
}

export async function getFaqs(publishedOnly?: boolean): Promise<Faq[]> {
  let query = supabase.from('faqs').select('*').order('sort_order', { ascending: true })
  if (publishedOnly) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getFaqById(id: string): Promise<Faq | null> {
  const { data, error } = await supabase.from('faqs').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createFaq(faq: Omit<Faq, 'id' | 'created_at' | 'updated_at'>): Promise<Faq> {
  const { data, error } = await supabase.from('faqs').insert(faq).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Created FAQ: ${faq.question.substring(0, 50)}`, entityType: 'faqs', entityId: data.id })
  return data
}

export async function updateFaq(id: string, updates: Partial<Faq>): Promise<Faq> {
  const { data, error } = await supabase.from('faqs').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated FAQ: ${data.question.substring(0, 50)}`, entityType: 'faqs', entityId: id })
  return data
}

export async function deleteFaq(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted FAQ: ${id}`, entityType: 'faqs', entityId: id })
  const { error } = await supabase.from('faqs').delete().eq('id', id)
  if (error) throw error
}

export async function reorderFaqs(items: { id: string; sort_order: number }[]): Promise<void> {
  for (const item of items) {
    await supabase.from('faqs').update({ sort_order: item.sort_order }).eq('id', item.id)
  }
}

export async function getStudentStories(publishedOnly?: boolean): Promise<StudentStory[]> {
  let query = supabase.from('student_stories').select('*').order('created_at', { ascending: false })
  if (publishedOnly) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getStudentStoryById(id: string): Promise<StudentStory | null> {
  const { data, error } = await supabase.from('student_stories').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createStudentStory(story: Omit<StudentStory, 'id' | 'created_at' | 'updated_at'>): Promise<StudentStory> {
  const { data, error } = await supabase.from('student_stories').insert(story).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Created student story: ${data.title}`, entityType: 'student_stories', entityId: data.id })
  return data
}

export async function updateStudentStory(id: string, updates: Partial<StudentStory>): Promise<StudentStory> {
  const { data, error } = await supabase.from('student_stories').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated student story: ${data.title}`, entityType: 'student_stories', entityId: id })
  return data
}

export async function deleteStudentStory(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted student story: ${id}`, entityType: 'student_stories', entityId: id })
  const { error } = await supabase.from('student_stories').delete().eq('id', id)
  if (error) throw error
}

export async function getMedia(publishedOnly?: boolean): Promise<MediaItem[]> {
  let query = supabase.from('media_library').select('*').order('created_at', { ascending: false })
  if (publishedOnly) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function uploadMedia(file: File, altText?: string, folder?: string): Promise<MediaItem> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const folderPath = folder && folder !== '/' ? `${folder}/` : ''
  const filePath = `cms/${folderPath}${Date.now()}_${safeName}`

  const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  })
  if (uploadError) throw uploadError

  const { data: urlData } = supabase.storage.from('media').getPublicUrl(filePath)
  const url = urlData.publicUrl

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'application/pdf']
  const mimeType = validTypes.includes(file.type) ? file.type : 'application/octet-stream'

  const { data, error } = await supabase
    .from('media_library')
    .insert({
      url,
      file_name: safeName,
      file_size: file.size,
      mime_type: mimeType,
      alt_text: altText || null,
      folder: folder || '/',
      uploaded_by: userId,
    })
    .select()
    .single()
  if (error) throw error

  await logAuditEvent({ action: `Uploaded media: ${safeName}`, entityType: 'media_library', entityId: data.id })
  return data
}

export async function updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  const { data, error } = await supabase
    .from('media_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteMedia(id: string, url: string): Promise<void> {
  const pathMatch = url.match(/\/media\/(.+)$/)
  if (pathMatch) {
    await supabase.storage.from('media').remove([pathMatch[1]])
  }
  await logAuditEvent({ action: `Deleted media: ${id}`, entityType: 'media_library', entityId: id })
  const { error } = await supabase.from('media_library').delete().eq('id', id)
  if (error) throw error
}

export async function getGalleryItemsWithCategory(category?: string, publishedOnly = true): Promise<GalleryItem[]> {
  let query = supabase.from('gallery_items').select('*').order('created_at', { ascending: false })
  if (category && category !== 'all') query = query.eq('category', category)
  if (publishedOnly) query = query.eq('is_published', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createGalleryItemWithCategory(
  item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>
): Promise<GalleryItem> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('gallery_items')
    .insert({ ...item, uploaded_by: userId })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created gallery item: ${data.title}`, entityType: 'gallery_items', entityId: data.id })
  return data
}

export async function updateGalleryItemWithCategory(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const { data, error } = await supabase.from('gallery_items').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated gallery item: ${data.title}`, entityType: 'gallery_items', entityId: id })
  return data
}

export async function getAllNews(includeUnpublished?: boolean): Promise<News[]> {
  let query = supabase.from('news').select('*').order('created_at', { ascending: false })
  if (!includeUnpublished) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createNewsWithAuthor(article: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const slug = article.slug || article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const { data, error } = await supabase
    .from('news')
    .insert({ ...article, slug, updated_by: userId })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created news: ${data.title}`, entityType: 'news', entityId: data.id })
  return data
}

export async function updateNewsWithAuthor(id: string, updates: Partial<News>): Promise<News> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('news')
    .update({ ...updates, updated_by: userId })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Updated news: ${data.title}`, entityType: 'news', entityId: id })
  return data
}

export async function getTestimonialsWithType(type?: string): Promise<Testimonial[]> {
  let query = supabase.from('testimonials').select('*').order('sort_order', { ascending: true })
  if (type && type !== 'all') query = query.eq('testimonial_type', type as Testimonial['testimonial_type'])
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function createTestimonial(item: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>): Promise<Testimonial> {
  const { data, error } = await supabase.from('testimonials').insert(item).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Created testimonial: ${data.author_name}`, entityType: 'testimonials', entityId: data.id })
  return data
}

export async function updateTestimonial(id: string, updates: Partial<Testimonial>): Promise<Testimonial> {
  const { data, error } = await supabase.from('testimonials').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated testimonial: ${data.author_name}`, entityType: 'testimonials', entityId: id })
  return data
}

export async function deleteTestimonial(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted testimonial: ${id}`, entityType: 'testimonials', entityId: id })
  const { error } = await supabase.from('testimonials').delete().eq('id', id)
  if (error) throw error
}

export async function getContentVersions(
  entityType: string,
  entityId: string
): Promise<ContentVersion[]> {
  const { data, error } = await supabase
    .from('content_versions')
    .select('*')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('version_number', { ascending: false })
  if (error) throw error
  return data || []
}

export async function getAllContentVersions(
  entityType?: string
): Promise<ContentVersion[]> {
  let query = supabase.from('content_versions').select('*').order('created_at', { ascending: false })
  if (entityType) query = query.eq('entity_type', entityType)
  const { data, error } = await query.limit(100)
  if (error) throw error
  return data || []
}

export async function restoreContentVersion(
  versionId: string,
  notes?: string
): Promise<ContentVersion> {
  const { data: version, error: fetchError } = await supabase
    .from('content_versions')
    .select('*')
    .eq('id', versionId)
    .single()
  if (fetchError) throw fetchError

  if (version.entity_type === 'pages') {
    const { error: pageError } = await supabase
      .from('pages')
      .select('id')
      .eq('id', version.entity_id)
      .single()
    if (pageError) throw pageError

    const { error: updateError } = await supabase
      .from('pages')
      .update({ content: version.content as Json, updated_by: (await supabase.auth.getSession()).data.session?.user?.id })
      .eq('id', version.entity_id)
    if (updateError) throw updateError
  }

  const { data, error } = await supabase
    .from('content_versions')
    .update({ restored_at: new Date().toISOString(), restore_notes: notes || 'Restored via admin panel' })
    .eq('id', versionId)
    .select()
    .single()
  if (error) throw error

  await logAuditEvent({ action: `Restored version ${version.version_number} for ${version.entity_type}`, entityType: 'content_versions', entityId: versionId })
  return data
}

export async function getContentAnalytics(): Promise<{
  total_pages: number
  published_pages: number
  total_news: number
  published_news: number
  total_faqs: number
  published_faqs: number
  total_testimonials: number
  published_testimonials: number
}> {
  const [pagesResult, newsResult, faqsResult, testimonialsResult] = await Promise.all([
    supabase.from('pages').select('id, published', { count: 'exact' }),
    supabase.from('news').select('id, published', { count: 'exact' }),
    supabase.from('faqs').select('id, is_published', { count: 'exact' }),
    supabase.from('testimonials').select('id, is_published', { count: 'exact' }),
  ])

  return {
    total_pages: pagesResult.count || 0,
    published_pages: pagesResult.data?.filter((p) => p.published).length || 0,
    total_news: newsResult.count || 0,
    published_news: newsResult.data?.filter((n) => n.published).length || 0,
    total_faqs: faqsResult.count || 0,
    published_faqs: faqsResult.data?.filter((f) => f.is_published).length || 0,
    total_testimonials: testimonialsResult.count || 0,
    published_testimonials: testimonialsResult.data?.filter((t) => t.is_published).length || 0,
  }
}
