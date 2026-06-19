import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getStudentById } from '../services/students'
import type { Student } from '../types/database'
import { formatNPR } from '../utils/currency'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadStudent(id)
  }, [id])

  const loadStudent = async (studentId: string) => {
    try {
      const data = await getStudentById(studentId)
      setStudent(data)
    } catch (error) {
      console.error('Error loading student:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Student not found</h2>
          <Button onClick={() => navigate('/students')}>
            Back to Students
          </Button>
        </div>
      </div>
    )
  }

  const sponsorshipProgress = student.sponsorship_amount > 0
    ? Math.min((student.current_sponsorship / student.sponsorship_amount) * 100, 100)
    : 0

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card variant="bordered" className="overflow-hidden">
              <img
                src={student.photo_url || `https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=800`}
                alt={student.name}
                className="w-full h-80 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                  <Badge variant={student.sponsorship_status} />
                </div>

                <div className="space-y-2 text-gray-600">
                  <div>Age: {student.age} years old</div>
                  <div>Grade: {student.grade}</div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber-500" />
                    <span>Kathmandu, Nepal</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Sponsorship Goal</span>
                    <span className="font-semibold text-gray-900">{formatNPR(student.sponsorship_amount)}/month</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-amber-500 rounded-full h-2 transition-all"
                      style={{ width: `${sponsorshipProgress}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 text-right">
                    {formatNPR(student.current_sponsorship)} of {formatNPR(student.sponsorship_amount)} raised
                  </div>
                </div>

                {student.sponsorship_status !== 'fully_sponsored' && (
                  <Link to={`/donate?student=${student.id}`} className="block mt-6">
                    <Button className="w-full" size="lg">
                      Sponsor This Child
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card variant="bordered" padding="lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About {student.name}</h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {student.bio}
              </p>
            </Card>

            {student.family_background && (
              <Card variant="bordered" padding="lg">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Family Background</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                  {student.family_background}
                </p>
              </Card>
            )}

            <Card variant="bordered" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Education Needs</h2>
                <p className="text-xs text-gray-400">All amounts in Nepalese Rupees (NPR)</p>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-amber-50 rounded-lg p-4">
                  <div className="mb-2">
                    <span className="font-medium text-gray-900">Monthly Sponsorship</span>
                  </div>
                  <p className="text-2xl font-bold text-amber-600">{formatNPR(student.sponsorship_amount)}</p>
                  <p className="text-sm text-gray-600 mt-1">Covers tuition, meals, books</p>
                </div>
                <div className="bg-emerald-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-gray-900">Current Support</span>
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">{formatNPR(student.current_sponsorship)}</p>
                  <p className="text-sm text-gray-600 mt-1">Monthly amount secured</p>
                </div>
              </div>
            </Card>

            <Card variant="bordered" padding="lg" className="bg-gradient-to-r from-amber-50 to-orange-50">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How Your Support Helps</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Quality education and school supplies</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Dietary nutrition programs</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Healthcare and medical checkups</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>School uniform and clothing</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Safe learning environment</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                  <span>Personal development programs</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
