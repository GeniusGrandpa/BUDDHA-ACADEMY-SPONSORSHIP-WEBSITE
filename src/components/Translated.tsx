import { memo } from 'react'
import { useTranslation } from 'react-i18next'
import { useLanguage } from '../context/LanguageContext'

export const Tr = memo(function Tr({ text }: { text: string }) {
  const { t } = useTranslation()
  const { language } = useLanguage()
  return <>{t(text, { defaultValue: text, lng: language })}</>
})