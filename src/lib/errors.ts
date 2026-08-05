export const ErrorCodes = {
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  FORBIDDEN: 'FORBIDDEN',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMITED: 'RATE_LIMITED',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_CANCELLED: 'PAYMENT_CANCELLED',
  PAYMENT_VERIFICATION_FAILED: 'PAYMENT_VERIFICATION_FAILED',
  UPLOAD_ERROR: 'UPLOAD_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

export const DEFAULT_ERROR_MESSAGE = 'Something went wrong. Please refresh the page or try again later.'
export const GENERIC_FALLBACK = 'Unable to process your request. Please try again later.'
export const NETWORK_MESSAGE = 'Unable to connect to the server. Please check your connection and try again.'
export const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.'
export const SESSION_REFRESH_MESSAGE = 'Unable to refresh your session. Please sign in again.'
export const AUTH_REQUIRED_MESSAGE = 'You are not signed in. Please sign in to continue.'

export interface AppErrorOptions {
  code?: ErrorCode
  statusCode?: number
  retryable?: boolean
  details?: unknown
}

export class AppError extends Error {
  readonly code: ErrorCode
  readonly statusCode: number
  readonly retryable: boolean
  readonly details: unknown

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message)
    this.name = 'AppError'
    this.code = options.code ?? ErrorCodes.UNKNOWN_ERROR
    this.statusCode = options.statusCode ?? 500
    this.retryable = options.retryable ?? false
    this.details = options.details
  }
}

export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

const SENSITIVE_PATTERNS: RegExp[] = [
  /schema/i,
  /postgres/i,
  /\brls\b/i,
  /row level security/i,
  /policy/i,
  /\brelations? .* does not exist/i,
  /database error/i,
  /pg_/i,
  /pgrst/i,
  /syntax error/i,
  /permission denied/i,
  /stack trace/i,
  /^\s*at [\w/\\-]+:\d+/im,
  /(^|\/)node_modules[\\/]/i,
  /\/home\//i,
  /\/usr\//i,
  /(^|[/\\])dist[\\/]/i,
  /(^|[/\\])src[\\/].*\.tsx?/i,
  /\.tsx?:?\d+:\d+/i,
  /api[_-]?key/i,
  /bearer [a-z0-9_-]{16,}/i,
  /whsec_/i,
  /sk_(test|live)_[a-z0-9]/i,
  /[a-z0-9]{32,}@/,
]

function isSensitive(text: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(text))
}

interface ExtractedError {
  message: string
  status: number | null
  code: string
}

function extractError(error: unknown): ExtractedError {
  if (!error) return { message: '', status: null, code: '' }

  if (error instanceof AppError) {
    return {
      message: error.message,
      status: error.statusCode,
      code: error.code,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const obj = error as Record<string, unknown>

    const rawStatus = obj.status ?? obj.statusCode
    const status = typeof rawStatus === 'number' ? rawStatus : null

    const code = typeof obj.code === 'string' ? obj.code : typeof obj.errorCode === 'string' ? obj.errorCode : ''

    const candidates = [obj.message, obj.msg, obj.error_message, obj.error_description, obj.error, obj.detail, obj.hint]
    for (const candidate of candidates) {
      if (typeof candidate === 'string' && candidate.length > 0) return { message: candidate, status, code }
    }

    if (typeof obj.name === 'string') return { message: obj.name, status, code }
  }

  if (error instanceof Error) {
    return { message: error.message || error.name || '', status: null, code: '' }
  }

  if (typeof error === 'string') return { message: error, status: null, code: '' }

  return { message: '', status: null, code: '' }
}

function statusMessage(status: number): { message: string; code: ErrorCode } | null {
  if (status === 401) return { message: SESSION_EXPIRED_MESSAGE, code: ErrorCodes.SESSION_EXPIRED }
  if (status === 403) return { message: 'You do not have permission to perform this action.', code: ErrorCodes.FORBIDDEN }
  if (status === 404) return { message: 'The requested resource could not be found.', code: ErrorCodes.NOT_FOUND }
  if (status === 429) return { message: 'Too many attempts. Please wait a moment and try again.', code: ErrorCodes.RATE_LIMITED }
  if (status >= 500) return { message: 'Something went wrong. Please try again later.', code: ErrorCodes.INTERNAL_SERVER_ERROR }
  return null
}

function codeMessage(code: string): { message: string; code: ErrorCode } | null {
  const lower = code.toLowerCase()
  if (lower.includes('pgrst116')) return { message: 'The requested item could not be found.', code: ErrorCodes.NOT_FOUND }
  if (lower.includes('42501') || lower.includes('permission')) return { message: 'You do not have permission to perform this action.', code: ErrorCodes.FORBIDDEN }
  if (lower.includes('23505')) return { message: 'This item already exists.', code: ErrorCodes.VALIDATION_ERROR }
  if (lower.includes('22p02') || lower.includes('invalid input')) return { message: 'The submitted information is not valid. Please check and try again.', code: ErrorCodes.VALIDATION_ERROR }
  if (lower.includes('23503') || lower.includes('foreign key')) return { message: 'This item cannot be removed because it is still in use.', code: ErrorCodes.VALIDATION_ERROR }
  return null
}

function keywordMessage(lower: string): { message: string; code: ErrorCode } | null {
  if (lower.includes('card') && (lower.includes('declined') || lower.includes('insufficient') || lower.includes('security code') || lower.includes('do not honor') || lower.includes('expired'))) {
    return { message: 'Your card could not be charged. Please check the card details or use another card.', code: ErrorCodes.PAYMENT_FAILED }
  }
  if (lower.includes('payment_intent') && (lower.includes('failed') || lower.includes('cannot be found') || lower.includes('no such'))) {
    return { message: 'Your payment could not be completed. Please try again or choose another payment method.', code: ErrorCodes.PAYMENT_VERIFICATION_FAILED }
  }
  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials') || lower.includes('invalid_grant')) {
    return { message: 'Wrong email or password', code: ErrorCodes.AUTH_REQUIRED }
  }
  if (lower.includes('email not confirmed') || lower.includes('email_not_confirmed')) {
    return { message: 'Please verify your email address before signing in', code: ErrorCodes.AUTH_REQUIRED }
  }
  if (lower.includes('email already registered') || lower.includes('user_already_registered') || lower.includes('email_exists') || lower.includes('duplicate')) {
    return { message: 'An account with this email already exists. Please sign in instead.', code: ErrorCodes.VALIDATION_ERROR }
  }
  if (lower.includes('weak_password') || lower.includes('password should be at least 6')) {
    return { message: 'Password is too weak. Please choose a stronger password', code: ErrorCodes.VALIDATION_ERROR }
  }
  if (lower.includes('rate limit') || lower.includes('too many requests') || lower.includes('rate_limit')) {
    return { message: 'Too many attempts. Please wait a moment and try again.', code: ErrorCodes.RATE_LIMITED }
  }
  if (lower.includes('authentication required') || lower.includes('not authenticated') || lower.includes('not logged in') || lower.includes('not signed in') || lower.includes('no session') || lower.includes('session not found') || lower.includes('no payment session')) {
    return { message: AUTH_REQUIRED_MESSAGE, code: ErrorCodes.AUTH_REQUIRED }
  }
  if (lower.includes('refresh token')) {
    return { message: SESSION_REFRESH_MESSAGE, code: ErrorCodes.SESSION_EXPIRED }
  }
  if (lower.includes('token expired') || lower.includes('expired token') || lower.includes('jwt expired') || lower.includes('session expired')) {
    return { message: SESSION_EXPIRED_MESSAGE, code: ErrorCodes.SESSION_EXPIRED }
  }
  if (lower.includes('email provider') || lower.includes('smtp') || lower.includes('confirmation mail')) {
    return { message: 'Unable to send the verification email. Please contact support.', code: ErrorCodes.UNKNOWN_ERROR }
  }
  return null
}

