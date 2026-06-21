import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { formatNPR } from '../../utils/currency'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../../services/students'
import type { Student } from '../../types/database'

type StudentForm = {
  name: string
  age: number
  grade: string
  bio: string
  photo_url: string
  sponsorship_status: 'available' | 'partially_sponsored' | 'fully_sponsored'
  sponsorship_amount: number
}

const emptyForm: StudentForm = {
  name: '',
  age: 0,
  grade: '',
  bio: '',
  photo_url: '',
  sponsorship_status: 'available',
  sponsorship_amount: 0,
}

export function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Student | null>(null)
  const [form, setForm] = useState<StudentForm>(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (student: Student) => {
    setEditing(student)
    setForm({
      name: student.name,
      age: student.age,
      grade: student.grade,
      bio: student.bio || '',
      photo_url: student.photo_url || '',
      sponsorship_status: student.sponsorship_status,
      sponsorship_amount: student.sponsorship_amount,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.grade) return
    setSaving(true)
    try {
      if (editing) {
        await updateStudent(editing.id, form)
        toast.success('Student updated')
      } else {
        await createStudent(form)
        toast.success('Student added')
      }
      setShowModal(false)
      await loadStudents()
    } catch (error: unknown) {
      console.error('Error saving student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to save student')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(id)
        toast.success('Student deleted')
        setStudents(students.filter(s => s.id !== id))
      } catch (error) {
        console.error('Error deleting student:', error)
        toast.error('Failed to delete student')
      }
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Management</h1>
          <p className="text-gray-600">Manage student profiles and sponsorship status</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Add Student
        </Button>
      </div>

      <Card variant="bordered" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    No students found
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.photo_url || 'https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=100'}
                          alt={student.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{student.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{student.bio}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.age}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.grade}</td>
                    <td className="px-6 py-4">
                      <Badge variant={student.sponsorship_status as 'success' | 'warning' | 'default'}>{student.sponsorship_status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatNPR(student.sponsorship_amount)}/mo</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(student)} className="text-gray-400 hover:text-amber-600 transition-colors" aria-label="Edit student">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit' : 'Add'} Student</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Name *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" placeholder="Student name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Age</label>
                  <input type="number" value={form.age || ''} onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" placeholder="Age" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Grade *</label>
                  <input value={form.grade} onChange={e => setForm({ ...form, grade: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" placeholder="Grade" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Status</label>
                  <select value={form.sponsorship_status} onChange={e => setForm({ ...form, sponsorship_status: e.target.value as Student['sponsorship_status'] })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" title="Sponsorship status">
                    <option value="available">Available</option>
                    <option value="partially_sponsored">Partially Sponsored</option>
                    <option value="fully_sponsored">Fully Sponsored</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Sponsorship Amount (NPR/mo)</label>
                <input type="number" value={form.sponsorship_amount || ''} onChange={e => setForm({ ...form, sponsorship_amount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" placeholder="Sponsorship amount" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Photo URL</label>
                <input value={form.photo_url} onChange={e => setForm({ ...form, photo_url: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Bio</label>
                <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50 resize-none" placeholder="Student biography" />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.grade}
                className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white disabled:opacity-50">
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
