const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const NL_SENTINEL = '\uE000'
const MAX_TEXT_LENGTH = 5000
const CHUNK_CHAR_LIMIT = 4500

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function safeSingleTranslation(data: unknown[] | null): string {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return ''
  const segments: string[] = []
  for (const row of data[0] as unknown[][]) {
    if (typeof row?.[0] === 'string' && row[0]) segments.push(row[0])
  }
  return segments.join('').trim()
}

async function translateOfficial(text: string, target: string): Promise<string> {
  const apiKey = Deno.env.get('GOOGLE_API_KEY') ?? ''
  if (!apiKey) return ''

  const url = 'https://translation.googleapis.com/language/translate/v2'
  const resp = await fetch(`${url}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ q: text, target, source: 'en', format: 'text' }),
  })
  if (!resp.ok) return ''
  const data = await resp.json()
  const translated = data?.data?.translations?.[0]?.translatedText as string | undefined
  if (!translated) return ''
  return translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()
}

async function translateFreeWithRetry(text: string, target: string, attempts = 3): Promise<string> {
  let lastError: Error | null = null
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const resp = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ sl: 'en', tl: target, dt: 't', q: text }),
      })
      if (!resp.ok) throw new Error(`gtx returned ${resp.status}`)
      const data = await resp.json()
      const translated = safeSingleTranslation(data)
      if (!translated) throw new Error('TRANSLATION_EMPTY')
      return translated
    } catch (err) {
      lastError = err instanceof Error ? err : new Error('translation failed')
      if (attempt < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, 200 * (attempt + 1)))
      }
    }
  }
  throw lastError
}

async function translateOne(text: string, target: string): Promise<string> {
  const official = await translateOfficial(text, target)
  if (official) return official
  return translateFreeWithRetry(text, target)
}

function chunkTexts(texts: string[]): string[][] {
  const chunks: string[][] = []
  let current: string[] = []
  let currentLength = 0
  for (const text of texts) {
    if (currentLength + text.length > CHUNK_CHAR_LIMIT && current.length > 0) {
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

async function translateMany(texts: string[], target: string): Promise<string[]> {
  const results = new Array<string>(texts.length)
  const chunks = chunkTexts(texts)

  for (const chunk of chunks) {
    const chunkResult = await translateOne(chunk.join('\n'), target)
    const lines = chunkResult.split('\n')
    if (lines.length !== chunk.length) {
      // gtx did not preserve line count — fall back to per-text translation
      for (let i = 0; i < chunk.length; i++) {
        const offset = texts.indexOf(chunk[i])
        try {
          results[offset] = await translateOne(chunk[i], target)
        } catch {
          results[offset] = chunk[i]
        }
      }
      continue
    }
    for (let i = 0; i < chunk.length; i++) {
      const offset = texts.indexOf(chunk[i])
      results[offset] = lines[i].trim()
    }
  }

  return results
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ success: false, message: 'Method not allowed', errorCode: 'METHOD_NOT_ALLOWED' }, 405)
  }

  try {
    const body = await req.json()
    const target = typeof body?.target === 'string' ? body.target : ''

    if (!/^[a-zA-Z-]{2,24}$/.test(target)) {
      return json({ success: false, message: 'invalid target language', errorCode: 'VALIDATION_ERROR' }, 400)
    }

    if (Array.isArray(body?.texts)) {
      const texts = body.texts
        .filter((t: unknown): t is string => typeof t === 'string')
        .map((t) => t.replaceAll('\n', NL_SENTINEL))
      if (texts.length === 0) {
        return json({ success: false, message: 'texts must not be empty', errorCode: 'VALIDATION_ERROR' }, 400)
      }
      const tooLong = texts.find((t) => t.length > MAX_TEXT_LENGTH)
      if (tooLong) {
        return json({ success: false, message: 'text too long (max 5000 chars)', errorCode: 'VALIDATION_ERROR' }, 400)
      }
      const translations = await translateMany(texts, target)
      return json({
        success: true,
        translations: translations.map((t) => t.replaceAll(NL_SENTINEL, '\n')),
        target,
      }, 200)
    }

    const text = typeof body?.text === 'string' ? body.text : ''
    if (!text.trim()) {
      return json({ success: false, message: 'text and target are required', errorCode: 'VALIDATION_ERROR' }, 400)
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return json({ success: false, message: 'text too long (max 5000 chars)', errorCode: 'VALIDATION_ERROR' }, 400)
    }

    const translated = await translateOne(text.replaceAll('\n', NL_SENTINEL), target)
    return json({ success: true, translated: translated.replaceAll(NL_SENTINEL, '\n'), target }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Translation failed'
    const status = message === 'TRANSLATION_SERVICE_UNAVAILABLE' ? 502 : 500
    return json({ success: false, message, errorCode: 'TRANSLATION_FAILED' }, status)
  }
})