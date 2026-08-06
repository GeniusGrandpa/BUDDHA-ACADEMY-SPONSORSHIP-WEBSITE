import { createClient } from '@supabase/supabase-js'
import { corsHeaders, jsonOk, jsonError, handleError } from '../_shared/response.ts'
import { getTranslationProvider } from '../_shared/translation-provider.ts'
import {
  NL_SENTINEL,
  protectNewlines,
  restoreNewlines,
  resolvePageTranslation,
} from '../_shared/translation-core.ts'

const LANGUAGE_REGEX = /^[a-zA-Z-]{2,24}$/
const MAX_TEXT_LENGTH = 5000
const MAX_PAGE_ID_LENGTH = 120

const serviceClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
)

interface StoredRow {
  translated_title: string | null
  translated_description: string | null
  translated_content: Record<string, string> | null
}

function normalizeRow(data: Record<string, unknown> | null): StoredRow | null {
  if (!data) return null
  const content = data.translated_content
  const map: Record<string, string> =
    content && typeof content === 'object' && !Array.isArray(content)
      ? (content as Record<string, string>)
      : {}
  return {
    translated_title: typeof data.translated_title === 'string' ? data.translated_title : null,
    translated_description:
      typeof data.translated_description === 'string' ? data.translated_description : null,
    translated_content: map,
  }
}

async function loadRow(pageId: string, language: string): Promise<StoredRow | null> {
  const { data, error } = await serviceClient
    .from('page_translations')
    .select('translated_title, translated_description, translated_content')
    .eq('page_id', pageId)
    .eq('language', language)
    .maybeSingle()
  if (error) throw error
  return normalizeRow(data as Record<string, unknown> | null)
}

async function saveRow(
  pageId: string,
  language: string,
  content: Record<string, string>,
  title: string | null,
  description: string | null,
): Promise<void> {
  const now = new Date().toISOString()
  const { error } = await serviceClient
    .from('page_translations')
    .upsert(
      {
        page_id: pageId,
        language,
        translated_content: content,
        translated_title: title,
        translated_description: description,
        translated_at: now,
        updated_at: now,
      },
      { onConflict: 'page_id,language' },
    )
  if (error) throw error
}

function extractTexts(body: unknown): string[] | null {
  const b = body as { texts?: unknown; text?: unknown } | null
  let texts: string[] = []
  if (Array.isArray(b?.texts)) {
    texts = b.texts.filter((t): t is string => typeof t === 'string' && t.trim() !== '')
  } else if (typeof b?.text === 'string' && b.text.trim()) {
    texts = [b.text]
  }
  if (texts.length === 0) return null
  if (texts.some((t) => t.length > MAX_TEXT_LENGTH)) return null
  return texts
}

function stringField(body: unknown, name: string, maxLength: number): string | undefined {
  const value = (body as Record<string, unknown> | null)?.[name]
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.slice(0, maxLength)
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return jsonError('Method not allowed', 'METHOD_NOT_ALLOWED', 405)
  }

  try {
    const body = await req.json()
    const pageId =
      typeof body?.pageId === 'string' && body.pageId
        ? body.pageId.slice(0, MAX_PAGE_ID_LENGTH)
        : 'global'
    const language =
      typeof body?.language === 'string' && body.language
        ? body.language
        : typeof body?.target === 'string'
          ? body.target
          : ''
    const target =
      typeof body?.target === 'string' && body.target ? body.target : language

    if (!LANGUAGE_REGEX.test(language)) {
      return jsonError('Invalid language', 'VALIDATION_ERROR', 400)
    }
    if (!LANGUAGE_REGEX.test(target)) {
      return jsonError('Invalid target language', 'VALIDATION_ERROR', 400)
    }

    const rawTexts = extractTexts(body)
    if (!rawTexts) {
      return jsonError('texts must be non-empty and each at most 5000 characters', 'VALIDATION_ERROR', 400)
    }
    const texts = rawTexts.map(protectNewlines)

    if (language === 'en' || target === 'en') {
      return jsonOk({ cached: true, translations: texts.map(restoreNewlines) })
    }

    const title = stringField(body, 'title', 1000)
    const description = stringField(body, 'description', MAX_TEXT_LENGTH)

    const provider = getTranslationProvider()
    const row = await loadRow(pageId, language)

    const result = await resolvePageTranslation({
      texts,
      cachedMap: row?.translated_content ?? {},
      target,
      provider,
      title,
      description,
    })

    const shouldWrite =
      Object.keys(result.mergedMap).length > 0 ||
      result.translatedTitle !== undefined ||
      result.translatedDescription !== undefined
    if (shouldWrite) {
      await saveRow(
        pageId,
        language,
        result.mergedMap,
        result.translatedTitle ?? row?.translated_title ?? null,
        result.translatedDescription ?? row?.translated_description ?? null,
      )
    }

    return jsonOk({
      cached: result.cached,
      translations: result.translations.map(restoreNewlines),
      translatedTitle: result.translatedTitle,
      translatedDescription: result.translatedDescription,
    })
  } catch (err) {
    return handleError('translate', err)
  }
})