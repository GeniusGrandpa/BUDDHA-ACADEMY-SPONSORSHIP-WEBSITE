import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'
import type { PaymentSetting } from '../../types/payments'

interface QRPaymentWidgetProps {
  setting: PaymentSetting
  transactionId: string
  amount: number
}

export function QRPaymentWidget({ setting, transactionId, amount }: QRPaymentWidgetProps) {
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
            <p className="font-medium mb-1">Complete your payment</p>
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
            <p className="text-center text-xs text-gray-500 mt-2">Scan to pay</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-600">
          <p className="font-medium text-gray-700 mb-1">Pay using account details below</p>
          <p>No QR code is configured for this payment method. Please use the account name and number to make your transfer.</p>
        </div>
      )}

      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Account Name</span>
          <span className="text-sm font-medium text-gray-900">{setting.account_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Account Number</span>
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
          <span className="text-sm text-gray-600">Amount</span>
          <span className="text-lg font-bold text-gray-900">NPR {amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Transaction ID</span>
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
        <p className="font-medium text-gray-700 mb-1">After making payment:</p>
        <ol className="list-decimal list-inside space-y-1">
          <li>Note the transaction ID from your payment app</li>
          <li>Click "I have completed the payment" below</li>
          <li>Enter your transaction ID and optionally upload a screenshot</li>
          <li>Our finance team will verify your payment within 24 hours</li>
        </ol>
      </div>
    </motion.div>
  )
}
