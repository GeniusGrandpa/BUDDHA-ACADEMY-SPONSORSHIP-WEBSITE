import { useState, useCallback, useRef } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

const defaultDurations: Record<ToastType, number> = {
  success: 4000,
  error: 6000,
  info: 3000,
  warning: 5000,
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const counterRef = useRef(0)

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const addToast = useCallback((message: string, type: ToastType = 'info', duration?: number) => {
    const id = `toast-${++counterRef.current}`
    const toast: Toast = {
      id,
      message,
      type,
      duration: duration ?? defaultDurations[type],
    }
    setToasts(prev => [...prev, toast])

    if (toast.duration > 0) {
      setTimeout(() => removeToast(id), toast.duration)
    }

    return id
  }, [removeToast])

  const success = useCallback((message: string) => addToast(message, 'success'), [addToast])
  const error = useCallback((message: string) => addToast(message, 'error'), [addToast])
  const info = useCallback((message: string) => addToast(message, 'info'), [addToast])
  const warning = useCallback((message: string) => addToast(message, 'warning'), [addToast])

  return { toasts, addToast, removeToast, success, error, info, warning }
}
