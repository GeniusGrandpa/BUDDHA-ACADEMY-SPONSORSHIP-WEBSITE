import { createContext, useContext } from 'react'
import en from '../locales/en.json'
import type { CmsStringMap } from '../types/cms-content'

export const DEFAULT_STRINGS: Record<string, string> = en

export interface CmsStringsContextValue {
  strings: CmsStringMap
  t: (key: string, replacements?: Record<string, string | number>) => string
  loading: boolean
  refresh: () => Promise<void>
}

export const CmsStringsContext = createContext<CmsStringsContextValue>({
  strings: {},
  t: (key: string) => DEFAULT_STRINGS[key] ?? key,
  loading: true,
  refresh: async () => {},
})

export function useCmsStrings() {
  return useContext(CmsStringsContext)
}