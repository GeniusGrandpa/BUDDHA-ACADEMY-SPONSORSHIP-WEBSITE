import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getContentAnalytics } from '../../../services/content'

interface AnalyticsData {
  total_pages: number
  published_pages: number
  total_news: number
  published_news: number
  total_faqs: number
  published_faqs: number
  total_testimonials: number
  published_testimonials: number
}

export function AdminContentAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const data = await getContentAnalytics()
      setAnalytics(data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const StatCard = ({ 
    label, 
    value, 
    published 
  }: { 
    label: string
    value: number
    published: number
  }) => (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white border border-gray-100 rounded-xl p-6"
    >
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-400">{published} published</p>
        </div>
      </div>
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-amber-500"
            style={{ width: `${value > 0 ? (published / value) * 100 : 0}%` }}
          />
          {/* dynamic percentage width from analytics data */}
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Analytics</h1>
          <p className="text-gray-500 mt-1">View content performance and publishing stats</p>
        </div>
        <button
          onClick={loadAnalytics}
          className="px-4 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Pages"
              value={analytics.total_pages}
              published={analytics.published_pages}
            />
            <StatCard
              label="News Articles"
              value={analytics.total_news}
              published={analytics.published_news}
            />
            <StatCard
              label="FAQs"
              value={analytics.total_faqs}
              published={analytics.published_faqs}
            />
            <StatCard
              label="Testimonials"
              value={analytics.total_testimonials}
              published={analytics.published_testimonials}
            />
          </div>

          <div className="bg-white border border-gray-100 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Summary</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Total Draft Content</span>
                <span className="font-medium text-gray-900">
                  {(analytics.total_pages - analytics.published_pages) +
                   (analytics.total_news - analytics.published_news) +
                   (analytics.total_faqs - analytics.published_faqs) +
                   (analytics.total_testimonials - analytics.published_testimonials)} items
                </span>
              </div>
<div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-gray-600">Publishing Rate</span>
                <span className="font-medium text-gray-900">
                  {Math.round(
                    ((analytics.published_pages + analytics.published_news + analytics.published_faqs + analytics.published_testimonials) /
                     Math.max(analytics.total_pages + analytics.total_news + analytics.total_faqs + analytics.total_testimonials, 1)) * 100
                  )}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}