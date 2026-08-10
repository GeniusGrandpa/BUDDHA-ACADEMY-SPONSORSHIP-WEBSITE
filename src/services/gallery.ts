import { getSupabaseClient } from '../lib/supabase'
import { isPreviewMode } from '../lib/preview-mode'
import type { GalleryItem } from '../types/database'
import { getLocalizedContent } from './content-localization'
const supabase = getSupabaseClient()

const GALLERY_IMAGE_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const GALLERY_VIDEO_MIME = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
const GALLERY_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const GALLERY_VIDEO_EXTENSIONS = ['mp4', 'webm', 'ogv', 'ogg', 'mov']
const GALLERY_IMAGE_MAX_BYTES = 10 * 1024 * 1024
const GALLERY_VIDEO_MAX_BYTES = 50 * 1024 * 1024

export type GalleryMediaType = 'photo' | 'video'

export type GalleryValidationResult =
  | { ok: true; type: GalleryMediaType }
  | { ok: false; reason: 'type' | 'size'; type: GalleryMediaType }

export type GalleryItemCreateInput = {
  type: 'photo' | 'video' | 'testimonial'
  title: string
  title_ne?: string | null
  caption?: string | null
  caption_ne?: string | null
  author?: string | null
  author_ne?: string | null
  url: string
  thumbnail_url?: string | null
  category?: string
  is_featured?: boolean
  is_published?: boolean
}

function getFileExtension(file: File): string {
  const match = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match ? match[1] : ''
}

export function validateGalleryMedia(file: File): GalleryValidationResult {
  const type: GalleryMediaType = file.type.startsWith('video/') ? 'video' : 'photo'
  const allowedMime = type === 'video' ? GALLERY_VIDEO_MIME : GALLERY_IMAGE_MIME
  const allowedExt = type === 'video' ? GALLERY_VIDEO_EXTENSIONS : GALLERY_IMAGE_EXTENSIONS
  const ext = getFileExtension(file)
  if (!allowedMime.includes(file.type) || !allowedExt.includes(ext)) {
    return { ok: false, reason: 'type', type }
  }
  const maxBytes = type === 'video' ? GALLERY_VIDEO_MAX_BYTES : GALLERY_IMAGE_MAX_BYTES
  if (file.size > maxBytes) {
    return { ok: false, reason: 'size', type }
  }
  return { ok: true, type }
}

export async function uploadGalleryMedia(file: File): Promise<{ url: string; type: GalleryMediaType }> {
  const validation = validateGalleryMedia(file)
  if (!validation.ok) {
    throw new Error(validation.reason === 'size' ? 'GALLERY_FILE_TOO_LARGE' : 'GALLERY_FILE_TYPE_UNSUPPORTED')
  }
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const filePath = `${Date.now()}_${safeName}`
  const { error: uploadError } = await supabase.storage
    .from('gallery')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })
  if (uploadError) throw uploadError
  const { data: urlData } = supabase.storage.from('gallery').getPublicUrl(filePath)
  return { url: urlData.publicUrl, type: validation.type }
}

export async function deleteGalleryMedia(url: string): Promise<void> {
  const match = url.match(/\/gallery\/(.+)$/)
  if (!match) return
  await supabase.storage.from('gallery').remove([match[1]])
}

export async function getGalleryItems(options?: { type?: string; publishedOnly?: boolean; featuredOnly?: boolean; language?: string }): Promise<GalleryItem[]> {
  let query = supabase
    .from('gallery_items')
    .select('id, type, title, title_ne, caption, caption_ne, url, thumbnail_url, author, author_ne, category, is_featured, is_published, uploaded_by, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (options?.type && options.type !== 'all') {
    query = query.eq('type', options.type as GalleryItem['type'])
  }

  if (options?.publishedOnly && !isPreviewMode()) {
    query = query.eq('is_published', true)
  }

  if (options?.featuredOnly) {
    query = query.eq('is_featured', true)
  }

  const { data, error } = await query

  if (error) throw error
  return Promise.all((data || []).map((item) => getLocalizedContent('gallery_items', item.id, options?.language || 'en', async () => item) as Promise<GalleryItem>))
}

export async function createGalleryItem(
  input: GalleryItemCreateInput,
  files?: { file?: File; thumbnailFile?: File },
): Promise<GalleryItem> {
  const media = files?.file ? await uploadGalleryMedia(files.file) : null
  const thumbnailUrl = files?.thumbnailFile ? (await uploadGalleryMedia(files.thumbnailFile)).url : null
  const item = { ...input, url: media ? media.url : input.url, thumbnail_url: thumbnailUrl ?? input.thumbnail_url }
  const { data, error } = await supabase
    .from('gallery_items')
    .insert(item)
    .select('id, type, title, title_ne, caption, caption_ne, url, thumbnail_url, author, author_ne, category, is_featured, is_published, uploaded_by, created_at, updated_at')
    .single()

  if (error) {
    const uploaded: string[] = []
    if (media) uploaded.push(media.url)
    if (thumbnailUrl) uploaded.push(thumbnailUrl)
    await Promise.allSettled(uploaded.map((u) => deleteGalleryMedia(u)))
    throw error
  }
  return data
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select('id, type, title, title_ne, caption, caption_ne, url, thumbnail_url, author, author_ne, category, is_featured, is_published, uploaded_by, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function deleteGalleryItem(id: string): Promise<void> {
  const { data: existing } = await supabase
    .from('gallery_items')
    .select('url, thumbnail_url')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id)

  if (error) throw error
  const media: string[] = []
  if (existing?.url) media.push(existing.url)
  if (existing?.thumbnail_url) media.push(existing.thumbnail_url)
  await Promise.allSettled(media.map((u) => deleteGalleryMedia(u)))
}
