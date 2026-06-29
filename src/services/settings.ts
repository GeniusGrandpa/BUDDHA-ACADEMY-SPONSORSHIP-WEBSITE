import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { SiteSettings } from '../types/cms'

const supabase = getSupabaseClient()
const db = () => supabase.from('site_settings' as never)

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await db().select('*').limit(1).maybeSingle()
  if (error) throw error
  return data as SiteSettings | null
}

export async function updateSiteSettings(updates: Partial<SiteSettings>): Promise<SiteSettings> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const current = await getSiteSettings()

  const payload = { ...updates, updated_by: userId } as never

  if (!current) {
    const { data, error } = await db()
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    await logAuditEvent({ action: 'Created site settings', entityType: 'site_settings', entityId: (data as SiteSettings).id })
    return data as SiteSettings
  }

  const { data, error } = await db()
    .update(payload)
    .eq('id', current.id)
    .select()
    .single()
  if (error) throw error

  await logAuditEvent({ action: 'Updated site settings', entityType: 'site_settings', entityId: (data as SiteSettings).id })
  return data as SiteSettings
}
