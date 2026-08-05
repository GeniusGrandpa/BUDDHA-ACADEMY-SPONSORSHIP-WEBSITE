import { useEffect, useState } from 'react'
import { useLanguage } from '../context/LanguageContext'

export function useTranslatedText(text: string): string {
  const { language, tr } = useLanguage()
  const [translated, setTranslated] = useState(text)

  useEffect(() => {
    let cancelled = false
    if (!text || language === 'en') {
      setTranslated(text)
      return
    }
    setTranslated(text)
    tr(text).then((result) => {
      if (!cancelled) setTranslated(result)
    }).catch(() => {})
    return () => { cancelled = true }
  }, [text, language, tr])

  return translated
}

export function Tr({ text, as = 'span' }: { text: string; as?: keyof JSX.IntrinsicElements }) {
  const translated = useTranslatedText(text)
  if (as === 'span') return <span>{translated}</span>
  return <>{translated}</>
}