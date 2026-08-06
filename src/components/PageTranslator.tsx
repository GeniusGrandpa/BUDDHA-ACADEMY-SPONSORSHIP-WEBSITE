import { useCallback, useEffect, useRef } from 'react'
import { getGoogleLanguageCode, useLanguage } from '../context/LanguageContext'
import { requestPageTranslation } from '../lib/translation/translateService'

const SKIP_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'NOSCRIPT',
  'CODE',
  'PRE',
  'TEXTAREA',
  'INPUT',
  'SVG',
  'PATH',
])
const SKIP_TEXTS = new Set(['Buddha Academy'])

function isInsideExcluded(node: Node): boolean {
  let el = node.parentNode
  while (el && el.nodeType === 1) {
    const current = el as HTMLElement
    if (
      SKIP_TAGS.has(current.tagName) ||
      current.hasAttribute('data-no-translate') ||
      current.isContentEditable
    ) {
      return true
    }
    el = current.parentNode
  }
  return false
}

function isTranslatableText(text: string): boolean {
  const trimmed = text.trim()
  if (trimmed.length < 2) return false
  if (/^[\d\s.,:/_\-+%$?°|\u00a0#@()[\]{}]+$/.test(trimmed)) return false
  if (/^https?:\/\//i.test(trimmed)) return false
  if (/^\S+@\S+\.\S+$/.test(trimmed)) return false
  return /\p{L}/u.test(trimmed)
}

const originalText = new WeakMap<Text, string>()
const writtenValues = new WeakMap<Text, string>()

function collectTextNodes(): Text[] {
  const nodes: Text[] = []
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node) {
      if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT
      if (isInsideExcluded(node)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })
  let next = walker.nextNode()
  while (next) {
    nodes.push(next as Text)
    next = walker.nextNode()
  }
  return nodes
}

function cacheKey(target: string, text: string): string {
  return `i18n:v2:${target}:${text}`
}

const CHUNK_SIZE = 80

export function PageTranslator() {
  const { language } = useLanguage()
  const busyRef = useRef(false)
  const rerunRef = useRef(false)

  const translate = useCallback(async () => {
    if (typeof document === 'undefined') return
    if (language === 'en') {
      const nodes = collectTextNodes()
      for (const node of nodes) {
        const original = originalText.get(node)
        if (original != null && node.data !== original) node.data = original
      }
      return
    }
    if (busyRef.current) {
      rerunRef.current = true
      return
    }
    busyRef.current = true
    try {
      const target = getGoogleLanguageCode(language)
      const nodes = collectTextNodes()
      for (const node of nodes) {
        if (!originalText.has(node)) originalText.set(node, node.data)
      }

      const pending: { node: Text; pre: string; post: string; src: string }[] = []
      for (const node of nodes) {
        const source = originalText.get(node) ?? node.data
        const match = source.match(/^(\s*)([\s\S]*?)(\s*)$/)
        const pre = match?.[1] ?? ''
        const mid = match?.[2] ?? source
        const post = match?.[3] ?? ''
        if (!isTranslatableText(mid) || SKIP_TEXTS.has(mid)) continue
        pending.push({ node, pre, post, src: mid })
      }
      if (pending.length === 0) return

      const results = new Map<string, string>()
      const missing: string[] = []
      for (const { src } of pending) {
        let cached: string | null = null
        try {
          cached = sessionStorage.getItem(cacheKey(target, src))
        } catch {
          // storage unavailable
        }
        if (cached != null) {
          results.set(src, cached)
        } else if (!missing.includes(src)) {
          missing.push(src)
        }
      }

      for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
        const chunk = missing.slice(i, i + CHUNK_SIZE)
        try {
          const response = await requestPageTranslation({
            pageId: 'global',
            language,
            target,
            texts: chunk,
          })
          const translated = response?.translations ?? []
          for (let j = 0; j < chunk.length; j++) {
            const value = translated[j] || chunk[j]
            results.set(chunk[j], value)
            try {
              sessionStorage.setItem(cacheKey(target, chunk[j]), value)
            } catch {
              // storage unavailable
            }
          }
        } catch {
          // leave as English
        }
      }

      for (const { node, pre, post, src } of pending) {
        const translated = results.get(src)
        if (!translated) continue
        const next = pre + translated + post
        if (node.data !== next) {
          writtenValues.set(node, next)
          node.data = next
        }
      }
    } finally {
      busyRef.current = false
      if (rerunRef.current) {
        rerunRef.current = false
        window.setTimeout(() => translate(), 50)
      }
    }
  }, [language])

  useEffect(() => {
    const id = window.setTimeout(() => translate(), 30)
    return () => window.clearTimeout(id)
  }, [translate])

  useEffect(() => {
    if (typeof document === 'undefined') return
    let timer = 0
    const schedule = () => {
      if (timer) return
      timer = window.setTimeout(() => {
        timer = 0
        translate()
      }, 250)
    }
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          schedule()
          return
        }
        if (mutation.type === 'characterData') {
          const node = mutation.target as Text
          if (writtenValues.get(node) === node.data) {
            writtenValues.delete(node)
            continue
          }
          originalText.set(node, node.data)
          schedule()
          return
        }
      }
    })
    observer.observe(document.body, { subtree: true, childList: true, characterData: true })
    return () => {
      observer.disconnect()
      if (timer) window.clearTimeout(timer)
    }
  }, [translate])

  return null
}
