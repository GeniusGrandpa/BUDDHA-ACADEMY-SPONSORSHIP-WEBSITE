import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { getPaymentStats, getAllPaymentSessions } from '../../../services/payments'
import type { PaymentSession } from '../../../types/payments'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'

export function FinanceDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    totalAmount: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    rejected: 0,
    failed: 0,
    completedAmount: 0,
    awaitingVerification: 0,
    processingCount: 0,
  })
  const [recentSessions, setRecentSessions] = useState<PaymentSession[]>([])

  useEffect(() => {
    async function load() {
      try {
        const [paymentStats, sessions] = await Promise.all([
          getPaymentStats(),
          getAllPaymentSessions(),
        ])
        setStats(paymentStats)
        setRecentSessions(sessions.slice(0, 5))
      } catch {
      }
    }
    load()
  }, [])

  const cards = [
    {
      label: 'Total Revenue',
      value: `NPR ${stats.completedAmount.toLocaleString()}`,
      subtext: `${stats.completed} completed donations`,
    },
    {
      label: 'Pending Verification',
      value: stats.processingCount.toString(),
      subtext: `NPR ${stats.awaitingVerification.toLocaleString()} awaiting review`,
    },
    {
      label: 'Total Transactions',
      value: stats.total.toString(),
      subtext: `NPR ${stats.totalAmount.toLocaleString()} total volume`,
    },
    {
      label: 'Rejected / Failed',
      value: (stats.rejected + stats.failed).toString(),
      subtext: `${stats.rejected} rejected, ${stats.failed} failed`,
    },
  ]

  const statusColors: Record<string, string> = {
    pending: 'text-orange-400',
    processing: 'text-orange-400',
    completed: 'text-orange-400',
    rejected: 'text-red-400',
    failed: 'text-red-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-500 mt-1">Payment verification and revenue tracking</p>
        </div>
        <Link to="/admin/payments/verify">
          <Button variant="primary" size="sm">
            Verify Payments
            {(stats.processingCount) > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {stats.processingCount}
              </span>
            )}
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card variant="bordered" className="bg-white border-gray-100 p-5">
              <p className="text-sm text-gray-500">{card.label}</p>
              <p className="text-2xl font-bold mt-1 text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.subtext}</p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card variant="bordered" className="bg-white border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Verify Payments', href: '/admin/payments/verify' },
              { label: 'Payment Settings', href: '/admin/payments/settings' },
              { label: 'Donation Reports', href: '/admin/donations' },
              { label: 'Audit Logs', href: '/admin/audit' },
            ].map((action) => (
              <Link key={action.label} to={action.href}>
                <div className="p-3 rounded-lg bg-orange-50 hover:bg-orange-100 border border-orange-100 text-sm text-gray-600 hover:text-orange-700 transition-colors text-center cursor-pointer">
                  {action.label}
                </div>
              </Link>
            ))}
          </div>
        </Card>

        <Card variant="bordered" className="bg-white border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
          {recentSessions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-sm text-gray-700 font-mono">{session.transaction_id || 'N/A'}</p>
                    <p className="text-xs text-gray-500">
                      {session.gateway} • {new Date(session.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-700">NPR {Number(session.amount).toLocaleString()}</p>
                    <p className={`text-xs ${statusColors[session.status] || 'text-gray-500'}`}>
                      {session.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <Link
            to="/admin/payments/verify"
            className="flex items-center justify-center gap-2 mt-4 text-sm text-orange-400 hover:text-orange-300"
          >
            View all transactions
          </Link>
        </Card>
      </div>
    </div>
  )
}
