export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const GENERIC_MESSAGE = 'Unable to process your request. Please try again later.'

const SENSITIVE_PATTERNS = [
  /schema/i,
  /postgres/i,
  /\brls\b/i,
  /row level security/i,
  /policy/i,
  /database error/i,
  /pg_/i,
  /pgrst/i,
  /syntax error/i,
  /permission denied/i,
  /stack trace/i,
  /api[_-]?key/i,
  /whsec_/i,
  /sk_(test|live)_[a-z0-9]/i,
  /(^|[/\\])dist[\\/]/i,
  /(^|[/\\])src[\\/]/i,
]

function isSensitive(text: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))
}

function extractMessage(err: unknown): string {
  if (!err) return ''
  if (err instanceof Error) return err.message || err.name || ''
  if (typeof err === 'string') return err
  if (typeof err === 'object') {
    const obj = err as Record<string, unknown>
    for (const key of ['message', 'error_message', 'msg', 'error', 'detail']) {
      if (typeof obj[key] === 'string' && obj[key]) return obj[key]
    }
  }
  return ''
}

export function safeMessage(err: unknown, fallback = GENERIC_MESSAGE): string {
  const message = extractMessage(err).trim()
  if (!message || isSensitive(message) || message.length > 300) return fallback
  return message
}

export function jsonOk(data: Record<string, unknown>, status = 200): Response {
  return json({ success: true, ...data }, status)
}

export function jsonError(message: string, errorCode: string, status = 500): Response {
  return json({ success: false, message, errorCode }, status)
}

export function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function logError(context: string, err: unknown): void {
  const message = extractMessage(err)
  const stack = err instanceof Error ? (err.stack ?? '') : ''
  console.error(JSON.stringify({ level: 'error', context, message, stack, time: new Date().toISOString() }))
}

export function handleError(
  context: string,
  err: unknown,
  errorCode = 'INTERNAL_SERVER_ERROR',
  status = 500,
): Response {
  logError(context, err)
  return jsonError(safeMessage(err), errorCode, status)
}

export function getCallerUserId(req: Request): string | null {
  const auth = req.headers.get('Authorization') ?? ''
  const token = auth.replace(/^Bearer\s+/i, '').trim()
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payloadJson = atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson) as { sub?: string }
    return typeof payload.sub === 'string' && payload.sub ? payload.sub : null
  } catch {
    return null
  }
}
