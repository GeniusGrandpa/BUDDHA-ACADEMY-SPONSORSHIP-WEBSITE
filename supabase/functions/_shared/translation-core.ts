import type { TranslationProvider } from './translation-provider.ts'

export const NL_SENTINEL = '\uE000'
const CHUNK_CHAR_LIMIT = 4500

export function protectNewlines(text: string): string {
  return text.replaceAll('\n', NL_SENTINEL)
}

export function restoreNewlines(text: string): string {
  return text.replaceAll(NL_SENTINEL, '\n')
}

export function chunkTexts(texts: string[], limit = CHUNK_CHAR_LIMIT): string[][] {
  const chunks: string[][] = []
  let current: string[] = []
  let currentLength = 0
  for (const text of texts) {
    if (currentLength + text.length > limit && current.length > 0) {
      chunks.push(current)
      current = []
      currentLength = 0
    }
    current.push(text)
    currentLength += text.length
  }
  if (current.length > 0) chunks.push(current)
  return chunks
}

export async function translateBatch(
  provider: TranslationProvider,
  texts: string[],
  target: string,
): Promise<string[]> {
  const results = new Array<string>(texts.length)
  for (const chunk of chunkTexts(texts)) {
    let chunkResult: string | null = null
    try {
      chunkResult = await provider.translate(chunk.join('\n'), target)
    } catch {
      chunkResult = null
    }
    const lines = chunkResult ? chunkResult.split('\n') : []
    if (lines.length === chunk.length) {
      for (let i = 0; i < chunk.length; i++) {
        results[texts.indexOf(chunk[i])] = lines[i].trim()
      }
      continue
    }
    for (let i = 0; i < chunk.length; i++) {
      const index = texts.indexOf(chunk[i])
      try {
        results[index] = (await provider.translate(chunk[i], target)).trim()
      } catch {
        results[index] = chunk[i]
      }
    }
  }
  for (let i = 0; i < results.length; i++) {
    if (!results[i]) results[i] = texts[i]
  }
  return results
}

export interface PageTranslationInput {
  texts: string[]
  cachedMap: Record<string, string>
  target: string
  provider: TranslationProvider
  title?: string
  description?: string
}

export interface PageTranslationResult {
  translations: string[]
  mergedMap: Record<string, string>
  cached: boolean
  translatedTitle?: string
  translatedDescription?: string
}

export async function resolvePageTranslation(
  input: PageTranslationInput,
): Promise<PageTranslationResult> {
  const { texts, cachedMap, target, provider } = input
  const resolved = new Array<string>(texts.length)
  const missingIndexes: number[] = []
  const missingTexts: string[] = []

  texts.forEach((text, index) => {
    const existing = cachedMap[text]
    if (existing !== undefined && existing !== '') {
      resolved[index] = existing
    } else {
      missingIndexes.push(index)
      missingTexts.push(text)
    }
  })

  const mergedMap: Record<string, string> = { ...cachedMap }
  const cached = missingTexts.length === 0

  if (missingTexts.length > 0) {
    const translated = await translateBatch(provider, missingTexts, target)
    missingIndexes.forEach((index, offset) => {
      const value = translated[offset]
      if (value && value !== missingTexts[offset]) {
        resolved[index] = value
        mergedMap[missingTexts[offset]] = value
      } else {
        resolved[index] = texts[index]
      }
    })
  }

  let translatedTitle: string | undefined
  let translatedDescription: string | undefined

  if (input.title) {
    if (mergedMap[input.title]) {
      translatedTitle = mergedMap[input.title]
    } else {
      const extra = await translateBatch(provider, [input.title], target)
      if (extra[0] && extra[0] !== input.title) {
        translatedTitle = extra[0]
        mergedMap[input.title] = translatedTitle
      } else {
        translatedTitle = input.title
      }
    }
  }

  if (input.description) {
    if (mergedMap[input.description]) {
      translatedDescription = mergedMap[input.description]
    } else {
      const extra = await translateBatch(provider, [input.description], target)
      if (extra[0] && extra[0] !== input.description) {
        translatedDescription = extra[0]
        mergedMap[input.description] = translatedDescription
      } else {
        translatedDescription = input.description
      }
    }
  }

  return {
    translations: resolved,
    mergedMap,
    cached,
    translatedTitle,
    translatedDescription,
  }
}