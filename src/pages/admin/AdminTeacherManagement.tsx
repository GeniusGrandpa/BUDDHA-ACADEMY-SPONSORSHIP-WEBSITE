import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Card } from '../../components/ui/Card'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import toast from 'react-hot-toast'
import { getErrorMessage } from '../../lib/errors'
import { useRole } from '../../hooks/useRole'
import type { Profile, Student } from '../../types/database'
import { Plus, Trash2, Edit2, UserCheck, UserX, BookOpen } from 'lucide-react'

interface TeacherWithDetails extends Profile {
  assignment_count: number
  student_count: number
  subjects: string[]
  class_sections: string[]
}

const emptyForm = {
  email: '',
  full_name: '',
  position: '',
  qualification: '',
  bio: '',
  photo_url: '',
  status: 'active' as 'active' | 'inactive',
  subjects: '',
  class_sections: '',
}

function csvToList(value: string) {
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

export function AdminTeacherManagement() {
  const { isSuperAdmin, isAdmin } = useRole()
  const [teachers, setTeachers] = useState<TeacherWithDetails[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [subjectOptions, setSubjectOptions] = useState<string[]>([])
  const [classOptions, setClassOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null)
  const [newTeacher, setNewTeacher] = useState(emptyForm)
  const [editTeacher, setEditTeacher] = useState(emptyForm & { id: string })
  const [assignment, setAssignment] = useState({ teacher_id: '', student_id: '', subject: '' })

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [teachersResult, studentsResult, subjectsResult, classesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select(`
            *,
            teacher_assignments(count),
            teacher_assignments_students(student_id),
            teacher_subjects(subjects(name)),
            teacher_class_assignments(class_section)
          `)
          .eq('role', 'teacher')
          .order('created_at', { ascending: false }),
        supabase.from('students').select('*').order('name'),
        supabase.from('subjects').select('name').eq('is_active', true).order('name'),
        supabase.from('students').select('class_section').not('class_section', 'is', null),
      ])

      if (teachersResult.error) throw teachersResult.error
      if (studentsResult.error) throw studentsResult.error
      if (subjectsResult.error) throw subjectsResult.error
      if (classesResult.error) throw classesResult.error

      const formattedTeachers = (teachersResult.data || []).map((teacher: any) => {
        const assignmentRows = teacher.teacher_assignments || []
        const studentIds = new Set((teacher.teacher_assignments_students || []).map((row: any) => row.student_id))
        const subjects = (teacher.teacher_subjects || []).map((row: any) => row.subjects?.name).filter(Boolean)
        const classSections = (teacher.teacher_class_assignments || []).map((row: any) => row.class_section).filter(Boolean)
        return {
          ...teacher,
          assignment_count: assignmentRows.length,
          student_count: studentIds.size,
          subjects: [...new Set(subjects)],
          class_sections: [...new Set(classSections)],
        }
      }) as TeacherWithDetails[]

      setTeachers(formattedTeachers)
      setStudents((studentsResult.data || []) as Student[])
      setSubjectOptions((subjectsResult.data || []).map((row: any) => row.name))
      setClassOptions([...new Set((classesResult.data || []).map((row: any) => row.class_section).filter(Boolean))])
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to load teachers'))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const adminHints = useMemo(() => ({
    canManage: isSuperAdmin || isAdmin,
  }), [isAdmin, isSuperAdmin])

  const syncTeacherAssignments = async (teacherId: string, subjects: string[], classSections: string[]) => {
    await supabase.from('teacher_subjects').delete().eq('teacher_id', teacherId)
    await supabase.from('teacher_class_assignments').delete().eq('teacher_id', teacherId)

    for (const subjectName of subjects) {
      const { data: subjectRow, error: subjectError } = await supabase
        .from('subjects')
        .upsert({ name: subjectName, is_active: true }, { onConflict: 'name' })
        .select('id')
        .maybeSingle()
      if (subjectError) throw subjectError
      if (subjectRow?.id) {
        const { error } = await supabase.from('teacher_subjects').insert({ teacher_id: teacherId, subject_id: subjectRow.id })
        if (error) throw error
      }
    }

    for (const classSection of classSections) {
      const { error } = await supabase.from('teacher_class_assignments').insert({ teacher_id: teacherId, class_section: classSection })
      if (error) throw error
    }
  }

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeacher.email || !newTeacher.full_name) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const subjects = csvToList(newTeacher.subjects)
      const classSections = csvToList(newTeacher.class_sections)
      const { data, error } = await supabase.rpc('admin_create_teacher_account', {
        p_email: newTeacher.email,
        p_full_name: newTeacher.full_name,
        p_position: newTeacher.position || null,
        p_qualification: newTeacher.qualification || null,
        p_bio: newTeacher.bio || null,
        p_photo_url: newTeacher.photo_url || null,
        p_status: newTeacher.status,
        p_subjects: subjects,
        p_class_sections: classSections,
      } as never)
      if (error) throw error

      await supabase.auth.resetPasswordForEmail(newTeacher.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      })

      toast.success('Teacher account created and setup email sent')
      setShowCreateModal(false)
      setNewTeacher(emptyForm)
      await loadData()
      return data
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create teacher'))
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateTeacher = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTeacher.id) return

    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: editTeacher.full_name,
        position: editTeacher.position || null,
        qualification: editTeacher.qualification || null,
        bio: editTeacher.bio || null,
        photo_url: editTeacher.photo_url || null,
        status: editTeacher.status,
      }).eq('id', editTeacher.id)
      if (error) throw error

      await syncTeacherAssignments(editTeacher.id, csvToList(editTeacher.subjects), csvToList(editTeacher.class_sections))

      toast.success('Teacher updated successfully')
      setShowEditModal(false)
      setSelectedTeacher(null)
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to update teacher'))
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher? This will also remove all their assignments.')) return
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id)
      if (error) throw error
      toast.success('Teacher deleted successfully')
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to delete teacher'))
    }
  }

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!assignment.teacher_id || !assignment.student_id || !assignment.subject) {
      toast.error('Please fill in all fields')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('teacher_assignments').insert({
        teacher_id: assignment.teacher_id,
        student_id: assignment.student_id,
        subject: assignment.subject,
      })
      if (error) throw error
      toast.success('Assignment created successfully')
      setShowAssignModal(false)
      setAssignment({ teacher_id: '', student_id: '', subject: '' })
      await loadData()
    } catch (err) {
      toast.error(getErrorMessage(err, 'Failed to create assignment'))
    } finally {
      setSaving(false)
    }
  }

  const openEditModal = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher)
    setEditTeacher({
      id: teacher.id,
      email: teacher.email,
      full_name: teacher.full_name,
      position: teacher.position || '',
      qualification: teacher.qualification || '',
      bio: teacher.bio || '',
      photo_url: teacher.photo_url || '',
      status: teacher.status as 'active' | 'inactive',
      subjects: teacher.subjects.join(', '),
      class_sections: teacher.class_sections.join(', '),
    })
    setShowEditModal(true)
  }

  const openAssignModal = (teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher)
    setAssignment({ teacher_id: teacher.id, student_id: '', subject: teacher.subjects[0] || '' })
    setShowAssignModal(true)
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><LoadingSpinner /></div>
  }

  if (!adminHints.canManage) {
    return <div className="text-gray-500">Access denied.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Management</h1>
          <p className="text-gray-500 mt-1">Create teacher accounts, assign subjects, classes, and students</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
          <Plus className="w-4 h-4" />
          Add Teacher
        </button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Teacher</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subjects</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Classes</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Students</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-8 text-gray-500">No teachers found. Create one to get started.</td></tr>
              ) : teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center text-orange-600 font-semibold text-sm">{teacher.full_name?.charAt(0) || 'T'}</div>
                      <span className="font-medium text-gray-900">{teacher.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{teacher.email}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.subjects.join(', ') || '-'}</td>
                  <td className="py-3 px-4 text-gray-600">{teacher.class_sections.join(', ') || '-'}</td>
                  <td className="py-3 px-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">{teacher.student_count}</span></td>
                  <td className="py-3 px-4">
                    <span className={`flex items-center gap-1.5 text-sm ${teacher.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                      {teacher.status === 'active' ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                      {teacher.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openAssignModal(teacher)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Add Assignment">
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEditModal(teacher)} className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors" title="Edit Teacher">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTeacher(teacher.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Teacher">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Teacher</h3>
            <form onSubmit={handleCreateTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" value={newTeacher.full_name} onChange={(e) => setNewTeacher({ ...newTeacher, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" value={newTeacher.email} onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input type="text" value={newTeacher.position} onChange={(e) => setNewTeacher({ ...newTeacher, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" value={newTeacher.qualification} onChange={(e) => setNewTeacher({ ...newTeacher, qualification: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                <input type="url" value={newTeacher.photo_url} onChange={(e) => setNewTeacher({ ...newTeacher, photo_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea value={newTeacher.bio} onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject(s)</label>
                  <input list="subject-options" value={newTeacher.subjects} onChange={(e) => setNewTeacher({ ...newTeacher, subjects: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="English, Social Studies" />
                  <datalist id="subject-options">
                    {subjectOptions.map(subject => <option key={subject} value={subject} />)}
                  </datalist>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class(es)</label>
                  <input list="class-options" value={newTeacher.class_sections} onChange={(e) => setNewTeacher({ ...newTeacher, class_sections: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Grade 4, Grade 5" />
                  <datalist id="class-options">
                    {classOptions.map(classSection => <option key={classSection} value={classSection} />)}
                  </datalist>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={newTeacher.status} onChange={(e) => setNewTeacher({ ...newTeacher, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">{saving ? 'Creating...' : 'Create Teacher'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Teacher</h3>
            <form onSubmit={handleUpdateTeacher} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" value={editTeacher.full_name} onChange={(e) => setEditTeacher({ ...editTeacher, full_name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editTeacher.status} onChange={(e) => setEditTeacher({ ...editTeacher, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input type="text" value={editTeacher.position} onChange={(e) => setEditTeacher({ ...editTeacher, position: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Qualification</label>
                  <input type="text" value={editTeacher.qualification} onChange={(e) => setEditTeacher({ ...editTeacher, qualification: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
                <input type="url" value={editTeacher.photo_url} onChange={(e) => setEditTeacher({ ...editTeacher, photo_url: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                <textarea value={editTeacher.bio} onChange={(e) => setEditTeacher({ ...editTeacher, bio: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" rows={3} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject(s)</label>
                  <input list="subject-options" value={editTeacher.subjects} onChange={(e) => setEditTeacher({ ...editTeacher, subjects: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class(es)</label>
                  <input list="class-options" value={editTeacher.class_sections} onChange={(e) => setEditTeacher({ ...editTeacher, class_sections: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setSelectedTeacher(null) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAssignModal && selectedTeacher && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Assignment for {selectedTeacher.full_name}</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <select required className="w-full px-3 py-2 border border-gray-300 rounded-lg" value={assignment.student_id} onChange={(e) => setAssignment({ ...assignment, student_id: e.target.value })}>
                  <option value="">Select a student</option>
                  {students.map((student) => <option key={student.id} value={student.id}>{student.name} (Grade {student.grade})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input list="subject-options" type="text" value={assignment.subject} onChange={(e) => setAssignment({ ...assignment, subject: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg" required />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowAssignModal(false); setSelectedTeacher(null) }} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50">{saving ? 'Adding...' : 'Add Assignment'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
