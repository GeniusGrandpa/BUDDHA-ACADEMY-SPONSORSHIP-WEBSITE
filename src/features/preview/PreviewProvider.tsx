import { useEffect } from 'react'
import { setPreviewMode } from '../../lib/preview-mode'

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    setPreviewMode(true)
    return () => setPreviewMode(false)
  }, [])

  return <>{children}</>
}