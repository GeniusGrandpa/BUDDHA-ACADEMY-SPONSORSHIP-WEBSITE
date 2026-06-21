import { getSupabaseClient } from '../lib/supabase'
import type { GalleryItem } from '../types/database'
const supabase = getSupabaseClient()

export async function getGalleryItems(options?: { type?: string; publishedOnly?: boolean; featuredOnly?: boolean }): Promise<GalleryItem[]> {
  let query = supabase
    .from('gallery_items')
    .select('*')
    .order('created_at', { ascending: false })

  if (options?.type && options.type !== 'all') {
    query = query.eq('type', options.type as GalleryItem['type'])
  }

  if (options?.publishedOnly) {
    query = query.eq('is_published', true)
  }

  if (options?.featuredOnly) {
    query = query.eq('is_featured', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function createGalleryItem(item: Omit<GalleryItem, 'id' | 'created_at' | 'updated_at'>): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .insert(item)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateGalleryItem(id: string, updates: Partial<GalleryItem>): Promise<GalleryItem> {
  const { data, error } = await supabase
    .from('gallery_items')
    .update(updates)
    .eq('id', id)
    .select()
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
