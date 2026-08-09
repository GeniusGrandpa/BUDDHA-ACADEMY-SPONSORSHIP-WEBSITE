import { getSupabaseClient } from '../lib/supabase'
import { isPreviewMode } from '../lib/preview-mode'
import { requireRole } from '../lib/auth/secureService'
import type { News } from '../types/database'
import { getLocalizedContent } from './content-localization'
const supabase = getSupabaseClient()

export async function getNews(category?: string, language = 'en'): Promise<News[]> {
  let query = supabase
    .from('news')
    .select('id, slug, title, title_ne, excerpt, excerpt_ne, content, content_ne, image_url, category, tags, published, published_at, updated_by, created_at, updated_at')
    .order('published_at', { ascending: false })

  if (!isPreviewMode()) {
    query = query.eq('published', true)
  }

  if (category && category !== 'all') {
    query = query.eq('category', category as News['category'])
  }

  const { data, error } = await query
  if (error) throw error
  return Promise.all((data || []).map((article) => getLocalizedContent('news', article.id, language, async () => article) as Promise<News>))
}

export async function getNewsById(id: string, language = 'en'): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('id, slug, title, title_ne, excerpt, excerpt_ne, content, content_ne, image_url, category, tags, published, published_at, updated_by, created_at, updated_at')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return getLocalizedContent('news', id, language, async () => data)
}

export async function createNews(article: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
  await requireRole(['admin', 'super_admin'])

  const { data, error } = await supabase
    .from('news')
    .insert(article)
    .select('id, slug, title, title_ne, excerpt, excerpt_ne, content, content_ne, image_url, category, tags, published, published_at, updated_by, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function updateNews(id: string, updates: Partial<News>): Promise<News> {
  await requireRole(['admin', 'super_admin'])

  const { data, error } = await supabase
    .from('news')
    .update(updates)
    .eq('id', id)
    .select('id, slug, title, title_ne, excerpt, excerpt_ne, content, content_ne, image_url, category, tags, published, published_at, updated_by, created_at, updated_at')
    .single()

  if (error) throw error
  return data
}

export async function deleteNews(id: string): Promise<void> {
  await requireRole(['admin', 'super_admin'])

  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) throw error
}
