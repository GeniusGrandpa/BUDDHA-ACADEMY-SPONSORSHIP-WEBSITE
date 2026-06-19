import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import type { Toast, ToastType } from '../hooks/useToast'

const iconMap: Record<ToastType, typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const colorMap: Record<ToastType, string> = {
  success: 'bg-emerald-600 border-emerald-500',
  error: 'bg-red-600 border-red-500',
  info: 'bg-blue-600 border-blue-500',
  warning: 'bg-amber-600 border-amber-500',
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (toast.duration <= 0) return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const remaining = Math.max(0, 100 - (elapsed / toast.duration) * 100)
      setProgress(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 50)
    return () => clearInterval(interval)
  }, [toast.duration])

  const Icon = iconMap[toast.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`flex items-start gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 text-white min-w-[320px] max-w-[420px] ${colorMap[toast.type]}`}
    >
      <Icon className="w-5 h-5 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      {toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20 rounded-b-lg overflow-hidden">
          <div
            className="h-full bg-white/40 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  )
}

export function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map(toast => (
            <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
