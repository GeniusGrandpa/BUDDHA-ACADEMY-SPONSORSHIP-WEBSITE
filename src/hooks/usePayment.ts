import { useState, useCallback } from 'react'
import type { PaymentGateway, CheckoutState } from '../types/payments'
import { initiatePaymentCheckout, cancelPaymentSession, submitPaymentConfirmation } from '../services/payments'
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
  }) => Promise<void>
  confirmPayment: (sessionId: string, screenshots?: string[], paymentReference?: string) => Promise<void>
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
  }) => {
    setLoading(true)
    setError(null)

    try {
      logger.info('payment.checkout.started', { gateway: params.gateway, amount: params.amount, frequency: params.frequency })

      const result = await initiatePaymentCheckout(
        params.amount,
        params.frequency,
        params.gateway,
        params.studentId,
        params.message,
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
    screenshots?: string[],
    paymentReference?: string,
  ) => {
    setLoading(true)
    setError(null)

    try {
      logger.info('payment.confirm.started', { sessionId })

      await submitPaymentConfirmation(sessionId, screenshots || [], paymentReference)

      logger.info('payment.confirm.submitted', { sessionId, screenshots: (screenshots || []).length })

      setCheckout(prev => ({
        ...prev,
        step: 'processing',
      }))

      await new Promise(resolve => setTimeout(resolve, 2000))

      setCheckout(prev => ({
        ...prev,
        step: 'success',
      }))
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
