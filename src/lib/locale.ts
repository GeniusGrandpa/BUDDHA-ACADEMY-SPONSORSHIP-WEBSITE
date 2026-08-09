import { isSupportedLocale, SUPPORTED_LOCALES, type SupportedLocale } from '../i18n'

export const LANGUAGE_COOKIE = 'language'
export const LANGUAGE_STORAGE_KEY = 'buddha-academy-language'

const NON_LOCALIZED_PREFIXES = [
  '/admin',
  '/dashboard',
  '/donations',
  '/super-admin',
  '/teacher',
  '/preview',
]

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
  if (typeof window === 'undefined') return 'en'
  const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (isSupportedLocale(storedLanguage ?? '')) return storedLanguage as SupportedLocale
  return parseLanguageCookie(document.cookie)
}

export function setLanguageCookie(language: string): void {
  if (typeof document === 'undefined') return
  document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; path=/; max-age=31536000; samesite=lax`
}

export function isKnownLocale(value: string | undefined | null): value is SupportedLocale {
  return typeof value === 'string' && isSupportedLocale(value)
}

export function toLocale(value: string | undefined | null): SupportedLocale {
  return isKnownLocale(value) ? value : 'en'
}

export function localizePath(path: string, locale: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`

  if (/^(https?:|mailto:|tel:|#)/.test(normalized)) return normalized
  if (NON_LOCALIZED_PREFIXES.some((prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`))) {
    return normalized
  }
  if (normalized === '/') return `/${locale}`
  return `/${locale}${normalized}`
}

export function localeFromPath(pathname: string): SupportedLocale {
  const segment = pathname.split('/')[1]
  return toLocale(segment)
}

export function stripLocale(pathname: string): string {
  const parts = pathname.split('/')
  if (isKnownLocale(parts[1])) {
    const rest = parts.slice(2).join('/')
    return rest ? `/${rest}` : '/'
  }
  return pathname
}

export { SUPPORTED_LOCALES }
