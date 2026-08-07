import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE } from '../i18n'
import { fetchPublicTranslations } from '../services/translations'
import { TranslationContext } from './TranslationContext'

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (loaded || typeof window === 'undefined') return

    let cancelled = false
    setLoading(true)

    fetchPublicTranslations()
      .then((strings) => {
        if (cancelled) return
        i18n.addResourceBundle(DEFAULT_LOCALE, 'translation', strings, true, true)
        setLoaded(true)
      })
      .catch(() => {
        if (!cancelled) setLoaded(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [loaded, i18n])

  const refresh = useCallback(async () => {
    setLoading(true)
    const strings = await fetchPublicTranslations()
    i18n.addResourceBundle(DEFAULT_LOCALE, 'translation', strings, true, true)
    setLoading(false)
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