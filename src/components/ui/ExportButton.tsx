import { useState, useRef, useEffect } from 'react'
import { Download, FileText, FileSpreadsheet, FileDown } from 'lucide-react'

type ExportFormat = 'pdf' | 'csv' | 'excel'

interface ExportButtonProps {
  onExport: (format: ExportFormat) => void
  label?: string
  className?: string
}

const options: { format: ExportFormat; icon: typeof FileText; label: string }[] = [
  { format: 'pdf', icon: FileText, label: 'Export as PDF' },
  { format: 'csv', icon: FileSpreadsheet, label: 'Export as CSV' },
  { format: 'excel', icon: FileDown, label: 'Export as Excel' },
]

export function ExportButton({
  onExport,
  label = 'Export',
  className = '',
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-lg border border-amber-200 bg-warm-50 px-4 py-2 text-sm font-medium text-gray-700 transition-all hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm"
      >
        <Download size={16} />
        {label}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1.5 w-48 overflow-hidden rounded-xl border border-amber-200 bg-warm-50 shadow-lg">
          {options.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.format}
                onClick={() => {
                  onExport(opt.format)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-700"
              >
                <Icon size={16} className="text-gray-400" />
                {opt.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
