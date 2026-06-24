/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { getAllCmsStrings } from '../services/cms-content'
import type { CmsStringMap } from '../types/cms-content'

interface CmsStringsContextValue {
  strings: CmsStringMap
  t: (key: string, replacements?: Record<string, string | number>) => string
  loading: boolean
  refresh: () => Promise<void>
}

const CmsStringsContext = createContext<CmsStringsContextValue>({
  strings: {},
  t: (key: string) => key,
  loading: true,
  refresh: async () => {},
})

export function CmsStringsProvider({ children }: { children: ReactNode }) {
  const [strings, setStrings] = useState<CmsStringMap>({})
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllCmsStrings()
      setStrings(data)
    } catch {
      setStrings({})
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    let value = strings[key] ?? key
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        value = value.replaceAll(`{${k}}`, String(v))
      }
    }
    return value
  }, [strings])

  return (
    <CmsStringsContext.Provider value={{ strings, t, loading, refresh: load }}>
      {children}
    </CmsStringsContext.Provider>
  )
}

export function useCmsStrings() {
  return useContext(CmsStringsContext)
}
