import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import type {
  DesignSettings,
  ThemePreset,
  WebsiteConfigEntry,
  SectionVisibilityEntry,
  DesignSettingsCategory,
} from '../types/design'

const supabase = getSupabaseClient()

// ==================== DESIGN SETTINGS ====================

export async function getPublishedDesignSettings(): Promise<DesignSettings | null> {
  const { data, error } = await supabase
    .from('design_settings')
    .select('*')
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  return data as DesignSettings | null
}

export async function getDesignSettings(): Promise<DesignSettings | null> {
  const { data, error } = await supabase
    .from('design_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as DesignSettings | null
}

export async function upsertDesignSettings(
  settings: Partial<Pick<DesignSettings, 'branding' | 'colors' | 'typography' | 'layout' | 'component_styles' | 'tokens' | 'config'>> & { publish?: boolean }
): Promise<DesignSettings> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const existing = await getDesignSettings()

  if (existing) {
    const updates: Record<string, unknown> = { updated_by: userId }
    if (settings.branding !== undefined) updates.branding = settings.branding
    if (settings.colors !== undefined) updates.colors = settings.colors
    if (settings.typography !== undefined) updates.typography = settings.typography
    if (settings.layout !== undefined) updates.layout = settings.layout
    if (settings.component_styles !== undefined) updates.component_styles = settings.component_styles
    if (settings.tokens !== undefined) updates.tokens = settings.tokens
    if (settings.config !== undefined) updates.config = settings.config
    if (settings.publish) {
      updates.is_published = true
      updates.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('design_settings')
      .update(updates)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    await logAuditEvent({ action: 'Updated design settings', entityType: 'design_settings', entityId: existing.id })
    return data as DesignSettings
  }

  const insertData: Record<string, unknown> = {
    branding: settings.branding || {},
    colors: settings.colors || {},
    typography: settings.typography || {},
    layout: settings.layout || {},
    component_styles: settings.component_styles || {},
    tokens: settings.tokens || {},
    config: settings.config || {},
    is_published: settings.publish || false,
    updated_by: userId,
  }
  if (settings.publish) insertData.published_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('design_settings')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: 'Created design settings', entityType: 'design_settings', entityId: data.id })
  return data as DesignSettings
}

export async function saveDraft(
  category: DesignSettingsCategory,
  values: Record<string, unknown>
): Promise<void> {
  const existing = await getDesignSettings()
  if (!existing) {
    const insertData: Record<string, unknown> = {
      branding: {},
      colors: {},
      typography: {},
      layout: {},
      component_styles: {},
      tokens: {},
      config: {},
      draft: { [category]: values },
    }
    insertData[category] = values
    await supabase.from('design_settings').insert(insertData)
    return
  }

  const draft = { ...((existing.draft as Record<string, unknown>) || {}), [category]: values }
  const categoryUpdate = { [category]: values }

  await supabase
    .from('design_settings')
    .update({ ...categoryUpdate, draft, updated_by: (await supabase.auth.getSession()).data.session?.user?.id })
    .eq('id', existing.id)
}

export async function publishDesignSettings(): Promise<DesignSettings> {
  const existing = await getDesignSettings()
  if (!existing) throw new Error('No design settings to publish')

  const { data, error } = await supabase
    .from('design_settings')
    .update({
      is_published: true,
      published_at: new Date().toISOString(),
      draft: null,
      updated_by: (await supabase.auth.getSession()).data.session?.user?.id,
    })
    .eq('id', existing.id)
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: 'Published design settings', entityType: 'design_settings', entityId: existing.id })
  return data as DesignSettings
}

export async function resetToDefaultDesignSettings(): Promise<DesignSettings> {
  const { data, error } = await supabase
    .rpc('reset_design_settings')
  if (error) {
    const existing = await getDesignSettings()
    if (existing) {
      return upsertDesignSettings({
        publish: true,
      })
    }
    throw error
  }
  return data as DesignSettings
}

// ==================== THEME PRESETS ====================

export async function getThemePresets(): Promise<ThemePreset[]> {
  const { data, error } = await supabase
    .from('theme_presets')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []) as ThemePreset[]
}

export async function saveThemePreset(
  preset: Omit<ThemePreset, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'is_default'>
): Promise<ThemePreset> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('theme_presets')
    .insert({ ...preset, created_by: userId })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Saved theme preset: ${preset.name}`, entityType: 'theme_presets', entityId: data.id })
  return data as ThemePreset
}

export async function deleteThemePreset(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted theme preset: ${id}`, entityType: 'theme_presets', entityId: id })
  const { error } = await supabase.from('theme_presets').delete().eq('id', id)
  if (error) throw error
}

export async function applyThemePreset(id: string): Promise<DesignSettings> {
  const { data: preset, error: fetchError } = await supabase
    .from('theme_presets')
    .select('*')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const p = preset as ThemePreset
  return upsertDesignSettings({
    branding: p.branding,
    colors: p.colors,
    typography: p.typography,
    layout: p.layout,
    component_styles: p.component_styles,
    tokens: p.tokens,
    config: p.config,
    publish: true,
  })
}

// ==================== WEBSITE CONFIG ====================

export async function getWebsiteConfigs(): Promise<WebsiteConfigEntry[]> {
  const { data, error } = await supabase
    .from('website_config')
    .select('*')
    .order('label', { ascending: true })
  if (error) throw error
  return (data || []) as WebsiteConfigEntry[]
}

export async function getWebsiteConfig(key: string): Promise<WebsiteConfigEntry | null> {
  const { data, error } = await supabase
    .from('website_config')
    .select('*')
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  return data as WebsiteConfigEntry | null
}

export async function upsertWebsiteConfig(key: string, label: string, value: Record<string, unknown>, isActive = true): Promise<WebsiteConfigEntry> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const existing = await getWebsiteConfig(key)

  if (existing) {
    const { data, error } = await supabase
      .from('website_config')
      .update({ value, is_active: isActive, updated_by: userId })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as WebsiteConfigEntry
  }

  const { data, error } = await supabase
    .from('website_config')
    .insert({ key, label, value, is_active: isActive, updated_by: userId })
    .select()
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created website config: ${key}`, entityType: 'website_config', entityId: data.id })
  return data as WebsiteConfigEntry
}

// ==================== SECTION VISIBILITY ====================

export async function getSectionVisibility(): Promise<SectionVisibilityEntry[]> {
  const { data, error } = await supabase
    .from('section_visibility')
    .select('*')
    .order('section_key', { ascending: true })
  if (error) throw error
  return (data || []) as SectionVisibilityEntry[]
}

export async function updateSectionVisibility(id: string, isVisible: boolean): Promise<SectionVisibilityEntry> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('section_visibility')
    .update({ is_visible: isVisible, updated_by: userId })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as SectionVisibilityEntry
}

export async function resetDesignSettingsToDefaults(): Promise<void> {
  const { default: defaults } = await import('../types/design')
  await upsertDesignSettings({
    branding: defaults.DEFAULT_BRANDING,
    colors: defaults.DEFAULT_COLORS,
    typography: defaults.DEFAULT_TYPOGRAPHY,
    layout: defaults.DEFAULT_LAYOUT,
    component_styles: defaults.DEFAULT_COMPONENT_STYLES,
    tokens: defaults.DEFAULT_TOKENS,
    publish: true,
  })
}
