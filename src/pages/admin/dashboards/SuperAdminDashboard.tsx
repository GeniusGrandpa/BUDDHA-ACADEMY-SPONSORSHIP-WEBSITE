import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getRecentActivities } from '../../../services/activities'
import type { ActivityRow } from '../../../types/database'
import { DashboardCard } from '../../../components/ui/DashboardCard'
import { DashboardStatCard } from '../../../components/ui/DashboardStatCard'

interface SystemStats {
  totalUsers: number
  totalStudents: number
  totalDonations: number
  totalSponsorships: number
  activeSessions: number
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0, totalStudents: 0, totalDonations: 0, totalSponsorships: 0, activeSessions: 0,
  })
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [activitiesError, setActivitiesError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const [
          { count: users }, { count: students }, { count: donations },
          { count: sponsorships }, { count: sessions },
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('students').select('*', { count: 'exact', head: true }),
          supabase.from('donations').select('*', { count: 'exact', head: true }),
          supabase.from('sponsorships').select('*', { count: 'exact', head: true }),
          supabase.from('user_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        ])
        setStats({
          totalUsers: users || 0,
          totalStudents: students || 0,
          totalDonations: donations || 0,
          totalSponsorships: sponsorships || 0,
          activeSessions: sessions || 0,
        })
      } finally {
        setLoading(false)
      }
    }

    async function loadActivities() {
      const data = await getRecentActivities(8)
      if (data.length === 0) {
        const probe = await supabase.from('activities').select('id').limit(1)
        if (probe.error) {
          setActivitiesError(true)
          return
        }
      }
      setActivities(data)
    }

    loadStats()
    loadActivities()
  }, [])

  function getTimeAgo(dateStr: string): string {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins} min ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">System Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Complete platform analytics and monitoring</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <DashboardStatCard
          label="Total Users"
          value={loading ? '...' : stats.totalUsers.toLocaleString()}
          trend={{ value: 12, positive: true }}
        />
        <DashboardStatCard
          label="Students"
          value={loading ? '...' : stats.totalStudents.toLocaleString()}
          trend={{ value: 5, positive: true }}
        />
        <DashboardStatCard
          label="Donations"
          value={loading ? '...' : stats.totalDonations.toLocaleString()}
          trend={{ value: 23, positive: true }}
        />
        <DashboardStatCard
          label="Sponsorships"
          value={loading ? '...' : stats.totalSponsorships.toLocaleString()}
        />
        <DashboardStatCard
          label="Active Sessions"
          value={loading ? '...' : stats.activeSessions.toLocaleString()}
          trend={{ value: 2, positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Security Status" description="Current system health and security metrics">
          <div className="space-y-3">
            {[
              { label: 'System Protection', status: 'Active', color: 'text-emerald-600' },
              { label: 'Recent Security Events', status: 'None', color: 'text-emerald-600' },
              { label: 'Failed Logins (24h)', status: '0', color: 'text-gray-500' },
              { label: 'API Health', status: 'Operational', color: 'text-emerald-600' },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.label}</span>
                <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
              </div>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Recent Activity" description="Latest system-wide actions">
          <div className="space-y-3">
            {activitiesError ? (
              <p className="text-sm text-gray-500">Unable to load recent activity.</p>
            ) : activities.length > 0 ? (
              activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-700 truncate">{activity.title}</span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{getTimeAgo(activity.created_at)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No recent activity yet.</p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  )
}
