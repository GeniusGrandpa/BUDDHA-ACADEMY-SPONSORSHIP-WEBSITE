import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react'
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
  resolve: (value: string) => void
}

interface TranslationContextValue {
  language: string
  translate: (text: string) => Promise<string>
  translateTexts: (texts: string[]) => Promise<string[]>
  clearCache: () => void
}

const TranslationContext = createContext<TranslationContextValue | null>(null)

export function TranslationProvider({ children }: { children: ReactNode }) {
  const { language } = useLanguage()
  const languageRef = useRef(language)
  languageRef.current = language
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

    for (const [lang, entries] of byLang) {
      const target = getGoogleLanguageCode(lang)
      const unique = Array.from(new Set(entries.map((entry) => entry.text)))
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
      for (const entry of entries) {
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
      const lang = languageRef.current
      if (!text || lang === 'en' || !isTranslatableText(text)) {
        return Promise.resolve(text)
      }
      const key = translationCacheKey(lang, text)
      const cached = cache.get(key)
      if (cached !== undefined) return Promise.resolve(cached)
      const pending = inflight.get(key)
      if (pending) return pending
      const promise = new Promise<string>((resolve) => {
        queueRef.current.set(key, { key, lang, text, resolve })
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

  const clearCache = useCallback(() => {
    cache.clear()
  }, [])

  const value = useMemo<TranslationContextValue>(
    () => ({
      language,
      translate,
      translateTexts,
      clearCache,
    }),
    [language, translate, translateTexts, clearCache],
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
