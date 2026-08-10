import { DEFAULT_LOCALE } from '../i18n'

export type ContentTranslationMap = Record<string, string>

/**
 * Direct field-based localization without content_translations table
 * This function maps English field names to their Nepali (_ne) counterparts
 * and applies the appropriate language version based on the requested language
 */
export function applyLanguageLocalization<T>(data: T | null, language: string): T | null {
  if (!data || language === DEFAULT_LOCALE || language === 'en') {
    return data
  }

  if (typeof data !== 'object' || data === null) {
    return data
  }

  const result = { ...data } as T
  const dataObj = data as Record<string, unknown>

  // Field mappings for common translatable fields
  const fieldMappings: Record<string, string> = {
    title: 'title_ne',
    subtitle: 'subtitle_ne',
    description: 'description_ne',
    content: 'content_ne',
    name: 'name_ne',
    bio: 'bio_ne',
    caption: 'caption_ne',
    author: 'author_ne',
    excerpt: 'excerpt_ne',
    question: 'question_ne',
    answer: 'answer_ne',
    quote: 'quote_ne',
    hero_title: 'hero_title_ne',
    hero_subtitle: 'hero_subtitle_ne',
    section_title: 'section_title_ne',
    section_description: 'section_description_ne',
    cta_title: 'cta_title_ne',
    cta_description: 'cta_description_ne',
    cta_button_text: 'cta_button_text_ne',
    cta_primary_text: 'cta_primary_text_ne',
    cta_secondary_text: 'cta_secondary_text_ne',
    highlight: 'highlight_ne',
    family_background: 'family_background_ne',
    dream_career: 'dream_career_ne',
    education_goals: 'education_goals_ne',
    copyright_text: 'copyright_text_ne',
    nonprofit_text: 'nonprofit_text_ne',
    meta_title: 'meta_title_ne',
    meta_description: 'meta_description_ne',
    alt_text: 'alt_text_ne',
    site_name: 'site_name_ne',
    site_tagline: 'site_tagline_ne',
  }

  // Apply simple field mappings
  for (const [englishField, nepaliField] of Object.entries(fieldMappings)) {
    if (englishField in dataObj && nepaliField in dataObj) {
      const nepaliValue = dataObj[nepaliField]
      if (typeof nepaliValue === 'string' && nepaliValue.trim() !== '') {
        ;(result as Record<string, unknown>)[englishField] = nepaliValue
      }
    }
  }

  // Handle array fields (hobbies, achievements, etc.)
  const arrayFieldMappings: Record<string, string> = {
    hobbies: 'hobbies_ne',
    achievements: 'achievements_ne',
  }

  for (const [englishField, nepaliField] of Object.entries(arrayFieldMappings)) {
    if (englishField in dataObj && nepaliField in dataObj) {
      const nepaliValue = dataObj[nepaliField]
      if (Array.isArray(nepaliValue) && nepaliValue.length > 0) {
        ;(result as Record<string, unknown>)[englishField] = nepaliValue
      }
    }
  }

  // Handle JSONB array fields (steps, benefits, impact_cards, etc.)
  const jsonbFieldMappings: Record<string, string> = {
    steps: 'steps_ne',
    benefits: 'benefits_ne',
    impact_cards: 'impact_cards_ne',
    impact_stories: 'impact_stories_ne',
    process_steps: 'process_steps_ne',
    statistics: 'statistics_ne',
    badges: 'badges_ne',
    quick_links: 'quick_links_ne',
    contact_info: 'contact_info_ne',
    opportunities: 'opportunities_ne',
    skill_options: 'skill_options_ne',
    form_fields: 'form_fields_ne',
    allocation_data: 'allocation_data_ne',
    verification_steps: 'verification_steps_ne',
    impact_report_items: 'impact_report_items_ne',
    sections: 'sections_ne',
    content: 'content_ne',
  }

  for (const [englishField, nepaliField] of Object.entries(jsonbFieldMappings)) {
    if (englishField in dataObj && nepaliField in dataObj) {
      const nepaliValue = dataObj[nepaliField]
      if (nepaliValue && typeof nepaliValue === 'object' && !Array.isArray(nepaliValue)) {
        // Check if it's a non-empty object/array
        const keys = Object.keys(nepaliValue)
        if (keys.length > 0 || (Array.isArray(nepaliValue) && nepaliValue.length > 0)) {
          ;(result as Record<string, unknown>)[englishField] = nepaliValue
        }
      }
    }
  }

  return result
}

/**
 * Legacy function for backward compatibility
 * Now uses direct field-based localization
 */
export async function getLocalizedContent<T>(
  _entityType: string,
  _entityId: string,
  language: string,
  fetchEnglish: () => Promise<T | null>,
): Promise<T | null> {
  const base = await fetchEnglish()
  return applyLanguageLocalization(base, language)
}

/**
 * Legacy cache clear function for backward compatibility
 */
export function clearContentTranslationsCache(): void {
  // No-op since we no longer use caching with direct field access
}

/**
 * Legacy function for backward compatibility
 * Now uses direct field-based localization
 */
export function applyContentTranslations<T>(data: T, _overrides: ContentTranslationMap): T {
  return applyLanguageLocalization(data, 'ne') as T
}

/**
 * Legacy function for backward compatibility
 */
export async function getContentTranslations(
  _entityType: string,
  _entityId: string,
  _language: string,
): Promise<ContentTranslationMap> {
  // Return empty map since we no longer use content_translations table
  return {}
}
