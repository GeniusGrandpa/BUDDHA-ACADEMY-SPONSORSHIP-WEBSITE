import { useTranslatedText } from '../hooks/useTranslatedText'

export { useTranslatedText, useTranslatedContent } from '../hooks/useTranslatedText'

export function Tr({ text }: { text: string }) {
  return <>{useTranslatedText(text)}</>
}
