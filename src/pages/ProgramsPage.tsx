import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { getCmsPrograms } from '../services/cms-programs'
import type { CmsProgram } from '../types/database'

export function ProgramsPage() {
  const [programs, setPrograms] = useState<CmsProgram[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCmsPrograms(true).then(setPrograms).catch(() => setPrograms([])).finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <section className="bg-gradient-to-br from-[var(--color-primary-dark)] via-[var(--color-accent)] to-[var(--color-secondary)] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">Our Programs</h1>
          <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto">
            Discover how we're making a difference through education, nutrition, and community support.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {programs.length === 0 ? (
            <p className="text-center text-[var(--color-text-muted)] py-12">No programs available.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {programs.map(program => {
                const features = (program.features as { title?: string; description?: string }[]) || []
                return (
                  <Card key={program.id} variant="bordered" className="overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
                    {program.image_url && (
                      <img src={program.image_url} alt={program.title} className="w-full h-48 object-cover" loading="lazy" decoding="async"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">{program.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)] mb-4 flex-1">{program.description}</p>
                      {features.length > 0 && (
                        <ul className="space-y-1.5 mb-4">
                          {features.slice(0, 3).map((f, idx) => (
                            <li key={idx} className="text-xs text-[var(--color-text-muted)] flex items-start gap-1.5">
                              <span className="text-[var(--color-primary)] mt-0.5 shrink-0">•</span>
                              <span>{f.title || f.description || ''}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="pt-3 border-t border-[var(--color-border)]">
                        <Link to={program.slug && program.slug.includes('sponsor') ? '/sponsor' : '/donate'}>
                          <Button variant="outline" className="w-full">
                            {program.slug && program.slug.includes('sponsor') ? 'Sponsor a Student' : 'Support This Program'}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
