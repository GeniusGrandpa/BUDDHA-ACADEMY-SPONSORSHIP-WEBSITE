const GENERIC_FALLBACK = 'Unable to complete this action. Please try again later.'

function shouldSuppressError(input: string): boolean {
  const keywords = ['schema', 'postgres', 'rls', 'policy', 'relation', 'database error', 'pg_', 'syntax error', 'permission denied']
  return keywords.some(kw => input.toLowerCase().includes(kw))
}

export function getAuthErrorMessage(error: unknown): string {
  if (!error) return ''

  const message = extractErrorMessage(error)
  const hint = extractHint(error)
  const combined = hint ? `${message} ${hint}` : message
  const lower = combined.toLowerCase()

  if (shouldSuppressError(lower)) {
    console.error('[Auth] Suppressed sensitive error:', message)
    return GENERIC_FALLBACK
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('invalid_grant')) {
    return 'Wrong email or password'
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return 'Please verify your email address before signing in'
  }
  if (lower.includes('user already registered') || lower.includes('user_already_registered') || lower.includes('email already registered') || lower.includes('email_exists')) {
    return 'An account with this email already exists'
  }
  if (lower.includes('password should be at least 6 characters') || lower.includes('weak_password')) {
    return 'Password is too weak. Please choose a stronger password'
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('429') || lower.includes('rate_limit')) {
    return 'Too many attempts. Please wait a moment and try again'
  }
  if (lower.includes('email provider') || lower.includes('smtp') || lower.includes('confirmation mail')) {
    return 'Unable to send verification email. Please contact support.'
  }
  if (lower.includes('signups') || lower.includes('registration') || lower.includes('not allowed')) {
    return 'Registration is currently unavailable. Please try again later.'
  }
  if (lower.includes('invalid api key') || lower.includes('invalid authentication')) {
    return GENERIC_FALLBACK
  }
  if (lower.includes('network') || lower.includes('fetch') || lower.includes('timeout') || lower.includes('abort') || lower.includes('failed to fetch') || lower.includes('504') || lower.includes('gateway timeout') || lower.includes('502') || lower.includes('503')) {
    return 'Network error. Please check your connection and try again'
  }

  console.error('[Auth] Unrecognized error:', message)
  return message || GENERIC_FALLBACK
}

function extractHint(error: unknown): string {
  if (!error || typeof error !== 'object') return ''
  const obj = error as Record<string, unknown>
  if (typeof obj.hint === 'string') return obj.hint
  return ''
}

function extractErrorMessage(error: unknown): string {
  if (!error) return ''

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>

    const status = obj.status ?? obj.statusCode
    const statusNum = typeof status === 'number' ? status : undefined

    if (statusNum && statusNum >= 500) {
      if (statusNum === 504) return 'Gateway timeout. The server took too long to respond. Please try again.'
      return `Server error (${status}). Please try again later.`
    }

    if (typeof status === 'string') {
      const s = status.toLowerCase()
      if (s === '504') return 'Gateway timeout. The server took too long to respond. Please try again.'
      if (['500', '502', '503', 'gateway timeout', 'server error'].some(k => s.includes(k))) {
        return `Server error (${status}). Please try again later.`
      }
    }

    const code = typeof obj.code === 'string' ? obj.code.toLowerCase() : ''
    if (code.includes('n504') || code.includes('pgrst504')) {
      return 'Gateway timeout. The server took too long to respond. Please try again.'
    }

    if (typeof obj.message === 'string') return obj.message
    if (typeof obj.msg === 'string') return obj.msg
    if (typeof obj.error === 'string') return obj.error
    if (typeof obj.error_description === 'string') return obj.error_description
    if (typeof obj.error_message === 'string') return obj.error_message
    if (typeof obj.detail === 'string') return obj.detail
  }

  if (error instanceof Error) {
    const msg = error.message
    if (msg) return msg
    return error.name || 'An unexpected error occurred'
  }

  if (typeof error === 'string') return error

  return 'An unexpected error occurred'
}

export function classifyAuthError(error: unknown): {
  userMessage: string
  category: 'credentials' | 'verification' | 'rate_limit' | 'account_status' | 'network' | 'unknown'
} {
  if (!error) return { userMessage: GENERIC_FALLBACK, category: 'unknown' }

  const message = extractErrorMessage(error)
  const hint = extractHint(error)
  const combined = hint ? `${message} ${hint}` : message
  const lower = combined.toLowerCase()

  if (shouldSuppressError(lower)) {
    console.error('[Auth] Suppressed:', message)
    return { userMessage: GENERIC_FALLBACK, category: 'unknown' }
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('invalid_grant')) {
    return { userMessage: 'Wrong email or password', category: 'credentials' }
  }

  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return { userMessage: 'Please verify your email address before signing in', category: 'verification' }
  }

  if (lower.includes('user already registered') || lower.includes('user_already_registered') || lower.includes('email already registered') || lower.includes('email_exists') || lower.includes('duplicate')) {
    return { userMessage: 'An account with this email already exists', category: 'unknown' }
  }

  if (lower.includes('password should be at least 6 characters') || lower.includes('weak_password') || lower.includes('password is too weak')) {
    return { userMessage: 'Password is too weak. Please choose a stronger password', category: 'unknown' }
  }

  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('429') || lower.includes('rate_limit')) {
    return { userMessage: 'Too many attempts. Please wait a moment and try again', category: 'rate_limit' }
  }

  if (lower.includes('network') || lower.includes('fetch') || lower.includes('timeout') || lower.includes('abort') || lower.includes('failed to fetch') || lower.includes('504') || lower.includes('gateway timeout') || lower.includes('502') || lower.includes('503')) {
    return { userMessage: 'Network error. Please check your connection and try again', category: 'network' }
  }

  if (lower.includes('invalid email') || lower.includes('email format') || lower.includes('malformed')) {
    return { userMessage: 'Please enter a valid email address', category: 'unknown' }
  }

  if (lower.includes('email provider') || lower.includes('smtp') || lower.includes('confirmation mail')) {
    return { userMessage: 'Unable to send verification email. Please contact support.', category: 'unknown' }
  }

  if (lower.includes('signups') || lower.includes('registration') || lower.includes('not allowed')) {
    return { userMessage: 'Registration is currently unavailable. Please try again later.', category: 'unknown' }
  }

  if (lower.includes('suspended') || lower.includes('banned')) {
    return { userMessage: 'Your account has been suspended. Please contact support', category: 'account_status' }
  }

  console.error('[Auth] Unrecognized error:', { message, error })
  return { userMessage: GENERIC_FALLBACK, category: 'unknown' }
}
