import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

import { TransactionCard } from './TransactionCard'
import { LoadingSpinner } from '../../../../components/ui/LoadingSpinner'
import type { TransactionWithDetails } from '../../../../types/features'
import type { DonationStatus } from '../../../../types/database'
import { formatNPR } from '../../../../utils/currency'

interface TransactionSectionProps {
  transactions: TransactionWithDetails[]
  loading: boolean
  donorName: string
  donorEmail: string
  onDownloadAll?: () => void
}

export function TransactionSection({
  transactions,
  loading,
  donorName,
  donorEmail,
  onDownloadAll,
}: TransactionSectionProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<DonationStatus | 'all'>('all')

  const stats = useMemo(() => {
    const completed = transactions.filter(
      (t) => t.status === 'completed' || t.status === 'verified',
    )
    const totalCompleted = completed.reduce((sum, t) => sum + t.amount, 0)
    const totalAll = transactions.reduce((sum, t) => sum + t.amount, 0)
    return {
      totalDonations: transactions.length,
      totalAmount: totalAll,
      completedAmount: totalCompleted,
      completedCount: completed.length,
      pendingCount: transactions.filter((t) => t.status === 'pending' || t.status === 'processing').length,
    }
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false
      if (search) {
        const q = search.toLowerCase()
        const txId = t.transaction_id?.toLowerCase() || ''
        const method = t.payment_method?.toLowerCase() || ''
        return txId.includes(q) || method.includes(q) || t.amount.toString().includes(q)
      }
      return true
    })
  }, [transactions, search, statusFilter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1 block">Donations</span>
          <p className="text-2xl font-bold text-gray-900">{stats.totalDonations}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-green-600 mb-1 block">Completed</span>
          <p className="text-2xl font-bold text-gray-900">{stats.completedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1 block">Pending</span>
          <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-gray-500 mb-1 block">Total Given</span>
          <p className="text-2xl font-bold text-gray-900">
            {formatNPR(stats.totalAmount)}
          </p>
        </div>
      </div>

      {transactions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-100 p-12 text-center"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Transactions Yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Your donation history will appear here once you make your first contribution.
            Every donation helps provide education to children in need.
          </p>
        </motion.div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search by transaction ID or amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none transition-shadow"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as DonationStatus | 'all')}
                className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none transition-shadow"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="verified">Verified</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            {onDownloadAll && stats.completedCount > 0 && (
              <button
                onClick={onDownloadAll}
                className="inline-flex items-center px-4 py-2.5 text-sm font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200"
              >
                Export
              </button>
            )}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
                <p className="text-gray-500">No transactions match your search criteria</p>
              </div>
            ) : (
              filtered.map((tx, idx) => (
                <TransactionCard
                  key={tx.id}
                  transaction={tx}
                  donorName={donorName}
                  donorEmail={donorEmail}
                  index={idx}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}
