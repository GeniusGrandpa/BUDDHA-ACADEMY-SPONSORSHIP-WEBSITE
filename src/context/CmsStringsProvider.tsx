import { useEffect, useState, useCallback, useMemo, type ReactNode } from 'react'
import { getAllCmsStrings } from '../services/cms-content'
import { useTranslation } from './TranslationContext'
import type { CmsStringMap } from '../types/cms-content'
import { CmsStringsContext, DEFAULT_STRINGS } from './CmsStringsContext'
import { getStaticDictionary } from '../locales'

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const [strings, setStrings] = useState<CmsStringMap>({})
  const [loading, setLoading] = useState(true)
  const [translatedMap, setTranslatedMap] = useState<Record<string, string>>({})
  const { language, isHydrated, translateTexts } = useTranslation()

  const staticDict = useMemo(() => getStaticDictionary(language), [language])

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
    const missing = new Set<string>()
    for (const key of Object.keys(merged)) {
      if (!(key in staticDict)) missing.add(merged[key])
    }
    const unique = Array.from(missing)
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
  }, [language, merged, translateTexts, isHydrated, staticDict])

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    const staticValue = staticDict[key]
    let value = staticValue ?? translatedMap[merged[key]] ?? merged[key] ?? key
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replaceAll(`{${k}}`, String(v))
      }
    }
    return value
  }, [merged, translatedMap, staticDict])

  return (
    <CmsStringsContext.Provider value={{ strings, t, loading, refresh: load }}>
      {children}
    </CmsStringsContext.Provider>
  )
}