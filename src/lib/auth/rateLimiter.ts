const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000
const LOCKOUT_MS = 15 * 60 * 1000

interface AttemptEntry {
  count: number
  firstAttempt: number
  lockedUntil: number | null
}

const store = new Map<string, AttemptEntry>()

function cleanup() {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.lockedUntil && now >= entry.lockedUntil) {
      store.delete(key)
    } else if (now - entry.firstAttempt > WINDOW_MS) {
      store.delete(key)
    }
  }
}

export function checkRateLimit(key: string): { allowed: boolean; retryAfterMs: number } {
  cleanup()
  const now = Date.now()
  const entry = store.get(key)

  if (entry?.lockedUntil && now < entry.lockedUntil) {
    return { allowed: false, retryAfterMs: entry.lockedUntil - now }
  }

  if (!entry || now - entry.firstAttempt > WINDOW_MS) {
    store.set(key, { count: 1, firstAttempt: now, lockedUntil: null })
    return { allowed: true, retryAfterMs: 0 }
  }

  entry.count++
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = now + LOCKOUT_MS
    return { allowed: false, retryAfterMs: LOCKOUT_MS }
  }

  return { allowed: true, retryAfterMs: 0 }
}

export function resetRateLimit(key: string): void {
  store.delete(key)
}
