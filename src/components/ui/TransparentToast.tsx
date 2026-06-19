import toast from 'react-hot-toast'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

export function showTransparentToast(message: string, type: ToastType = 'info') {
  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
  }
  const colors = {
    success: 'border-emerald-500 bg-emerald-50',
    error: 'border-red-500 bg-red-50',
    warning: 'border-amber-500 bg-amber-50',
    info: 'border-blue-500 bg-blue-50',
  }
  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-red-500',
    warning: 'text-amber-500',
    info: 'text-blue-500',
  }
  const Icon = icons[type]

  toast.custom(
    (t) => (
      <div
        className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full shadow-lg rounded-lg pointer-events-auto border-l-4 ${colors[type]} ring-1 ring-black ring-opacity-5`}
      >
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <Icon className={`h-5 w-5 ${iconColors[type]}`} />
            </div>
            <div className="ml-3 flex-1 pt-0.5">
              <p className="text-sm font-medium text-gray-900">{message}</p>
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    ),
    { duration: 4000 }
  )
}
