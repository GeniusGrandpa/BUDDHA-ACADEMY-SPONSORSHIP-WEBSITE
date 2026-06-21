import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { Tabs } from '../components/ui/Tabs'
import { Button } from '../components/ui/Button'
import { getStudents } from '../services/students'
import type { Student } from '../types/database'
import { formatNPR } from '../utils/currency'

export function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const data = await getStudents()
      setStudents(data)
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = activeFilter === 'all'
    ? students
    : students.filter(s => s.sponsorship_status === activeFilter)

  const tabs = [
    { id: 'all', label: 'All', count: students.length },
    { id: 'available', label: 'Available', count: students.filter(s => s.sponsorship_status === 'available').length },
    { id: 'partially_sponsored', label: 'Partially Sponsored', count: students.filter(s => s.sponsorship_status === 'partially_sponsored').length },
    { id: 'fully_sponsored', label: 'Fully Sponsored', count: students.filter(s => s.sponsorship_status === 'fully_sponsored').length },
  ]

  return (
    <div>
      <section className="relative py-24 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Meet Our Students
            </h1>
            <p className="text-xl text-gray-600">
              Browse profiles of children waiting for sponsors. Each child has a unique story and dreams for a brighter future.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs tabs={tabs} activeTab={activeFilter} onChange={setActiveFilter} className="mb-8" />

          <p className="text-xs text-gray-400 mb-4">All amounts in Nepalese Rupees (NPR)</p>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-pulse text-gray-500">Loading students...</div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map((student) => (
                <Card key={student.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-w-4 aspect-h-3">
                    <img
                      src={student.photo_url || `https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=600`}
                      alt={student.name}
                      className="w-full h-56 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900">{student.name}</h3>
                      <Badge variant={student.sponsorship_status as 'success' | 'warning' | 'default'}>{student.sponsorship_status}</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>Age: {student.age}</span>
                      <span>Grade: {student.grade}</span>
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {student.bio}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span>Sponsorship: {formatNPR(student.sponsorship_amount)}/month</span>
                      {student.current_sponsorship > 0 && (
                        <span>{formatNPR(student.current_sponsorship)} raised</span>
                      )}
                    </div>
                    <Link to={`/students/${student.id}`}>
                      <Button variant="outline" className="w-full">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No students found in this category.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
