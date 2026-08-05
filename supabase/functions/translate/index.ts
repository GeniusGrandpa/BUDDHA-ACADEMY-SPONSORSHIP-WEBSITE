const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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
    body: JSON.stringify({
      q: text,
      target,
      source: 'en',
      format: 'text',
    }),
  })
  if (!resp.ok) return ''
  const data = await resp.json()
  const translated = data?.data?.translations?.[0]?.translatedText as string | undefined
  if (!translated) return ''
  return translated.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').trim()
}

async function translateFree(text: string, target: string): Promise<string> {
  const resp = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ sl: 'en', tl: target, dt: 't', q: text }),
  })
  if (!resp.ok) throw new Error('TRANSLATION_SERVICE_UNAVAILABLE')
  const data = await resp.json()
  const translated = safeSingleTranslation(data)
  if (!translated) throw new Error('TRANSLATION_EMPTY')
  return translated
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
    const text = typeof body?.text === 'string' ? body.text : ''
    const target = typeof body?.target === 'string' ? body.target : ''

    if (!text.trim() || !target) {
      return json({ success: false, message: 'text and target are required', errorCode: 'VALIDATION_ERROR' }, 400)
    }
    if (text.length > 5000) {
      return json({ success: false, message: 'text too long (max 5000 chars)', errorCode: 'VALIDATION_ERROR' }, 400)
    }
    if (!/^[a-zA-Z-]{2,24}$/.test(target)) {
      return json({ success: false, message: 'invalid target language', errorCode: 'VALIDATION_ERROR' }, 400)
    }

    const official = await translateOfficial(text, target)
    const translated = official || await translateFree(text, target)

    return json({ success: true, translated, target }, 200)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Translation failed'
    const status = message === 'TRANSLATION_SERVICE_UNAVAILABLE' ? 502 : 500
    return json({ success: false, message, errorCode: 'TRANSLATION_FAILED' }, status)
  }
})