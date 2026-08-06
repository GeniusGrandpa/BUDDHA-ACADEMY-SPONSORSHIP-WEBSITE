import { memo } from 'react'
import { useTranslatedText } from '../hooks/useTranslatedText'

export const Tr = memo(function Tr({ text }: { text: string }) {
  return <>{useTranslatedText(text)}</>
})