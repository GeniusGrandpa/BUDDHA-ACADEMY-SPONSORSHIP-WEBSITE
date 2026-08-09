import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, FileText, FileDown, Calendar, Award } from 'lucide-react'
import { fadeInUp, stagger } from '../animations'
import { generateReceiptPDF, generateDonationHistoryPDF } from '../utils/pdfGenerator'
import type { TransactionWithDetails } from '../../../types/features'
import { useSiteCurrency } from '../hooks/useSiteCurrency'
import { formatCurrency } from '../../../utils/currency'
import { Tr } from '../../../components/Translated'

interface ReceiptDownloadsProps {
  transactions: TransactionWithDetails[]
  donorName: string
  donorEmail: string
}

export function ReceiptDownloads({ transactions, donorName, donorEmail }: ReceiptDownloadsProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const currency = useSiteCurrency()

  const completedTx = transactions.filter(
    (t) => t.status === 'completed' || t.status === 'verified',
  )

  const handleDownloadReceipt = async (tx: TransactionWithDetails) => {
    setDownloading(tx.id)
    await new Promise((r) => setTimeout(r, 300))
    generateReceiptPDF(
      {
        receipt_number: `RCP-${new Date(tx.created_at).getFullYear()}-${tx.id.slice(0, 4).toUpperCase()}`,
        amount: tx.amount,
        certificate_type: 'donation_receipt',
        title: 'Donation Receipt',
        description: null,
        issued_date: tx.verified_at || tx.created_at,
        donation_id: tx.id,
      },
      { name: donorName, email: donorEmail },
      currency,
    )
    setDownloading(null)
  }

  const handleDownloadYearlySummary = async () => {
    setDownloading('yearly')
    await new Promise((r) => setTimeout(r, 300))
    generateDonationHistoryPDF(
      completedTx.map((t) => ({
        id: t.id,
        donor_id: t.donor_id,
        student_id: t.student_id,
        amount: t.amount,
        frequency: t.frequency,
        status: t.status,
        message: t.message,
        transaction_id: t.transaction_id,
        payment_method: t.payment_method,
        payment_session_id: t.payment_session_id,
        verified_at: t.verified_at,
        verified_by: t.verified_by,
        created_at: t.created_at,
        updated_at: t.updated_at,
      })),
      { name: donorName },
      currency,
    )
    setDownloading(null)
  }

  const latestReceipts = completedTx.slice(0, 5)

  if (completedTx.length === 0) return null

  return (
    <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-100 to-orange-100">
          <FileText className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900"><Tr text="Receipts & Downloads" /></h2>
          <p className="text-sm text-gray-400 mt-0.5"><Tr text="Download receipts and reports for your records" /></p>
        </div>
      </div>

      <motion.div variants={stagger} initial="initial" animate="animate" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-100 to-orange-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1"><Tr text="Yearly Summary" /></h3>
          <p className="text-xs text-gray-400 mb-3">
            <Tr text="Complete donation history for the year" /> — {completedTx.length} {completedTx.length !== 1 ? <Tr text="donations" /> : <Tr text="donation" />}
          </p>
          <button
            onClick={handleDownloadYearlySummary}
            disabled={downloading === 'yearly'}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading === 'yearly' ? <Tr text="Downloading..." /> : <Tr text="Download PDF" />}
          </button>
        </motion.div>

        <motion.div
          variants={fadeInUp}
          className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <h3 className="text-sm font-semibold text-gray-900 mb-1"><Tr text="Sponsorship Report" /></h3>
          <p className="text-xs text-gray-400 mb-3">
            <Tr text="Overview of your sponsored students and their progress" />
          </p>
          <button
            onClick={() => handleDownloadYearlySummary()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <FileDown className="w-3.5 h-3.5" />
            <Tr text="Download Report" />
          </button>
        </motion.div>

        {latestReceipts.slice(0, 1).map((tx) => (
          <motion.div
            key={tx.id}
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1"><Tr text="Latest Receipt" /></h3>
            <p className="text-xs text-gray-400 mb-3">
              {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} &mdash; {formatCurrency(tx.amount, currency)}
            </p>
            <button
              onClick={() => handleDownloadReceipt(tx)}
              disabled={downloading === tx.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloading === tx.id ? <Tr text="Downloading..." /> : <Tr text="Download Receipt" />}
            </button>
          </motion.div>
        ))}

        {latestReceipts.length > 1 && (
          <motion.div
            variants={fadeInUp}
            className="bg-white rounded-xl border border-gray-100 p-4 col-span-full sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center">
                <Download className="w-5 h-5 text-orange-600" />
              </div>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1"><Tr text="All Receipts" /></h3>
            <p className="text-xs text-gray-400 mb-3">
              {completedTx.length} {completedTx.length !== 1 ? <Tr text="receipts" /> : <Tr text="receipt" />} <Tr text="available for download" />
            </p>
            <div className="space-y-1.5 max-h-28 overflow-y-auto">
              {latestReceipts.map((tx) => (
                <button
                  key={tx.id}
                  onClick={() => handleDownloadReceipt(tx)}
                  disabled={downloading === tx.id}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <span className="text-gray-500 group-hover:text-gray-700 truncate">
                    {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &mdash; {formatCurrency(tx.amount, currency)}
                  </span>
                  <Download className="w-3 h-3 text-gray-300 group-hover:text-orange-500 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}
