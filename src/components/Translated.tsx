import { memo } from 'react'
import { useTranslation } from 'react-i18next'

export const Tr = memo(function Tr({ text }: { text: string }) {
  const { t } = useTranslation()
  return <>{t(text, { defaultValue: text })}</>
})