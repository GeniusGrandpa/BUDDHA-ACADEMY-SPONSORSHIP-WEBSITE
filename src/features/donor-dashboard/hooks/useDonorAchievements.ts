import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Achievement } from '../../../types/features'
type DbQuery = ReturnType<typeof supabase.from>
interface DonorAchievementsReturn {
  achievements: Achievement[]
  unlockedAchievements: Achievement[]
  loading: boolean
  checkAndAwardAchievements: () => Promise<string[]>
}

export function useDonorAchievements(userId: string | undefined): DonorAchievementsReturn {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  const fetchAchievements = useCallback(async () => {
    if (!userId) {
      setAchievements([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)
        .order('unlocked_at', { ascending: false })
        .order('progress', { ascending: false })

      if (error) throw error

      setAchievements((data || []) as Achievement[])
    } catch {
      setAchievements([])
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  const unlockedAchievements = achievements.filter(a => a.unlocked_at !== null)

  const checkAndAwardAchievements = useCallback(async (): Promise<string[]> => {
    if (!userId) return []

    try {
      const { data: donations } = await supabase
        .from('donations')
        .select('amount, status, created_at')
        .eq('donor_id', userId)
        .eq('status', 'received')
        .order('created_at', { ascending: true })

      const { data: sponsorships } = await supabase
        .from('sponsorships')
        .select('id, status')
        .eq('donor_id', userId)

      const { data: existingAchievements } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', userId)

      const receivedDonations = donations || []
      const existing = (existingAchievements || []) as Achievement[]
      const existingUnlocked = new Set(
        existing.filter(a => a.unlocked_at !== null).map(a => a.id)
      )

      const totalDonated = receivedDonations.reduce((sum, d) => sum + d.amount, 0)
      const totalDonationsCount = receivedDonations.length
      const activeSponsorshipsCount = (sponsorships || []).filter(s => s.status === 'active').length
      const allSponsorshipsCount = (sponsorships || []).length

      const months = new Set(receivedDonations.map(d => d.created_at.slice(0, 7)))
      const streakMonths = months.size

      const newlyUnlocked: string[] = []

      const awards: { id: string; condition: boolean }[] = [
        { id: 'first-donation', condition: totalDonationsCount >= 1 },
        { id: 'sponsor-a-child', condition: allSponsorshipsCount >= 1 },
        { id: 'three-month-streak', condition: streakMonths >= 3 },
        { id: 'generous-supporter', condition: totalDonated >= 10000 },
        { id: 'triple-sponsor', condition: activeSponsorshipsCount >= 3 },
        { id: 'supporter-extraordinaire', condition: totalDonated >= 50000 },
        { id: 'six-month-streak', condition: streakMonths >= 6 },
        { id: 'first-milestone', condition: totalDonationsCount >= 5 },
        { id: 'dedicated-donor', condition: totalDonationsCount >= 10 },
      ]

      for (const award of awards) {
        if (award.condition && !existingUnlocked.has(award.id)) {
          newlyUnlocked.push(award.id)
        }
      }

      if (newlyUnlocked.length > 0) {
        for (const achievementId of newlyUnlocked) {
          await (supabase.from('achievements') as unknown as DbQuery)
            .upsert({
              user_id: userId,
              id: achievementId,
              unlocked_at: new Date().toISOString(),
            } as never, { onConflict: 'id' })
        }

        await fetchAchievements()
      }

      return newlyUnlocked
    } catch {
      return []
    }
  }, [userId, fetchAchievements])

  return {
    achievements,
    unlockedAchievements,
    loading,
    checkAndAwardAchievements,
  }
}
