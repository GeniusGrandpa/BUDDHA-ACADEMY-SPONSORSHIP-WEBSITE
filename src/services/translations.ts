import { supabase } from '../lib/supabase'
import type { CmsStringMap } from '../types/cms-content'

let cache: CmsStringMap | null = null
let inflight: Promise<CmsStringMap> | null = null

export async function fetchPublicTranslations(): Promise<CmsStringMap> {
  if (cache) return cache
  if (inflight) return inflight

  inflight = (async () => {
    const { data } = await supabase
      .from('cms_strings')
      .select('key, value')
      .limit(1000)
    const rows = (data || []) as { key: string; value: string }[]
    const map: CmsStringMap = {}
    for (const row of rows) {
      if (row.key && row.value) map[row.key] = row.value
    }
    cache = map
    return map
  })()
    .catch((error) => {
      cache = null
      throw error
    })
    .finally(() => {
      inflight = null
    })

  return inflight
}

export function clearPublicTranslationsCache(): void {
  cache = null
  inflight = null
}