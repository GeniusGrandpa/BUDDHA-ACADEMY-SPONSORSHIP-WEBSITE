export function getAuthRedirectBase(): string {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL

  if (configured) {
    return configured.replace(/\/$/, '')
  }

  try {
    const origin = window.location.origin
    if (origin && origin !== 'null') {
      return origin
    }
  } catch {
  }

  return 'http://localhost:5174'
}

export function getAuthRedirectUrl(path: string): string {
  const base = getAuthRedirectBase()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`
}
