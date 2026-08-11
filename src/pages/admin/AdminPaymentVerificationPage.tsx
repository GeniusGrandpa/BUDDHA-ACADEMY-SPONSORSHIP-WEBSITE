import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNPR } from '../../utils/currency'
import { getAllPaymentSessions, verifyPayment, approvePayment, rejectPayment } from '../../services/payments'
import { useAuth } from '../../context/AuthContext'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/LoadingSkeleton'
import { AlertCircle, RefreshCw, Receipt, CheckCircle, XCircle, ShieldCheck } from 'lucide-react'
import type { PaymentSession, PaymentSessionStatus, VerificationStatus } from '../../types/payments'
import toast from 'react-hot-toast'

interface SessionWithDonor extends Omit<PaymentSession, 'status'> {
  donation?: {
    id: string
    donor_id: string
    amount: number
    frequency: string
    status: string
    verification_status: string | null
    transaction_id: string | null
    receipt?: {
      receipt_number: string | null
    } | null
    donor?: {
      id: string
      full_name: string
      email: string
    }
  } | null
  donor?: {
    id: string
    full_name: string
    email: string
  }
  status: PaymentSessionStatus
  verification_status: VerificationStatus | null
}

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-50 text-blue-600 border-blue-200',
  payment_received: 'bg-orange-50 text-orange-700 border-orange-200',
  completed: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  failed: 'bg-red-50 text-red-600 border-red-200',
  cancelled: 'bg-gray-50 text-gray-500 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  payment_received: 'Awaiting Verification',
  completed: 'Completed',
  failed: 'Failed',
  cancelled: 'Cancelled',
}

const VERIFICATION_STYLES: Record<string, string> = {
  pending_verification: 'bg-amber-50 text-amber-700 border-amber-200',
  verified: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
}

const VERIFICATION_LABELS: Record<string, string> = {
  pending_verification: 'Pending Verification',
  verified: 'Verified',
  rejected: 'Rejected',
}

