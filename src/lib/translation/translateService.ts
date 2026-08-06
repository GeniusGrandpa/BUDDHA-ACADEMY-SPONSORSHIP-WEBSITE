import { supabase } from '../supabase'

export interface TranslatePageRequest {
  pageId: string
  language: string
  target: string
  texts: string[]
  title?: string
  description?: string
}

export interface TranslateResult {
  translations: string[]
  cached: boolean
  translatedTitle?: string
  translatedDescription?: string
}

interface TranslateApiResponse {
  success?: boolean
  cached?: boolean
  translations?: string[]
  translatedTitle?: string
  translatedDescription?: string
}

export async function requestPageTranslation(
  req: TranslatePageRequest,
): Promise<TranslateResult | null> {
  if (req.texts.length === 0) return { translations: [], cached: true }
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        pageId: req.pageId,
        language: req.language,
        target: req.target,
        texts: req.texts,
        title: req.title,
        description: req.description,
      },
    })
    if (error) return null
    const res = (data ?? {}) as TranslateApiResponse
    if (!res.success || !Array.isArray(res.translations) || res.translations.length !== req.texts.length) {
      return null
    }
    return {
      translations: res.translations,
      cached: Boolean(res.cached),
      translatedTitle: res.translatedTitle,
      translatedDescription: res.translatedDescription,
    }
  } catch {
    return null
  }
}