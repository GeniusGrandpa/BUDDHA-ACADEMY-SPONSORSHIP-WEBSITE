export const LANGUAGE_COOKIE = 'language'

export function parseLanguageCookie(cookieHeader: string | null | undefined): string {
  if (!cookieHeader) return 'en'
  const match = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LANGUAGE_COOKIE}=`))
  if (!match) return 'en'
  return match.slice(LANGUAGE_COOKIE.length + 1) || 'en'
}

export function getBrowserLanguage(): string {
  if (typeof document === 'undefined') return 'en'
  return parseLanguageCookie(document.cookie)
}

export function setLanguageCookie(language: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`
}
