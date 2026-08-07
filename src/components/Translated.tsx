import { memo } from 'react'

export const Tr = memo(function Tr({ text }: { text: string }) {
  return <>{text}</>
})