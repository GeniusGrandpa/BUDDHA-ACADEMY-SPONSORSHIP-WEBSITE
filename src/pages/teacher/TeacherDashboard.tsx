import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'
import { DashboardSkeleton } from '../../components/ui/LoadingSkeleton'
import type { AttendanceRecord, Profile, Student, StudentProgress, TeacherAssignment } from '../../types/database'

interface AssignedStudent {
  id: string
  name: string
  grade: string
  class_section: string | null
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

interface SubjectJoinRow {
  subjects: {
    name: string | null
    name_ne: string | null
  } | null
}

interface ClassJoinRow {
  class_section: string | null
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
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
    <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  )
}

function parseGrade(grade: string | null): number | null {
  if (!grade) return null
  if (grade.endsWith('%')) return parseInt(grade)
  const letterGrades: Record<string, number> = { 'A+': 97, 'A': 93, 'A-': 90, 'B+': 87, 'B': 83, 'B-': 80, 'C+': 77, 'C': 73, 'C-': 70, 'D+': 67, 'D': 63, 'F': 50 }
  return letterGrades[grade] ?? null
}

function isString(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.length > 0
}

function collectStrings(values: Array<string | null | undefined>): string[] {
  const result: string[] = []
  for (const value of values) {
    if (isString(value)) result.push(value)
  }
  return result
}

