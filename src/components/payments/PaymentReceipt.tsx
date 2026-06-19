import { motion } from 'framer-motion'
import { Download, Printer } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatNPR } from '../../utils/currency'
import type { PaymentReceipt as PaymentReceiptType } from '../../types/payments'

interface PaymentReceiptViewProps {
  receipt: PaymentReceiptType
  donorName: string
  donorEmail: string
}

export function PaymentReceiptView({ receipt, donorName, donorEmail }: PaymentReceiptViewProps) {
  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    const receiptData = receipt.receipt_data
    const content = `
BUDDHA ACADEMY - DONATION RECEIPT
================================
Receipt #: ${receipt.receipt_number}
Date: ${new Date(receipt.generated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

Donor: ${donorName}
Email: ${donorEmail}

Amount: ${formatNPR(receiptData.amount || 0)}
Payment Method: ${receiptData.gateway || 'N/A'}
Transaction ID: ${receiptData.transaction_id || 'N/A'}

Thank you for your generous support!
Buddha Academy - Education Sponsorship Program
    `.trim()

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receipt.receipt_number}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto"
    >
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm" id="receipt-content">
        <div className="text-center border-b border-gray-200 pb-4 mb-4">
          <h2 className="text-xl font-bold text-amber-700">Buddha Academy</h2>
          <p className="text-xs text-gray-500">Education Sponsorship Program</p>
          <p className="text-xs text-gray-500">Kathmandu, Nepal</p>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">Donation Receipt</h3>

        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Receipt #</span>
            <span className="font-medium text-gray-900">{receipt.receipt_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Date</span>
            <span className="font-medium text-gray-900">
              {new Date(receipt.generated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Donor Information</h4>
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">{donorName}</p>
            <p className="text-gray-600">{donorEmail}</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center mb-4">
          <p className="text-sm text-gray-600 mb-1">Amount Received</p>
          <p className="text-2xl font-bold text-amber-700">
            {formatNPR(receipt.receipt_data.amount || 0)}
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Payment Method</span>
            <span className="font-medium text-gray-900 capitalize">{receipt.receipt_data.gateway || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Transaction ID</span>
            <span className="font-mono font-medium text-gray-900">{receipt.receipt_data.transaction_id || 'N/A'}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-4 pt-4 text-center">
          <p className="text-xs text-gray-500">Thank you for supporting education at Buddha Academy!</p>
          <p className="text-xs text-gray-400 mt-1">This is a computer-generated receipt.</p>
        </div>
      </div>

      <div className="flex gap-3 mt-4 justify-center">
        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="w-4 h-4 mr-2" />
          Print
        </Button>
      </div>
    </motion.div>
  )
}
