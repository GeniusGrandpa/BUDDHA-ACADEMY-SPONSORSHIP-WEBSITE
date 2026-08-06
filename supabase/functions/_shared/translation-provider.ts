export interface TranslationProvider {
  name: string
  translate(text: string, target: string): Promise<string>
}

export type TranslationEnv = Record<string, string | undefined>

export function readEnv(name: string, env?: TranslationEnv): string | undefined {
  if (env && name in env) return env[name]
  const deno = (globalThis as { Deno?: { env: { get(key: string): string | undefined } } }).Deno
  if (deno?.env) return deno.env.get(name)
  const proc = (globalThis as { process?: { env: TranslationEnv } }).process
  if (proc?.env) return proc.env[name]
  return undefined
}

function simpleCode(target: string): string {
  return target.split('-')[0]
}

function error(message: string): Error {
  return new Error(message)
}

function failOnEmpty(translated: string): string {
  if (!translated) throw error('provider returned an empty translation')
  return translated.trim()
}

function googleCloudProvider(env?: TranslationEnv): TranslationProvider {
  return {
    name: 'google-cloud',
    async translate(text, target) {
      const apiKey = readEnv('GOOGLE_API_KEY', env)
      if (!apiKey) throw error('GOOGLE_API_KEY is not configured')
      const resp = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ q: text, target, source: 'en', format: 'text' }),
        },
      )
      if (!resp.ok) throw error(`google cloud translation returned ${resp.status}`)
      const data = (await resp.json()) as { data?: { translations?: Array<{ translatedText?: string }> } }
      const translated = data?.data?.translations?.[0]?.translatedText
      if (!translated) throw error('google cloud returned an empty translation')
      return translated
        .replace(/&#39;/g, "'")
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .trim()
    },
  }
}

function libreTranslateProvider(env?: TranslationEnv): TranslationProvider {
  const apiKey = readEnv('LIBRETRANSLATE_API_KEY', env)
  const endpoint = readEnv('LIBRETRANSLATE_URL', env) ?? 'https://libretranslate.com/translate'
  return {
    name: 'libretranslate',
    async translate(text, target) {
      const params: Record<string, string> = {
        q: text,
        source: 'en',
        target: simpleCode(target),
        format: 'text',
      }
      if (apiKey) params.api_key = apiKey
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!resp.ok) throw error(`libretranslate returned ${resp.status}`)
      const data = (await resp.json()) as { translatedText?: string }
      return failOnEmpty(data.translatedText ?? '')
    },
  }
}

const TARGET_LANGUAGE_NAMES: Record<string, string> = {
  ne: 'Nepali',
  hi: 'Hindi',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  'zh-CN': 'Simplified Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  pt: 'Portuguese',
  ru: 'Russian',
  it: 'Italian',
  nl: 'Dutch',
  sv: 'Swedish',
  no: 'Norwegian',
  da: 'Danish',
  fi: 'Finnish',
  pl: 'Polish',
  cs: 'Czech',
  sk: 'Slovak',
  hu: 'Hungarian',
  ro: 'Romanian',
  bg: 'Bulgarian',
  el: 'Greek',
  tr: 'Turkish',
  uk: 'Ukrainian',
  id: 'Indonesian',
  ms: 'Malay',
  th: 'Thai',
  vi: 'Vietnamese',
  tl: 'Filipino',
  bn: 'Bengali',
  ur: 'Urdu',
  pa: 'Punjabi',
  ta: 'Tamil',
  te: 'Telugu',
  mr: 'Marathi',
  gu: 'Gujarati',
  kn: 'Kannada',
  ml: 'Malayalam',
  si: 'Sinhala',
  fa: 'Persian',
  iw: 'Hebrew',
  sw: 'Swahili',
  am: 'Amharic',
  ha: 'Hausa',
  yo: 'Yoruba',
  zu: 'Zulu',
  af: 'Afrikaans',
  sq: 'Albanian',
  sr: 'Serbian',
  hr: 'Croatian',
  sl: 'Slovenian',
  et: 'Estonian',
  lv: 'Latvian',
  lt: 'Lithuanian',
  ga: 'Irish',
  cy: 'Welsh',
  is: 'Icelandic',
  mt: 'Maltese',
}

function openaiProvider(env?: TranslationEnv): TranslationProvider {
  const apiKey = readEnv('OPENAI_API_KEY', env)
  const model = readEnv('OPENAI_TRANSLATION_MODEL', env) ?? 'gpt-4o-mini'
  const endpoint = readEnv('OPENAI_TRANSLATION_URL', env) ?? 'https://api.openai.com/v1/chat/completions'
  return {
    name: 'openai',
    async translate(text, target) {
      if (!apiKey) throw error('OPENAI_API_KEY is not configured')
      const languageName = TARGET_LANGUAGE_NAMES[target] ?? target
      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            {
              role: 'system',
              content: `Translate the user's message from English to ${languageName}. Respond with only the translation.`,
            },
            { role: 'user', content: text },
          ],
        }),
      })
      if (!resp.ok) throw error(`openai returned ${resp.status}`)
      const data = (await resp.json()) as { choices?: Array<{ message?: { content?: string } }> }
      const translated = data?.choices?.[0]?.message?.content
      return failOnEmpty(translated ?? '')
    },
  }
}

