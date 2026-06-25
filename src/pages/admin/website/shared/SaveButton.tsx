interface SaveButtonProps {
  saving: boolean
  disabled?: boolean
  onClick: () => void
}

export function SaveButton({ saving, disabled, onClick }: SaveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={saving || disabled}
      className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition-colors disabled:opacity-50 shadow-sm"
    >
      {saving && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {saving ? 'Saving...' : 'Publish Changes'}
    </button>
  )
}
