import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { getAllContentVersions, restoreContentVersion } from '../../../services/content'
import type { ContentVersion } from '../../../types/database'
import { ListSkeleton } from '../../../components/ui/LoadingSkeleton'

const ENTITY_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'pages', label: 'Pages' },
  { value: 'news', label: 'News' },
]

export function AdminVersionHistory() {
  const [versions, setVersions] = useState<ContentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [selectedVersion, setSelectedVersion] = useState<ContentVersion | null>(null)

  const loadVersions = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllContentVersions(filterType === 'all' ? undefined : filterType)
      setVersions(data)
    } catch {
      toast.error('Failed to load version history')
    } finally {
      setLoading(false)
    }
  }, [filterType])

  useEffect(() => {
    loadVersions()
  }, [loadVersions])

  const handleRestore = async (notes?: string) => {
    if (!selectedVersion) return

    try {
      await restoreContentVersion(selectedVersion.id, notes)
      toast.success(`Version ${selectedVersion.version_number} restored`)
      setShowRestoreModal(false)
      loadVersions()
    } catch {
      toast.error('Failed to restore version')
    }
  }

  const formatDate = (date: string | null) => {
    if (!date) return '—'
    return new Date(date).toLocaleString()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Version History</h1>
          <p className="text-gray-500 mt-1">Track and restore previous versions of content</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {ENTITY_TYPES.map(t => (
          <button
            key={t.value}
            onClick={() => setFilterType(t.value)}
            className={`px-3 py-1.5 rounded-lg text-sm ${
              filterType === t.value
                ? 'bg-amber-500/10 text-amber-600'
                : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <ListSkeleton rows={5} />
      ) : versions.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No versions found</div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <motion.div
              key={version.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-500/30 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      v{version.version_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 capitalize">
                      {version.entity_type}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(version.created_at)}
                    </span>
                  </div>
                  <h3 className="font-medium text-gray-900">{version.title}</h3>
                  {version.entity_slug && (
                    <p className="text-sm text-gray-500 mt-1">Slug: /{version.entity_slug}</p>
                  )}
                  {version.restored_at && (
                    <p className="text-xs text-green-600 mt-1">
                      Restored: {formatDate(version.restored_at)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSelectedVersion(version)
                    setShowRestoreModal(true)
                  }}
                  disabled={!!version.restored_at}
                  className="px-3 py-1.5 rounded-lg text-sm bg-gray-50 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {version.restored_at ? 'Restored' : 'Restore'}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showRestoreModal && selectedVersion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-xl w-full max-w-md"
            >
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900">Restore Version</h2>
              </div>
              <div className="p-4">
                <p className="text-sm text-gray-600 mb-4">
                  Restore version {selectedVersion.version_number} of "{selectedVersion.title}"?
                </p>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-600 mb-1.5">Notes (optional)</label>
                  <textarea
                    placeholder="Reason for restore..."
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:border-amber-500/50"
                    rows={3}
                    id="restore-notes"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 p-4 border-t border-gray-100">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const notes = (document.getElementById('restore-notes') as HTMLTextAreaElement)?.value || ''
                    handleRestore(notes)
                  }}
                  className="px-4 py-2 rounded-lg text-sm bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Restore Version
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}