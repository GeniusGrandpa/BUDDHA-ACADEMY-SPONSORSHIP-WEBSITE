const FALLBACK_COLOR = 'rgba(12, 11, 9, 0.72)'

export function resolveOverlayColor(value: string | null | undefined, fallback = FALLBACK_COLOR): string {
  const v = (value ?? '').trim()
  if (!v) return fallback
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v
  if (/^(rgb|rgba|hsl|hsla)\(/.test(v)) return v
  if (v === 'transparent') return v
  if (/\s/.test(v)) return fallback
  return v
}