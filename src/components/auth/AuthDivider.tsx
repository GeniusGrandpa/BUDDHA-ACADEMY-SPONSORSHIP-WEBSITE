interface AuthDividerProps {
  text?: string
}

export function AuthDivider({ text = 'or continue with' }: AuthDividerProps) {
  return (
    <div className="relative my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-100" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-warm-50 px-3 text-xs text-gray-400">
          {text}
        </span>
      </div>
    </div>
  )
}
