import { createContext, useContext } from 'react'

export interface TranslationContextType {
  t: (key: string, replacements?: Record<string, string | number>) => string
  loading: boolean
  refresh: () => Promise<void>
}

export const TranslationContext = createContext<TranslationContextType>({
  t: (key: string) => key,
  loading: false,
  refresh: async () => {},
})

export function useTranslationContext() {
  return useContext(TranslationContext)
}