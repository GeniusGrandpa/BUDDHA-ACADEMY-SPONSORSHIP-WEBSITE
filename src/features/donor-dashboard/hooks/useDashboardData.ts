import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { Donation, Sponsorship, ImpactMetric, StudentProgress } from '../../../types/database'
import type {
  DashboardData,
  DonorStats,
  DonorImpact,
  SponsorshipWithStudent,
  DonationWithStudent,
  ContributionWithStudent,
  ActivityItem,
} from '../../../types/features'

export interface EnhancedDashboardData extends Omit<DashboardData, 'donorStats'> {
  donorStats: DonorStats | null
  donorImpact: DonorImpact | null
  impactMetrics: ImpactMetric[]
  studentProgress: StudentProgress[]
  notificationsCount: number
  activities: ActivityItem[]
  contributedStudents: ContributionWithStudent[]
}

function computeDonorStats(donations: DonationWithStudent[], sponsorships: SponsorshipWithStudent[]): DonorStats {
  const receivedDonations = donations.filter(d => d.status === 'received' || d.status === 'completed' || d.status === 'verified' || (d.status === 'pending' && d.verified_at))
  const totalDonated = receivedDonations.reduce((sum, d) => sum + d.amount, 0)
  const activeSponsorships = sponsorships.filter(s => s.status === 'active')
  const monthlyRecurring = activeSponsorships.reduce((sum, s) => sum + s.amount, 0)

  const firstDonation = receivedDonations.length > 0 ? receivedDonations[receivedDonations.length - 1].created_at : null
  const lastDonation = receivedDonations.length > 0 ? receivedDonations[0].created_at : null

  return {
    totalDonated,
    totalDonations: receivedDonations.length,
    activeSponsorships: activeSponsorships.length,
    totalSponsorships: sponsorships.length,
    monthlyRecurring,
    firstDonationDate: firstDonation,
    lastDonationDate: lastDonation,
  }
}

