import { useMemo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { CmsStringsContext } from './CmsStringsContext'

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation()

  const value = useMemo(
    () => ({
      strings: {} as Record<string, string>,
      t: (key: string, replacements?: Record<string, string | number>) => t(key, replacements ?? {}),
      loading: false,
      refresh: async () => {},
    }),
    [t],
  )

  return <CmsStringsContext.Provider value={value}>{children}</CmsStringsContext.Provider>
}