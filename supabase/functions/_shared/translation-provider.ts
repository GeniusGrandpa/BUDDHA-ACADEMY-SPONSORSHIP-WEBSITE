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