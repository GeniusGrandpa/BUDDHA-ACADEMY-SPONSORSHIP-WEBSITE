import { useCallback } from 'react'
import { useLanguage } from '../context/LanguageContext'
import { localizePath } from '../lib/locale'

export function useLocalizePath() {
  const { language } = useLanguage()
  return useCallback(
    (path: string) => localizePath(path, language),
    [language],
  )
}