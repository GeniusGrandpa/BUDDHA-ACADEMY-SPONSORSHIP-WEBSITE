import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatNPR } from '../../utils/currency'
import { getPendingVerifications, verifyPayment } from '../../services/payments'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import type { PaymentSession } from '../../types/payments'

interface SessionWithDonor extends PaymentSession {
  donation?: {
    id: string
    donor_id: string
    amount: number
    frequency: string
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
}

export function AdminPaymentVerificationPage() {
  const [sessions, setSessions] = useState<SessionWithDonor[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('processing')
  const [selectedSession, setSelectedSession] = useState<SessionWithDonor | null>(null)
  const [verificationNotes, setVerificationNotes] = useState('')
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const data = await getPendingVerifications()
      setSessions(data as unknown as SessionWithDonor[])
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (sessionId: string, status: 'verified' | 'rejected') => {
    setVerifying(true)
    try {
      await verifyPayment(sessionId, status, verificationNotes || undefined)
      setSelectedSession(null)
      setVerificationNotes('')
      await loadSessions()
    } catch {
    } finally {
      setVerifying(false)
    }
  }

  const filtered = sessions.filter(s => {
    const statuses = statusFilter.split(',')
    if (!statuses.includes(s.status)) return false
    if (search) {
      const q = search.toLowerCase()
      const donor = s.donation?.donor
      return (
        donor?.full_name?.toLowerCase().includes(q) ||
        donor?.email?.toLowerCase().includes(q) ||
        s.transaction_id?.toLowerCase().includes(q) ||
        s.id?.toLowerCase().includes(q)
      )
    }
    return true
  })

  const stats = {
    processing: sessions.filter(s => s.status === 'processing').length,
    total: sessions.length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verification</h1>
          <p className="text-gray-500 mt-1">Review and verify donor payments</p>
        </div>
        <Button variant="primary" size="sm" onClick={loadSessions}>
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Awaiting Verification', value: stats.processing, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'In Review Queue', value: stats.total, color: 'text-gray-400', bg: 'bg-gray-500/10' },
        ].map((stat) => (
          <Card key={stat.label} variant="bordered" className="bg-white border-gray-100 p-5">
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
              placeholder="Search by donor name, email, or transaction ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:border-amber-500/50"
            >
              <option value="processing">Awaiting Verification</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 font-medium">All caught up!</p>
            <p className="text-gray-400 text-sm mt-1">No pending payments to review.</p>
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
                  className="bg-gray-50 border border-gray-100 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => setSelectedSession(session)}
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
                        <span className="font-mono">{session.transaction_id}</span>
                        <span>{formatNPR(Number(session.amount))}</span>
                        <span className="capitalize">{session.gateway.replace(/_/g, ' ')}</span>
                        <span>{new Date(session.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        session.status === 'processing'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {session.status === 'processing' ? 'Payment Submitted' : session.status}
                      </span>
                      {session.screenshots && session.screenshots.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {session.screenshots.length} screenshot(s)
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
                  <h2 className="text-lg font-semibold text-gray-900">Payment Details</h2>
                  <button onClick={() => setSelectedSession(null)} className="text-sm text-gray-500 hover:text-gray-900">
                    Close
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Donor Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name</span>
                        <span className="text-gray-700 font-medium">{selectedSession.donor?.full_name || selectedSession.donation?.donor?.full_name}</span>
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
                        <span className="text-gray-500">Transaction ID</span>
                        <span className="text-gray-700 font-mono">{selectedSession.transaction_id}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Gateway</span>
                        <span className="text-gray-700 capitalize">{selectedSession.gateway.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Date</span>
                        <span className="text-gray-700">{new Date(selectedSession.created_at).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          selectedSession.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}>
                          {selectedSession.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {selectedSession.screenshots && selectedSession.screenshots.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h3 className="text-sm font-medium text-gray-500 mb-3">Payment Screenshots</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {selectedSession.screenshots.map((url, idx) => (
                          <a
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group"
                          >
                            <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Verification Notes</h3>
                    <textarea
                      value={verificationNotes}
                      onChange={(e) => setVerificationNotes(e.target.value)}
                      placeholder="Add verification notes (optional)..."
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-amber-500/50"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      className="flex-1"
                      onClick={() => handleVerify(selectedSession.id, 'verified')}
                      disabled={verifying}
                    >
                      Approve Payment
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-500/50 text-red-400 hover:bg-red-500/10"
                      onClick={() => handleVerify(selectedSession.id, 'rejected')}
                      disabled={verifying}
                    >
                      Reject Payment
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
