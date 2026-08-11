import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../lib/errors'
import type { TeacherAssignment, Student, Profile } from '../../types/database'
import { User, GraduationCap, Plus, Trash2, Save } from 'lucide-react'

type AssignmentRow = TeacherAssignment & {
  students?: { name: string; grade: string } | null
  profiles?: { full_name: string } | null
}

type SubjectRow = { name: string | null }
type StudentClassRow = { class_section: string | null }

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

interface AssignmentWithDetails extends TeacherAssignment {
  student_name: string
  student_grade: string
  teacher_name: string
}

export function AdminTeacherAssignments() {
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([])
  const [teachers, setTeachers] = useState<Profile[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjects, setSubjects] = useState<string[]>([])
  const [classSections, setClassSections] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newAssignment, setNewAssignment] = useState({
    teacher_id: '',
    student_id: '',
    subject: '',
    class_section: '',
  })
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [assignmentsResult, teachersResult, studentsResult, subjectsResult] = await Promise.all([
        supabase
          .from('teacher_assignments')
          .select(`
            *,
            students!inner(name, grade),
            profiles!inner(full_name)
          `)
          .order('assigned_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('role', 'teacher').eq('status', 'active'),
        supabase.from('students').select('*').order('name'),
        supabase.from('subjects').select('name').eq('is_active', true).order('name'),
      ])

      if (assignmentsResult.error) throw assignmentsResult.error
      if (teachersResult.error) throw teachersResult.error
      if (studentsResult.error) throw studentsResult.error

      const formattedAssignments = (assignmentsResult.data || []).map((a: AssignmentRow) => ({
        ...a,
        student_name: a.students?.name || 'Unknown',
        student_grade: a.students?.grade || 'N/A',
        teacher_name: a.profiles?.full_name || 'Unknown',
      })) as AssignmentWithDetails[]

      setAssignments(formattedAssignments)
      setTeachers((teachersResult.data || []) as Profile[])
      setStudents((studentsResult.data || []) as Student[])
      setSubjects(collectStrings((subjectsResult.data || []).map((row: SubjectRow) => row.name)))
      setClassSections([...new Set(collectStrings((studentsResult.data || []).map((student: StudentClassRow) => student.class_section)))])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load assignments'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newAssignment.teacher_id || !newAssignment.student_id || !newAssignment.subject) {
      toast.error('Please fill in all fields')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.from('teacher_assignments').insert({
        teacher_id: newAssignment.teacher_id,
        student_id: newAssignment.student_id,
        subject: newAssignment.subject,
      })

      if (error) throw error
      toast.success('Assignment created successfully')
      setShowAddModal(false)
      setNewAssignment({ teacher_id: '', student_id: '', subject: '', class_section: '' })
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create assignment'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAssignment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return

    try {
      const { error } = await supabase.from('teacher_assignments').delete().eq('id', id)
      if (error) throw error
      toast.success('Assignment deleted successfully')
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete assignment'))
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Assignments</h1>
          <p className="text-gray-500 mt-1">Manage teacher-student-subject assignments</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Assignment
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Student</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Grade</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Assigned Date</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No assignments found. Create one to get started.
                  </td>
                </tr>
              ) : (
                assignments.map((assignment) => (
                  <tr key={assignment.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{assignment.teacher_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{assignment.student_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600">{assignment.student_grade}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                        {assignment.subject}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(assignment.assigned_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDeleteAssignment(assignment.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Teacher Assignment</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teacher</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newAssignment.teacher_id}
                  onChange={(e) => setNewAssignment({ ...newAssignment, teacher_id: e.target.value })}
                >
                  <option value="">Select a teacher...</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name} ({teacher.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newAssignment.student_id}
                  onChange={(e) => setNewAssignment({ ...newAssignment, student_id: e.target.value })}
                >
                  <option value="">Select a student...</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name} (Grade {student.grade})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  list="subject-options"
                  type="text"
                  required
                  placeholder="Choose or type a subject"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newAssignment.subject}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                />
                <datalist id="subject-options">
                  {subjects.map((subject) => (
                    <option key={subject} value={subject} />
                  ))}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Class Section</label>
                <input
                  list="class-section-options"
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={newAssignment.class_section}
                  onChange={(e) => setNewAssignment({ ...newAssignment, class_section: e.target.value })}
                  placeholder="Optional class section"
                />
                <datalist id="class-section-options">
                  {classSections.map((classSection) => (
                    <option key={classSection} value={classSection} />
                  ))}
                </datalist>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false)
                    setNewAssignment({ teacher_id: '', student_id: '', subject: '', class_section: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <LoadingSpinner /> : <Save className="w-4 h-4" />}
                  {saving ? 'Creating...' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
