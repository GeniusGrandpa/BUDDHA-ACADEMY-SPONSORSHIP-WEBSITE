import { useState, useEffect, type ChangeEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, Upload, Check } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCmsStrings } from '../../context/CmsStringsContext'
import { formatNPR } from '../../utils/currency'
import { usePayment } from '../../hooks/usePayment'
import { getActivePaymentSettings } from '../../services/paymentSettings'
import { uploadPaymentScreenshot } from '../../services/payments'
import { getErrorMessage } from '../../lib/errors'
import toast from 'react-hot-toast'
import { Button } from '../ui/Button'
import { PaymentMethodCard } from './PaymentMethodCard'
import { QRPaymentWidget } from './QRPaymentWidget'
import { DonationImpactCard } from './DonationImpactCard'
import { PaymentSuccess } from './PaymentSuccess'
import { StripePaymentWrapper } from './stripe/StripePaymentWrapper'
import type { PaymentGateway, PaymentSetting } from '../../types/payments'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  amount: number
  frequency: 'one-time' | 'monthly' | 'annual'
  studentId?: string | null
  message?: string | null
}

export function PaymentModal({ isOpen, onClose, amount, frequency, studentId, message }: PaymentModalProps) {
  const { user } = useAuth()
  const { t } = useCmsStrings()
  const { checkout, loading, error, startCheckout, confirmPayment, abandonCheckout } = usePayment()
  const [paymentSettings, setPaymentSettings] = useState<PaymentSetting[]>([])
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null)
  const [settingsLoading, setSettingsLoading] = useState(true)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(false)
  const [paymentReference, setPaymentReference] = useState('')

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

  const selectedSetting = paymentSettings.find(s => s.gateway_name === selectedGateway)

  const handleStartPayment = async () => {
    if (!user || !selectedGateway) return

    await startCheckout({
      donorId: user.id,
      amount,
      frequency,
      gateway: selectedGateway,
      studentId,
      message,
    })
  }

  const handleConfirmPayment = async () => {
    if (!checkout.sessionId) return

    let screenshots: string[] = []

    if (screenshot) {
      setUploadProgress(true)
      try {
        const url = await uploadPaymentScreenshot(checkout.sessionId, screenshot)
        screenshots = [url]
      } catch (err) {
        toast.error(getErrorMessage(err, t('payment_screenshot_upload_error')))
      }
      setUploadProgress(false)
    }

    await confirmPayment(checkout.sessionId, screenshots, paymentReference || undefined)
  }

  const handleScreenshotChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      return
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return
    }

    setScreenshot(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleStripeSuccess = async (paymentIntentId: string) => {
    await confirmPayment(checkout.sessionId!, [], paymentIntentId)
  }

  const handleClose = async () => {
    await abandonCheckout()
    setScreenshot(null)
    setScreenshotPreview(null)
    setPaymentReference('')
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
                          <span className="text-xl font-bold text-gray-900">{formatNPR(amount)}</span>
                        </div>
                      </div>
                      <StripePaymentWrapper
                        amount={amount}
                        frequency={frequency}
                        sessionId={checkout.sessionId}
                        studentId={studentId}
                        message={message}
                        onSuccess={handleStripeSuccess}
                        onCancel={() => setSelectedGateway(null)}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{t('payment_donation_amount')}</span>
                          <span className="text-xl font-bold text-gray-900">{formatNPR(amount)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-sm text-gray-600">{t('payment_transaction_id')}</span>
                          <span className="text-sm font-mono font-medium text-gray-900">{checkout.transactionId}</span>
                        </div>
                      </div>

                      {selectedSetting && checkout.transactionId && (
                        <QRPaymentWidget
                          setting={selectedSetting}
                          transactionId={checkout.transactionId}
                          amount={amount}
                        />
                      )}

                      <DonationImpactCard amount={amount} />

                      <div className="bg-warm-50 border border-amber-200 rounded-xl p-4 space-y-4">
                        <h3 className="font-medium text-gray-900">{t('payment_confirm_title')}</h3>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('payment_reference_label')}
                            </label>
                            <input
                              type="text"
                              value={paymentReference}
                              onChange={(e) => setPaymentReference(e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                              placeholder={t('payment_reference_placeholder')}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              {t('payment_screenshot_label')}
                            </label>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 text-sm text-gray-600">
                                <Upload className="w-4 h-4" />
                                {screenshot ? t('payment_change_file') : t('payment_upload_screenshot')}
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp"
                                  className="hidden"
                                  onChange={handleScreenshotChange}
                                />
                              </label>
                              {screenshot && (
                                <span className="text-sm text-green-600 flex items-center gap-1">
                                  <Check className="w-4 h-4" />
                                  {screenshot.name}
                                </span>
                              )}
                            </div>
                            {screenshotPreview && (
                              <img
                                src={screenshotPreview}
                                alt={t('payment_screenshot_preview_alt')}
                                className="mt-2 w-32 h-32 object-cover rounded-lg border border-gray-200"
                                loading="lazy" decoding="async"
                              />
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              {t('payment_max_size')}
                            </p>
                          </div>
                        </div>

                        <Button
                          className="w-full"
                          size="lg"
                          onClick={handleConfirmPayment}
                          disabled={loading || uploadProgress}
                        >
                          {loading || uploadProgress ? (
                            <span className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              {t('payment_processing')}
                            </span>
                          ) : (
                            t('payment_completed_button')
                          )}
                        </Button>

                        <p className="text-xs text-gray-400 text-center">
                          {t('payment_confirm_disclaimer')}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <DonationImpactCard amount={amount} />

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

                    {selectedSetting && selectedSetting.qr_image_url && (
                      <div className="mt-4 flex justify-center">
                        <div className="bg-warm-50 p-4 rounded-xl border border-amber-200 shadow-sm">
                          <img
                            src={selectedSetting.qr_image_url}
                            alt={`${selectedSetting.gateway_display_name} QR`}
                            className="w-48 h-48 object-contain"
                            loading="lazy" decoding="async"
                          />
                          <p className="text-center text-xs text-gray-500 mt-2">{t('payment_scan_to_pay')}</p>
                        </div>
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
                      <>{t('donate_confirm_button', { amount: formatNPR(amount) })}</>
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