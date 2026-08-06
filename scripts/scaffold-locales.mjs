import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const localesDir = resolve(root, 'src/locales')
const en = JSON.parse(readFileSync(resolve(localesDir, 'en.json'), 'utf-8'))

const codes = [
  'ne', 'hi', 'es', 'fr', 'de', 'zh', 'ja', 'ko', 'ar', 'pt', 'pt-br', 'ru',
  'it', 'nl', 'sv', 'no', 'da', 'fi', 'pl', 'cs', 'sk', 'hu', 'ro', 'bg', 'el',
  'tr', 'uk', 'id', 'ms', 'th', 'vi', 'fil', 'bn', 'ur', 'pa', 'ta', 'te', 'mr',
  'gu', 'kn', 'ml', 'si', 'fa', 'he', 'sw', 'am', 'ha', 'yo', 'zu', 'af', 'sq',
  'sr', 'hr', 'sl', 'et', 'lv', 'lt', 'ga', 'cy', 'is', 'mt',
]

mkdirSync(localesDir, { recursive: true })

for (const code of codes) {
  const scaffold = { _translated: false, ...en }
  writeFileSync(
    resolve(localesDir, `${code}.json`),
    `${JSON.stringify(scaffold, null, 2)}\n`,
    'utf-8',
  )
}

console.log(`Wrote ${codes.length} scaffold locale files to ${localesDir}`)