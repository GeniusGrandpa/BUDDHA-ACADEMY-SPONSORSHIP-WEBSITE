import { supabase } from '../lib/supabase'
import { DEFAULT_LOCALE } from '../i18n'

export type ContentTranslationMap = Record<string, string>

const cache = new Map<string, ContentTranslationMap>()

export function clearContentTranslationsCache(): void {
  cache.clear()
}

export async function getContentTranslations(
  entityType: string,
  entityId: string,
  language: string,
): Promise<ContentTranslationMap> {
  if (language === DEFAULT_LOCALE || language === 'en') return {}
  const key = `${entityType}::${entityId}::${language}`
  const hit = cache.get(key)
  if (hit) return hit

  const { data, error } = await supabase
    .from('content_translations')
    .select('field, value')
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('language', language)

  if (error) {
    // Treat as no translations (English fallback) rather than breaking the page.
    cache.set(key, {})
    return {}
  }

  const map: ContentTranslationMap = {}
  for (const row of (data || []) as { field: string; value: string }[]) {
    if (row.field) map[row.field] = row.value
  }
  cache.set(key, map)
  return map
}

function setByPath(target: unknown, path: string, value: string): void {
  const parts = path.split('.')
  let node: unknown = target
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i]
    if (Array.isArray(node)) {
      const idx = Number(part)
      if (!Number.isFinite(idx) || idx < 0 || idx >= node.length) return
      node = node[idx]
    } else if (node && typeof node === 'object') {
      const next = (node as Record<string, unknown>)[part]
      if (next === undefined || next === null) return
      node = next
    } else {
      return
    }
  }
  const last = parts[parts.length - 1]
  if (Array.isArray(node)) {
    const idx = Number(last)
    if (Number.isFinite(idx) && idx >= 0 && idx < node.length) {
      node[idx] = value
    }
  } else if (node && typeof node === 'object') {
    ;(node as Record<string, unknown>)[last] = value
  }
}

function clone<T>(value: T): T {
  if (value === null || typeof value !== 'object') return value
  if (Array.isArray(value)) return value.map((item) => clone(item)) as unknown as T
  const out: Record<string, unknown> = {}
  for (const k of Object.keys(value as Record<string, unknown>)) {
    out[k] = clone((value as Record<string, unknown>)[k])
  }
  return out as T
}

export function applyContentTranslations<T>(data: T, overrides: ContentTranslationMap): T {
  if (!overrides || Object.keys(overrides).length === 0 || data === null || data === undefined) {
    return data
  }
  const copy = clone(data)
  for (const [field, value] of Object.entries(overrides)) {
    // Top-level object (plain column name) → direct assignment.
    if (
      copy &&
      typeof copy === 'object' &&
      !Array.isArray(copy) &&
      field in (copy as Record<string, unknown>)
    ) {
      ;(copy as Record<string, unknown>)[field] = value
    } else {
      setByPath(copy, field, value)
    }
  }
  return copy
}

export async function getLocalizedContent<T>(
  entityType: string,
  entityId: string,
  language: string,
  fetchEnglish: () => Promise<T | null>,
): Promise<T | null> {
  const base = await fetchEnglish()
  if (!base) return null
  const overrides = await getContentTranslations(entityType, entityId, language)
  return applyContentTranslations(base, overrides)
}