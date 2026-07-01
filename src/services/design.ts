import { getSupabaseClient } from '../lib/supabase'
import { logAuditEvent } from '../lib/audit'
import {
  DEFAULT_BRANDING, DEFAULT_COLORS, DEFAULT_TYPOGRAPHY,
  DEFAULT_LAYOUT, DEFAULT_COMPONENT_STYLES, DEFAULT_TOKENS,
  type DesignSettings,
  type ThemePreset,
  type WebsiteConfigEntry,
  type SectionVisibilityEntry,
  type DesignSettingsCategory,
} from '../types/design'
import type { Database, Json } from '../types/database'

const supabase = getSupabaseClient()

export async function getPublishedDesignSettings(): Promise<DesignSettings | null> {
  const { data, error } = await supabase
    .from('design_settings')
    .select('id, branding, colors, typography, layout, component_styles, tokens, config, is_published, created_at')
    .eq('is_published', true)
    .maybeSingle()
  if (error) throw error
  return data as DesignSettings | null
}

export async function getDesignSettings(): Promise<DesignSettings | null> {
  const { data, error } = await supabase
    .from('design_settings')
    .select('id, branding, colors, typography, layout, component_styles, tokens, config, draft, is_published, created_at')
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
    const { data, error } = await supabase
      .from('design_settings')
      .update({
        updated_by: userId,
        ...(settings.branding !== undefined ? { branding: settings.branding as unknown as Json } : {}),
        ...(settings.colors !== undefined ? { colors: settings.colors as unknown as Json } : {}),
        ...(settings.typography !== undefined ? { typography: settings.typography as unknown as Json } : {}),
        ...(settings.layout !== undefined ? { layout: settings.layout as unknown as Json } : {}),
        ...(settings.component_styles !== undefined ? { component_styles: settings.component_styles as unknown as Json } : {}),
        ...(settings.tokens !== undefined ? { tokens: settings.tokens as unknown as Json } : {}),
        ...(settings.config !== undefined ? { config: settings.config as unknown as Json } : {}),
        ...(settings.publish ? { is_published: true, published_at: new Date().toISOString() } : {}),
      })
      .eq('id', existing.id)
      .select('id, branding, colors, typography, layout, component_styles, tokens, config, draft, is_published, created_at')
      .single()
    if (error) throw error
    await logAuditEvent({ action: 'Updated design settings', entityType: 'design_settings', entityId: existing.id })
    return data as unknown as DesignSettings
  }

  const { data, error } = await supabase
    .from('design_settings')
    .insert({
      branding: (settings.branding || {}) as unknown as Json,
      colors: (settings.colors || {}) as unknown as Json,
      typography: (settings.typography || {}) as unknown as Json,
      layout: (settings.layout || {}) as unknown as Json,
      component_styles: (settings.component_styles || {}) as unknown as Json,
      tokens: (settings.tokens || {}) as unknown as Json,
      config: (settings.config || {}) as unknown as Json,
      is_published: settings.publish || false,
      updated_by: userId,
      ...(settings.publish ? { published_at: new Date().toISOString() } : {}),
    })
    .select('id, branding, colors, typography, layout, component_styles, tokens, config, draft, is_published, created_at')
    .single()
  if (error) throw error
  await logAuditEvent({ action: 'Created design settings', entityType: 'design_settings', entityId: data.id })
  return data as unknown as DesignSettings
}

export async function saveDraft(
  category: DesignSettingsCategory,
  values: Record<string, unknown>
): Promise<void> {
  const existing = await getDesignSettings()
  if (!existing) {
    await supabase.from('design_settings').insert({
      branding: {} as Json,
      colors: {} as Json,
      typography: {} as Json,
      layout: {} as Json,
      component_styles: {} as Json,
      tokens: {} as Json,
      config: {} as Json,
      draft: { [category]: values } as unknown as Json,
      [category]: values as unknown as Json,
    } as unknown as Database['public']['Tables']['design_settings']['Insert'])
    return
  }

  const draft = { ...((existing.draft as Record<string, unknown>) || {}), [category]: values }

  await supabase
    .from('design_settings')
    .update({
      [category]: values as unknown as Json,
      draft: draft as unknown as Json,
      updated_by: (await supabase.auth.getSession()).data.session?.user?.id,
    } as unknown as Database['public']['Tables']['design_settings']['Update'])
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
    .select('id, branding, colors, typography, layout, component_styles, tokens, config, draft, is_published, created_at')
    .single()
  if (error) throw error
  await logAuditEvent({ action: 'Published design settings', entityType: 'design_settings', entityId: existing.id })
  return data as unknown as DesignSettings
}

