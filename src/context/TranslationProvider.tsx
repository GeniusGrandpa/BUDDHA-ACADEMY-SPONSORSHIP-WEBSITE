import { startTransition, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE } from '../i18n'
import { fetchPublicTranslations } from '../services/translations'
import { clearContentTranslationsCache } from '../services/content-localization'
import { TranslationContext } from './TranslationContext'

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded || typeof window === 'undefined') return

    let cancelled = false
    startTransition(() => setLoading(true))

    fetchPublicTranslations()
      .then((strings) => {
        if (cancelled) return
        startTransition(() => {
          i18n.addResourceBundle(DEFAULT_LOCALE, 'translation', strings, true, true)
          setLoaded(true)
        })
      })
      .catch(() => {
        if (!cancelled) startTransition(() => setLoaded(true))
      })
      .finally(() => {
        if (!cancelled) startTransition(() => setLoading(false))
      })

    return () => {
      cancelled = true
    }
  }, [loaded, i18n])

  const refresh = useCallback(async () => {
    startTransition(() => setLoading(true))
    clearContentTranslationsCache()
    const strings = await fetchPublicTranslations()
    startTransition(() => {
      i18n.addResourceBundle(DEFAULT_LOCALE, 'translation', strings, true, true)
      setLoading(false)
    })
  }, [i18n])

  const value = useMemo(
    () => ({
      t: (key: string, replacements?: Record<string, string | number>) => t(key, replacements ?? {}),
      loading,
      refresh,
    }),
    [t, loading, refresh],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
