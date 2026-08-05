import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { useCmsStrings } from '../../context/CmsStringsContext'
import type { PaymentSetting } from '../../types/payments'

interface QRPaymentWidgetProps {
  setting: PaymentSetting
  transactionId: string
  amount: number
}

export function QRPaymentWidget({ setting, transactionId, amount }: QRPaymentWidgetProps) {
  const { t } = useCmsStrings()
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        <div>
            <p className="font-medium mb-1">{t('payment_qr_complete_title')}</p>
            <p className="text-amber-700">{setting.instructions}</p>
        </div>
      </div>

      {setting.qr_image_url ? (
        <div className="flex justify-center">
          <div className="bg-warm-50 p-4 rounded-xl border border-amber-200 shadow-sm">
            <img
              src={setting.qr_image_url}
              alt={`${setting.gateway_display_name} QR`}
              className="w-48 h-48 object-contain"
              loading="lazy" decoding="async"
            />
            <p className="text-center text-xs text-gray-500 mt-2">{t('payment_scan_to_pay')}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-1">{t('payment_qr_use_account_details')}</p>
          <p>{t('payment_qr_no_qr_configured')}</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('payment_account_name')}</span>
          <span className="text-sm font-medium text-gray-900">{setting.account_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('payment_account_number')}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{setting.account_number}</span>
            <button
              onClick={() => copyToClipboard(setting.account_number, 'account')}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              {copied === 'account' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('payment_qr_amount')}</span>
          <span className="text-lg font-bold text-gray-900">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('payment_qr_transaction_id')}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-mono font-medium text-gray-900">{transactionId}</span>
            <button
              onClick={() => copyToClipboard(transactionId, 'txn')}
              className="p-1 rounded hover:bg-gray-200 transition-colors"
            >
              {copied === 'txn' ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
        <p className="font-medium text-gray-700 mb-1">{t('payment_after_payment')}</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>{t('payment_qr_step_1')}</li>
          <li>{t('payment_qr_step_2')}</li>
          <li>{t('payment_qr_step_3')}</li>
          <li>{t('payment_qr_step_4')}</li>
        </ol>
      </div>
    </motion.div>
  )
}