function huggingFaceProvider(env?: TranslationEnv): TranslationProvider {
  const apiKey = readEnv('HF_API_KEY', env)
  const model = readEnv('HF_TRANSLATION_MODEL', env) ?? 'facebook/m2m100_418M'
  return {
    name: 'huggingface',
    async translate(text, target) {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (apiKey) headers.Authorization = `Bearer ${apiKey}`
      const resp = await fetch(`https://api-inference.huggingface.co/models/${model}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          inputs: text,
          parameters: { src_lang: 'en', tgt_lang: simpleCode(target) },
        }),
      })
      if (!resp.ok) throw error(`huggingface returned ${resp.status}`)
      const data = (await resp.json()) as Array<{ generated_text?: string }>
      const translated = data?.[0]?.generated_text
      return failOnEmpty(translated ?? '')
    },
  }
}

const CLOUDFLARE_TARGET_CODES: Record<string, string> = {
  'zh-cn': 'zh',
  'zh-hans': 'zh',
  'zh-hant': 'zh',
  'zh-tw': 'zh',
  'zh-hk': 'zh',
  iw: 'he',
  fil: 'tl',
  nb: 'no',
  nn: 'no',
}

const M2M100_CODES = new Set<string>([
  'af', 'am', 'ar', 'ast', 'az', 'ba', 'be', 'bg', 'bn', 'br', 'bs', 'ca',
  'ceb', 'cs', 'cy', 'da', 'de', 'el', 'en', 'es', 'et', 'fa', 'ff', 'fi',
  'fr', 'fy', 'ga', 'gd', 'gl', 'gu', 'ha', 'he', 'hi', 'hr', 'ht', 'hu',
  'hy', 'id', 'ig', 'ilo', 'is', 'it', 'ja', 'jv', 'ka', 'kk', 'km', 'kn',
  'ko', 'lb', 'lg', 'ln', 'lo', 'lt', 'lv', 'mg', 'mk', 'ml', 'mn', 'mr',
  'ms', 'my', 'ne', 'nl', 'no', 'ns', 'oc', 'or', 'pa', 'pl', 'ps', 'pt',
  'ro', 'ru', 'sd', 'si', 'sk', 'sl', 'so', 'sq', 'sr', 'ss', 'su', 'sv',
  'sw', 'ta', 'th', 'tl', 'tr', 'uk', 'ur', 'uz', 'vi', 'wo', 'xh', 'yi',
  'yo', 'zh', 'zu',
])

export function cloudflareTargetCode(target: string): string {
  return CLOUDFLARE_TARGET_CODES[target.toLowerCase()] ?? simpleCode(target)
}

export function cloudflareSupports(target: string): boolean {
  return M2M100_CODES.has(cloudflareTargetCode(target))
}

function cloudflareProvider(env?: TranslationEnv): TranslationProvider {
  return {
    name: 'cloudflare',
    async translate(text, target) {
      const accountId = readEnv('CLOUDFLARE_ACCOUNT_ID', env)
      const token = readEnv('CLOUDFLARE_API_TOKEN', env)
      if (!accountId || !token) throw error('CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN are required')
      const model = readEnv('CLOUDFLARE_AI_MODEL', env) ?? '@cf/meta/m2m100-1.2b'
      const resp = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            text,
            source_lang: 'en',
            target_lang: cloudflareTargetCode(target),
          }),
        },
      )
      if (!resp.ok) throw error(`cloudflare workers ai returned ${resp.status}`)
      const data = (await resp.json()) as {
        success?: boolean
        result?: { translated_text?: string }
        errors?: Array<{ message?: string }>
      }
      if (data.success !== true || !data.result?.translated_text) {
        throw error(`cloudflare workers ai failed: ${data.errors?.[0]?.message ?? 'unknown error'}`)
      }
      return data.result.translated_text.trim()
    },
  }
}

function mockProvider(): TranslationProvider {
  return {
    name: 'mock',
    async translate(text, target) {
      return text
        .split('\n')
        .map((line) => `${line}->${target}`)
        .join('\n')
    },
  }
}

function routingProvider(env?: TranslationEnv): TranslationProvider {
  const cloudflare = cloudflareProvider(env)
  const google = googleCloudProvider(env)
  return {
    name: 'cloudflare-google',
    async translate(text, target) {
      if (
        cloudflareSupports(target) &&
        readEnv('CLOUDFLARE_ACCOUNT_ID', env) &&
        readEnv('CLOUDFLARE_API_TOKEN', env)
      ) {
        return cloudflare.translate(text, target)
      }
      if (readEnv('GOOGLE_API_KEY', env)) {
        return google.translate(text, target)
      }
      throw error(`no translation provider configured for target ${target}`)
    },
  }
}

export function getTranslationProvider(env?: TranslationEnv): TranslationProvider {
  const name = (readEnv('TRANSLATION_PROVIDER', env) ?? 'google-cloud').toLowerCase()
  switch (name) {
    case 'mock':
    case 'off':
    case 'none':
      return mockProvider()
    case 'libretranslate':
    case 'libre':
      return libreTranslateProvider(env)
    case 'cloudflare-google':
    case 'routing':
    case 'auto':
    case 'hybrid':
      return routingProvider(env)
    case 'cloudflare':
    case 'workers-ai':
    case 'cf':
      return cloudflareProvider(env)
    case 'openai':
      return openaiProvider(env)
    case 'huggingface':
    case 'hugging-face':
    case 'hf':
      return huggingFaceProvider(env)
    case 'google':
    case 'google-cloud':
    case 'googlecloud':
    default:
      return googleCloudProvider(env)
  }
}