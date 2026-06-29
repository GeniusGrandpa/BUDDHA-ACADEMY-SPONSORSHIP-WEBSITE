import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Download, Search, Filter } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getDonorDonationsWithPayment } from '../services/payments'
import { generateReceiptPDF, generateDonationHistoryPDF, exportToCSV } from '../features/donor-dashboard/utils/pdfGenerator'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { TableSkeleton } from '../components/ui/LoadingSkeleton'
import { formatNPR } from '../utils/currency'
import type { Donation } from '../types/database'
import type { DonationWithPayment } from '../types/payments'

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  processing: 'bg-blue-100 text-blue-700 border-blue-200',
  verified: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  failed: 'bg-red-100 text-red-700 border-red-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  cancelled: 'bg-gray-100 text-gray-700 border-gray-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Verified',
  verified: 'Verified',
  failed: 'Failed',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
}

export function DonationHistoryPage() {
  const { user, profile } = useAuth()
  const [donations, setDonations] = useState<DonationWithPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const loadDonations = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getDonorDonationsWithPayment(user.id)
      setDonations(data)
    } catch {
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadDonations()
  }, [loadDonations])

  async function handleDownloadReceipt(donation: DonationWithPayment) {
    const receipt = donation.receipt
    if (!receipt) return

    generateReceiptPDF(
      {
        receipt_number: receipt.receipt_number,
        amount: receipt.receipt_data.amount || donation.amount,
        certificate_type: 'donation_receipt',
        title: 'Donation Receipt',
        description: null,
        issued_date: receipt.generated_at,
        donation_id: donation.id,
      },
      {
        name: profile?.full_name || 'Donor',
        email: user?.email || '',
      },
    )
  }

  const handleDownloadHistory = () => {
    if (!profile) return
    generateDonationHistoryPDF(
      donations as unknown as Donation[],
      { name: profile.full_name },
    )
  }

  const handleExportCSV = () => {
    const data = donations.map(d => ({
      Date: new Date(d.created_at).toLocaleDateString(),
      Amount: `${formatNPR(d.amount)}`,
      Frequency: d.frequency,
      Method: d.payment_method || 'N/A',
      Status: d.status,
      Transaction: d.transaction_id || 'N/A',
    }))
    exportToCSV(data, 'donation-history')
  }

  const filtered = donations.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        d.transaction_id?.toLowerCase().includes(q) ||
        d.payment_method?.toLowerCase().includes(q) ||
        d.amount.toString().includes(q)
      )
    }
    return true
  })

  if (loading) return <TableSkeleton />

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Donation History</h1>
            <p className="text-sm text-gray-500 mt-1">Track all your contributions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleDownloadHistory}>
              <Download className="w-4 h-4 mr-2" />
              PDF Report
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              Export CSV
            </Button>
          </div>
        </div>

        <Card variant="bordered" padding="md" className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by transaction ID or amount..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                title="Filter by status"
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Verified</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </Card>

        {filtered.length === 0 ? (
          <Card variant="bordered" padding="lg" className="text-center">
            <p className="text-gray-500">No donations found</p>
            <p className="text-sm text-gray-400 mt-1">Your donation history will appear here after you make a donation.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((donation, idx) => (
              <motion.div
                key={donation.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <Card variant="bordered" padding="md">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold text-gray-900">
                          {formatNPR(donation.amount)}
                        </span>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLES[donation.status] || 'bg-gray-100 text-gray-700'}`}>
                          {STATUS_LABELS[donation.status] || donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>{new Date(donation.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        <span className="capitalize">{donation.frequency}</span>
                        {donation.payment_method && (
                          <span className="capitalize">{donation.payment_method.replace(/_/g, ' ')}</span>
                        )}
                        {donation.transaction_id && (
                          <span className="font-mono text-xs">{donation.transaction_id}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(donation.status === 'completed' || donation.status === 'verified') && donation.receipt && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadReceipt(donation)}
                        >
                          <Download className="w-3.5 h-3.5 mr-1.5" />
                          Receipt
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {donations.length > 0 && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <p className="font-medium mb-1">Total Donations</p>
            <p className="text-2xl font-bold">{formatNPR(donations.reduce((s, d) => s + d.amount, 0))}</p>
          </div>
        )}
      </div>
    </div>
  )
}
