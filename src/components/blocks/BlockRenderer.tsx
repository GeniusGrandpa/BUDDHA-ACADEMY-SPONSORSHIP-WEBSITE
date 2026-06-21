import { Link } from 'react-router-dom'
import { ArrowRight, Play, ChevronRight } from 'lucide-react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import type { PageBlock } from '../../types/cms'

interface BlockContent {
  preTitle?: string
  title?: string
  highlight?: string
  description?: string
  primaryText?: string
  secondaryText?: string
  primaryLink?: string
  secondaryLink?: string
  html_tag?: string
  subtitle?: string
  body?: string
  image_url?: string
  alt_text?: string
  caption?: string
  max_height?: number
  video_url?: string
  thumbnail_url?: string
  html?: string
  donate_link?: string
  button_text?: string
  items?: Array<Record<string, unknown>>
  images?: Array<Record<string, unknown>>
  [key: string]: unknown
}

interface BlockRendererProps {
  block: PageBlock
}

export function BlockRenderer({ block }: BlockRendererProps) {
  const { settings } = block
  const sectionStyle: React.CSSProperties = {
    ...(settings?.background_color ? { backgroundColor: settings.background_color } : {}),
    ...(settings?.background_image ? { backgroundImage: `url(${settings.background_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
    paddingTop: settings?.padding_top || '4rem',
    paddingBottom: settings?.padding_bottom || '4rem',
  }
  const textAlign = (settings?.text_alignment as 'left' | 'center' | 'right') || 'left'
  const maxWidth = settings?.max_width || 'max-w-7xl'

  const content = (block.content || {}) as BlockContent

  switch (block.type) {
    case 'hero':
      return (
        <section style={sectionStyle} className="relative overflow-hidden">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            <div className="max-w-2xl mx-auto" style={{ marginLeft: textAlign === 'center' ? 'auto' : undefined, marginRight: textAlign === 'center' ? 'auto' : undefined }}>
              {content.preTitle && <span className="text-amber-500 font-semibold text-sm tracking-wider uppercase">{String(content.preTitle)}</span>}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mt-4 leading-tight">{String(content.title || '')}</h1>
              {content.highlight && <span className="text-amber-500 block mt-2">{String(content.highlight)}</span>}
              {content.description && <p className="text-lg text-gray-600 mt-6 leading-relaxed">{String(content.description)}</p>}
              {(content.primaryText || content.secondaryText) && (
                <div className="flex flex-col sm:flex-row gap-4 mt-8" style={{ justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                  {content.primaryText && (
                    <Link to={String(content.primaryLink || '#')}>
                      <Button size="lg">{String(content.primaryText)}</Button>
                    </Link>
                  )}
                  {content.secondaryText && (
                    <Link to={String(content.secondaryLink || '#')}>
                      <Button size="lg" variant="glass">{String(content.secondaryText)}</Button>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'text': {
      const Tag = content.html_tag === 'h1' ? 'h1' : content.html_tag === 'h2' ? 'h2' : content.html_tag === 'h3' ? 'h3' : 'div'
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            {content.title && <Tag className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{String(content.title)}</Tag>}
            {content.subtitle && <p className="text-lg text-gray-600 mb-4">{String(content.subtitle)}</p>}
            {content.body && <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: String(content.body) }} />}
          </div>
        </section>
      )
    }

    case 'image':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            {content.image_url && (
              <figure>
                <img src={String(content.image_url)} alt={String(content.alt_text || '')} className="w-full rounded-xl shadow-lg" style={{ maxHeight: content.max_height ? Number(content.max_height) : undefined, objectFit: 'cover' }} />
                {content.caption && <figcaption className="text-sm text-gray-500 mt-2">{String(content.caption)}</figcaption>}
              </figure>
            )}
          </div>
        </section>
      )

    case 'cta':
      return (
        <section style={sectionStyle} className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-center text-white`}>
            <h3 className="text-3xl sm:text-4xl font-bold mb-6 leading-tight">{String(content.title || '')}</h3>
            {content.description && <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">{String(content.description)}</p>}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {content.primaryText && (
                <Link to={String(content.primaryLink || '#')} className="bg-white text-amber-700 hover:bg-amber-50 px-8 py-3.5 rounded-full font-semibold transition-colors shadow-lg">
                  {String(content.primaryText)}
                </Link>
              )}
              {content.secondaryText && (
                <Link to={String(content.secondaryLink || '#')} className="bg-white/10 hover:bg-white/20 border border-white/30 text-white px-8 py-3.5 rounded-full font-semibold transition-colors backdrop-blur-sm">
                  {String(content.secondaryText)}
                </Link>
              )}
            </div>
          </div>
        </section>
      )

    case 'stats':
      return (
        <section style={sectionStyle} className="bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl font-bold text-white text-center mb-10">{String(content.title)}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-white text-center">
              {(content.items as Array<{ value: string; label: string }>)?.map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-white/90 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'testimonials':
      return (
        <section style={sectionStyle} className="bg-gray-50">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">{String(content.title)}</h2>}
            {content.description && <p className="text-gray-600 text-center max-w-2xl mx-auto mb-12">{String(content.description)}</p>}
            <div className="grid md:grid-cols-3 gap-8">
              {(content.items as Array<{ author: string; role: string; content: string; avatar_url?: string; quote?: string }>)?.map((item, idx) => (
                <Card key={idx} variant="bordered" className="p-6">

                  <p className="text-gray-600 mb-6 italic">&ldquo;{item.content}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    {item.avatar_url && <img src={item.avatar_url} alt={item.author} className="w-10 h-10 rounded-full object-cover" />}
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{item.author}</div>
                      <div className="text-gray-500 text-xs">{item.role}</div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )

    case 'faq':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-12">{String(content.title)}</h2>}
            <div className="max-w-3xl mx-auto space-y-4">
              {(content.items as Array<{ question: string; answer: string }>)?.map((item, idx) => (
                <details key={idx} className="bg-white rounded-xl border border-gray-200 group">
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-gray-900 hover:text-amber-600 transition-colors">
                    {item.question}
                    <ChevronRight className="w-5 h-5 text-gray-400 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5 text-gray-600">{item.answer}</div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )

    case 'timeline':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{String(content.title)}</h2>}
            {content.description && <p className="text-gray-600 mb-12">{String(content.description)}</p>}
            <div className="relative">
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-amber-200" />
              <div className="space-y-8">
                {(content.items as Array<{ year: string; title: string; description?: string }>)?.map((item, idx) => (
                  <div key={idx} className="relative pl-20">
                    <div className="absolute left-3 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{idx + 1}</span>
                    </div>
                    <div className="text-sm text-amber-600 font-semibold mb-1">{item.year}</div>
                    <div className="text-gray-900 font-medium">{item.title}</div>
                    {item.description && <p className="text-gray-500 text-sm mt-1">{item.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )

    case 'video':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            {content.title && <h2 className="text-3xl font-bold text-gray-900 mb-6">{String(content.title)}</h2>}
            <div className="aspect-w-16 aspect-h-9 max-w-4xl mx-auto">
              {content.video_url && (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  {content.thumbnail_url ? (
                    <div className="relative cursor-pointer group" onClick={() => window.open(String(content.video_url), '_blank')}>
                      <img src={String(content.thumbnail_url)} alt={String(content.title || 'Video')} className="w-full" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                        <Play className="w-16 h-16 text-white" fill="white" />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-100 aspect-video flex items-center justify-center">
                      <a href={String(content.video_url)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-amber-600 hover:text-amber-700">
                        <Play className="w-8 h-8" /> Watch Video
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )

    case 'gallery':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">{String(content.title)}</h2>}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(content.images as Array<{ url: string; alt?: string; caption?: string }>)?.map((img, idx) => (
                <div key={idx} className="relative group overflow-hidden rounded-xl">
                  <img src={img.url} alt={img.alt || ''} className="w-full h-48 object-cover transition-transform group-hover:scale-110" />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-sm">{img.caption}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'sponsors':
    case 'partners':
      return (
        <section style={sectionStyle} className="bg-gray-50">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">{String(content.title)}</h2>}
            <div className="flex flex-wrap items-center justify-center gap-8">
              {(content.items as Array<{ name: string; logo_url: string; website_url?: string }>)?.map((item, idx) => (
                <div key={idx} className="grayscale hover:grayscale-0 transition-all">
                  {item.website_url ? (
                    <a href={item.website_url} target="_blank" rel="noopener noreferrer">
                      <img src={item.logo_url} alt={item.name} className="h-12 w-auto opacity-60 hover:opacity-100 transition-opacity" />
                    </a>
                  ) : (
                    <img src={item.logo_url} alt={item.name} className="h-12 w-auto opacity-60" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )

    case 'donation':
      return (
        <section style={sectionStyle} className="bg-gradient-to-br from-amber-50 via-white to-orange-50">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            <div className="max-w-2xl mx-auto text-center">
              {content.title && <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{String(content.title)}</h2>}
              {content.description && <p className="text-gray-600 mb-8">{String(content.description)}</p>}
              <Link to={String(content.donate_link || '/donate')}>
                <Button size="lg">{String(content.button_text || 'Donate Now')}</Button>
              </Link>
            </div>
          </div>
        </section>
      )

    case 'student_cards':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {content.title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">{String(content.title)}</h2>}
            {content.description && <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">{String(content.description)}</p>}
            <div className="grid md:grid-cols-3 gap-8">
              {(content.items as Array<{ name: string; photo_url?: string; age?: string; grade?: string; bio?: string; link?: string }>)?.map((student, idx) => (
                <Card key={idx} variant="bordered" className="overflow-hidden">
                  <img src={student.photo_url || ''} alt={student.name} className="w-full h-48 object-cover" onError={e => { (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=600' }} />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                    {(student.age || student.grade) && <p className="text-sm text-gray-500 mt-1">{[student.age, student.grade].filter(Boolean).join(' · ')}</p>}
                    {student.bio && <p className="text-gray-600 text-sm mt-3 line-clamp-2">{student.bio}</p>}
                    {student.link && (
                      <Link to={student.link} className="mt-4 inline-block text-amber-600 font-medium text-sm hover:text-amber-700">
                        View Profile <ArrowRight className="w-3 h-3 inline ml-1" />
                      </Link>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )

    case 'announcements':
      return (
        <section style={sectionStyle} className="bg-amber-50">
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8`}>
            {(content.items as Array<{ title: string; content: string; type?: string; link_url?: string; link_text?: string }>)?.map((ann, idx) => (
              <div key={idx} className={`rounded-xl p-4 mb-3 flex items-center gap-4 ${
                ann.type === 'warning' ? 'bg-orange-100 text-orange-800' :
                ann.type === 'success' ? 'bg-green-100 text-green-800' :
                ann.type === 'error' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
              }`}>
                <div className="flex-1">
                  <p className="font-medium">{ann.title}{ann.content ? `: ${ann.content}` : ''}</p>
                </div>
                {ann.link_url && (
                  <a href={ann.link_url} className="text-sm font-medium underline shrink-0">{ann.link_text || 'Learn more'}</a>
                )}
              </div>
            ))}
          </div>
        </section>
      )

    case 'custom_section':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            {content.html && <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: String(content.html) }} />}
          </div>
        </section>
      )

    case 'rich_content':
      return (
        <section style={sectionStyle}>
          <div className={`${maxWidth} mx-auto px-4 sm:px-6 lg:px-8 text-${textAlign}`}>
            {content.title && <h2 className="text-3xl font-bold text-gray-900 mb-4">{String(content.title)}</h2>}
            {content.body && <div className="prose prose-lg max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: String(content.body) }} />}
          </div>
        </section>
      )

    default:
      return null
  }
}
