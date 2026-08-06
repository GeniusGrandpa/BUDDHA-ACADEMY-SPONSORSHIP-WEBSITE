import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnvFile } from 'node:process'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = resolve(root, 'src/locales')
const envPath = resolve(root, '.env')

const code = process.argv[2]
if (!code || code === 'en') {
  console.error('Usage: node scripts/translate-locale.mjs <language-code>  (e.g. ne, hi, es)')
  process.exit(1)
}

try {
  loadEnvFile(envPath)
} catch (err) {
  console.error('Failed to load .env:', err.message)
  process.exit(1)
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const anonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !anonKey) {
  console.error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing in .env')
  process.exit(1)
}

const GOOGLE_CODES = {
  zh: 'zh-CN',
  'pt-br': 'pt',
  he: 'iw',
  fil: 'tl',
}

const targetCode = GOOGLE_CODES[code] ?? code
const CHUNK_SIZE = 40
const PLACEHOLDER_OPEN = '\uE001'
const PLACEHOLDER_CLOSE = '\uE002'

const enPath = resolve(localesDir, 'en.json')
const targetPath = resolve(localesDir, `${code}.json`)

const en = JSON.parse(readFileSync(enPath, 'utf-8'))
let target = {}
if (existsSync(targetPath)) {
  target = JSON.parse(readFileSync(targetPath, 'utf-8'))
}

const TRANSLATED_FLAG = '_translated'
const COMPLETED_FLAG = '_completed'
if (target[TRANSLATED_FLAG] === true) {
  console.log(`  ${code}.json is already marked translated. Skipping (delete ${code}.json to redo).`)
  process.exit(0)
}

const URL_RE = /^https?:\/\//i
const EMAIL_RE = /^\S+@\S+\.\S+$/
const SYMBOLS_ONLY_RE = /^[\d\s.,:/_\-+%$?°|\u00a0#@()[\]{}]+$/

function translatable(text) {
  const trimmed = String(text ?? '').trim()
  if (trimmed.length < 2) return false
  if (URL_RE.test(trimmed)) return false
  if (EMAIL_RE.test(trimmed)) return false
  if (SYMBOLS_ONLY_RE.test(trimmed)) return false
  return /\p{L}/u.test(trimmed)
}

async function invoke(texts) {
  const res = await fetch(`${supabaseUrl}/functions/v1/translate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify({
      pageId: 'global',
      language: code,
      target: targetCode,
      texts,
    }),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`translate function returned ${res.status}: ${body.slice(0, 300)}`)
  }
  const data = await res.json()
  if (!data?.success || !Array.isArray(data.translations) || data.translations.length !== texts.length) {
    throw new Error('translate function returned an unexpected payload')
  }
  return data.translations
}

function writeTarget(output, completed) {
  writeFileSync(targetPath, `${JSON.stringify({ ...output, [COMPLETED_FLAG]: completed }, null, 2)}\n`, 'utf-8')
}

async function main() {
  const completed = Array.isArray(target[COMPLETED_FLAG]) ? target[COMPLETED_FLAG] : []
  const completedSet = new Set(completed)

  const uniqueTexts = Array.from(new Set(
    Object.values(en).filter((t) => typeof t === 'string' && translatable(t)),
  ))
  const pending = uniqueTexts.filter((t) => !completedSet.has(t))

  if (pending.length === 0) {
    console.log(`  all ${uniqueTexts.length} unique strings already translated. Finalizing...`)
    target[TRANSLATED_FLAG] = true
    writeFileSync(targetPath, `${JSON.stringify(target, null, 2)}\n`, 'utf-8')
    process.exit(0)
  }

  console.log(`  ${pending.length} of ${uniqueTexts.length} unique strings to translate into ${code} (target: ${targetCode})`)

  const output = { ...target }
  const done = new Set(completedSet)

  for (let i = 0; i < pending.length; i += CHUNK_SIZE) {
    const chunk = pending.slice(i, i + CHUNK_SIZE)

    const tokens = []
    const protectedTexts = chunk.map((text) =>
      text.replace(/\{[\w\s-]+\}/g, (m) => {
        tokens.push(m)
        return `${PLACEHOLDER_OPEN}${tokens.length - 1}${PLACEHOLDER_CLOSE}`
      }),
    )
    const tokenGroups = []
    {
      let cursor = 0
      for (const text of chunk) {
        const group = []
        text.replace(/\{[\w\s-]+\}/g, () => {
          group.push(tokens[cursor++])
          return ''
        })
        tokenGroups.push(group)
      }
    }

    let translated = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        translated = await invoke(protectedTexts)
        break
      } catch (err) {
        console.error(`  chunk ${i / CHUNK_SIZE + 1} attempt ${attempt} failed: ${err.message}`)
        if (attempt < 3) await new Promise((r) => setTimeout(r, 2000 * attempt))
      }
    }
    if (!translated) {
      console.error(`  aborting at chunk ${i / CHUNK_SIZE + 1}; progress so far saved. Re-run to continue.`)
      writeTarget(output, Array.from(done))
      process.exit(1)
    }

    chunk.forEach((text, index) => {
      let value = translated[index] ?? text
      tokenGroups[index].forEach((token, tIndex) => {
        value = value.split(`${PLACEHOLDER_OPEN}${tIndex}${PLACEHOLDER_CLOSE}`).join(token)
      })
      const cleaned = value.trim() || text
      for (const [key, source] of Object.entries(en)) {
        if (source === text) output[key] = cleaned
      }
      done.add(text)
    })

    writeTarget(output, Array.from(done))
    console.log(`  chunk ${i / CHUNK_SIZE + 1}/${Math.ceil(pending.length / CHUNK_SIZE)} done (${done.size}/${uniqueTexts.length} unique)`)
  }

  delete output[TRANSLATED_FLAG]
  delete output[COMPLETED_FLAG]
  output[TRANSLATED_FLAG] = true
  writeFileSync(targetPath, `${JSON.stringify(output, null, 2)}\n`, 'utf-8')
  console.log(`Done. Wrote ${Object.keys(output).length - 1} keys to ${code}.json`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})