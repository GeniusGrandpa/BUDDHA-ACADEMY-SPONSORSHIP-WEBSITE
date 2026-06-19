import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'buddha-academy-dark-mode'

interface DarkModeReturn {
  isDark: boolean
  toggle: () => void
  enable: () => void
  disable: () => void
}

function getInitialValue(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'true'
    }
  } catch {
  }

  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }

  return false
}

export function useDarkMode(): DarkModeReturn {
  const [isDark, setIsDark] = useState<boolean>(getInitialValue)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark))
    } catch {
    }

    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = (e: MediaQueryListEvent) => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored === null) {
          setIsDark(e.matches)
        }
      } catch {
        setIsDark(e.matches)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggle = useCallback(() => setIsDark(prev => !prev), [])
  const enable = useCallback(() => setIsDark(true), [])
  const disable = useCallback(() => setIsDark(false), [])

  return { isDark, toggle, enable, disable }
}