function computeDonorImpact(sponsorships: SponsorshipWithStudent[], totalDonated: number): DonorImpact {
  const totalStudents = sponsorships.length
  const avgMealsPerStudentPerMonth = 30
  const avgBooksPerStudentPerYear = 10
  const avgUniformsPerStudentPerYear = 2

  const monthsActive = sponsorships.reduce((sum, s) => {
    const start = new Date(s.start_date)
    const end = s.end_date ? new Date(s.end_date) : new Date()
    const diffMonths = (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth()
    return sum + Math.max(1, diffMonths)
  }, 0)

  return {
    meals_funded: monthsActive * avgMealsPerStudentPerMonth,
    books_donated: Math.round((monthsActive / 12) * avgBooksPerStudentPerYear * totalStudents),
    students_supported: totalStudents,
    uniforms_provided: Math.round((monthsActive / 12) * avgUniformsPerStudentPerYear * totalStudents),
    total_donated: totalDonated,
  }
}

export function useDashboardData(userId: string | undefined) {
  const [data, setData] = useState<EnhancedDashboardData>({
    donations: [],
    sponsorships: [],
    donorStats: null as DonorStats | null,
    loading: true,
    error: null,
    donorImpact: null,
    impactMetrics: [],
    studentProgress: [],
    notificationsCount: 0,
    activities: [],
    contributedStudents: [],
  })

  const fetchStudentsForSponsorships = useCallback(async (sponsorshipsData: Sponsorship[]): Promise<SponsorshipWithStudent[]> => {
    const studentIds = sponsorshipsData.map(s => s.student_id)
    if (studentIds.length === 0) return []

    const { data: students, error } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds)

    if (error || !students) return []

    const studentMap = new Map(students.map(s => [s.id, s]))
    return sponsorshipsData.map(s => ({
      ...s,
      student: studentMap.get(s.student_id)!,
    })).filter(s => s.student !== undefined) as SponsorshipWithStudent[]
  }, [])

  const fetchStudentsForDonations = useCallback(async (donationsData: Donation[]): Promise<DonationWithStudent[]> => {
    const studentIds = donationsData.map(d => d.student_id).filter(Boolean) as string[]
    if (studentIds.length === 0) return donationsData.map(d => ({ ...d, student: null }))

    const { data: students } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds)

    const studentMap = new Map((students || []).map(s => [s.id, s]))

    return donationsData.map(d => ({
      ...d,
      student: d.student_id ? (studentMap.get(d.student_id) ?? null) : null,
    }))
  }, [])

  const loadData = useCallback(async () => {
    if (!userId) {
      setData(prev => ({ ...prev, loading: false }))
      return
    }

    setData(prev => ({ ...prev, loading: true, error: null }))

    try {
      const [donationsResult, sponsorshipsResult] = await Promise.all([
        supabase
          .from('donations')
          .select('*')
          .eq('donor_id', userId)
          .order('created_at', { ascending: false }),
        supabase
          .from('sponsorships')
          .select('*')
          .eq('donor_id', userId)
          .order('created_at', { ascending: false }),
      ])

      const donationsData = donationsResult.data || []
      const sponsorshipsData = sponsorshipsResult.data || []

      if (donationsResult.error || sponsorshipsResult.error) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [donationsWithStudents, sponsorshipsWithStudents] = await Promise.all([
        fetchStudentsForDonations(donationsData),
        fetchStudentsForSponsorships(sponsorshipsData),
      ])

      const donorStats = computeDonorStats(donationsWithStudents, sponsorshipsWithStudents)
      const donorImpact = computeDonorImpact(sponsorshipsWithStudents, donorStats.totalDonated)

      const studentIds = sponsorshipsData.map(s => s.student_id).filter(Boolean) as string[]

      const [
        statsResult,
        impactResult,
        progressResult,
        notifCountResult,
        activitiesResult,
      ] = await Promise.all([
        supabase.rpc('get_donor_dashboard_stats', { p_donor_id: userId }).then(r => r, () => ({ data: null, error: null })),
        supabase
          .from('impact_metrics')
          .select('*')
          .order('month', { ascending: false })
          .limit(12),
        studentIds.length > 0
          ? supabase
              .from('student_progress')
              .select('*')
              .in('student_id', studentIds)
              .order('recorded_at', { ascending: false })
          : { data: [], error: null },
        supabase
          .from('notifications')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false),
        supabase
          .from('activities')
          .select('*')
          .or(`user_id.eq.${userId},is_public.eq.true`)
          .order('created_at', { ascending: false })
          .limit(20),
      ])

      const enhancedStats = statsResult?.data as DonorStats | null
      const finalStats = enhancedStats ?? donorStats

      const impactMetrics = (impactResult.data || []) as ImpactMetric[]

      const studentProgress = (progressResult.data || []) as StudentProgress[]

      const notificationsCount = notifCountResult.count ?? 0

      const activities = (activitiesResult.data || []) as ActivityItem[]

      const seenStudentIds = new Set(sponsorshipsWithStudents.map(s => s.student.id))
      const donationContributions: ContributionWithStudent[] = donationsWithStudents
        .filter(d => d.student && !seenStudentIds.has(d.student.id))
        .map(d => ({
          id: `don-${d.id}`,
          student: d.student!,
          type: 'donation' as const,
          amount: d.amount,
          status: d.status,
          frequency: d.frequency,
          start_date: d.created_at,
          end_date: null,
          created_at: d.created_at,
        }))
      const sponsorshipContributions: ContributionWithStudent[] = sponsorshipsWithStudents.map(s => ({
        id: `spon-${s.id}`,
        student: s.student,
        type: 'sponsorship' as const,
        amount: s.amount,
        status: s.status,
        frequency: 'monthly',
        start_date: s.start_date,
        end_date: s.end_date,
        created_at: s.created_at,
      }))
      const contributedStudents = [...sponsorshipContributions, ...donationContributions]

      setData({
        donations: donationsWithStudents,
        sponsorships: sponsorshipsWithStudents,
        donorStats: finalStats,
        loading: false,
        error: null,
        donorImpact: donorImpact,
        impactMetrics,
        studentProgress,
        notificationsCount,
        activities,
        contributedStudents,
      })
    } catch {
      setData({
        donations: [],
        sponsorships: [],
        donorStats: null as DonorStats | null,
        loading: false,
        error: 'Failed to load dashboard data.',
        donorImpact: null,
        impactMetrics: [],
        studentProgress: [],
        notificationsCount: 0,
        activities: [],
        contributedStudents: [],
      })
    }
  }, [userId, fetchStudentsForDonations, fetchStudentsForSponsorships])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('donor-donations-realtime')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'donations',
          filter: `donor_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Donation>) => {
          const updated = payload.new as Donation
          setData(prev => {
            const donations = prev.donations.map(d =>
              d.id === updated.id ? { ...d, ...updated, student: d.student } : d
            )
            const donorStats = computeDonorStats(donations, prev.sponsorships)
            const donorImpact = computeDonorImpact(prev.sponsorships, donorStats.totalDonated)
            return { ...prev, donations, donorStats, donorImpact }
          })
        },
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'donations',
          filter: `donor_id=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Donation>) => {
          const inserted = payload.new as Donation
          setData(prev => {
            const alreadyExists = prev.donations.some(d => d.id === inserted.id)
            if (alreadyExists) return prev
            const donations = [inserted as DonationWithStudent, ...prev.donations]
            const donorStats = computeDonorStats(donations, prev.sponsorships)
            const donorImpact = computeDonorImpact(prev.sponsorships, donorStats.totalDonated)
            return { ...prev, donations, donorStats, donorImpact }
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  return data
}
