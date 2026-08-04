import { getSupabaseClient } from '../lib/supabase'
import { AppError, ErrorCodes, getErrorMessage, type ErrorCode } from '../lib/errors'

const supabase = getSupabaseClient()

export async function createPaymentIntent(
  amount: number,
  currency = 'npr',
  metadata: Record<string, string> = {},
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('create-payment-intent', {
    body: { amount, currency, metadata },
  })

  if (error) {
    throw await parseFunctionsError(error, 'We could not start your payment. Please try again or choose another payment method.')
  }
  if (!data?.clientSecret) {
    throw new AppError('We could not start your payment. Please try again.', {
      code: ErrorCodes.PAYMENT_FAILED,
      retryable: true,
    })
  }

  return data.clientSecret as string
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
