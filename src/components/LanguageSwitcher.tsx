import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { getLanguageFlagAlt, getLanguageFlagUrl, languages, useLanguage } from '../context/LanguageContext'
import type { LanguageCode } from '../context/LanguageContext'

const sortedLanguages = [...languages].sort((a, b) =>
  a.label.localeCompare(b.label)
)

export function LanguageSwitcher({ mobile = false }: { mobile?: boolean }) {
  const { language, setLanguage } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handler)
      return () => document.removeEventListener('keydown', handler)
    }
  }, [open])

  const current = languages.find((l) => l.code === language)

  const select = (code: LanguageCode) => {
    setLanguage(code)
    setOpen(false)
  }

  const renderItem = (lang: (typeof languages)[number]) => {
    const active = lang.code === language
    return (
      <button
        key={lang.code}
        onClick={() => select(lang.code)}
        role="option"
        aria-selected={active ? "true" : "false"}
        className={`w-full flex items-center gap-3 px-3 py-2 text-sm transition-colors ${
          active
            ? 'bg-amber-50 text-amber-700 font-medium'
            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
        }`}
      >
        <img
          src={getLanguageFlagUrl(lang.code)}
          alt={getLanguageFlagAlt(lang.code)}
          className="h-3.5 w-5 rounded-sm object-cover shadow-sm flex-shrink-0"
          loading="lazy"
        />
        <span className="truncate">{lang.nativeLabel}</span>
      </button>
    )
  }

  return (
    <div ref={ref} className={`relative ${mobile ? 'w-full' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="listbox"
        aria-label="Select language"
        className={`flex items-center gap-2 transition-colors ${
          mobile
            ? 'w-full px-4 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <span className="text-sm font-medium truncate">{current?.nativeLabel ?? 'English'}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <>
          <div
            className={`fixed inset-0 z-40 ${mobile ? '' : 'hidden'}`}
            onClick={() => setOpen(false)}
          />
          <div
            className={`z-50 bg-warm-50 rounded-xl shadow-lg border border-amber-200 overflow-hidden ${
              mobile
                ? 'relative mt-1 w-full'
                : 'absolute right-0 mt-2 w-56 origin-top-right'
            } ${mobile ? '' : 'animate-dropdown-fade'}`}
          >
            <div
              role="listbox"
              aria-label="Select language"
              className="max-h-72 overflow-y-auto"
            >
              {sortedLanguages.map(renderItem)}
            </div>
          </div>
          <style>{`
            @keyframes dropdown-fade {
              from { opacity: 0; transform: translateY(-4px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .animate-dropdown-fade {
              animation: dropdown-fade 0.15s ease-out;
            }
          `}</style>
        </>
      )}
    </div>
  )
}
