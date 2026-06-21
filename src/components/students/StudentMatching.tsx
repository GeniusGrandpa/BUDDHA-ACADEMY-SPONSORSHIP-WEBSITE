import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Search, SlidersHorizontal, Filter, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Student } from '../../types/database'

interface Filters {
  ageRange: [number, number]
  grade: string
  sponsorshipStatus: string
  searchQuery: string
}

export function StudentMatching() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<Filters>({
    ageRange: [5, 18],
    grade: '',
    sponsorshipStatus: '',
    searchQuery: '',
  })

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']

  const loadStudents = useCallback(async () => {
    setLoading(true)
    let query = supabase.from('students').select('*')

    if (filters.grade) {
      query = query.eq('grade', filters.grade)
    }
    if (filters.sponsorshipStatus) {
      query = query.eq('sponsorship_status', filters.sponsorshipStatus as Student['sponsorship_status'])
    }
    if (filters.searchQuery) {
      query = query.or(
        `name.ilike.%${filters.searchQuery}%,bio.ilike.%${filters.searchQuery}%,hobbies.cs.{${filters.searchQuery}}`
      )
    }

    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error loading students:', error)
    } else {
      setStudents(data || [])
    }
    setLoading(false)
  }, [filters.grade, filters.sponsorshipStatus, filters.searchQuery])

  useEffect(() => {
    loadStudents()
  }, [loadStudents])

  function clearFilters() {
    setFilters({
      ageRange: [5, 18],
      grade: '',
      sponsorshipStatus: '',
      searchQuery: '',
    })
    setShowFilters(false)
  }

  const filteredStudents = students.filter(s => {
    if (s.age < filters.ageRange[0] || s.age > filters.ageRange[1]) return false
    return true
  })

  const hasActiveFilters = filters.grade || filters.sponsorshipStatus || filters.searchQuery

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, interests, or background..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters(prev => ({ ...prev, searchQuery: e.target.value }))
            }}
            onKeyDown={(e) => e.key === 'Enter' && loadStudents()}
            className="w-full pl-10 pr-4 py-2.5 bg-warm-50 border border-amber-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            aria-label="Search students"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${hasActiveFilters
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : 'bg-warm-50 border-amber-200 text-gray-600 hover:border-amber-300'
            }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
          )}
        </button>
      </div>

      <motion.div
        initial={false}
        animate={{ height: showFilters ? 'auto' : 0, opacity: showFilters ? 1 : 0 }}
        className="overflow-hidden"
      >
        <div className="bg-warm-50 rounded-xl border border-amber-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Grade
              </label>
              <select
                value={filters.grade}
                onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Grade filter"
              >
                <option value="">All Grades</option>
                {grades.map(g => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Sponsorship Status
              </label>
              <select
                value={filters.sponsorshipStatus}
                onChange={(e) => setFilters(prev => ({ ...prev, sponsorshipStatus: e.target.value }))}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                aria-label="Sponsorship status filter"
              >
                <option value="">All Statuses</option>
                <option value="available">Available for Sponsorship</option>
                <option value="partially_sponsored">Partially Sponsored</option>
                <option value="fully_sponsored">Fully Sponsored</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={5}
                  max={18}
                  value={filters.ageRange[0]}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageRange: [parseInt(e.target.value), prev.ageRange[1]] }))}
                  className="flex-1 accent-emerald-500"
                  aria-label="Minimum age"
                />
                <span className="text-xs text-gray-500 w-4 text-center">-</span>
                <input
                  type="range"
                  min={5}
                  max={18}
                  value={filters.ageRange[1]}
                  onChange={(e) => setFilters(prev => ({ ...prev, ageRange: [prev.ageRange[0], parseInt(e.target.value)] }))}
                  className="flex-1 accent-emerald-500"
                  aria-label="Maximum age"
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => { loadStudents(); setShowFilters(false) }}
            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-warm-50 rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="w-full h-40 bg-gray-200 rounded-lg mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-lg font-semibold text-gray-900">No students found</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mt-1">
            {hasActiveFilters
              ? 'Try adjusting your filters to find more students.'
              : 'New student profiles are being added. Check back soon to meet the children.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            Showing {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student, index) => (
              <motion.a
                key={student.id}
                href={`/students/${student.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
                className="bg-warm-50 rounded-xl border border-amber-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
              >
                <div className="relative h-48 overflow-hidden">
                  {student.photo_url ? (
                    <img
                      src={student.photo_url}
                      alt={student.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center" />
                  )}
                  <div className="absolute top-3 right-3">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${student.sponsorship_status === 'available'
                        ? 'bg-emerald-100 text-emerald-700'
                        : student.sponsorship_status === 'partially_sponsored'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                      {student.sponsorship_status === 'available' ? 'Available' :
                        student.sponsorship_status === 'partially_sponsored' ? 'Partially Sponsored' : 'Sponsored'}
                    </span>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {student.name}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mb-3">
                    <span>Age {student.age}</span>
                    <span>Grade {student.grade}</span>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {student.bio}
                  </p>
                  {student.dream_career && (
                    <p className="text-xs text-emerald-600 mt-2">
                      Dreams of becoming {student.dream_career}
                    </p>
                  )}
                  {student.hobbies && student.hobbies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {student.hobbies.slice(0, 3).map((hobby, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {hobby}
                        </span>
                      ))}
                      {student.hobbies.length > 3 && (
                        <span className="text-xs text-gray-400">+{student.hobbies.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