export default function TeacherDashboard() {
  const { profile } = useAuth()
  const [teacherProfile, setTeacherProfile] = useState<Profile | null>(null)
  const [students, setStudents] = useState<AssignedStudent[]>([])
  const [progressEntries, setProgressEntries] = useState<ProgressEntry[]>([])
  const [attendance, setAttendance] = useState<AttendanceSummary>({ present: 0, absent: 0, late: 0, excused: 0, total: 0 })
  const [subjects, setSubjects] = useState<string[]>([])
  const [classSections, setClassSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<AssignedStudent | null>(null)
  const [newGrade, setNewGrade] = useState({ subject: '', grade: '', notes: '', achievement: '' })
  const [newAttendance, setNewAttendance] = useState({ date: new Date().toISOString().split('T')[0], status: 'present' as 'present' | 'absent' | 'late' | 'excused', notes: '' })

  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      if (!profile?.id) return
      setLoading(true)
      try {
        const teacherId = profile.id
        const [teacherResult, assignmentResult, progressResult, attendanceResult, subjectResult, classResult] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', teacherId).maybeSingle(),
          supabase.from('teacher_assignments').select('student_id, subject').eq('teacher_id', teacherId),
          supabase.from('student_progress').select('*').eq('teacher_id', teacherId).order('recorded_at', { ascending: false }),
          supabase.from('attendance_records').select('student_id, status').eq('teacher_id', teacherId),
          supabase.from('teacher_subjects').select('subjects(name, name_ne)').eq('teacher_id', teacherId),
          supabase.from('teacher_class_assignments').select('class_section').eq('teacher_id', teacherId),
        ])

        if (teacherResult.error) throw teacherResult.error
        if (assignmentResult.error) throw assignmentResult.error
        if (progressResult.error) throw progressResult.error
        if (attendanceResult.error) throw attendanceResult.error
        if (subjectResult.error) throw subjectResult.error
        if (classResult.error) throw classResult.error

        const assignments = (assignmentResult.data || []) as Pick<TeacherAssignment, 'student_id' | 'subject'>[]
        const studentIds = [...new Set(assignments.map(a => a.student_id))]

        const progressData = (progressResult.data || []) as StudentProgress[]
        const attendanceData = (attendanceResult.data || []) as Pick<AttendanceRecord, 'student_id' | 'status'>[]
        const studentResult = studentIds.length
          ? await supabase.from('students').select('id, name, grade, class_section, photo_url, sponsorship_status').in('id', studentIds)
          : { data: [], error: null }

        if (studentResult.error) throw studentResult.error

        const subjectsList = collectStrings(((subjectResult.data || []) as SubjectJoinRow[]).map((row: SubjectJoinRow) => row.subjects?.name))
        const uniqueSubjects = [...new Set(subjectsList)]
        if (uniqueSubjects.length === 0) {
          uniqueSubjects.push(...collectStrings(assignments.map(a => a.subject)))
        }

        const uniqueClassSections = [...new Set([
          ...collectStrings(((classResult.data || []) as ClassJoinRow[]).map((row: ClassJoinRow) => row.class_section)),
          ...collectStrings(((studentResult.data || []) as Student[]).map(s => s.class_section)),
        ])]

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

        const attendanceByStudent = new Map<string, { present: number; total: number }>()
        attendanceData.forEach(a => {
          const current = attendanceByStudent.get(a.student_id) || { present: 0, total: 0 }
          current.total++
          if (a.status === 'present') current.present++
          attendanceByStudent.set(a.student_id, current)
        })

        const merged: AssignedStudent[] = ((studentResult.data || []) as Student[]).map(s => {
          const studentAtt = attendanceByStudent.get(s.id) || { present: 0, total: 0 }
          return {
            id: s.id,
            name: s.name,
            grade: s.grade,
            class_section: s.class_section,
            photo_url: s.photo_url,
            sponsorship_status: s.sponsorship_status,
            progress: progressByStudent.get(s.id) || [],
            attendance: studentAtt.total > 0 ? Math.round((studentAtt.present / studentAtt.total) * 100) : 100,
          }
        })

        if (!cancelled) {
          setTeacherProfile(teacherResult.data as Profile | null)
          setStudents(merged)
          setProgressEntries(progressData || [])
          setAttendance(attSummary)
          setSubjects(uniqueSubjects)
          setClassSections(uniqueClassSections)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => { cancelled = true }
  }, [profile?.id])

  const recentUploads = useMemo(() => progressEntries.filter(p => p.notes || p.achievement).slice(0, 5), [progressEntries])

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !profile?.id) return
    const { error } = await supabase.from('student_progress').insert({
      student_id: selectedStudent.id,
      teacher_id: profile.id,
      subject: newGrade.subject,
      grade: newGrade.grade.includes('%') ? newGrade.grade : `${newGrade.grade}%`,
      notes: newGrade.notes || null,
      achievement: newGrade.achievement || null,
    })
    if (!error) {
      setShowGradeModal(false)
      setSelectedStudent(null)
      setNewGrade({ subject: '', grade: '', notes: '', achievement: '' })
      window.location.reload()
    }
  }

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedStudent || !profile?.id) return
    const { error } = await supabase.from('attendance_records').insert({
      student_id: selectedStudent.id,
      teacher_id: profile.id,
      date: newAttendance.date,
      status: newAttendance.status,
      notes: newAttendance.notes || null,
    })
    if (!error) {
      setShowAttendanceModal(false)
      setSelectedStudent(null)
      setNewAttendance({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' })
      window.location.reload()
    }
  }

  if (loading) return <DashboardSkeleton />

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Welcome back, {teacherProfile?.full_name?.split(' ')[0] || 'Teacher'}
              </h1>
              <p className="text-gray-500 mt-1">Here's your classroom overview</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              {subjects.map(subject => (
                <span key={subject} className="px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm">{subject}</span>
              ))}
              {classSections.map(classSection => (
                <span key={classSection} className="px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700">{classSection}</span>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowAttendanceModal(true)} className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 transition-colors shadow-sm">
                Record Attendance
              </button>
              <button onClick={() => setShowGradeModal(true)} className="px-4 py-2 bg-orange-500 border border-transparent rounded-xl text-sm font-medium text-white hover:bg-orange-600 transition-colors shadow-sm">
                Add Grades
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Assigned Students" value={students.length} sub="Under your care" color="text-orange-600" />
          <StatCard label="Avg. Performance" value={students.length ? `${(students.reduce((s, st) => s + (st.progress.reduce((a, p) => a + (parseGrade(p.grade) || 0), 0) / (st.progress.length || 1)), 0) / students.length).toFixed(0)}%` : '--'} sub="Across all subjects" color="text-orange-600" />
          <StatCard label="Attendance Rate" value={attendance.total ? `${Math.round((attendance.present / attendance.total) * 100)}%` : '--'} sub={`${attendance.present} of ${attendance.total} records`} color="text-orange-600" />
          <StatCard label="Achievements" value={progressEntries.filter(p => p.achievement).length} sub="Tracked this term" color="text-orange-600" />
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <motion.div variants={fadeInUp} initial="initial" animate="animate" className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Assigned Students</h2>
            </motion.div>
            {students.length === 0 ? (
              <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-8 text-center shadow-sm">
                <h3 className="font-semibold text-gray-700 mb-1">No Students Assigned</h3>
                <p className="text-sm text-gray-500">You haven't been assigned any students yet. Contact your admin.</p>
              </motion.div>
            ) : (
              <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid sm:grid-cols-2 gap-4">
                {students.map(student => (
                  <motion.div key={student.id} variants={itemVariants} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 mb-4">
                      {student.photo_url ? (
                        <img src={student.photo_url} alt={student.name} className="w-12 h-12 rounded-full object-cover border-2 border-orange-200" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-semibold text-lg">
                          {student.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.class_section ? `Grade ${student.grade} · ${student.class_section}` : `Grade ${student.grade}`}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-orange-600">
                          {(student.progress.length ? student.progress.reduce((s, p) => s + (parseGrade(p.grade) || 0), 0) / student.progress.length : 0).toFixed(0)}%
                        </div>
                        <p className="text-xs text-gray-500">Avg. Grade</p>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      {student.progress.slice(0, 3).map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">{entry.subject}</span>
                          <span className={`font-medium ${(parseGrade(entry.grade) ?? 0) >= 80 ? 'text-green-600' : (parseGrade(entry.grade) ?? 0) >= 60 ? 'text-orange-600' : 'text-red-600'}`}>{entry.grade}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                      <span className="text-sm text-gray-500">Attendance: {student.attendance}%</span>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedStudent(student); setShowAttendanceModal(true) }} className="text-sm text-orange-600 hover:text-orange-700 font-medium">Attendance</button>
                        <button onClick={() => { setSelectedStudent(student); setShowGradeModal(true) }} className="text-sm text-orange-600 hover:text-orange-700 font-medium">Add Grade</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} initial="hidden" animate="visible" className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3">Recent Updates</h3>
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
              <h3 className="font-semibold text-gray-900 mb-3">Attendance Overview</h3>
              {attendance.total === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No attendance records</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Present</span><span className="font-medium text-gray-900">{attendance.present}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Absent</span><span className="font-medium text-gray-900">{attendance.absent}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Late</span><span className="font-medium text-gray-900">{attendance.late}</span></div>
                  <div className="flex items-center justify-between text-sm"><span className="text-gray-600">Excused</span><span className="font-medium text-gray-900">{attendance.excused}</span></div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {showGradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Student Grade</h3>
            <form onSubmit={handleAddGrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={selectedStudent?.id || ''} onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}>
                  <option value="">Choose a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Grade {s.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input list="teacher-subjects" required placeholder="Choose or type a subject" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newGrade.subject} onChange={(e) => setNewGrade({ ...newGrade, subject: e.target.value })} />
                <datalist id="teacher-subjects">
                  {subjects.map(subject => <option key={subject} value={subject} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade (%)</label>
                <input type="text" required placeholder="e.g., 85%, 92%" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newGrade.grade} onChange={(e) => setNewGrade({ ...newGrade, grade: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea placeholder="Optional notes about performance..." className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={newGrade.notes} onChange={(e) => setNewGrade({ ...newGrade, notes: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Achievement (Optional)</label>
                <input type="text" placeholder="e.g., Won science fair, Perfect attendance" className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newGrade.achievement} onChange={(e) => setNewGrade({ ...newGrade, achievement: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowGradeModal(false); setSelectedStudent(null); setNewGrade({ subject: '', grade: '', notes: '', achievement: '' }) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Add Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAttendanceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Attendance</h3>
            <form onSubmit={handleAddAttendance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Student</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={selectedStudent?.id || ''} onChange={(e) => setSelectedStudent(students.find(s => s.id === e.target.value) || null)}>
                  <option value="">Choose a student...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} (Grade {s.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input type="date" required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newAttendance.date} onChange={(e) => setNewAttendance({ ...newAttendance, date: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select required className="w-full border border-gray-300 rounded-lg px-3 py-2" value={newAttendance.status} onChange={(e) => setNewAttendance({ ...newAttendance, status: e.target.value as 'present' | 'absent' | 'late' | 'excused' })}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="excused">Excused</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea placeholder="Optional notes..." className="w-full border border-gray-300 rounded-lg px-3 py-2" rows={2} value={newAttendance.notes} onChange={(e) => setNewAttendance({ ...newAttendance, notes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowAttendanceModal(false); setSelectedStudent(null); setNewAttendance({ date: new Date().toISOString().split('T')[0], status: 'present', notes: '' }) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">Record Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
