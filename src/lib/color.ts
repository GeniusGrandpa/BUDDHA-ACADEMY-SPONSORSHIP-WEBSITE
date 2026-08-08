const FALLBACK_COLOR = 'rgba(12, 11, 9, 0.72)'

/**
 * Coerces a stored overlay value into a valid CSS color.
 * CMS content may hold a Tailwind gradient class (e.g. "from-stone-950/80 via-... to-...")
 * instead of a real color. When the value looks like a Tailwind class (contains spaces or
 * a "/" opacity suffix that is not part of a hex/rgb color), fall back to a neutral dark color
 * so the `backgroundColor` declaration is valid and no console warning is emitted.
 */
export function resolveOverlayColor(value: string | null | undefined, fallback = FALLBACK_COLOR): string {
  const v = (value ?? '').trim()
  if (!v) return fallback
  // Valid hex / rgb / rgba / hsl colors are kept as-is.
  if (/^#[0-9a-fA-F]{3,8}$/.test(v)) return v
  if (/^(rgb|rgba|hsl|hsla)\(/.test(v)) return v
  if (v === 'transparent') return v
  // Any token with a space (e.g. Tailwind gradient) is not a CSS color.
  if (/\s/.test(v)) return fallback
  return v
}