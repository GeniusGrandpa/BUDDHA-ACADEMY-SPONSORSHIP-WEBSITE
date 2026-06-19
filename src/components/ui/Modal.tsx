import { useEffect, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  size?: ModalSize
  gradientHeader?: boolean
  className?: string
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { type: 'spring' as const, damping: 25, stiffness: 300 },
  },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.15 } },
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  gradientHeader = false,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
          />
          <motion.div
            className={`relative w-full ${sizeStyles[size]} bg-warm-50 rounded-2xl shadow-2xl overflow-hidden ${className}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {gradientHeader ? (
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    {title && <h2 className="text-lg font-semibold text-white">{title}</h2>}
                    {description && <p className="mt-1 text-sm text-white/80">{description}</p>}
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-4 rounded-full p-1 text-white/80 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
                <div>
                  {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-gray-500">{description}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">{children}</div>
            {footer && (
              <div className="border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
