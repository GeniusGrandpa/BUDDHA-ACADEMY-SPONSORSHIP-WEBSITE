import { createContext, useContext } from 'react'

export interface CmsStringsContextValue {
  strings: Record<string, string>
  t: (key: string, replacements?: Record<string, string | number>) => string
  loading: boolean
  refresh: () => Promise<void>
}

export const CmsStringsContext = createContext<CmsStringsContextValue>({
  strings: {},
  t: (key: string) => key,
  loading: false,
  refresh: async () => {},
})

export function useCmsStrings() {
  return useContext(CmsStringsContext)
}