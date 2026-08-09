import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'
import { useCmsStrings } from '../../../context/CmsStringsContext'
import { formatCurrency, type Currency } from '../../../utils/currency'
import { initiateKhaltiPayment, type KhaltiPaymentInit } from '../../../services/khaltiPay'
import { getErrorMessage } from '../../../lib/errors'
import { Button } from '../../ui/Button'

interface KhaltiPaymentProps {
  sessionId: string
  amount: number
  currency?: Currency
  onError?: (message: string) => void
  onCancel: () => void
}

export function KhaltiPayment({ sessionId, amount, currency = 'NPR', onError, onCancel }: KhaltiPaymentProps) {
  const { t } = useCmsStrings()
  const [payment, setPayment] = useState<KhaltiPaymentInit | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    let timer: number | undefined

    async function init() {
      try {
        const result = await initiateKhaltiPayment(sessionId)
        if (cancelled) return
        setPayment(result)
        setLoading(false)
        timer = window.setTimeout(() => {
          window.location.href = result.payment_url
        }, 600)
      } catch (err) {
        if (!cancelled) {
          const message = getErrorMessage(err, t('payment_khalti_init_failed'))
          setError(message)
          setLoading(false)
          onError?.(message)
        }
      }
    }

    init()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
  }, [sessionId, onError, t])

  const handleContinue = () => {
    if (!payment) return
    setSubmitting(true)
    window.location.href = payment.payment_url
  }

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">{t('payment_donation_amount')}</span>
          <span className="text-xl font-bold text-gray-900">{formatCurrency(amount, currency)}</span>
        </div>
      </div>

      <div className="bg-warm-50 border border-amber-200 rounded-xl p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500 text-white flex items-center justify-center font-bold">
            K
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{t('payment_khalti_init_title')}</h3>
            <p className="text-sm text-gray-500">{t('payment_khalti_init_msg')}</p>
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 rounded-md p-2">
          {t('payment_khalti_test_credentials_note')}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 text-sm text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">{t('payment_khalti_init_error_title')}</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <Button
          className="w-full"
          size="lg"
          onClick={handleContinue}
          disabled={loading || submitting || !payment || !!error}
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('payment_khalti_initializing')}
            </span>
          ) : (
            t('payment_khalti_continue')
          )}
        </Button>

        <button
          type="button"
          onClick={onCancel}
          className="w-full text-center text-sm text-gray-500 hover:text-gray-700 py-1"
        >
          {t('payment_khalti_return_to_donate')}
        </button>
      </div>
    </div>
  )
}