import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useCmsStrings } from '../context/CmsStringsContext'
import { confirmKhaltiPayment } from '../services/khaltiPay'
import { getErrorMessage } from '../lib/errors'
import { Button } from '../components/ui/Button'
import { useLocalizePath } from '../hooks/useLocalizePath'

type ResultState =
  | { kind: 'loading' }
  | { kind: 'confirmed'; transactionId?: string }
  | { kind: 'cancelled' }
  | { kind: 'failed'; message: string }

export function KhaltiReturnPage() {
  const { t } = useCmsStrings()
  const localize = useLocalizePath()
  const [searchParams] = useSearchParams()
  const session = searchParams.get('session')
  const pidx = searchParams.get('pidx')
  const status = searchParams.get('status')

  const [result, setResult] = useState<ResultState>({ kind: 'loading' })

  useEffect(() => {
    if (!session) {
      setResult({ kind: 'failed', message: t('payment_khalti_failed_msg') })
      return
    }
    const sessionId = session

    let cancelled = false
    async function confirm() {
      try {
        const res = await confirmKhaltiPayment(sessionId, pidx || undefined, status || undefined)
        if (cancelled) return
        if (res.status === 'confirmed' || res.status === 'pending_verification') {
          setResult({ kind: 'confirmed', transactionId: res.transaction_id })
        } else if (res.status === 'cancelled') {
          setResult({ kind: 'cancelled' })
        } else if (res.status === 'failed') {
          setResult({ kind: 'failed', message: t('payment_khalti_failed_msg') })
        } else {
          setResult({ kind: 'failed', message: t('payment_khalti_pending_msg') })
        }
      } catch (err) {
        if (!cancelled) {
          setResult({ kind: 'failed', message: getErrorMessage(err, t('payment_khalti_failed_msg')) })
        }
      }
    }
    confirm()
    return () => { cancelled = true }
  }, [session, pidx, status])

  return (
    <div className="min-h-screen bg-[var(--color-background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border-accent)]/30 rounded-2xl shadow-xl p-8 text-center">
        {result.kind === 'loading' && (
          <div className="py-8">
            <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_khalti_processing')}</h2>
          </div>
        )}

        {result.kind === 'confirmed' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_khalti_confirmed_title')}</h2>
            <p className="text-sm text-gray-500 mb-1">{t('payment_khalti_confirmed_msg')}</p>
            {result.transactionId && (
              <p className="text-sm text-gray-400 mt-3">
                {t('payment_transaction_id')}: <span className="font-mono font-medium text-gray-900">{result.transactionId}</span>
              </p>
            )}
            <div className="mt-6">
              <Link to="/donations">
                <Button className="w-full" size="lg">{t('payment_khalti_go_dashboard')}</Button>
              </Link>
            </div>
          </div>
        )}

        {result.kind === 'cancelled' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-9 h-9 text-gray-500" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_khalti_cancelled_title')}</h2>
            <p className="text-sm text-gray-500 mb-1">{t('payment_khalti_cancelled_msg')}</p>
            <div className="mt-6 space-y-2">
              <Link to={localize('/donate')}>
                <Button className="w-full" size="lg">{t('payment_khalti_try_again')}</Button>
              </Link>
              <Link to="/donations" className="block text-sm text-gray-500 hover:text-gray-700 py-1">
                {t('payment_khalti_go_dashboard')}
              </Link>
              <Link to={localize('/')} className="block text-sm text-gray-500 hover:text-gray-700 py-1">
                {t('notfound_home_button')}
              </Link>
            </div>
          </div>
        )}

        {result.kind === 'failed' && (
          <div className="py-4">
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-9 h-9 text-red-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_khalti_failed_title')}</h2>
            <p className="text-sm text-gray-500 mb-1">{result.message}</p>
            <div className="mt-6 space-y-2">
              <Link to={localize('/donate')}>
                <Button className="w-full" size="lg">{t('payment_khalti_try_again')}</Button>
              </Link>
              <Link to="/donations" className="block text-sm text-gray-500 hover:text-gray-700 py-1">
                {t('payment_khalti_go_dashboard')}
              </Link>
              <Link to={localize('/')} className="block text-sm text-gray-500 hover:text-gray-700 py-1">
                {t('notfound_home_button')}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}