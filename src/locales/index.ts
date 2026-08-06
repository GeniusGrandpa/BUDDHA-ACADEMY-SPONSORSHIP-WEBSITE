const modules = import.meta.glob<Record<string, unknown>>('./*.json', {
  eager: true,
  import: 'default',
})

export type StaticStringMap = Record<string, string>

/** Scaffold locale files are marked `_translated: false` until real translations are added. */
const TRANSLATED_FLAG = '_translated'

const dictionaries = new Map<string, StaticStringMap>()
for (const [path, dict] of Object.entries(modules)) {
  const match = path.match(/\/([^/]+)\.json$/)
  const code = match?.[1]
  if (!code || code === 'en') continue
  const isTranslated = dict?.[TRANSLATED_FLAG] === true
  if (!isTranslated) continue
  const { [TRANSLATED_FLAG]: _flag, ...strings } = dict
  dictionaries.set(code, strings as StaticStringMap)
}

export function getStaticDictionary(language: string): StaticStringMap {
  return dictionaries.get(language) ?? {}
}

export function hasStaticDictionary(language: string): boolean {
  return dictionaries.has(language)
}
