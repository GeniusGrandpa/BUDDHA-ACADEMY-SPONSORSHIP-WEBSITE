import { useState, type FormEvent } from 'react'
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import { useCmsStrings } from '../../../context/CmsStringsContext'
import { Button } from '../../ui/Button'
import { formatNPR } from '../../../utils/currency'

interface StripeCheckoutFormProps {
  amount: number
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
}

export function StripeCheckoutForm({ amount, onSuccess, onCancel: _onCancel }: StripeCheckoutFormProps) {
  const { t } = useCmsStrings()
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setIsProcessing(true)
    setMessage(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setMessage(submitError.message ?? t('payment_stripe_unexpected'))
      setIsProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/donate`,
      },
      redirect: 'if_required',
    })

    if (confirmError) {
      if (confirmError.type === 'card_error' || confirmError.type === 'validation_error') {
        setMessage(confirmError.message ?? t('payment_stripe_unexpected'))
      } else {
        setMessage(t('payment_stripe_unexpected'))
      }
      setIsProcessing(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      onSuccess(paymentIntent.id)
    } else if (paymentIntent?.status === 'requires_payment_method') {
      setMessage(t('payment_stripe_failed'))
      setIsProcessing(false)
    } else {
      setMessage(t('payment_stripe_processing'))
    }
  }

  return (
    <form id="stripe-payment-form" onSubmit={handleSubmit}>
      <PaymentElement
        options={{
          layout: {
            type: 'tabs',
                defaultCollapsed: false,
          },
        }}
      />
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{t('payment_stripe_error_title')}</p>
            <p>{message}</p>
          </div>
        </motion.div>
      )}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <span className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            {t('payment_processing')}
          </span>
        ) : (
          t('pay_amount_button', { amount: formatNPR(amount) })
        )}
      </Button>
    </form>
  )
}