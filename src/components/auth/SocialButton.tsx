interface SocialButtonProps {
  provider: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}

export function SocialButton({ provider, icon, onClick, disabled }: SocialButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl
        border border-amber-200 bg-warm-50
        text-sm font-medium text-gray-600
        transition-all duration-200
        ${disabled
          ? 'opacity-40 cursor-not-allowed'
          : 'hover:bg-amber-50 hover:border-amber-300 active:bg-amber-100'
        }
      `}
    >
      {icon}
      <span>{provider}</span>
    </button>
  )
}
