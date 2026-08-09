import { getSupabaseClient } from '../lib/supabase'
import { isPreviewMode } from '../lib/preview-mode'
import type { GalleryItem } from '../types/database'
import { getLocalizedContent } from './content-localization'
const supabase = getSupabaseClient()

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

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert(item)
    .select('id, type, title, title_ne, caption, caption_ne, url, thumbnail_url, author, author_ne, category, is_featured, is_published, uploaded_by, created_at, updated_at')
    .single()

  if (error) throw error
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
  const { error } = await supabase
    .from('gallery_items')
    .delete()
    .eq('id', id)

  if (error) throw error
}
