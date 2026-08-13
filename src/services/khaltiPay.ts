import { getSupabaseClient } from '../lib/supabase'
import { AppError, ErrorCodes, getErrorMessage, type ErrorCode } from '../lib/errors'
import { logger } from '../lib/logger'

const supabase = getSupabaseClient()

export interface KhaltiPaymentInit {
  environment: 'test' | 'production'
  pidx: string
  payment_url: string
  expires_at?: string | null
  expires_in?: number | null
}

export interface KhaltiConfirmResult {
  status: 'confirmed' | 'cancelled' | 'failed' | 'processing' | 'pending_verification'
  transaction_id?: string
}

export function getKhaltiReturnBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined
  if (configured) return configured
  return 'https://buddha-academy.vercel.app'
}

export async function initiateKhaltiPayment(
  sessionId: string,
  returnUrl?: string,
): Promise<KhaltiPaymentInit> {
  logger.info('khalti.initiate.started', { sessionId, hasReturnUrl: !!returnUrl })

  const { data, error } = await supabase.functions.invoke('khalti-pay', {
    body: { sessionId, returnUrl: returnUrl || getKhaltiReturnBaseUrl() },
  })

  if (error) {
    logger.error('khalti.initiate.failed', { sessionId, error: error.message })
    throw await parseFunctionsError(error, 'We could not start your Khalti payment. Please try again or choose another payment method.')
  }
  if (!data?.payment_url || !data?.pidx) {
    logger.error('khalti.initiate.invalid_response', { sessionId, hasPaymentUrl: !!data?.payment_url, hasPidx: !!data?.pidx })
    throw new AppError('We could not start your Khalti payment. Please try again.', {
      code: ErrorCodes.PAYMENT_FAILED,
      retryable: true,
    })
  }

  logger.info('khalti.initiate.succeeded', { sessionId, pidx: data.pidx, environment: data.environment })
  return data as KhaltiPaymentInit
}

export async function confirmKhaltiPayment(
  sessionId: string,
  pidx?: string,
  status?: string,
): Promise<KhaltiConfirmResult> {
  logger.info('khalti.confirm.started', { sessionId, hasPidx: !!pidx, status })

  const { data: result, error } = await supabase.functions.invoke('khalti-callback', {
    body: { sessionId, pidx: pidx || null, status: status || null },
  })

  if (error) {
    logger.error('khalti.confirm.failed', { sessionId, error: error.message })
    throw await parseFunctionsError(error, 'We could not confirm your Khalti payment. Please try again.')
  }

  logger.info('khalti.confirm.succeeded', { sessionId, status: result?.status })
  return (result ?? { status: 'processing' }) as KhaltiConfirmResult
}

async function parseFunctionsError(error: unknown, fallback: string): Promise<AppError> {
  const functionsError = error as { context?: Response; message?: string } | null
  if (functionsError?.context) {
    try {
      const body = (await functionsError.context.json()) as {
        success?: boolean
        message?: string
        errorCode?: string
      } | null
      if (body && body.success === false) {
        return new AppError(body.message || fallback, {
          code: (body.errorCode as ErrorCode) || ErrorCodes.PAYMENT_FAILED,
          statusCode: functionsError.context.status,
          retryable: functionsError.context.status >= 500,
        })
      }
    } catch {
    }
  }
  return new AppError(getErrorMessage(error, fallback), {
    code: ErrorCodes.NETWORK_ERROR,
    retryable: true,
  })
}