function isNetworkLike(lower: string, code: string): boolean {
  const combined = `${lower} ${code.toLowerCase()}`
  return (
    combined.includes('network') ||
    combined.includes('failed to fetch') ||
    combined.includes('fetch failed') ||
    combined.includes('load failed') ||
    combined.includes('timeout') ||
    combined.includes('abort') ||
    combined.includes('gateway') ||
    combined.includes('504') ||
    combined.includes('502') ||
    combined.includes('503') ||
    combined.includes('typeerror: failed')
  )
}

export function classifyError(error: unknown): {
  message: string
  code: ErrorCode
  statusCode: number
  retryable: boolean
} {
  const extracted = extractError(error)
  const message = extracted.message.trim()
  const lower = message.toLowerCase()

  if (message.length > 300) {
    return { message: GENERIC_FALLBACK, code: ErrorCodes.UNKNOWN_ERROR, statusCode: extracted.status ?? 500, retryable: false }
  }

  if (extracted.status) {
    const mapped = statusMessage(extracted.status)
    if (mapped) return { message: mapped.message, code: mapped.code, statusCode: extracted.status, retryable: extracted.status >= 500 }
  }

  const byCode = codeMessage(extracted.code)
  if (byCode) return { message: byCode.message, code: byCode.code, statusCode: extracted.status ?? 400, retryable: false }

  if (isNetworkLike(lower, extracted.code)) {
    return { message: NETWORK_MESSAGE, code: ErrorCodes.NETWORK_ERROR, statusCode: extracted.status ?? 0, retryable: true }
  }

  const byKeyword = keywordMessage(lower)
  if (byKeyword) return { message: byKeyword.message, code: byKeyword.code, statusCode: extracted.status ?? 400, retryable: false }

  if (isSensitive(message)) {
    return { message: GENERIC_FALLBACK, code: ErrorCodes.DATABASE_ERROR, statusCode: extracted.status ?? 500, retryable: true }
  }

  if (message) {
    return { message, code: ErrorCodes.UNKNOWN_ERROR, statusCode: extracted.status ?? 500, retryable: true }
  }

  return { message: DEFAULT_ERROR_MESSAGE, code: ErrorCodes.UNKNOWN_ERROR, statusCode: extracted.status ?? 500, retryable: true }
}

export function getErrorMessage(error: unknown, fallback?: string): string {
  if (typeof error === 'string' && error.trim().length > 0) {
    return isSensitive(error) ? GENERIC_FALLBACK : error
  }
  const { message } = classifyError(error)
  return message || fallback || DEFAULT_ERROR_MESSAGE
}

export function toErrorMessage(error: unknown, fallback?: string): string {
  return getErrorMessage(error, fallback)
}

export function isRetryableError(error: unknown): boolean {
  return classifyError(error).retryable
}
