import { useCallback, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import { getErrorMessage } from '../../../lib/errors'
import type { SponsorshipTimelineEvent } from '../../../types/features'

export interface UseSponsorshipTimelineResult {
  events: SponsorshipTimelineEvent[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useSponsorshipTimeline(
  userId: string | undefined,
  sponsorshipId?: string,
): UseSponsorshipTimelineResult {
  const [events, setEvents] = useState<SponsorshipTimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimeline = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('sponsorship_timeline')
        .select('*, sponsorships!inner(donor_id)')
        .eq('sponsorships.donor_id', userId)

      if (sponsorshipId) {
        query = query.eq('sponsorship_id', sponsorshipId)
      }

      const { data, error: fetchError } = await query
        .order('event_date', { ascending: false })
        .limit(50)

      if (fetchError) throw fetchError

      setEvents((data || []) as unknown as SponsorshipTimelineEvent[])
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load timeline'))
    } finally {
      setLoading(false)
    }
  }, [userId, sponsorshipId])

  return { events, loading, error, refresh: fetchTimeline }
}
