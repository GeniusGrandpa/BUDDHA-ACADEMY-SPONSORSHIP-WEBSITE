import i18n from '../i18n'

type LocalizedRecord = Record<string, unknown>

/** Returns a non-empty Nepali field when Nepali is active, else English. */
export function getLocalizedField<T = string>(item: LocalizedRecord | null | undefined, field: string): T | undefined {
  if (!item) return undefined
  const nepaliValue = item[`${field}_ne`]
  if (i18n.resolvedLanguage === 'ne' && nepaliValue !== null && nepaliValue !== undefined && nepaliValue !== '') {
    return nepaliValue as T
  }
  return item[field] as T | undefined
}
