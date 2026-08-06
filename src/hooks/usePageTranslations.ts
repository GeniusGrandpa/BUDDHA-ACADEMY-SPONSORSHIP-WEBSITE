import { useMemo } from 'react'

export interface UsePageTranslationsOptions {
  title?: string
  description?: string
}

export function usePageTranslations(
  texts: string[],
  _options?: UsePageTranslationsOptions,
): { translations: string[]; loading: boolean } {
  const stableTexts = useMemo(() => texts, [texts])
  return { translations: stableTexts, loading: false }
}
