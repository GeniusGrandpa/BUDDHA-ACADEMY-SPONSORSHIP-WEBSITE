import { createContext, useContext } from 'react'
import type { DesignSettings, DesignColors, DesignBranding, DesignTypography, DesignLayout, DesignTokens, DesignComponentStyles } from '../types/design'

export interface ThemeContextValue {
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

export const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}