export async function resetToDefaultDesignSettings(): Promise<DesignSettings> {
  const { data, error } = await (supabase
    .rpc('reset_design_settings') as unknown as Promise<{ data: DesignSettings; error: unknown }>)
  if (error) {
    const existing = await getDesignSettings()
    if (existing) {
      return upsertDesignSettings({
        publish: true,
      })
    }
    throw error
  }
  return data as unknown as DesignSettings
}

export async function getThemePresets(): Promise<ThemePreset[]> {
  const { data, error } = await supabase
    .from('theme_presets')
    .select('id, name, branding, colors, typography, layout, component_styles, tokens, config, sort_order, is_default')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true })
  if (error) throw error
  return (data || []) as unknown as ThemePreset[]
}

export async function saveThemePreset(
  preset: Omit<ThemePreset, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'is_default'>
): Promise<ThemePreset> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('theme_presets')
    .insert({ ...preset, created_by: userId } as unknown as Database['public']['Tables']['theme_presets']['Insert'])
    .select('id, name, branding, colors, typography, layout, component_styles, tokens, config, sort_order, is_default')
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Saved theme preset: ${preset.name}`, entityType: 'theme_presets', entityId: data.id })
  return data as unknown as ThemePreset
}

export async function deleteThemePreset(id: string): Promise<void> {
  await logAuditEvent({ action: `Deleted theme preset: ${id}`, entityType: 'theme_presets', entityId: id })
  const { error } = await supabase.from('theme_presets').delete().eq('id', id)
  if (error) throw error
}

export async function applyThemePreset(id: string): Promise<DesignSettings> {
  const { data: preset, error: fetchError } = await supabase
    .from('theme_presets')
    .select('id, name, branding, colors, typography, layout, component_styles, tokens, config, sort_order, is_default')
    .eq('id', id)
    .single()
  if (fetchError) throw fetchError

  const p = preset as unknown as ThemePreset
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

export async function getWebsiteConfigs(): Promise<WebsiteConfigEntry[]> {
  const { data, error } = await supabase
    .from('website_config')
    .select('id, key, label, value, is_active')
    .order('label', { ascending: true })
  if (error) throw error
  return (data || []) as unknown as WebsiteConfigEntry[]
}

export async function getWebsiteConfig(key: string): Promise<WebsiteConfigEntry | null> {
  const { data, error } = await supabase
    .from('website_config')
    .select('id, key, label, value, is_active')
    .eq('key', key)
    .maybeSingle()
  if (error) throw error
  return data as unknown as WebsiteConfigEntry | null
}

export async function upsertWebsiteConfig(key: string, label: string, value: Record<string, unknown>, isActive = true): Promise<WebsiteConfigEntry> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const existing = await getWebsiteConfig(key)

  if (existing) {
    const { data, error } = await supabase
      .from('website_config')
      .update({ value: value as unknown as Json, is_active: isActive, updated_by: userId })
      .eq('id', existing.id)
      .select('id, key, label, value, is_active')
      .single()
    if (error) throw error
    return data as unknown as WebsiteConfigEntry
  }

  const { data, error } = await supabase
    .from('website_config')
    .insert({ key, label, value: value as unknown as Json, is_active: isActive, updated_by: userId })
    .select('id, key, label, value, is_active')
    .single()
  if (error) throw error
  await logAuditEvent({ action: `Created website config: ${key}`, entityType: 'website_config', entityId: data.id })
  return data as unknown as WebsiteConfigEntry
}

export async function getSectionVisibility(): Promise<SectionVisibilityEntry[]> {
  const { data, error } = await supabase
    .from('section_visibility')
    .select('id, section_key, section_name, is_visible, sort_order')
    .order('section_key', { ascending: true })
  if (error) throw error
  return (data || []) as unknown as SectionVisibilityEntry[]
}

export async function updateSectionVisibility(id: string, isVisible: boolean): Promise<SectionVisibilityEntry> {
  const userId = (await supabase.auth.getSession()).data.session?.user?.id
  const { data, error } = await supabase
    .from('section_visibility')
    .update({ is_visible: isVisible, updated_by: userId })
    .eq('id', id)
    .select('id, section_key, section_name, is_visible, sort_order')
    .single()
  if (error) throw error
  return data as unknown as SectionVisibilityEntry
}

export async function resetDesignSettingsToDefaults(): Promise<void> {
  await upsertDesignSettings({
    branding: DEFAULT_BRANDING,
    colors: DEFAULT_COLORS,
    typography: DEFAULT_TYPOGRAPHY,
    layout: DEFAULT_LAYOUT,
    component_styles: DEFAULT_COMPONENT_STYLES,
    tokens: DEFAULT_TOKENS,
    publish: true,
  })
}
