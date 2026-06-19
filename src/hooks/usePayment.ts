import { useState, useCallback } from 'react'
import type { PaymentGateway, CheckoutState } from '../types/payments'
import { initiatePaymentCheckout, cancelPaymentSession, submitPaymentConfirmation } from '../services/payments'

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
      const result = await initiatePaymentCheckout(
        params.amount,
        params.frequency,
        params.gateway,
        params.studentId,
        params.message,
      )

      setCheckout({
        step: 'payment',
        donationId: null,
        sessionId: result.sessionId,
        gateway: params.gateway,
        amount: params.amount,
        transactionId: result.transactionId,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to start payment'
      setError(message)
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
      await submitPaymentConfirmation(sessionId, screenshots || [], paymentReference)

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
      const message = err instanceof Error ? err.message : 'Failed to confirm payment'
      setError(message)
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
