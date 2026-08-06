import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getAllCmsStrings } from '../services/cms-content'
import { useTranslation } from './TranslationContext'
import type { CmsStringMap } from '../types/cms-content'
import { CmsStringsContext, DEFAULT_STRINGS } from './CmsStringsContext'

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const [strings, setStrings] = useState<CmsStringMap>({})
  const [loading, setLoading] = useState(true)
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({})
  const { language, isHydrated, translateTexts } = useTranslation()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCmsStrings()
      setStrings(data)
    } catch {
      setStrings({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const merged = useMemo(() => ({ ...DEFAULT_STRINGS, ...strings }), [strings])

  useEffect(() => {
    if (!isHydrated) {
      setTranslatedMap({})
      return
    }
    if (language === 'en') {
      setTranslatedMap({})
      return
    }
    let cancelled = false
    const unique = Array.from(new Set(Object.values(merged)))
    translateTexts(unique).then((results) => {
      if (cancelled) return
      const map: Record<string, string> = {}
      unique.forEach((value, index) => {
        const translated = results[index]
        if (translated && translated !== value) map[value] = translated
      })
      setTranslatedMap(map)
    }).catch(() => {
      if (!cancelled) setTranslatedMap({})
    })
    return () => { cancelled = true }
  }, [language, merged, translateTexts, isHydrated])

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    let value = translatedMap[merged[key]] || merged[key] || key
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replaceAll(`{${k}}`, String(v))
      }
    }
    return value
  }, [merged, translatedMap])

  return (
    <CmsStringsContext.Provider value={{ strings, t, loading, refresh: load }}>
      {children}
    </CmsStringsContext.Provider>
  )
}