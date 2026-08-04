export function optimizeImageUrl(
  url: string | null | undefined,
  opts?: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' },
): string | undefined {
  if (!url) return undefined

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return url
  }

  const isSupabaseStorage =
    parsed.hostname.endsWith('.supabase.co') &&
    parsed.pathname.includes('/storage/v1/object/public/')

  if (!isSupabaseStorage) return url

  const { width, height, quality = 75, resize } = opts || {}
  const params = new URLSearchParams(parsed.search)

  if (width) params.set('width', String(width))
  if (height && width && resize) {
    params.set('height', String(height))
    params.set('resize', resize)
  } else if (height && !width) {
    params.set('height', String(height))
  }
  params.set('quality', String(quality))

  parsed.search = params.toString()
  return parsed.toString()
}
