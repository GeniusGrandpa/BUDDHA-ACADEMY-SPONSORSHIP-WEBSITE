import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { usePayment } from '../../hooks/usePayment'
import { getActivePaymentSettings } from '../../services/paymentSettings'
import { getErrorMessage } from '../../lib/errors'
import { formatCurrency, type Currency } from '../../utils/currency'
import { Button } from '../ui/Button'
import { PaymentMethodCard } from './PaymentMethodCard'
import { DonationImpactCard } from './DonationImpactCard'
import { PaymentSuccess } from './PaymentSuccess'
import { StripePaymentWrapper } from './stripe/StripePaymentWrapper'
import { EsewaPayment } from './esewa/EsewaPayment'
import { KhaltiPayment } from './khalti/KhaltiPayment'
import type { PaymentGateway, PaymentSetting } from '../../types/payments'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
  currency?: Currency
  studentId?: string | null
  message?: string | null
}

export function PaymentModal({ isOpen, onClose, amount, frequency, currency = 'NPR', studentId, message }: PaymentModalProps) {
  const { user } = useAuth()
  const { t } = useCmsStrings()
  const { checkout, loading, error, startCheckout, confirmPayment, abandonCheckout } = usePayment()
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([])
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadSettings()
    }
  }, [isOpen])

  const loadSettings = async () => {
    setSettingsLoading(true)
    setSettingsError(null)
    try {
      const settings = await getActivePaymentSettings()
      setPaymentSettings(settings)
      setSelectedGateway(null)
    } catch (err) {
      setSettingsError(getErrorMessage(err, t('payment_settings_load_error')))
    } finally {
      setSettingsLoading(false)
    }
  }

  const handleSelectGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway)
  }

  const handleStartPayment = async () => {
    if (!user || !selectedGateway) return

    await startCheckout({
      donorId: user.id,
      amount,
      frequency,
      gateway: selectedGateway,
      studentId,
      message,
      currency,
    })
  }

  const handleStripeSuccess = async () => {
    if (!checkout.sessionId) return
    await confirmPayment(checkout.sessionId)
  }

  const handleClose = async () => {
    await abandonCheckout()
    setSettingsError(null)
    onClose()
  }

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  }

  const modalVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', damping: 25, stiffness: 300 } as const },
    exit: { opacity: 0, y: 50, scale: 0.95 },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-warm-50 rounded-2xl shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="sticky top-0 bg-warm-50 z-10 flex items-center justify-between p-4 border-b border-amber-200 rounded-t-2xl">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('payment_complete_title')}</h2>
                <p className="text-sm text-gray-500">{t('payment_secure_processing')}</p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label={t('payment_close_modal')}
                title={t('payment_close_modal')}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-start gap-3 text-sm text-red-700"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">{t('payment_error_title')}</p>
                    <p>{error}</p>
                  </div>
                </motion.div>
              )}

              {checkout.step === 'success' ? (
                <PaymentSuccess
                  amount={amount}
                  currency={currency}
                  transactionId={checkout.transactionId || ''}
                />
              ) : checkout.step === 'payment' || checkout.step === 'processing' || checkout.step === 'failed' ? (
                <div className="space-y-6">
                  {checkout.step === 'processing' ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_processing_title')}</h3>
                      <p className="text-sm text-gray-500">{t('payment_processing_msg')}</p>
                    </motion.div>
                  ) : checkout.step === 'failed' ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <X className="w-8 h-8 text-red-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_failed_title')}</h3>
                      <p className="text-sm text-gray-500 mb-4">{error || t('login_generic_error')}</p>
                      <Button onClick={handleClose}>{t('payment_close')}</Button>
                    </div>
                  ) : selectedGateway === 'stripe' ? (
                    <div className="space-y-6">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{t('payment_donation_amount')}</span>
                          <span className="text-xl font-bold text-gray-900">{formatCurrency(amount, currency)}</span>
                        </div>
                      </div>
                      <StripePaymentWrapper
                        amount={amount}
                        frequency={frequency}
                        currency={currency}
                        sessionId={checkout.sessionId}
                        studentId={studentId}
                        message={message}
                        onSuccess={handleStripeSuccess}
                        onCancel={() => setSelectedGateway(null)}
                      />
                    </div>
                  ) : selectedGateway === 'esewa' && checkout.sessionId ? (
                    <EsewaPayment
                      sessionId={checkout.sessionId}
                      amount={amount}
                      currency={currency}
                      onCancel={() => setSelectedGateway(null)}
                    />
                  ) : selectedGateway === 'khalti' && checkout.sessionId ? (
                    <KhaltiPayment
                      sessionId={checkout.sessionId}
                      amount={amount}
                      currency={currency}
                      onCancel={() => setSelectedGateway(null)}
                    />
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('payment_failed_title')}</h3>
                      <p className="text-sm text-gray-500 mb-4">{t('payment_gateway_unavailable')}</p>
                      <Button onClick={() => setSelectedGateway(null)}>{t('payment_close')}</Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <DonationImpactCard amount={amount} currency={currency} />

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">{t('payment_select_method')}</h3>
                    {settingsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : settingsError ? (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                        <p className="font-medium mb-1">{t('payment_settings_error_title')}</p>
                        <p>{settingsError}</p>
                      </div>
                    ) : paymentSettings.length === 0 ? (
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                        <p className="font-medium">{t('payment_no_methods_title')}</p>
                        <p className="mt-1">{t('payment_no_methods_desc')}</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {paymentSettings.map(setting => (
                          <PaymentMethodCard
                            key={setting.id}
                            gateway={setting.gateway_name as PaymentGateway}
                            name={setting.gateway_display_name}
                            description={setting.gateway_description || ''}
                            isSelected={selectedGateway === setting.gateway_name}
                            onSelect={() => handleSelectGateway(setting.gateway_name as PaymentGateway)}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-700 mb-1">{t('payment_secure_checkout')}</p>
                    <p>{t('payment_secure_checkout_desc')}</p>
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleStartPayment}
                    disabled={loading || !selectedGateway || !user}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        {t('payment_processing')}
                      </span>
                    ) : (
                      <>{t('donate_confirm_button', { amount: formatCurrency(amount, currency) })}</>
                    )}
                  </Button>

                  {!user && (
                    <p className="text-center text-sm text-gray-500">
                      {t('payment_sign_in_required')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}