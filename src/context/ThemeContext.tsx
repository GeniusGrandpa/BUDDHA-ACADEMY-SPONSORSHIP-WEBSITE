/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { DesignSettings, DesignColors, DesignBranding, DesignTypography, DesignLayout, DesignTokens, DesignComponentStyles } from '../types/design'
import { DEFAULT_COLORS, DEFAULT_BRANDING, DEFAULT_TYPOGRAPHY, DEFAULT_LAYOUT, DEFAULT_TOKENS, DEFAULT_COMPONENT_STYLES } from '../types/design'
import { getPublishedDesignSettings } from '../services/design'

interface ThemeContextValue {
  settings: DesignSettings | null
  colors: DesignColors
  typography: DesignTypography
  layout: DesignLayout
  branding: DesignBranding
  tokens: DesignTokens
  componentStyles: DesignComponentStyles
  isLoaded: boolean
  refreshTheme: () => Promise<void>
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '')
  if (clean.length !== 6 && clean.length !== 3) return null
  const full = clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean
  const num = parseInt(full, 16)
  if (isNaN(num)) return null
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 }
}

function generateColorShades(hex: string): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return []
  const shades: string[] = []
  for (let i = 0; i < 10; i++) {
    const factor = i / 10
    const r = Math.round(rgb.r + (255 - rgb.r) * factor)
    const g = Math.round(rgb.g + (255 - rgb.g) * factor)
    const b = Math.round(rgb.b + (255 - rgb.b) * factor)
    shades.push(`rgb(${r}, ${g}, ${b})`)
  }
  return shades
}

function getContrastColor(hex: string): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255
  return luminance > 0.5 ? '#111827' : '#ffffff'
}

function isTrustedUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return ['http:', 'https:'].includes(parsed.protocol)
  } catch {
    return false
  }
}

