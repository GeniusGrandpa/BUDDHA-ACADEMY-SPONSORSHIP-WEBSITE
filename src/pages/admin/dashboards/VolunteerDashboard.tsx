import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Card } from '../../../components/ui/Card'
import type { VolunteerAssignment } from '../../../types/database'

export function VolunteerDashboard() {
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0, total: 0 })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('volunteer_assignments')
        .select('status')
      const rows = (data || []) as Pick<VolunteerAssignment, 'status'>[]
      if (rows.length > 0 || data !== null) {
        setStats({
          assigned: rows.filter(s => s.status === 'assigned').length,
          inProgress: rows.filter(s => s.status === 'in_progress').length,
          completed: rows.filter(s => s.status === 'completed').length,
          total: rows.length,
        })
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Assigned', value: stats.assigned },
    { label: 'In Progress', value: stats.inProgress },
    { label: 'Completed', value: stats.completed },
    { label: 'Total Tasks', value: stats.total },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Volunteer Dashboard</h1>
        <p className="text-gray-500 mt-1">Volunteer task management and coordination</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <Card key={card.label} variant="bordered" className="bg-white border-gray-100 p-5">
            <p className="text-sm text-gray-500">{card.label}</p>
            <p className="text-2xl font-bold mt-1 text-gray-900">{card.value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
