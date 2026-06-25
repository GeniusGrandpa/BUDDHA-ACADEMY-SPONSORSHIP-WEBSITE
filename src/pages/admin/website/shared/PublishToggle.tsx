interface PublishToggleProps {
  published: boolean
  saving: boolean
  onToggle: () => void
}

export function PublishToggle({ published, saving, onToggle }: PublishToggleProps) {
  return (
    <button
      onClick={onToggle}
      disabled={saving}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
        published
          ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
      }`}
    >
      {published ? (
        <>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Published
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-6 8h6m-6 4h6M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          Save Draft
        </>
      )}
    </button>
  )
}
