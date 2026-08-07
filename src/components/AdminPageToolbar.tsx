import { useAuth } from '../context/AuthContext'
import { Link } from 'react-router-dom'
import { Settings, ExternalLink } from 'lucide-react'
import { ENABLE_VISUAL_BUILDER } from '../config/feature-flags'

interface AdminPageToolbarProps {
  pageSlug: string
  sectionKey?: string
}

export function AdminPageToolbar({ pageSlug, sectionKey }: AdminPageToolbarProps) {
  const { profile } = useAuth()
  const isAdmin = profile && (profile.role === 'admin' || profile.role === 'super_admin')

  if (!ENABLE_VISUAL_BUILDER) return null
  if (!isAdmin) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <Link
        to={`/admin/website/builder?page=${pageSlug}${sectionKey ? `&section=${sectionKey}` : ''}`}
        className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg transition-all hover:scale-105 text-sm font-medium"
      >
        <Settings className="w-4 h-4" />
        Edit Page
        <ExternalLink className="w-3 h-3 opacity-70" />
      </Link>
    </div>
  )
}
