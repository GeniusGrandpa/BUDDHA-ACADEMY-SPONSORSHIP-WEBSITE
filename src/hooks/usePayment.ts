import { useState, useCallback } from 'react'
import type { PaymentGateway, CheckoutState } from '../types/payments'
import { initiatePaymentCheckout, cancelPaymentSession, getPaymentSession } from '../services/payments'
import { getErrorMessage } from '../lib/errors'
import { logger } from '../lib/logger'

interface UsePaymentReturn {
  checkout: CheckoutState
  loading: boolean
  error: string | null
  startCheckout: (params: {
    donorId: string
    amount: number
    frequency: 'one-time' | 'monthly' | 'annual'
    gateway: PaymentGateway
    studentId?: string | null
    message?: string | null
    currency?: string
  }) => Promise<void>
  confirmPayment: (sessionId: string) => Promise<void>
  resetCheckout: () => void
  abandonCheckout: () => Promise<void>
}

const initialCheckout: CheckoutState = {
  step: 'method',
  donationId: null,
  sessionId: null,
  gateway: null,
  amount: 0,
  transactionId: null,
}

export function usePayment(): UsePaymentReturn {
  const [checkout, setCheckout] = useState<CheckoutState>(initialCheckout)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const startCheckout = useCallback(async (params: {
    donorId: string
    amount: number
    frequency: 'one-time' | 'monthly' | 'annual'
    gateway: PaymentGateway
    studentId?: string | null
    message?: string | null
    currency?: string
  }) => {
    setLoading(true)
    setError(null)

    try {
      logger.info('payment.checkout.started', { gateway: params.gateway, amount: params.amount, frequency: params.frequency, currency: params.currency })

      const result = await initiatePaymentCheckout(
        params.amount,
        params.frequency,
        params.gateway,
        params.studentId,
        params.message,
        undefined,
        params.currency,
      )

      logger.info('payment.checkout.success', { sessionId: result.sessionId })

      setCheckout({
        step: 'payment',
        donationId: null,
        sessionId: result.sessionId,
        gateway: params.gateway,
        amount: params.amount,
        transactionId: result.transactionId,
      })
    } catch (err: unknown) {
      logger.error('payment.checkout.failed', { error: getErrorMessage(err, 'Failed to start payment') })
      setError(getErrorMessage(err, 'Failed to start payment'))
    } finally {
      setLoading(false)
    }
  }, [])

  const confirmPayment = useCallback(async (
    sessionId: string,
  ) => {
    setLoading(true)
    setError(null)

    try {
      logger.info('payment.confirm.started', { sessionId })

      setCheckout(prev => ({
        ...prev,
        step: 'processing',
      }))

      const MAX_ATTEMPTS = 8
      const POLL_DELAY_MS = 1500

      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
        const session = await getPaymentSession(sessionId)
        if (!session) {
          throw new Error('Payment session not found')
        }

        if (session.status === 'completed') {
          logger.info('payment.confirm.completed', { sessionId, attempt })
          setCheckout(prev => ({
            ...prev,
            step: 'success',
            transactionId: session.transaction_id,
          }))
          return
        }

        if (session.status === 'failed' || session.status === 'cancelled') {
          logger.warn('payment.confirm.rejected', { sessionId, status: session.status, attempt })
          setError('Payment was not completed. Please try again.')
          setCheckout(prev => ({ ...prev, step: 'failed' }))
          return
        }

        logger.info('payment.confirm.waiting', { sessionId, status: session.status, attempt })
        if (attempt < MAX_ATTEMPTS) {
          await new Promise(resolve => setTimeout(resolve, POLL_DELAY_MS))
        }
      }

      logger.warn('payment.confirm.pending', { sessionId })
      setError('Payment is still processing. Please check back later or contact support.')
      setCheckout(prev => ({ ...prev, step: 'failed' }))
    } catch (err: unknown) {
      logger.error('payment.confirm.failed', { sessionId, error: getErrorMessage(err, 'Failed to confirm payment') })
      setError(getErrorMessage(err, 'Failed to confirm payment'))
      setCheckout(prev => ({ ...prev, step: 'failed' }))
    } finally {
      setLoading(false)
    }
  }, [])

  const resetCheckout = useCallback(() => {
    setCheckout(initialCheckout)
    setError(null)
  }, [])

  const abandonCheckout = useCallback(async () => {
    if (checkout.sessionId && checkout.step === 'payment') {
      try {
        await cancelPaymentSession(checkout.sessionId)
      } catch {

      }
    }
    resetCheckout()
  }, [checkout.sessionId, checkout.step, resetCheckout])

  return {
    checkout,
    loading,
    error,
    startCheckout,
    confirmPayment,
    resetCheckout,
    abandonCheckout,
  }
}
