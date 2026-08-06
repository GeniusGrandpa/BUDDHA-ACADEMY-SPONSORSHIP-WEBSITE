import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { getGoogleLanguageCode, useLanguage } from './LanguageContext'
import { requestPageTranslation } from '../lib/translation/translateService'
import { isTranslatableText, translationCacheKey } from '../lib/translation/translatable'
import { logger } from '../lib/logger'

const CHUNK_SIZE = 80

const cache = new Map<string, string>()
const inflight = new Map<string, Promise<string>>()

interface QueuedText {
  key: string
  lang: string
  text: string
  generation: number
  resolve: (value: string) => void
}

interface TranslationContextValue {
  language: string
  isHydrated: boolean
  translate: (text: string) => Promise<string>
  translateTexts: (texts: string[]) => Promise<string[]>
  translateCMS: <T extends Record<string, string>>(obj: T) => Promise<T>
  translateMissingStrings: (texts: string[]) => Promise<string[]>
  clearCache: () => void
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage()

  const [isHydrated, setIsHydrated] = useState(false)
  useEffect(() => {
    setIsHydrated(true)
  }, [])
  const hydratedRef = useRef(false)
  hydratedRef.current = isHydrated

  const languageRef = useRef(language)
  languageRef.current = language
  const generationRef = useRef(0)

  useEffect(() => {
    generationRef.current += 1
  }, [language])

  const queueRef = useRef<Map<string, QueuedText>>(new Map())
  const timerRef = useRef<number | null>(null)

  const flush = useCallback(async () => {
    timerRef.current = null
    const queue = queueRef.current
    queueRef.current = new Map()
    if (queue.size === 0) return

    const byLang = new Map<string, QueuedText[]>()
    for (const entry of queue.values()) {
      const list = byLang.get(entry.lang)
      if (list) list.push(entry)
      else byLang.set(entry.lang, [entry])
    }

    const currentGeneration = generationRef.current
    for (const [lang, entries] of byLang) {
      const stale = entries.filter((entry) => entry.generation !== currentGeneration)
      for (const entry of stale) {
        inflight.delete(entry.key)
        entry.resolve(entry.text)
      }
      const fresh = entries.filter((entry) => entry.generation === currentGeneration)
      if (fresh.length === 0) continue

      const target = getGoogleLanguageCode(lang)
      const unique = Array.from(new Set(fresh.map((entry) => entry.text)))
      const translated = new Map<string, string>()
      try {
        for (let i = 0; i < unique.length; i += CHUNK_SIZE) {
          const chunk = unique.slice(i, i + CHUNK_SIZE)
          const response = await requestPageTranslation({
            pageId: 'global',
            language: lang,
            target,
            texts: chunk,
          })
          if (!response || !Array.isArray(response.translations)) continue
          response.translations.forEach((value, index) => {
            if (value) translated.set(chunk[index], value)
          })
        }
      } catch (err) {
        logger.error('[translation] batch request failed', err)
      }
      for (const entry of fresh) {
        const value = translated.get(entry.text) || entry.text
        cache.set(entry.key, value)
        inflight.delete(entry.key)
        entry.resolve(value)
      }
    }
  }, [])

  const schedule = useCallback(() => {
    if (timerRef.current !== null) return
    timerRef.current = window.setTimeout(() => {
      void flush()
    }, 0)
  }, [flush])

  const translate = useCallback(
    (text: string): Promise<string> => {
      if (!hydratedRef.current) return Promise.resolve(text)
      const lang = languageRef.current
      if (!text || lang === 'en' || !isTranslatableText(text)) {
        return Promise.resolve(text)
      }
      const key = translationCacheKey(lang, text)
      const cached = cache.get(key)
      if (cached !== undefined) return Promise.resolve(cached)
      const pending = inflight.get(key)
      if (pending) return pending
      const generation = generationRef.current
      const promise = new Promise<string>((resolve) => {
        queueRef.current.set(key, { key, lang, text, generation, resolve })
        schedule()
      })
      inflight.set(key, promise)
      return promise
    },
    [schedule],
  )

  const translateTexts = useCallback(
    (texts: string[]) => Promise.all(texts.map((text) => translate(text))),
    [translate],
  )

  const translateCMS = useCallback(
    async <T extends Record<string, string>>(obj: T): Promise<T> => {
      const entries = Object.entries(obj)
      const results = await translateTexts(entries.map(([, value]) => value))
      const out: Record<string, string> = { ...obj }
      entries.forEach(([key, value], index) => {
        out[key] = results[index] ?? value
      })
      return out as T
    },
    [translateTexts],
  )

  const translateMissingStrings = useCallback(
    async (texts: string[]): Promise<string[]> => {
      const lang = languageRef.current
      if (lang === 'en' || texts.length === 0) return texts
      const results: string[] = new Array(texts.length)
      const missing: Array<{ index: number; text: string }> = []
      texts.forEach((text, index) => {
        const key = translationCacheKey(lang, text)
        const cached = cache.get(key)
        if (cached !== undefined) results[index] = cached
        else missing.push({ index, text })
      })
      const translated = await translateTexts(missing.map((m) => m.text))
      missing.forEach((m, index) => {
        results[m.index] = translated[index] ?? m.text
      })
      return results
    },
    [translateTexts],
  )

  const clearCache = useCallback(() => {
    cache.clear()
  }, [])

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      isHydrated,
      translate,
      translateTexts,
      translateCMS,
      translateMissingStrings,
      clearCache,
    }),
    [language, isHydrated, translate, translateTexts, translateCMS, translateMissingStrings, clearCache],
  )

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>
}

export function useTranslation(): TranslationContextValue {
  const context = useContext(TranslationContext)
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider')
  }
  return context
}
