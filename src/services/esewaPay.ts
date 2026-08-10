import { getSupabaseClient } from '../lib/supabase'
import { AppError, ErrorCodes, getErrorMessage, type ErrorCode } from '../lib/errors'
import { logger } from '../lib/logger'

const supabase = getSupabaseClient()

export interface EsewaPaymentInit {
  environment: 'uat' | 'production'
  pay_url: string
  fields: Record<string, string>
}

export interface EsewaConfirmResult {
  status: 'confirmed' | 'cancelled' | 'processing'
  transaction_id?: string
}

export function getEsewaReturnBaseUrl(): string {
  const configured = import.meta.env.VITE_PUBLIC_BASE_URL as string | undefined
  if (configured) return configured
  if (typeof window !== 'undefined') return window.location.origin
  return ''
}

export async function initiateEsewaPayment(
  sessionId: string,
  returnUrl?: string,
): Promise<EsewaPaymentInit> {
  logger.info('esewa.initiate.started', { sessionId, hasReturnUrl: !!returnUrl })

  const { data, error } = await supabase.functions.invoke('esewa-pay', {
    body: { sessionId, returnUrl: returnUrl || getEsewaReturnBaseUrl() },
  })

  if (error) {
    logger.error('esewa.initiate.failed', { sessionId, error: error.message })
    throw await parseFunctionsError(error, 'We could not start your eSewa payment. Please try again or choose another payment method.')
  }
  if (!data?.pay_url || !data?.fields) {
    logger.error('esewa.initiate.invalid_response', { sessionId, hasPayUrl: !!data?.pay_url, hasFields: !!data?.fields })
    throw new AppError('We could not start your eSewa payment. Please try again.', {
      code: ErrorCodes.PAYMENT_FAILED,
      retryable: true,
    })
  }

  logger.info('esewa.initiate.succeeded', { sessionId, environment: data.environment })
  return data as EsewaPaymentInit
}

export async function confirmEsewaPayment(
  sessionId: string,
  data?: string,
  failed?: boolean,
): Promise<EsewaConfirmResult> {
  logger.info('esewa.confirm.started', { sessionId, hasData: !!data, failed })

  const { data: result, error } = await supabase.functions.invoke('esewa-callback', {
    body: { sessionId, data: data || null, failed: failed || false },
  })

  if (error) {
    logger.error('esewa.confirm.failed', { sessionId, error: error.message })
    throw await parseFunctionsError(error, 'We could not confirm your eSewa payment. Please try again.')
  }

  logger.info('esewa.confirm.succeeded', { sessionId, status: result?.status })
  return (result ?? { status: 'processing' }) as EsewaConfirmResult
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
