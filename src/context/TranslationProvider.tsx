import { startTransition, useCallback, useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DEFAULT_LOCALE } from '../i18n'
import { fetchPublicTranslations } from '../services/translations'
import { clearContentTranslationsCache } from '../services/content-localization'
import { TranslationContext } from './TranslationContext'

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation()
  const refresh = useCallback(async () => {
    clearContentTranslationsCache()
    const strings = await fetchPublicTranslations()
    startTransition(() => {
      i18n.addResourceBundle(DEFAULT_LOCALE, 'translation', strings, true, true)
    })
  }, [i18n])

  const value = useMemo(
    () => ({
      t: (key: string, replacements?: Record<string, string | number>) => t(key, replacements ?? {}),
      loading: false,
      refresh,
    }),
    [t, refresh],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}
