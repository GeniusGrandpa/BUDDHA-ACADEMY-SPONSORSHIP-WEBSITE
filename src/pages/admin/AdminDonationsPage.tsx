import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatNPR } from '../../utils/currency'
import { getAllDonations, updateDonationStatus } from '../../services/donations'
import type { Donation } from '../../types/database'
import { TableSkeleton } from '../../components/ui/LoadingSkeleton'
import toast from 'react-hot-toast'

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
    } catch {
    } finally {
      setLoading(false)
    }
  }

  const [updating, setUpdating] = useState<Record<string, boolean>>({})

  const handleStatusChange = async (id: string, status: Donation['status']) => {
    if (updating[id]) return
    setUpdating(prev => ({ ...prev, [id]: true }))
    try {
      await updateDonationStatus(id, status)
      setDonations(donations.map(d => d.id === id ? { ...d, status } : d))
      toast.success(status === 'completed' ? 'Donation approved' : status === 'rejected' ? 'Donation rejected' : `Status set to ${status}`)
    } catch {
      toast.error('Failed to update donation status')
    } finally {
      setUpdating(prev => ({ ...prev, [id]: false }))
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

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
        {loading ? (
          <TableSkeleton />
        ) : (
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
                {donations.length === 0 ? (
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          donation.status === 'completed' ? 'bg-green-100 text-green-700' :
                          donation.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          donation.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          donation.status === 'payment_received' ? 'bg-orange-100 text-orange-700' :
                          donation.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {donation.status}
                        </span>
                        {(donation.status === 'pending' || donation.status === 'payment_received') && (
                          <div className="flex gap-1 mt-1">
                            <button
                              onClick={() => handleStatusChange(donation.id, 'completed')}
                              disabled={updating[donation.id]}
                              className="text-xs px-2 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
                            >
                              {updating[donation.id] ? '...' : 'Approve'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(donation.id, 'rejected')}
                              disabled={updating[donation.id]}
                              className="text-xs px-2 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
                            >
                              {updating[donation.id] ? '...' : 'Reject'}
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
