let previewMode = false

export function setPreviewMode(enabled: boolean) {
  previewMode = enabled
}

export function isPreviewMode(): boolean {
  return previewMode
}

export function openPreview(slug: string): void {
  if (typeof window === 'undefined') return
  window.open(`/preview/${slug}`, '_blank', 'noopener,noreferrer')
}