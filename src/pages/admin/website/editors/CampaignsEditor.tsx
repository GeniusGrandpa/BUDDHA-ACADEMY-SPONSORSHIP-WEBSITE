import { useState, useEffect } from 'react'
import { getSupabaseClient } from '../../../../lib/supabase'
import { FormSkeleton } from '../../../../components/ui/LoadingSkeleton'
import type { DonationGoal as DBDonationGoal } from '../../../../types/database'
import toast from 'react-hot-toast'

const supabase = getSupabaseClient()

type DonationGoal = DBDonationGoal & { _new?: boolean }

export function CampaignsEditor() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [goals, setGoals] = useState<DonationGoal[]>([])

  useEffect(() => { load() }, [])

  const load = async () => {
    try {
      const { data } = await supabase.from('donation_goals').select('*').order('created_at', { ascending: false })
      setGoals(data || [])
    } catch { toast.error('Failed to load campaigns') }
    finally { setLoading(false) }
  }

  const handleSave = async (goal: DonationGoal) => {
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { id, _new, ...rest } = goal
      const { error } = await supabase.from('donation_goals').upsert({ ...rest, start_date: rest.start_date || null, end_date: rest.end_date || null })
      if (error) throw error
      toast.success('Campaign saved')
      load()
    } catch { toast.error('Failed to save campaign') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('donation_goals').delete().eq('id', id)
      if (error) throw error
      setGoals(prev => prev.filter(g => g.id !== id))
      toast.success('Campaign deleted')
    } catch { toast.error('Failed to delete campaign') }
  }

  const addGoal = () => {
    setGoals(prev => [{
      id: '', title: '', description: '', target_amount: 0, raised_amount: 0,
      donor_count: 0, icon: 'heart', color: '#f59e0b', category: 'general',
      is_active: true, start_date: '', end_date: '', created_at: '', updated_at: '', _new: true,
    } as DonationGoal, ...prev])
  }

  const updateGoal = (i: number, field: string, value: unknown) => {
    setGoals(prev => prev.map((g, idx) => idx === i ? { ...g, [field]: value } : g))
  }

  if (loading) return <FormSkeleton fields={4} />

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns & Donation Goals</h1>
          <p className="text-gray-500 mt-1">Manage fundraising campaigns and donation targets</p>
        </div>
        <button onClick={addGoal}
          className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors">
          + Add Campaign
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium">No campaigns yet</p>
          <p className="text-gray-400 text-sm mt-1">Add your first fundraising campaign</p>
        </div>
      ) : (
        goals.map((goal, i) => (
          <div key={goal.id || `new-${i}`} className="bg-white rounded-xl border border-gray-100 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">{goal.title || 'New Campaign'}</h3>
              <div className="flex gap-2">
                <button onClick={() => handleSave(goal)} disabled={saving}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white text-xs font-medium rounded-lg transition-colors">
                  {saving ? 'Saving...' : 'Save'}
                </button>
                {goal.id && (
                  <button onClick={() => handleDelete(goal.id)} className="px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded-lg transition-colors">Delete</button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Title</label>
                <input value={goal.title} onChange={e => updateGoal(i, 'title', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                <input value={goal.category} onChange={e => updateGoal(i, 'category', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-500 mb-1">Description</label>
                <textarea value={goal.description || ''} onChange={e => updateGoal(i, 'description', e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Target Amount (NPR)</label>
                <input type="number" value={goal.target_amount} onChange={e => updateGoal(i, 'target_amount', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Raised Amount (NPR)</label>
                <input type="number" value={goal.raised_amount} onChange={e => updateGoal(i, 'raised_amount', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Donor Count</label>
                <input type="number" value={goal.donor_count} onChange={e => updateGoal(i, 'donor_count', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Color</label>
                <input type="color" value={goal.color || '#f59e0b'} onChange={e => updateGoal(i, 'color', e.target.value)}
                  className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Start Date</label>
                <input type="date" value={goal.start_date?.split('T')[0] || ''} onChange={e => updateGoal(i, 'start_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">End Date</label>
                <input type="date" value={goal.end_date?.split('T')[0] || ''} onChange={e => updateGoal(i, 'end_date', e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-amber-500/50" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" checked={goal.is_active} onChange={e => updateGoal(i, 'is_active', e.target.checked)} id={`active-${i}`} />
                <label htmlFor={`active-${i}`} className="text-sm text-gray-700">Active</label>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
