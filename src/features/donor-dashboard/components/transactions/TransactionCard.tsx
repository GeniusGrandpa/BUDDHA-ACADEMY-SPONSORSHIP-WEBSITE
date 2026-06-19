import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

import { StatusBadge } from './StatusBadge'
import { AllocationBadge } from './AllocationBadge'
import { DonationTimeline } from './DonationTimeline'
import { generateReceiptPDF } from '../../utils/pdfGenerator'
import type { TransactionWithDetails } from '../../../../types/features'
import type { DonationAllocation } from '../../../../types/database'
import type { PaymentReceipt } from '../../../../types/payments'
import { formatNPR } from '../../../../utils/currency'

interface TransactionCardProps {
  transaction: TransactionWithDetails
  donorName: string
  donorEmail: string
  index?: number
}

export function TransactionCard({ transaction, donorName, donorEmail, index = 0 }: TransactionCardProps) {
  const [expanded, setExpanded] = useState(false)

  const formatAmount = (amount: number) =>
    formatNPR(amount)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const handleDownloadReceipt = () => {
    if (!transaction.receipt) return
    const receipt = transaction.receipt as PaymentReceipt
    generateReceiptPDF(
      {
        receipt_number: receipt.receipt_number,
        amount: receipt.receipt_data?.amount || transaction.amount,
        certificate_type: 'donation_receipt',
        title: 'Donation Receipt',
        description: null,
        issued_date: receipt.generated_at,
        donation_id: transaction.id,
      },
      {
        name: donorName,
        email: donorEmail,
      },
    )
  }

  const hasReceipt = transaction.status === 'completed' && !!transaction.receipt
  const hasAllocations = (transaction.allocations?.length ?? 0) > 0
  const hasTimeline = transaction.status !== 'pending'

  const getTransactionLabel = () => {
    if (transaction.transaction_id) return transaction.transaction_id
    if (transaction.payment_session?.transaction_id) return transaction.payment_session.transaction_id
    return `TXN-${transaction.id.slice(0, 8).toUpperCase()}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <span className="text-2xl font-bold text-gray-900">
                {formatAmount(transaction.amount)}
              </span>
              <StatusBadge status={transaction.status} size="sm" />
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-500">
              <span className="font-mono text-xs">{getTransactionLabel()}</span>
              <span>{formatDate(transaction.created_at)}</span>
              {transaction.payment_method && (
                <span className="capitalize">{transaction.payment_method.replace(/_/g, ' ')}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {hasReceipt && (
              <button
                onClick={handleDownloadReceipt}
                className="px-3 py-1.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                Receipt
              </button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="px-3 py-1.5 text-sm font-medium text-gray-500 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {expanded ? 'Less' : 'Details'}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 border-t border-gray-50">
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {hasAllocations && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Allocation Breakdown
                    </h4>
                    <div className="space-y-2">
                      {(transaction.allocations as DonationAllocation[]).map((alloc) => (
                        <AllocationBadge
                          key={alloc.id}
                          category={alloc.category}
                          percentage={alloc.allocation_percentage}
                          amount={alloc.amount}
                          size="sm"
                        />
                      ))}
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Total Allocated</span>
                          <span className="font-semibold text-gray-900">
                            {formatAmount(transaction.amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {hasTimeline && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">
                      Donation Timeline
                    </h4>
                    <DonationTimeline transaction={transaction} />
                  </div>
                )}

                {transaction.verified_at && (
                  <div className="sm:col-span-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                      <div className="text-green-700 font-medium mb-1">
                        Donation Verified
                      </div>
                      <p className="text-green-600">
                        Verified on{' '}
                        {new Date(transaction.verified_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {transaction.payment_session?.verification_notes && (
                          <>
                            <br />
                            Note: {transaction.payment_session.verification_notes}
                          </>
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
