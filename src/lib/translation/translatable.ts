export function translationCacheKey(language: string, text: string): string {
  return `${language}|${text}`
}

export function isTranslatableText(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 2) return false
  if (/^[\d\s.,:/_\-+%$?°|\u00a0#@()[\]{}]+$/.test(trimmed)) return false
  if (/^https?:\/\//i.test(trimmed)) return false
  if (/^\S+@\S+\.\S+$/.test(trimmed)) return false
  return /\p{L}/u.test(trimmed)
}

export function splitWhitespace(text: string): { pre: string; mid: string; post: string } {
  const match = text.match(/^(\s*)([\s\S]*?)(\s*)$/)
  return {
    pre: match?.[1] ?? '',
    mid: match?.[2] ?? text,
    post: match?.[3] ?? '',
  }
}
