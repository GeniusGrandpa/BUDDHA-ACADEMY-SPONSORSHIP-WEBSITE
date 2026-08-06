import { createContext, useContext } from 'react'

export interface TranslationContextValue {
  language: string
  isHydrated: boolean
  translate: (text: string) => Promise<string>
  translateTexts: (texts: string[]) => Promise<string[]>
  translateCMS: <T extends Record<string, string>>(obj: T) => Promise<T>
  translateMissingStrings: (texts: string[]) => Promise<string[]>
  clearCache: () => void
}

export const TranslationContext = createContext<TranslationContextValue | null>(null)

export function useTranslation(): TranslationContextValue {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider')
  }
  return context
}