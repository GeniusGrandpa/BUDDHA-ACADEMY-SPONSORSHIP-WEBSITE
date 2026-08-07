import { useMemo, type ReactNode } from 'react'
import { useTranslationContext } from './TranslationContext'
import { CmsStringsContext } from './CmsStringsContext'

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const { t, loading, refresh } = useTranslationContext()

  const value = useMemo(
    () => ({
      strings: {} as Record<string, string>,
      t,
      loading,
      refresh,
    }),
    [t, loading, refresh],
  )

  return <CmsStringsContext.Provider value={value}>{children}</CmsStringsContext.Provider>
}