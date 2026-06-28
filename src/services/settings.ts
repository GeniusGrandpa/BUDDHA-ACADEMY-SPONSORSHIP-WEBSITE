import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { SiteSettings } from '../types/cms'

const supabase = getSupabaseClient()

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle()
  if (error) throw error
  return data as SiteSettings | null
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const current = await getSiteSettings()

  if (!current) {
    const { data, error } = await supabase
      .from('site_settings')
      .insert({ ...updates, updated_by: userId })
      .select()
      .single()
    if (error) throw error
    await logAuditEvent({ action: 'Created site settings', entityType: 'site_settings', entityId: data.id })
    return data as SiteSettings
  }

  const { data, error } = await supabase
    .from('site_settings')
    .update({ ...updates, updated_by: userId })
    .eq('id', current.id)
    .select()
    .single()
  if (error) throw error

  await logAuditEvent({ action: 'Updated site settings', entityType: 'site_settings', entityId: data.id })
  return data as SiteSettings
}
