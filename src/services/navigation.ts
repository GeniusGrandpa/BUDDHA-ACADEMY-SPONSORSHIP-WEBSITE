import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import { getContentTranslations } from './content-localization'
import type { NavigationItem, NavigationLocation } from '../types/cms'

const supabase = getSupabaseClient()

function localizeNavLabel(item: NavigationItem, overrides: Record<string, string>): NavigationItem {
  const label = overrides[item.id] ?? overrides[item.route ?? item.url ?? '']
  return label ? { ...item, label } : item
}

export async function getNavigationItems(location?: NavigationLocation, language?: string): Promise<NavigationItem[]> {
  let query = supabase
    .from('navigation_items')
    .select('id, label, url, route, location, parent_id, sort_order, is_visible, is_cta, cta_style, target')
    .order('sort_order', { ascending: true })
  if (location) query = query.eq('location', location)
  const { data, error } = await query
  if (error) throw error
  const items = (data || []) as NavigationItem[]
  if (!language || language === 'en') return items
  const overrides = await getContentTranslations('navigation_items', 'labels', language)
  return items.map((item) => localizeNavLabel(item, overrides))
}

export async function getNavigationItemById(id: string): Promise<NavigationItem | null> {
  const { data, error } = await supabase.from('navigation_items').select('id, label, url, route, location, parent_id, sort_order, is_visible, is_cta, cta_style, target').eq('id', id).maybeSingle()
  if (error) throw error
  return data as NavigationItem | null
}

export async function createNavigationItem(item: Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'>): Promise<NavigationItem> {
  const { data, error } = await supabase.from('navigation_items').insert(item).select('id, label, url, route, location, parent_id, sort_order, is_visible, is_cta, cta_style, target').single()
  if (error) throw error
  await logAuditEvent({ action: `Created navigation item: ${data.label}`, entityType: 'navigation_items', entityId: data.id })
  return data as NavigationItem
}

export async function updateNavigationItem(id: string, updates: Partial<NavigationItem>): Promise<NavigationItem> {
  const { data, error } = await supabase.from('navigation_items').update(updates).eq('id', id).select('id, label, url, route, location, parent_id, sort_order, is_visible, is_cta, cta_style, target').single()
  if (error) throw error
  await logAuditEvent({ action: `Updated navigation item: ${data.label}`, entityType: 'navigation_items', entityId: id })
  return data as NavigationItem
}

export async function deleteNavigationItem(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted navigation item: ${id}`, entityType: 'navigation_items', entityId: id })
  const { error } = await supabase.from('navigation_items').delete().eq('id', id)
  if (error) throw error
}

export async function reorderNavigationItems(items: { id: string; sort_order: number }[]): Promise<void> {
  for (const item of items) {
    await supabase.from('navigation_items').update({ sort_order: item.sort_order }).eq('id', item.id)
  }
}

export async function buildNavigationTree(items: NavigationItem[]): Promise<(NavigationItem & { children: NavigationItem[] })[]> {
  const topLevel = items.filter(i => !i.parent_id)
  const children = items.filter(i => i.parent_id)
  return topLevel.map(item => ({
    ...item,
    children: children.filter(c => c.parent_id === item.id).sort((a, b) => a.sort_order - b.sort_order),
  }))
}
