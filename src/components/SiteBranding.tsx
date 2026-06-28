import { useEffect, useRef } from 'react'
import { useTheme } from '../context/ThemeContext'

const BRANDING_ATTR = 'data-sb'

function setMeta(prop: string, content: string) {
  const sel = prop.startsWith('og:') || prop.startsWith('twitter:')
    ? `meta[property="${prop}"]`
    : `meta[name="${prop}"]`
  let el = document.querySelector<HTMLMetaElement>(sel)
  if (!el) {
    el = document.createElement('meta')
    if (prop.startsWith('og:') || prop.startsWith('twitter:')) {
      el.setAttribute('property', prop)
    } else {
      el.name = prop
    }
    document.head.appendChild(el)
  }
  el.content = content
}

function setLink(rel: string, href: string, extra: Record<string, string> = {}) {
  const id = `sb-${rel.replace(/\s+/g, '-')}`
  let el = document.getElementById(id) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.id = id
    el.rel = rel
    el.setAttribute(BRANDING_ATTR, '')
    document.head.appendChild(el)
  }
  el.href = href
  Object.entries(extra).forEach(([k, v]) => el!.setAttribute(k, v))
}

function cacheBust(url: string, ver: number): string {
  if (!url) return url
  const sep = url.includes('?') ? '&' : '?'
  return `${url}${sep}_cb=${ver}`
}

const HEX_RE = /^#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?$/

function isValidHex(color: string): boolean {
  return HEX_RE.test(color)
}

export function SiteBranding() {
  const { branding, isLoaded } = useTheme()
  const verRef = useRef(0)
  const prevRef = useRef('')

  useEffect(() => {
    if (!isLoaded) return

    const b = branding
    const key = JSON.stringify(b)
    if (key === prevRef.current) return
    prevRef.current = key

    verRef.current += 1
    const v = verRef.current

    const siteName = b?.browser_tab_title || b?.organization_name || 'Buddha Academy'
    const tagline = b?.tagline || ''
    document.title = tagline ? `${siteName} - ${tagline}` : siteName

    setMeta('description', tagline)
    setMeta('og:title', siteName)
    setMeta('og:description', tagline)
    setMeta('og:type', 'website')
    setMeta('twitter:card', 'summary_large_image')
    setMeta('twitter:title', siteName)
    setMeta('twitter:description', tagline)

    if (b?.theme_color && isValidHex(b.theme_color)) {
      setMeta('theme-color', b.theme_color)
    }

    if (b?.og_image_url) {
      const url = cacheBust(b.og_image_url, v)
      setMeta('og:image', url)
      setMeta('twitter:image', url)
    }

    const fv = b?.favicon_url
    if (fv) {
      const busted = cacheBust(fv, v)
      const ext = fv.split('.').pop()?.toLowerCase()
      if (ext === 'svg') {
        setLink('icon', busted, { type: 'image/svg+xml' })
      } else if (ext === 'png') {
        setLink('icon', busted, { type: 'image/png' })
      } else {
        setLink('icon', busted, { type: 'image/x-icon' })
      }
      setLink('shortcut icon', busted)
    }

    if (b?.apple_touch_icon_url) {
      setLink('apple-touch-icon', cacheBust(b.apple_touch_icon_url, v), { sizes: '180x180' })
    } else if (fv) {
      setLink('apple-touch-icon', cacheBust(fv, v), { sizes: '180x180' })
    }

    return () => {
      document.querySelectorAll(`[${BRANDING_ATTR}]`).forEach(el => el.remove())
    }
  }, [branding, isLoaded])

  return null
}
