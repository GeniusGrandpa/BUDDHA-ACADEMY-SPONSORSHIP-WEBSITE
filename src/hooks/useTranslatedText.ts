import { useEffect, useState } from 'react'
import { useTranslation } from '../context/TranslationContext'

export interface TranslatedContent {
  content: string
  isLoading: boolean
}

export function useTranslatedContent(original: string): TranslatedContent {
  const { language, translate } = useTranslation()
  const [state, setState] = useState<TranslatedContent>({ content: original, isLoading: false })

  useEffect(() => {
    let cancelled = false
    if (!original || language === 'en') {
      setState((prev) => (prev.content === original ? prev : { content: original, isLoading: false }))
      return
    }
    setState((prev) => (prev.content === original ? prev : { content: original, isLoading: true }))
    translate(original)
      .then((result) => {
        if (!cancelled) setState({ content: result, isLoading: false })
      })
      .catch(() => {
        if (!cancelled) setState({ content: original, isLoading: false })
      })
    return () => {
      cancelled = true
    }
  }, [original, language, translate])

  return state
}

export function useTranslatedText(text: string): string {
  return useTranslatedContent(text).content
}
