import { useEffect } from 'react'

interface PreviewModalProps {
  open: boolean
  onClose: () => void
  url: string
  title: string
}

export function PreviewModal({ open, onClose, url, title }: PreviewModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
            aria-label="Close preview"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <span className="text-sm font-medium text-gray-700">Preview: {title}</span>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
          Open in new tab
        </a>
      </div>
      <div className="flex-1 bg-gray-50">
        <iframe
          src={url}
          title={`Preview: ${title}`}
          className="w-full h-full border-0"
          loading="eager"
        />
      </div>
    </div>
  )
}
