import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../../features/auth/providers/AuthContext'
import { canManageContent } from '../../../features/auth/services/permissions'
import type { Role } from '../../../features/auth/types/permissions'

const cmsModules = [
  {
    title: 'Homepage Editor',
    description: 'Edit hero, stats badges, features, CTA buttons, and impact sections',
    href: '/admin/content/homepage',
  },
  {
    title: 'Static Pages',
    description: 'Manage About, Volunteer, Privacy, Terms, and Contact page content',
    href: '/admin/content/pages/about',
    isGroup: true,
    groupPages: [
      { label: 'About Page', href: '/admin/content/pages/about' },
      { label: 'Volunteer Page', href: '/admin/content/pages/volunteer' },
      { label: 'Privacy Policy', href: '/admin/content/pages/privacy' },
      { label: 'Terms of Service', href: '/admin/content/pages/terms' },
      { label: 'Contact Page', href: '/admin/content/pages/contact' },
    ],
  },
  {
    title: 'Transparency',
    description: 'Edit donation allocation, impact stats & trust messaging',
    href: '/admin/content/transparency',
  },
  {
    title: 'Gallery',
    description: 'Upload images, create albums, manage captions & categories',
    href: '/admin/content/gallery',
  },
  {
    title: 'Videos',
    description: 'Manage YouTube embeds, thumbnails, descriptions & featured videos',
    href: '/admin/content/videos',
  },
  {
    title: 'Testimonials',
    description: 'Manage donor, teacher, student & volunteer testimonials',
    href: '/admin/content/testimonials',
  },
  {
    title: 'News & Announcements',
    description: 'Create, edit, publish news articles with rich text & images',
    href: '/admin/content/news',
  },
  {
    title: 'Student Stories',
    description: 'Share success stories, achievements & sponsorship journeys',
    href: '/admin/content/stories',
  },
  {
    title: 'FAQs',
    description: 'Create, edit, reorder & categorize frequently asked questions',
    href: '/admin/content/faqs',
  },
  {
    title: 'Media Library',
    description: 'Centralized uploads: images, videos, documents - reuse anywhere',
    href: '/admin/content/media',
  },
  {
    title: 'Version History',
    description: 'Track changes, compare versions, and restore previous content',
    href: '/admin/content/versions',
  },
  {
    title: 'Content Analytics',
    description: 'View publishing stats, engagement metrics, and content performance',
    href: '/admin/content/analytics',
  },
]

export function AdminContentDashboard() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile && !canManageContent(profile.role as Role)) {
      navigate('/admin', { replace: true })
    }
  }, [profile, navigate])

  if (profile && !canManageContent(profile.role as Role)) {
    return null
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-500 mt-1">Manage all website content without writing code</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cmsModules.map((module, idx) => (
          <motion.div
            key={module.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
          >
            {module.isGroup ? (
              <div className="bg-white border border-gray-100 rounded-xl p-5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
                <h3 className="text-gray-900 font-semibold mb-1.5">{module.title}</h3>
                <p className="text-sm text-gray-500 mb-3 leading-relaxed">{module.description}</p>
                <div className="space-y-1">
                  {module.groupPages?.map((page) => (
                    <Link
                      key={page.href}
                      to={page.href}
                      className="block text-xs text-gray-600 hover:text-amber-600 py-1 px-2 rounded hover:bg-amber-50 transition-colors"
                    >
                      {page.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                to={module.href}
                className="group block bg-white border border-gray-100 rounded-xl p-5 hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300"
              >
                <h3 className="text-gray-900 font-semibold mb-1.5 group-hover:text-amber-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">{module.description}</p>
              </Link>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-6">
        <h3 className="text-gray-900 font-semibold mb-1">Content Security Notice</h3>
        <p className="text-sm text-gray-500">
          All content changes are logged in the audit trail. Only Admin and Super Admin roles can edit website content.
          Public content is served instantly after publishing.
        </p>
      </div>
    </div>
  )
}
