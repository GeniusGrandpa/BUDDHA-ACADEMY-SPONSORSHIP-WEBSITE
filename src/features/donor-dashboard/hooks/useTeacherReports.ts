import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'
import type { TeacherReport } from '../../../types/database'

export interface UseTeacherReportsOptions {
  studentId?: string
}

export interface UseTeacherReportsResult {
  reports: TeacherReport[]
  latestReports: TeacherReport[]
  loading: boolean
  error: string | null
  refresh: () => void
}

export function useTeacherReports(
  userId: string | undefined,
  options?: UseTeacherReportsOptions,
): UseTeacherReportsResult {
  const [reports, setReports] = useState<TeacherReport[]>([])
  const [latestReports, setLatestReports] = useState<TeacherReport[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data: sponsorships } = await supabase
        .from('sponsorships')
        .select('student_id')
        .eq('donor_id', userId)

      const studentIds = (sponsorships || []).map(s => s.student_id).filter(Boolean) as string[]

      if (studentIds.length === 0) {
        setReports([])
        setLatestReports([])
        setLoading(false)
        return
      }

      let query = supabase
        .from('teacher_reports')
        .select('*, students!inner(id)')
        .in('students.id', studentIds)
        .eq('is_published', true)

      if (options?.studentId) {
        query = query.eq('student_id', options.studentId)
      }

      const { data, error: fetchError } = await query
        .order('report_date', { ascending: false })

      if (fetchError) throw fetchError

      const allReports = (data || []) as unknown as TeacherReport[]
      setReports(allReports)

      const latestMap = new Map<string, TeacherReport>()
      for (const report of allReports) {
        const existing = latestMap.get(report.student_id)
        if (!existing || new Date(report.report_date) > new Date(existing.report_date)) {
          latestMap.set(report.student_id, report)
        }
      }
      setLatestReports(Array.from(latestMap.values()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teacher reports')
    } finally {
      setLoading(false)
    }
  }, [userId, options?.studentId])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  return { reports, latestReports, loading, error, refresh: fetchReports }
}
