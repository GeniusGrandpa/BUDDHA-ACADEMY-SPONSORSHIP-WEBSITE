import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { Partner, PartnerType } from '../types/cms'

const supabase = getSupabaseClient()

export async function getPartners(type?: PartnerType, visibleOnly?: boolean): Promise<Partner[]> {
  let query = supabase.from('partners').select('*').order('sort_order', { ascending: true })
  if (type) query = query.eq('partner_type', type)
  if (visibleOnly) query = query.eq('is_visible', true)
  const { data, error } = await query
  if (error) throw error
  return data || []
}

export async function getPartnerById(id: string): Promise<Partner | null> {
  const { data, error } = await supabase.from('partners').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export async function createPartner(item: Omit<Partner, 'id' | 'created_at' | 'updated_at'>): Promise<Partner> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase.from('partners').insert({ ...item, created_by: userId }).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Created partner: ${data.name}`, entityType: 'partners', entityId: data.id })
  return data
}

export async function updatePartner(id: string, updates: Partial<Partner>): Promise<Partner> {
  const { data, error } = await supabase.from('partners').update(updates).eq('id', id).select().single()
  if (error) throw error
  await logAuditEvent({ action: `Updated partner: ${data.name}`, entityType: 'partners', entityId: id })
  return data
}

export async function deletePartner(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted partner: ${id}`, entityType: 'partners', entityId: id })
  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) throw error
}

export async function reorderPartners(items: { id: string; sort_order: number }[]): Promise<void> {
  for (const item of items) {
    await supabase.from('partners').update({ sort_order: item.sort_order }).eq('id', item.id)
  }
}
