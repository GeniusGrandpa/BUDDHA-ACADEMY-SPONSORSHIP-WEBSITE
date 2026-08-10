import i18n from '../i18n'

export function getLocalizedField<T extends object>(
  item: T | null | undefined,
  fieldName: string
): string {
  if (!item) return ''

  const currentLanguage = i18n.language
  const nepaliField = `${fieldName}_ne` as keyof T
  const englishField = fieldName as keyof T

  if (
    currentLanguage === 'ne' &&
    nepaliField in item &&
    item[nepaliField] !== null &&
    item[nepaliField] !== undefined &&
    item[nepaliField] !== ''
  ) {
    return String(item[nepaliField])
  }

  if (englishField in item && item[englishField] !== null && item[englishField] !== undefined) {
    return String(item[englishField])
  }

  return ''
}

export function getLocalizedArrayField<T extends object>(
  item: T | null | undefined,
  fieldName: string
): string[] {
  if (!item) return []

  const currentLanguage = i18n.language
  const nepaliField = `${fieldName}_ne` as keyof T
  const englishField = fieldName as keyof T

  if (
    currentLanguage === 'ne' &&
    nepaliField in item &&
    Array.isArray(item[nepaliField]) &&
    (item[nepaliField] as unknown[]).length > 0
  ) {
    return item[nepaliField] as string[]
  }

  if (englishField in item && Array.isArray(item[englishField])) {
    return item[englishField] as string[]
  }

  return []
}

export function getLocalizedJsonField<T extends object>(
  item: T | null | undefined,
  fieldName: string
): Record<string, unknown> | null {
  if (!item) return null

  const currentLanguage = i18n.language
  const nepaliField = `${fieldName}_ne` as keyof T
  const englishField = fieldName as keyof T

  if (
    currentLanguage === 'ne' &&
    nepaliField in item &&
    item[nepaliField] !== null &&
    item[nepaliField] !== undefined &&
    typeof item[nepaliField] === 'object'
  ) {
    return item[nepaliField] as Record<string, unknown>
  }

  if (englishField in item && item[englishField] !== null && item[englishField] !== undefined) {
    return item[englishField] as Record<string, unknown>
  }

  return null
}

export function hasNepaliTranslation<T extends object>(
  item: T | null | undefined,
  fieldName: string
): boolean {
  if (!item) return false

  const nepaliField = `${fieldName}_ne` as keyof T
  return (
    nepaliField in item &&
    item[nepaliField] !== null &&
    item[nepaliField] !== undefined &&
    item[nepaliField] !== ''
  )
}

export function getCurrentLanguage(): 'en' | 'ne' {
  return i18n.language === 'ne' ? 'ne' : 'en'
}
