import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'

import { supabase } from '../../lib/supabase'
import { downloadDonationReceipt, downloadYearlySummary } from '../../services/pdfExport'
import type { Donation, Sponsorship } from '../../types/database'
import { EmptyState } from '../ui/EmptyState'

interface DonorImpactProps {
  userId: string
  donorName: string
}

export function DonorImpactDashboard({ userId, donorName }: DonorImpactProps) {
  const [donations, setDonations] = useState<(Donation & { student_name?: string })[]>([])
  const [sponsorships, setSponsorships] = useState<(Sponsorship & { student_name?: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)

    const [donationsRes, sponsorshipsRes] = await Promise.all([
      supabase
        .from('donations')
        .select('*, students(name)')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('sponsorships')
        .select('*, students(name)')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false }),
    ])

    if (donationsRes.data) {
      setDonations(donationsRes.data.map(d => ({
        ...d,
        student_name: d.students?.name || undefined,
      })))
    }
    if (sponsorshipsRes.data) {
      setSponsorships(sponsorshipsRes.data.map(s => ({
        ...s,
        student_name: s.students?.name || undefined,
      })))
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const totalDonated = donations.reduce((sum, d) => sum + (d.status === 'verified' || d.status === 'completed' ? d.amount : 0), 0)
  const verifiedDonations = donations.filter(d => d.status === 'verified' || d.status === 'completed')
  const activeSponsorships = sponsorships.filter(s => s.status === 'active')

  async function handleDownloadReceipt(donation: Donation & { student_name?: string }) {
    setExporting(donation.id)
    await downloadDonationReceipt({
      donorName,
      donorEmail: '',
      amount: donation.amount,
      transactionId: donation.transaction_id || donation.id,
      date: donation.created_at,
      allocationCategory: donation.payment_method || 'General Support',
      studentName: donation.student_name,
    })
    setExporting(null)
  }

  async function handleDownloadYearlySummary() {
    const currentYear = new Date().getFullYear()
    const yearDonations = donations.filter(d => new Date(d.created_at).getFullYear() === currentYear)
    setExporting('yearly')
    await downloadYearlySummary({
      donorName,
      year: currentYear,
      totalDonated: yearDonations.reduce((sum, d) => sum + d.amount, 0),
      donations: yearDonations.map(d => ({ date: d.created_at, amount: d.amount, status: d.status })),
      studentsSponsored: activeSponsorships.map(s => s.student_name || 'Unknown'),
    })
    setExporting(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-warm-50 rounded-xl p-6 border border-amber-200">
            <div className="h-4 bg-gray-200 rounded w-24 mb-4" />
            <div className="h-8 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    )
  }

  if (donations.length === 0 && sponsorships.length === 0) {
    return (
      <EmptyState

        title="Start Your Journey"
        message="Your giving journey begins here. When you make your first donation or sponsorship, your impact summary, transaction history, and certificates will appear on this dashboard."
        action={{
          label: 'Sponsor a Child',
          onClick: () => window.location.href = '/students',
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-warm-50 rounded-xl p-6 border border-amber-200"
        >
          <div className="mb-2">
            <span className="text-sm text-gray-500">Total Contributed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            NPR {totalDonated.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Across {verifiedDonations.length} verified donation{verifiedDonations.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-warm-50 rounded-xl p-6 border border-amber-200"
        >
          <div className="mb-2">
            <span className="text-sm text-gray-500">Students Supported</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {activeSponsorships.length}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Active sponsorship{activeSponsorships.length !== 1 ? 's' : ''}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-warm-50 rounded-xl p-6 border border-amber-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-500">Documents</span>
          </div>
          <button
            onClick={handleDownloadYearlySummary}
            disabled={exporting === 'yearly'}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium disabled:opacity-50"
          >
            {exporting === 'yearly' ? 'Generating...' : 'Download Yearly Summary'}
          </button>
          <p className="text-xs text-gray-500 mt-1">
            Tax receipt available
          </p>
        </motion.div>
      </div>

      {activeSponsorships.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-warm-50 rounded-xl border border-amber-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">

              Your Sponsored Students
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {activeSponsorships.map((sponsorship) => (
              <div key={sponsorship.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {sponsorship.student_name || 'Student'}
                  </p>
                  <p className="text-xs text-gray-500">
                    Since {new Date(sponsorship.start_date).toLocaleDateString()} &middot; NPR {sponsorship.amount.toLocaleString()}/month
                  </p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                  Active
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl border border-gray-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Transaction History</h3>
          <button
            onClick={handleDownloadYearlySummary}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Export All
          </button>
        </div>
        {donations.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">
            No donations yet. Your transaction history will appear here.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {donations.slice(0, 10).map((donation) => (
              <div key={donation.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {donation.student_name ? `Sponsorship: ${donation.student_name}` : 'General Donation'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(donation.created_at).toLocaleDateString()} &middot; {donation.frequency}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    NPR {donation.amount.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-1.5 py-0.5 rounded ${donation.status === 'verified' || donation.status === 'completed'
                        ? 'bg-emerald-100 text-emerald-600'
                        : donation.status === 'pending' || donation.status === 'processing'
                          ? 'bg-amber-100 text-amber-600'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                      {donation.status}
                    </span>
                    {(donation.status === 'verified' || donation.status === 'completed') && (
                      <button
                        onClick={() => handleDownloadReceipt(donation)}
                        disabled={exporting === donation.id}
                        className="text-xs text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                      >
                        {exporting === donation.id ? '...' : 'Receipt'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  )
}
