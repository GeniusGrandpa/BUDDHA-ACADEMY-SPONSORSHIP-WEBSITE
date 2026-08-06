import { getTranslationProvider } from '../supabase/functions/_shared/translation-provider.ts'
import {
  chunkTexts,
  protectNewlines,
  restoreNewlines,
  resolvePageTranslation,
  translateBatch,
} from '../supabase/functions/_shared/translation-core.ts'

let passed = 0
let failed = 0

function assert(condition: boolean, message: string) {
  if (condition) {
    passed++
    console.log(`  ok: ${message}`)
  } else {
    failed++
    console.error(`  FAIL: ${message}`)
  }
}

const env = { TRANSLATION_PROVIDER: 'mock' }

function failingProvider() {
  return {
    name: 'failing',
    async translate() {
      throw new Error('provider unavailable')
    },
  }
}

async function main() {
  console.log('translation-provider')
  const mock = getTranslationProvider(env)
  assert(mock.name === 'mock', 'TRANSLATION_PROVIDER=mock selects the mock provider')
  const single = await mock.translate('Hello world', 'ne')
  assert(single === 'Hello world->ne', `mock translates with marker (got ${single})`)

  console.log('translation-core / translateBatch')
  const texts = ['Home', 'About us', 'Donate now']
  const batch = await translateBatch(mock, texts, 'ne')
  assert(batch.length === texts.length, 'batch preserves item count')
  assert(batch.every((t, i) => t === `${texts[i]}->ne`), 'batch translates every item')

  const many = Array.from({ length: 40 }, (_, i) => `${i} `.repeat(80).trim())
  const manyBatch = await translateBatch(mock, many, 'es')
  assert(manyBatch.length === many.length, 'large batch preserves item count')
  assert(manyBatch.every((t, i) => t === `${many[i]}->es`), 'large batch translates every item')

  const chunks = chunkTexts(many)
  assert(chunks.length > 1, 'chunkTexts splits large lists into multiple chunks')

  console.log('translation-core / newline protection')
  const withNewline = 'line one\nline two'
  const protectedText = protectNewlines(withNewline)
  assert(protectedText.indexOf('\n') === -1, 'protectNewlines removes literal newlines')
  assert(restoreNewlines(protectedText) === withNewline, 'restoreNewlines restores newlines')
  const nlBatch = await translateBatch(mock, [protectedText, 'simple'], 'ne')
  assert(nlBatch[0] === `${protectedText}->ne`, 'batch handles embedded newlines via sentinel')
  assert(restoreNewlines(nlBatch[0]) === 'line one\nline two->ne', 'restored batch keeps original newlines')

  console.log('translation-core / cache resolution')
  const first = await resolvePageTranslation({
    texts: ['Hello', 'World', 'Home'],
    cachedMap: {},
    target: 'ne',
    provider: mock,
  })
  assert(first.cached === false, 'empty cache reports cached=false')
  assert(first.translations.every((t) => t.endsWith('->ne')), 'uncached texts are translated')
  assert(first.mergedMap['Hello'] === 'Hello->ne', 'translations are written into merged map')

  let providerCalls = 0
  const countingProvider = {
    name: 'counting',
    async translate(text: string, target: string) {
      providerCalls++
      return `${text}->${target}`
    },
  }
  const second = await resolvePageTranslation({
    texts: ['Hello', 'World', 'Home'],
    cachedMap: first.mergedMap,
    target: 'ne',
    provider: countingProvider,
  })
  assert(second.cached === true, 'cached page reports cached=true')
  assert(providerCalls === 0, 'no provider calls when everything is cached')
  assert(second.translations.join('|') === 'Hello->ne|World->ne|Home->ne', 'cached values are returned')

  const partial = await resolvePageTranslation({
    texts: ['Hello', 'New string'],
    cachedMap: first.mergedMap,
    target: 'ne',
    provider: countingProvider,
  })
  assert(partial.cached === false, 'partially cached page reports cached=false')
  assert(partial.translations[0] === 'Hello->ne', 'cached entry reused in partial page')
  assert(partial.translations[1] === 'New string->ne', 'missing entry translated in partial page')

  console.log('translation-core / title and description')
  const titled = await resolvePageTranslation({
    texts: [],
    cachedMap: {},
    target: 'hi',
    provider: mock,
    title: 'Buddha Academy',
    description: 'Providing free education',
  })
  assert(titled.translatedTitle === 'Buddha Academy->hi', 'title is translated and stored')
  assert(titled.translatedDescription === 'Providing free education->hi', 'description is translated and stored')
  assert(titled.mergedMap['Buddha Academy'] === 'Buddha Academy->hi', 'title merged into cached map')
  providerCalls = 0
  const titledCached = await resolvePageTranslation({
    texts: [],
    cachedMap: titled.mergedMap,
    target: 'hi',
    provider: countingProvider,
    title: 'Buddha Academy',
    description: 'Providing free education',
  })
  assert(titledCached.translatedTitle === 'Buddha Academy->hi', 'cached title is reused')
  assert(titledCached.translatedDescription === 'Providing free education->hi', 'cached description is reused')
  assert(providerCalls === 0, 'no provider calls when title/description cached')

  console.log('translation-core / failure fallback')
  const failing = await resolvePageTranslation({
    texts: ['Hello', 'World'],
    cachedMap: {},
    target: 'ne',
    provider: failingProvider(),
  })
  assert(failing.translations.join('|') === 'Hello|World', 'failed translation falls back to English')
  assert(Object.keys(failing.mergedMap).length === 0, 'failed translations are not persisted')

  console.log('translation-core / same text as its own translation is not cached')
  const echoProvider = {
    name: 'echo',
    async translate(text: string) {
      return text
    },
  }
  const echo = await resolvePageTranslation({
    texts: ['Same'],
    cachedMap: {},
    target: 'ne',
    provider: echoProvider,
  })
  assert(Object.keys(echo.mergedMap).length === 0, 'provider output equal to source is not cached')

  console.log(`\n${passed} passed, ${failed} failed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})