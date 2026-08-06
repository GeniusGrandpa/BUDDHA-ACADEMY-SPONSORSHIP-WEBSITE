import { useEffect, useMemo, useState } from 'react'
import { getGoogleLanguageCode, useLanguage } from '../context/LanguageContext'
import { requestPageTranslation } from '../lib/translation/translateService'

export interface UsePageTranslationsOptions {
  title?: string
  description?: string
}

export function usePageTranslations(
  texts: string[],
  options?: UsePageTranslationsOptions,
): { translations: string[]; loading: boolean } {
  const { language, pageId } = useLanguage()
  const title = options?.title
  const description = options?.description
  const stableTexts = useMemo(() => texts, [texts])
  const [translations, setTranslations] = useState<string[]>(stableTexts)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (language === 'en' || stableTexts.length === 0) {
      setTranslations(stableTexts)
      setLoading(false)
      return
    }
    setTranslations(stableTexts)
    setLoading(true)
    requestPageTranslation({
      pageId,
      language,
      target: getGoogleLanguageCode(language),
      texts: stableTexts,
      title,
      description,
    })
      .then((result) => {
        if (cancelled) return
        setLoading(false)
        if (result) setTranslations(result.translations)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language, pageId, stableTexts, title, description])

  return { translations, loading }
}