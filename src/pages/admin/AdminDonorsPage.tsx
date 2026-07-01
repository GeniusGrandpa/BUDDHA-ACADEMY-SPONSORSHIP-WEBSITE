import { useCallback, useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Profile } from '../../types/database'
import { TableSkeleton } from '../../components/ui/LoadingSkeleton'

export function AdminDonorsPage() {
  const { profile: caller } = useAuth()
  const [donors, setDonors] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  const isSuperAdmin = caller?.role === 'super_admin'

  const loadDonors = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setDonors(data || [])
    } catch {
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDonors()
  }, [loadDonors])

  const toggleRole = async (donor: Profile) => {
    if (!isSuperAdmin) return
    setUpdating(donor.id)
    const newRole = donor.role === 'admin' ? 'donor' : 'admin'
    try {
      const { error } = await supabase.rpc('admin_update_role', {
        target_user_id: donor.id,
        new_role: newRole,
      })

      if (error) throw error
      setDonors(prev => prev.map(d => d.id === donor.id ? { ...d, role: newRole } : d))
    } catch {
    } finally {
      setUpdating(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Donor Management</h1>
        <p className="text-gray-600">View all registered donors and administrators</p>
      </div>

      <Card variant="bordered" className="overflow-hidden">
        {loading ? (
          <TableSkeleton />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {donors.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">No donors found</td>
                  </tr>
                ) : (
                  donors.map((donor) => (
                    <tr key={donor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{donor.full_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donor.email}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{donor.country || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          donor.role === 'admin'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {donor.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(donor.created_at)}</td>
                      <td className="px-6 py-4">
                        {isSuperAdmin ? (
                          <Button
                            size="sm"
                            variant={donor.role === 'admin' ? 'outline' : 'primary'}
                            disabled={updating === donor.id}
                            onClick={() => toggleRole(donor)}
                          >
                            {updating === donor.id ? '...' : donor.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
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
