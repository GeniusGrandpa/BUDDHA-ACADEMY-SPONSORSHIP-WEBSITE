import { useState, useEffect } from 'react'
import { loadStripe, type Stripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { AlertCircle } from 'lucide-react'
import { useCmsStrings } from '../../../context/CmsStringsContext'
import { createPaymentIntent } from '../../../services/stripePayment'
import { getErrorMessage } from '../../../lib/errors'
import type { Currency } from '../../../utils/currency'
import { StripeCheckoutForm } from './StripeCheckoutForm'

let stripePromise: Promise<Stripe | null> | null = null

function getStripe(): Promise<Stripe | null> {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!stripePromise) {
    stripePromise = loadStripe(key)
  }
  return stripePromise
}

interface StripePaymentWrapperProps {
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
  currency?: Currency
  sessionId?: string | null
  studentId?: string | null
  message?: string | null
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
}

export function StripePaymentWrapper({ amount, frequency, currency = 'NPR', sessionId, onSuccess, onCancel }: StripePaymentWrapperProps) {
  const { t } = useCmsStrings()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const secret = await createPaymentIntent(
          amount * 100,
          currency.toLowerCase(),
          { frequency, ...(sessionId ? { session_id: sessionId } : {}) },
        )
        if (!cancelled) setClientSecret(secret)
      } catch (err) {
        if (!cancelled) {
          setError(getErrorMessage(err, t('payment_stripe_initialize_failed')))
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    init()
    return () => { cancelled = true }
  }, [amount, frequency, sessionId, currency])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500">{t('payment_stripe_initializing')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium">{t('payment_stripe_init_error_title')}</p>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!clientSecret) {
    return null
  }

  return (
    <Elements stripe={getStripe()} options={{ clientSecret }}>
      <StripeCheckoutForm
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onCancel={onCancel}
      />
    </Elements>
  )
}