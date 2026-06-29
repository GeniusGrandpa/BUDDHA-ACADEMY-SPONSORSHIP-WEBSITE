import { Link, useNavigate } from 'react-router-dom'

interface QuickLink {
  name: string
  href: string
  desc: string
  color: string
}

const quickLinks: QuickLink[] = [
  { name: 'Visual Builder', href: '/admin/website/builder', desc: 'Manage all website pages visually', color: 'bg-amber-500' },
  { name: 'Media Library', href: '/admin/website/media', desc: 'Upload and manage images and files', color: 'bg-blue-500' },
  { name: 'Navigation', href: '/admin/website/navigation', desc: 'Manage header and footer menus', color: 'bg-purple-500' },
  { name: 'News & Updates', href: '/admin/website/news', desc: 'Create and publish news articles', color: 'bg-green-500' },
  { name: 'Gallery', href: '/admin/website/gallery', desc: 'Manage photo albums and galleries', color: 'bg-pink-500' },
  { name: 'Testimonials', href: '/admin/website/testimonials', desc: 'Manage donor and student testimonials', color: 'bg-indigo-500' },
  { name: 'SEO', href: '/admin/website/seo', desc: 'Manage meta titles and descriptions', color: 'bg-teal-500' },
  { name: 'Site Settings', href: '/admin/website/settings', desc: 'Configure global site settings', color: 'bg-orange-500' },
  { name: 'FAQ', href: '/admin/website/faqs', desc: 'Manage frequently asked questions', color: 'bg-cyan-500' },
  { name: 'Footer', href: '/admin/website/footer', desc: 'Manage footer content and links', color: 'bg-rose-500' },
  { name: 'Branding', href: '/admin/website/branding', desc: 'Manage logo, colors, and typography', color: 'bg-violet-500' },
  { name: 'Donation Content', href: '/admin/website/donation', desc: 'Manage donation page content', color: 'bg-emerald-500' },
  { name: 'Sponsorship Content', href: '/admin/website/sponsorship', desc: 'Manage sponsorship page content', color: 'bg-yellow-500' },
  { name: 'Volunteer Content', href: '/admin/website/volunteer', desc: 'Manage volunteer page content', color: 'bg-sky-500' },
  { name: 'Transparency', href: '/admin/website/transparency', desc: 'Manage transparency and allocation data', color: 'bg-lime-500' },
  { name: 'Announcements', href: '/admin/website/announcements', desc: 'Manage site-wide announcements', color: 'bg-red-500' },
  { name: 'Partners', href: '/admin/website/partners', desc: 'Manage partner organizations', color: 'bg-fuchsia-500' },
  { name: 'Section Visibility', href: '/admin/website/sections', desc: 'Show/hide sections across pages', color: 'bg-gray-500' },
  { name: 'Version History', href: '/admin/website/versions', desc: 'Track and restore content changes', color: 'bg-stone-500' },
  { name: 'Site Images', href: '/admin/website/images', desc: 'Manage site-wide image assets', color: 'bg-amber-500' },
]

interface PageGroup {
  title: string
  subtitle: string
  pages: { name: string; href: string; desc: string }[]
}

const pageGroups: PageGroup[] = [
  {
    title: 'Main Pages',
    subtitle: 'Core website pages',
    pages: [
      { name: 'Home', href: '/admin/website/builder', desc: 'Hero, welcome, stats, featured students, testimonials, donation CTA' },
      { name: 'About Us', href: '/admin/website/builder', desc: 'Mission, vision, values, timeline, statistics' },
      { name: 'Sponsorship', href: '/admin/website/builder', desc: 'Hero, how it works, benefits, CTA' },
      { name: 'Donations', href: '/admin/website/builder', desc: 'Hero, impact cards, process steps' },
      { name: 'Contact', href: '/admin/website/builder', desc: 'Header, contact details, contact form' },
    ],
  },
  {
    title: 'Content Pages',
    subtitle: 'Dynamic content pages',
    pages: [
      { name: 'Students', href: '/admin/website/builder', desc: 'Student profiles, filtering, sponsorship status' },
      { name: 'Gallery', href: '/admin/website/builder', desc: 'Photo albums, videos, testimonials grid' },
      { name: 'News/Blog', href: '/admin/website/builder', desc: 'News articles, categories, filtering' },
      { name: 'FAQ', href: '/admin/website/builder', desc: 'FAQ accordion list' },
      { name: 'Volunteer', href: '/admin/website/builder', desc: 'Opportunities, events, application form' },
      { name: 'Campaigns', href: '/admin/website/builder', desc: 'Fundraising goals and progress' },
      { name: 'Success Stories', href: '/admin/website/builder', desc: 'Student success stories carousel and grid' },
      { name: 'Activity', href: '/admin/website/builder', desc: 'Recent activity feed' },
      { name: 'Transparency', href: '/admin/website/builder', desc: 'Allocation chart, verification, impact report' },
    ],
  },
  {
    title: 'Legal Pages',
    subtitle: 'Policy and legal content',
    pages: [
      { name: 'Privacy Policy', href: '/admin/website/builder', desc: 'Privacy policy content and header' },
      { name: 'Terms of Service', href: '/admin/website/builder', desc: 'Terms of service content and header' },
    ],
  },
]

export function WebsiteDashboard() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Management</h1>
          <p className="text-gray-500 mt-1">Manage your entire website from one place</p>
        </div>
        <Link
          to="/admin/website/builder"
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Open Visual Builder
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {quickLinks.map(link => (
          <Link
            key={link.href}
            to={link.href}
            className="group block bg-white border border-gray-100 rounded-xl p-4 hover:border-amber-500/30 hover:shadow-md transition-all"
          >
            <div className={`w-8 h-8 rounded-lg ${link.color} bg-opacity-20 flex items-center justify-center mb-2`}>
              <div className={`w-3 h-3 rounded ${link.color}`} />
            </div>
            <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors">{link.name}</h3>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{link.desc}</p>
          </Link>
        ))}
      </div>

      {pageGroups.map(group => (
        <div key={group.title}>
          <div className="flex items-center gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-500">{group.subtitle}</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.pages.map(p => (
              <button
                key={p.href + p.name}
                onClick={() => navigate(p.href)}
                className="group block bg-white border border-gray-100 rounded-xl px-4 py-3.5 hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5 transition-all text-left"
              >
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-amber-600 transition-colors leading-snug">{p.name}</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-2m4 0h-6" />
          </svg>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Everything updates instantly</h3>
            <p className="text-sm text-gray-600 mt-0.5">
              All changes are saved directly to the database. Content updates appear on the public website immediately after saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
