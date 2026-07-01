import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type { SiteSettings } from '../types/cms'

const supabase = getSupabaseClient()
const db = () => supabase.from('site_settings' as never)

export async function getSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await db().select('id, site_name, tagline, logo_url, favicon_url, theme_primary_color, theme_secondary_color, contact_email, contact_phone, contact_address, social_facebook, social_instagram, social_twitter, social_youtube, social_linkedin, seo_default_title, seo_default_description, seo_default_image, announcement_enabled, announcement_text, announcement_type, maintenance_mode, maintenance_message, donation_default_currency, donation_min_amount, donation_max_amount, footer_description, footer_copyright, footer_nonprofit_text, updated_by, created_at, updated_at').limit(1).maybeSingle()
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
      .select('id, site_name, tagline, logo_url, favicon_url, theme_primary_color, theme_secondary_color, contact_email, contact_phone, contact_address, social_facebook, social_instagram, social_twitter, social_youtube, social_linkedin, seo_default_title, seo_default_description, seo_default_image, announcement_enabled, announcement_text, announcement_type, maintenance_mode, maintenance_message, donation_default_currency, donation_min_amount, donation_max_amount, footer_description, footer_copyright, footer_nonprofit_text, updated_by, created_at, updated_at')
      .single()
    if (error) throw error
    await logAuditEvent({ action: 'Updated site settings', entityType: 'site_settings', entityId: (data as SiteSettings).id })
    return data as SiteSettings
  }

  const { data, error } = await db()
    .update(payload)
    .eq('id', current.id)
      .select('id, site_name, tagline, logo_url, favicon_url, theme_primary_color, theme_secondary_color, contact_email, contact_phone, contact_address, social_facebook, social_instagram, social_twitter, social_youtube, social_linkedin, seo_default_title, seo_default_description, seo_default_image, announcement_enabled, announcement_text, announcement_type, maintenance_mode, maintenance_message, donation_default_currency, donation_min_amount, donation_max_amount, footer_description, footer_copyright, footer_nonprofit_text, updated_by, created_at, updated_at')
    .single()
  if (error) throw error

  await logAuditEvent({ action: 'Updated site settings', entityType: 'site_settings', entityId: (data as SiteSettings).id })
  return data as SiteSettings
}