function generateCSSVariables(settings: DesignSettings | null): string {
  const colors = settings?.colors || DEFAULT_COLORS
  const typography = settings?.typography || DEFAULT_TYPOGRAPHY
  const layout = settings?.layout || DEFAULT_LAYOUT
  const tokens = settings?.tokens || DEFAULT_TOKENS

  const vars: string[] = []

  Object.entries(colors).forEach(([key, value]) => {
    const cssKey = key.replace(/_/g, '-')
    vars.push(`  --color-${cssKey}: ${value};`)
    const rgb = hexToRgb(value)
    if (rgb) {
      vars.push(`  --color-${cssKey}-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};`)
    }
  })
  const primaryShades = generateColorShades(colors.primary)
  primaryShades.forEach((shade, i) => {
    const level = (i + 1) * 100
    vars.push(`  --color-primary-${level}: ${shade};`)
  })
  vars.push(`  --color-text-on-primary: ${getContrastColor(colors.primary)};`)
  vars.push(`  --color-text-on-secondary: ${getContrastColor(colors.secondary)};`)
  vars.push(`  --color-text-on-accent: ${getContrastColor(colors.accent)};`)
  vars.push(`  --font-heading: '${typography.heading_font}', sans-serif;`)
  vars.push(`  --font-body: '${typography.body_font}', sans-serif;`)
  vars.push(`  --font-size-base: ${typography.base_size}px;`)
  vars.push(`  --font-size-h1: ${typography.h1_size}rem;`)
  vars.push(`  --font-size-h2: ${typography.h2_size}rem;`)
  vars.push(`  --font-size-h3: ${typography.h3_size}rem;`)
  vars.push(`  --font-size-h4: ${typography.h4_size}rem;`)
  vars.push(`  --font-size-h5: ${typography.h5_size}rem;`)
  vars.push(`  --font-size-h6: ${typography.h6_size}rem;`)
  vars.push(`  --font-size-body: ${typography.body_size}rem;`)
  vars.push(`  --font-size-small: ${typography.small_size}rem;`)
  vars.push(`  --font-weight-heading: ${typography.heading_weight};`)
  vars.push(`  --font-weight-body: ${typography.body_weight};`)
  vars.push(`  --letter-spacing-heading: ${typography.heading_letter_spacing}em;`)
  vars.push(`  --letter-spacing-body: ${typography.body_letter_spacing}em;`)
  vars.push(`  --line-height-heading: ${typography.heading_line_height};`)
  vars.push(`  --line-height-body: ${typography.body_line_height};`)
  vars.push(`  --text-transform-heading: ${typography.text_transform_heading};`)
  vars.push(`  --text-transform-body: ${typography.text_transform_body};`)
  vars.push(`  --layout-container-width: ${layout.container_width}px;`)
  vars.push(`  --layout-container-padding: ${layout.container_padding_x}px;`)
  vars.push(`  --layout-section-spacing-y: ${layout.section_spacing_y}px;`)
  vars.push(`  --layout-section-spacing-x: ${layout.section_spacing_x}px;`)
  vars.push(`  --radius-sm: ${layout.border_radius_sm}rem;`)
  vars.push(`  --radius-md: ${layout.border_radius_md}rem;`)
  vars.push(`  --radius-lg: ${layout.border_radius_lg}rem;`)
  vars.push(`  --radius-xl: ${layout.border_radius_xl}rem;`)
  vars.push(`  --radius-2xl: ${layout.border_radius_2xl}rem;`)
  vars.push(`  --radius-full: ${layout.border_radius_full}px;`)
  vars.push(`  --shadow-sm: ${layout.shadow_sm};`)
  vars.push(`  --shadow-md: ${layout.shadow_md};`)
  vars.push(`  --shadow-lg: ${layout.shadow_lg};`)
  vars.push(`  --shadow-xl: ${layout.shadow_xl};`)
  vars.push(`  --animation-enabled: ${layout.animation_enabled ? '1' : '0'};`)
  vars.push(`  --animation-duration: ${layout.animation_duration}s;`)
  vars.push(`  --hover-effects: ${layout.hover_effects ? '1' : '0'};`)
  vars.push(`  --website-max-width: ${layout.website_max_width}%;`)
  vars.push(`  --spacing-unit: ${tokens.spacing_unit}px;`)
  vars.push(`  --transition-duration: ${tokens.transition_duration}ms;`)
  vars.push(`  --transition-timing: ${tokens.transition_timing};`)
  vars.push(`  --z-dropdown: ${tokens.z_index_dropdown};`)
  vars.push(`  --z-sticky: ${tokens.z_index_sticky};`)
  vars.push(`  --z-modal-backdrop: ${tokens.z_index_modal_backdrop};`)
  vars.push(`  --z-modal: ${tokens.z_index_modal};`)
  vars.push(`  --z-popover: ${tokens.z_index_popover};`)
  vars.push(`  --z-tooltip: ${tokens.z_index_tooltip};`)
  vars.push(`  --z-toast: ${tokens.z_index_toast};`)
  vars.push(`  --bp-sm: ${tokens.breakpoint_sm}px;`)
  vars.push(`  --bp-md: ${tokens.breakpoint_md}px;`)
  vars.push(`  --bp-lg: ${tokens.breakpoint_lg}px;`)
  vars.push(`  --bp-xl: ${tokens.breakpoint_xl}px;`)
  vars.push(`  --bp-2xl: ${tokens.breakpoint_2xl}px;`)

  return `:root {\n${vars.join('\n')}\n}`
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DesignSettings | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const styleRef = useRef<HTMLStyleElement | null>(null)

  const applyTheme = useCallback((s: DesignSettings | null) => {
    const css = generateCSSVariables(s)
    if (!styleRef.current) {
      styleRef.current = document.createElement('style')
      styleRef.current.id = 'dynamic-theme-vars'
      document.head.appendChild(styleRef.current)
    }
    styleRef.current.textContent = css
  }, [])

  const applyFavicon = useCallback((branding: DesignBranding | undefined) => {
    const url = branding?.favicon_url
    if (!url || !isTrustedUrl(url)) return
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = url
  }, [])

  const loadGoogleFont = useCallback((typography: DesignTypography | undefined) => {
    const existing = document.getElementById('dynamic-theme-fonts')
    if (existing) existing.remove()

    if (!typography) return

    const urls: string[] = []
    if (typography.heading_font_url && isTrustedUrl(typography.heading_font_url)) urls.push(typography.heading_font_url)
    if (typography.body_font_url && typography.body_font_url !== typography.heading_font_url && isTrustedUrl(typography.body_font_url)) {
      urls.push(typography.body_font_url)
    }

    urls.forEach(href => {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = href
      link.dataset.themeFont = 'true'
      document.head.appendChild(link)
    })
  }, [])

  const refreshTheme = useCallback(async () => {
    try {
      const data = await getPublishedDesignSettings()
      setSettings(data)
      applyTheme(data)
      applyFavicon(data?.branding as DesignBranding | undefined)
      loadGoogleFont(data?.typography as DesignTypography | undefined)
    } catch {
      applyTheme(null)
    } finally {
      setIsLoaded(true)
    }
  }, [applyTheme, applyFavicon, loadGoogleFont])

  useEffect(() => {
    refreshTheme()
    return () => {
      if (styleRef.current) {
        styleRef.current.remove()
        styleRef.current = null
      }
      document.querySelectorAll('link[data-theme-font]').forEach(el => el.remove())
    }
  }, [refreshTheme])

  const value: ThemeContextValue = {
    settings,
    colors: (settings?.colors || DEFAULT_COLORS) as DesignColors,
    typography: (settings?.typography || DEFAULT_TYPOGRAPHY) as DesignTypography,
    layout: (settings?.layout || DEFAULT_LAYOUT) as DesignLayout,
    branding: (settings?.branding || DEFAULT_BRANDING) as DesignBranding,
    tokens: (settings?.tokens || DEFAULT_TOKENS) as DesignTokens,
    componentStyles: (settings?.component_styles || DEFAULT_COMPONENT_STYLES) as DesignComponentStyles,
    isLoaded,
    refreshTheme,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
