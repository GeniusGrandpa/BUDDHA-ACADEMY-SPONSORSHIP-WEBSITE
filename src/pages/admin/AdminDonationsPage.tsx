import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatNPR } from '../../utils/currency'
import { getAllDonations, updateDonationStatus } from '../../services/donations'
import type { Donation } from '../../types/database'

export function AdminDonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDonations()
  }, [])

  const loadDonations = async () => {
    try {
      const data = await getAllDonations()
      setDonations(data)
    } catch (error) {
      console.error('Error loading donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: Donation['status']) => {
    try {
      await updateDonationStatus(id, status)
      setDonations(donations.map(d => d.id === id ? { ...d, status } : d))
    } catch (error) {
      console.error('Error updating donation:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending Review' },
    { value: 'processing', label: 'In Review' },
    { value: 'completed', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
  ]

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  const receivedAmount = donations.filter(d => d.status === 'completed').reduce((sum, d) => sum + d.amount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donation Management</h1>
        <p className="text-gray-600">View verified donations in the approval workflow</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card variant="bordered" className="bg-amber-50">
          <div className="text-sm text-amber-600">Total Verified</div>
          <div className="text-2xl font-bold text-amber-900">{formatNPR(totalAmount)}</div>
        </Card>
        <Card variant="bordered" className="bg-emerald-50">
          <div className="text-sm text-emerald-600">Approved</div>
          <div className="text-2xl font-bold text-emerald-900">{formatNPR(receivedAmount)}</div>
        </Card>
        <Card variant="bordered">
          <div className="text-sm text-gray-600">Total Donations</div>
          <div className="text-2xl font-bold text-gray-900">{donations.length}</div>
        </Card>
      </div>

      <Card variant="bordered" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">No donations found</td>
                </tr>
              ) : (
                donations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(donation.created_at)}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatNPR(donation.amount)}</td>
                    <td className="px-6 py-4">
                      <Badge variant="default">{donation.frequency}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {donation.student_id || 'General'}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={donation.status}
                        onChange={(e) => handleStatusChange(donation.id, e.target.value as Donation['status'])}
                        className="text-sm border rounded px-2 py-1"
                        aria-label="Change donation status"
                      >
                        {statusOptions.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
