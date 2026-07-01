import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { Announcement } from '../types/cms'

const supabase = getSupabaseClient()

export async function getAnnouncements(activeOnly?: boolean): Promise<Announcement[]> {
  let query = supabase.from('announcements').select('id, title, content, type, link_url, link_text, is_active, is_dismissible, starts_at, ends_at, sort_order, created_by, created_at, updated_at').order('sort_order', { ascending: true })
  if (activeOnly) {
    const now = new Date().toISOString()
    query = query.eq('is_active', true).or(`starts_at.is.null,starts_at.lte.${now}`).or(`ends_at.is.null,ends_at.gte.${now}`)
  }
  const { data, error } = await query
  if (error) throw error
  return (data || []) as Announcement[]
}

export async function getAnnouncementById(id: string): Promise<Announcement | null> {
  const { data, error } = await supabase.from('announcements').select('id, title, content, type, link_url, link_text, is_active, is_dismissible, starts_at, ends_at, sort_order, created_by, created_at, updated_at').eq('id', id).maybeSingle()
  if (error) throw error
  return data as Announcement | null
}

export async function createAnnouncement(item: Omit<Announcement, 'id' | 'created_at' | 'updated_at'>): Promise<Announcement> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase.from('announcements').insert({ ...item, created_by: userId }).select('id, title, content, type, link_url, link_text, is_active, is_dismissible, starts_at, ends_at, sort_order, created_by, created_at, updated_at').single()
  if (error) throw error
  await logAuditEvent({ action: `Created announcement: ${data.title}`, entityType: 'announcements', entityId: data.id })
  return data as Announcement
}

export async function updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<Announcement> {
  const { data, error } = await supabase.from('announcements').update(updates).eq('id', id).select('id, title, content, type, link_url, link_text, is_active, is_dismissible, starts_at, ends_at, sort_order, created_by, created_at, updated_at').single()
  if (error) throw error
  await logAuditEvent({ action: `Updated announcement: ${data.title}`, entityType: 'announcements', entityId: id })
  return data as Announcement
}

export async function deleteAnnouncement(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted announcement: ${id}`, entityType: 'announcements', entityId: id })
  const { error } = await supabase.from('announcements').delete().eq('id', id)
  if (error) throw error
}
