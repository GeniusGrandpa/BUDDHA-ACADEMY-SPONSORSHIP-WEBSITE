import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import { Card } from '../../../components/ui/Card'
import type { Sponsorship } from '../../../types/database'

export function SponsorshipDashboard() {
  const [stats, setStats] = useState({ active: 0, paused: 0, ended: 0, total: 0 })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('sponsorships')
        .select('status')
      const rows = (data || []) as Pick<Sponsorship, 'status'>[]
      if (rows.length > 0 || data !== null) {
        setStats({
          active: rows.filter(s => s.status === 'active').length,
          paused: rows.filter(s => s.status === 'paused').length,
          ended: rows.filter(s => s.status === 'ended').length,
          total: rows.length,
        })
      }
    }
    load()
  }, [])

  const cards = [
    { label: 'Active Sponsorships', value: stats.active },
    { label: 'Paused', value: stats.paused },
    { label: 'Ended', value: stats.ended },
    { label: 'Total Sponsorships', value: stats.total },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sponsorship Dashboard</h1>
        <p className="text-gray-500 mt-1">Sponsorship lifecycle and engagement tracking</p>
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