export function AdminPaymentVerificationPage() {
  const { profile } = useAuth()
  const [sessions, setSessions] = useState<SessionWithDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<PaymentSessionStatus | 'all'>('all')
  const [selectedSession, setSelectedSession] = useState<SessionWithDonor | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionNotes, setActionNotes] = useState('')

  const isFinanceManager = profile?.role === 'finance_manager'
  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin'

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setLoadError(null)
    try {
      const data = await getAllPaymentSessions()
      setSessions(data as unknown as SessionWithDonor[])
    } catch (err) {
      const detail = typeof err === 'object' && err !== null && 'message' in err
        ? String((err as { message?: unknown }).message || '')
        : ''
      setLoadError(detail || 'Failed to load payment transactions. Please try again.')
      console.error('[payment] load transactions failed:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const filtered = sessions.filter(s => {
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      const donor = s.donor || s.donation?.donor
      return (
        donor?.full_name?.toLowerCase().includes(q) ||
        donor?.email?.toLowerCase().includes(q) ||
        s.transaction_id?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q) ||
        s.gateway.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    total: sessions.length,
    completed: sessions.filter(s => s.status === 'completed').length,
    awaitingVerification: sessions.filter(s => s.status === 'payment_received').length,
    processing: sessions.filter(s => s.status === 'processing').length,
    pending: sessions.filter(s => s.status === 'pending').length,
    failed: sessions.filter(s => s.status === 'failed' || s.status === 'cancelled').length,
  }

  const statCards = [
    { label: 'Total Transactions', value: stats.total, color: 'text-gray-600', bg: 'bg-gray-50' },
    { label: 'Awaiting Verification', value: stats.awaitingVerification, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Completed (Paid)', value: stats.completed, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Failed / Cancelled', value: stats.failed, color: 'text-red-600', bg: 'bg-red-50' },
  ]

  const handleAction = async (action: 'verify' | 'approve' | 'reject') => {
    if (!selectedSession) return
    setActionLoading(true)
    try {
      if (action === 'verify') {
        await verifyPayment(selectedSession.id, actionNotes || undefined)
        toast.success('Payment verified successfully')
      } else if (action === 'approve') {
        await approvePayment(selectedSession.id, actionNotes || undefined)
        toast.success('Payment approved successfully')
      } else {
        await rejectPayment(selectedSession.id, actionNotes || undefined)
        toast.success('Payment rejected')
      }
      setActionNotes('')
      setSelectedSession(null)
      await loadSessions()
    } catch (err) {
      toast.error(`Failed to ${action} payment`)
      console.error(`[payment] ${action} failed:`, err)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify pending payments</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} variant="bordered" className={`${stat.bg} border-gray-100 p-5`}>
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card variant="bordered" className="bg-white border-gray-100 p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by donor name, email, gateway, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PaymentSessionStatus | 'all')}
            title="Filter by status"
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Statuses</option>
            <option value="payment_received">Awaiting Verification</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <TableSkeleton />
        ) : loadError ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-3" />
            <p className="text-gray-700 font-medium">Unable to load payments</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">{loadError}</p>
            <Button variant="outline" size="sm" onClick={loadSessions} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">No transactions found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting the search or status filter.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((session) => {
              const donor = session.donor || session.donation?.donor
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  layout
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedSession(session)
                    setActionNotes('')
                  }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center flex-shrink-0 text-white text-sm font-medium">
                          {(donor?.full_name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">{donor?.full_name || 'Unknown'}</p>
                          <p className="text-xs text-gray-500">{donor?.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 mt-2">
                        <span className="font-mono">{session.transaction_id || session.id.slice(0, 8)}</span>
                        <span>{formatNPR(Number(session.amount))}</span>
                        <span className="capitalize">{session.gateway.replace(/_/g, ' ')}</span>
                        <span>{new Date(session.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.verification_status && (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${VERIFICATION_STYLES[session.verification_status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {VERIFICATION_LABELS[session.verification_status] || session.verification_status}
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[session.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                        {STATUS_LABELS[session.status] || session.status}
                      </span>
                      {session.donation?.receipt?.receipt_number && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Receipt className="w-3.5 h-3.5" />
                          {session.donation.receipt.receipt_number}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </Card>

      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">Transaction Details</h2>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-sm text-gray-500 hover:text-gray-900"
                  >
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Donor Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-700 font-medium">{selectedSession.donor?.full_name || selectedSession.donation?.donor?.full_name || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Email</span>
                        <span className="text-gray-700">{selectedSession.donor?.email || selectedSession.donation?.donor?.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Amount</span>
                        <span className="text-gray-700 font-bold">{formatNPR(Number(selectedSession.amount))}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Currency</span>
                        <span className="text-gray-700">NPR</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Internal Transaction ID</span>
                        <span className="text-gray-700 font-mono">{selectedSession.transaction_id || selectedSession.id.slice(0, 8)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Provider Payment ID</span>
                        <span className="text-gray-700 font-mono">{selectedSession.transaction_id || 'Pending'}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gateway</span>
                        <span className="text-gray-700 capitalize">{selectedSession.gateway.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Frequency</span>
                        <span className="text-gray-700 capitalize">{selectedSession.frequency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[selectedSession.status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                          {STATUS_LABELS[selectedSession.status] || selectedSession.status}
                        </span>
                      </div>
                      {selectedSession.verification_status && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Verification</span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${VERIFICATION_STYLES[selectedSession.verification_status] || 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                            {VERIFICATION_LABELS[selectedSession.verification_status] || selectedSession.verification_status}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Initiated</span>
                        <span className="text-gray-700">{new Date(selectedSession.created_at).toLocaleString()}</span>
                      </div>
                      {selectedSession.verified_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Verified</span>
                          <span className="text-gray-700">{new Date(selectedSession.verified_at).toLocaleString()}</span>
                        </div>
                      )}
                      {selectedSession.approved_at && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Approved</span>
                          <span className="text-gray-700">{new Date(selectedSession.approved_at).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedSession.donation && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Associated Donation</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Donation ID</span>
                          <span className="text-gray-700 font-mono">{selectedSession.donation.id.slice(0, 8)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Status</span>
                          <span className="text-gray-700 capitalize">{selectedSession.donation.status}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Amount</span>
                          <span className="text-gray-700">{formatNPR(Number(selectedSession.donation.amount))}</span>
                        </div>
                        {selectedSession.donation.receipt?.receipt_number && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Receipt</span>
                            <span className="text-gray-700 font-mono">{selectedSession.donation.receipt.receipt_number}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedSession.verification_notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Verification Notes</h3>
                      <p className="text-sm text-gray-700">{selectedSession.verification_notes}</p>
                    </div>
                  )}

                  {selectedSession.approval_notes && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Approval Notes</h3>
                      <p className="text-sm text-gray-700">{selectedSession.approval_notes}</p>
                    </div>
                  )}

                  {selectedSession.status === 'payment_received' && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-500 mb-2 block">Notes (optional)</label>
                      <textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder="Add notes for this action..."
                        rows={3}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                      />
                    </div>
                  )}

                  {selectedSession.status === 'payment_received' && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {isFinanceManager && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAction('verify')}
                            disabled={actionLoading}
                          >
                            <ShieldCheck className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Verify Payment'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('reject')}
                            disabled={actionLoading}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </Button>
                        </>
                      )}
                      {isAdmin && (
                        <>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleAction('approve')}
                            disabled={actionLoading}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Approve Payment'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAction('reject')}
                            disabled={actionLoading}
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {selectedSession.status !== 'payment_received' && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                      Payment status is updated only by verified gateway confirmations (Stripe webhook, eSewa callback, Khalti lookup). Transactions cannot be manually marked as paid.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
