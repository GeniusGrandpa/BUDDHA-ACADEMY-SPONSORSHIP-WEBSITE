import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import type { TeacherAssignment, Student, StudentProgress, AttendanceRecord } from '../../types/database'


interface AssignedStudent {
  id: string
  name: string
  grade: string
  photo_url: string | null
  sponsorship_status: string
  progress: { subject: string; grade: string }[]
  attendance: number
}

interface ProgressEntry {
  id: string
  student_id: string
  subject: string
  grade: string | null
  attendance: number | null
  notes: string | null
  achievement: string | null
  recorded_at: string
}

interface AttendanceSummary {
  present: number
  absent: number
  late: number
  excused: number
  total: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
}

const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

function StatCard({ label, value, sub, color }: {
  label: string
  value: string | number
  sub?: string
  color: string
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
    </motion.div>
  )
}

function ProgressCard({ student }: { student: AssignedStudent }) {
  const avgGrade = student.progress.length
    ? student.progress.reduce((s, p) => s + (parseGrade(p.grade) || 0), 0) / student.progress.length
    : 0

  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all"
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-semibold text-lg">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 truncate">{student.name}</h4>
          <p className="text-sm text-gray-500">Grade {student.grade}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-orange-600">{avgGrade.toFixed(0)}%</div>
          <p className="text-xs text-gray-500">Avg. Grade</p>
        </div>
      </div>
      <div className="space-y-2 mb-3">
        {student.progress.slice(0, 3).map((p, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{p.subject}</span>
            <span className={`font-medium ${
              (parseGrade(p.grade) ?? 0) >= 80 ? 'text-green-600' :
              (parseGrade(p.grade) ?? 0) >= 60 ? 'text-orange-600' : 'text-red-600'
            }`}>{p.grade}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-sm text-gray-500">Attendance: {student.attendance}%</span>
        <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          View Profile
        </button>
      </div>
    </motion.div>
  )
}

function parseGrade(grade: string | null): number | null {
  if (!grade) return null
  if (grade.endsWith('%')) return parseInt(grade)
  const letterGrades: Record<string, number> = { 'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D+': 67, 'D': 63, 'F': 50 }
  return letterGrades[grade] ?? null
}

export function TeacherDashboard() {
  const { profile } = useAuth()
  const [students, setStudents] = useState<AssignedStudent[]>([])
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [attendance, setAttendance] = useState<AttendanceSummary>({ present: 0, absent: 0, late: 0, excused: 0, total: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return

    async function loadData() {
      try {
        if (!profile) { setLoading(false); return }
        const pid = profile.id

        const { data: rawAssignments } = await supabase
          .from('teacher_assignments')
          .select('student_id, subject')
          .eq('teacher_id', pid)
        const assignments = (rawAssignments || []) as Pick<TeacherAssignment, 'student_id' | 'subject'>[]

        if (assignments.length === 0) {
          setLoading(false)
          return
        }

        const studentIds = [...new Set(assignments.map(a => a.student_id))]
        const subjectMap = new Map<string, string[]>()
        assignments.forEach(a => {
          const subs = subjectMap.get(a.student_id) || []
          if (a.subject) subs.push(a.subject)
          subjectMap.set(a.student_id, subs)
        })

        const { data: rawStudentData } = await supabase
          .from('students')
          .select('id, name, grade, photo_url, sponsorship_status')
          .in('id', studentIds)
        const studentData = (rawStudentData || []) as Pick<Student, 'id' | 'name' | 'grade' | 'photo_url' | 'sponsorship_status'>[]

        if (studentData.length === 0) { setLoading(false); return }

        const { data: rawProgressData } = await supabase
          .from('student_progress')
          .select('*')
          .eq('teacher_id', pid)
          .order('recorded_at', { ascending: false })
        const progressData = (rawProgressData || []) as StudentProgress[]

        const { data: rawAttendanceData } = await supabase
          .from('attendance_records')
          .select('status')
          .eq('teacher_id', pid)
        const attendanceData = (rawAttendanceData || []) as Pick<AttendanceRecord, 'status'>[]

        const attSummary: AttendanceSummary = { present: 0, absent: 0, late: 0, excused: 0, total: 0 }
        attendanceData.forEach(a => {
          if (a.status === 'present') attSummary.present++
          else if (a.status === 'absent') attSummary.absent++
          else if (a.status === 'late') attSummary.late++
          else if (a.status === 'excused') attSummary.excused++
          attSummary.total++
        })

        const progressByStudent = new Map<string, { subject: string; grade: string }[]>()
        progressData.forEach(p => {
          const list = progressByStudent.get(p.student_id) || []
          if (p.subject && p.grade) list.push({ subject: p.subject, grade: p.grade })
          progressByStudent.set(p.student_id, list)
        })

        const totalDays = attSummary.total || 1
        const merged: AssignedStudent[] = studentData.map(s => ({
          id: s.id,
          name: s.name,
          grade: s.grade,
          photo_url: s.photo_url,
          sponsorship_status: s.sponsorship_status,
          progress: progressByStudent.get(s.id) || [],
          attendance: totalDays > 0
            ? Math.round(((attSummary.present) / totalDays) * 100)
            : 100,
        }))

        setStudents(merged)
        setProgressEntries(progressData || [])
        setAttendance(attSummary)
      } finally {
        setLoading(false)
      }
    }

loadData()
   }, [profile?.id, profile])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Loading your classroom...</p>
        </div>
      </div>
    )
  }

  const recentUploads = progressEntries.filter(p => p.notes || p.achievement).slice(0, 5)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {profile?.full_name?.split(' ')[0] || 'Teacher'}
              </h1>
              <p className="text-gray-500 mt-1">Here's your classroom overview</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 transition-colors shadow-sm">
                Upload Photos
              </button>
              <button className="px-4 py-2 bg-orange-500 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-orange-600 transition-colors shadow-sm">
                Add Progress
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard label="Assigned Students" value={students.length} sub="Under your care" color="text-orange-600" />
          <StatCard label="Avg. Performance" value={
            students.length
              ? `${(students.reduce((s, st) => s + (st.progress.reduce((a, p) => a + (parseGrade(p.grade) || 0), 0) / (st.progress.length || 1)), 0) / students.length).toFixed(0)}%`
              : '--'
          } sub="Across all subjects" color="text-orange-600" />
          <StatCard label="Attendance Rate" value={
            attendance.total ? `${Math.round((attendance.present / attendance.total) * 100)}%` : '--'
          } sub={`${attendance.present} of ${attendance.total} records`} color="text-orange-600" />
          <StatCard label="Achievements" value={progressEntries.filter(p => p.achievement).length} sub="Tracked this term" color="text-orange-600" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Assigned Students
              </h2>
              <button className="text-sm text-orange-600 hover:text-orange-700 font-medium">View All</button>
            </motion.div>
            {students.length === 0 ? (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-1">No Students Assigned</h3>
                <p className="text-sm text-gray-500">You haven't been assigned any students yet. Contact your admin.</p>
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid sm:grid-cols-2 gap-4"
              >
                {students.map(s => <ProgressCard key={s.id} student={s} />)}
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Quick Actions
              </h3>
              <div className="space-y-2">
                {['Record Attendance', 'Update Grades', 'Write Progress Note', 'Upload Report Card'].map((label, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-3 w-full p-3 rounded-lg hover:bg-orange-50 transition-colors text-left"
                  >
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Recent Updates
              </h3>
              {recentUploads.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No recent updates</p>
              ) : (
                <div className="space-y-3">
                  {recentUploads.map((entry, i) => (
                    <div key={entry.id || i} className="flex items-start gap-3 pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                      <div className="w-2 h-2 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 truncate">{entry.notes || entry.achievement}</p>
                        <p className="text-xs text-gray-500">{entry.subject} · {new Date(entry.recorded_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">
                Attendance Overview
              </h3>
              {attendance.total === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No attendance records</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-emerald-400" />
                      Present
                    </span>
                    <span className="font-medium text-gray-900">{attendance.present}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      Absent
                    </span>
                    <span className="font-medium text-gray-900">{attendance.absent}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-amber-400" />
                      Late
                    </span>
                    <span className="font-medium text-gray-900">{attendance.late}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-400" />
                      Excused
                    </span>
                    <span className="font-medium text-gray-900">{attendance.excused}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {progressEntries.filter(p => p.achievement).length > 0 && (
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Student Achievement Timeline
            </h2>
            <div className="space-y-4">
              {progressEntries.filter(p => p.achievement).slice(0, 8).map((entry, i) => (
                <div key={entry.id || i} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-orange-400 mt-2" />
                    {i < Math.min(progressEntries.filter(p => p.achievement).length, 8) - 1 && (
                      <div className="w-px flex-1 bg-orange-200 ml-1 mt-1" />
                    )}
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-900">{entry.achievement}</p>
                    <p className="text-sm text-gray-500">{entry.subject} · {new Date(entry.recorded_at).toLocaleDateString()}</p>
                    {entry.notes && <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}