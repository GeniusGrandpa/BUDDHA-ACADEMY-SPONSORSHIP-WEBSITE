import { getSupabaseClient } from '../lib/supabase'
import type { News } from '../types/database'
const supabase = getSupabaseClient()

export async function getNews(category?: string): Promise<News[]> {
  let query = supabase
    .from('news')
    .select('*')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (category && category !== 'all') {
    query = query.eq('category', category)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

export async function getNewsById(id: string): Promise<News | null> {
  const { data, error } = await supabase
    .from('news')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function createNews(article: Omit<News, 'id' | 'created_at' | 'updated_at'>): Promise<News> {
  const { data, error } = await supabase
    .from('news')
    .insert(article)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateNews(id: string, updates: Partial<News>): Promise<News> {
  const { data, error } = await supabase
    .from('news')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase
    .from('news')
    .delete()
    .eq('id', id)

  if (error) throw error
}
