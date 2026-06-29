import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { getPublishedLegalPageByType, type LegalPageWithSections } from '../services/legal-pages'
import { getSectionContent } from '../services/cms-content'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'

const FALLBACK_SECTIONS = [
  {
    heading: 'Introduction',
    content: 'Buddha Academy operates this sponsorship platform to support student sponsorships, donations, school programs, community updates, and organizational transparency. We are committed to protecting your privacy and handling your personal data responsibly. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform. We aim to follow privacy-conscious practices in line with applicable data protection principles. User trust, donor transparency, and student privacy are our priorities.',
  },
  {
    heading: 'Information We Collect',
    content: 'We may collect the following categories of information:\n\nAccount information: name, email address, phone number, role, and login details.\nDonor information: donation amount, donation purpose, transaction reference, and donor dashboard activity.\nSponsor information: sponsorship preferences, sponsored student or program details where applicable.\nStudent-related information: student profiles, education status, sponsorship status, and public visibility settings.\nVolunteer, teacher, and admin information where applicable to their roles.\nContact form messages submitted through the platform.\nUploaded media and images managed by authorized users.\nTechnical data: IP address, browser type, device information, session data, and security logs.\nCookies or similar tracking technologies where used for essential functionality.',
  },
  {
    heading: 'How We Use Information',
    content: 'We use collected information for the following purposes:\n\nTo create and manage user accounts.\nTo process donations and sponsorships.\nTo display donation history and allocation transparency in donor dashboards.\nTo manage student sponsorship records.\nTo communicate updates to donors, sponsors, volunteers, and staff.\nTo improve website performance and user experience.\nTo protect against fraud, abuse, unauthorized access, and security threats.\nTo maintain audit logs and administrative accountability.\nTo comply with legal, financial, or organizational obligations where applicable.',
  },
  {
    heading: 'Legal and Privacy Basis',
    content: 'We process personal data based on one or more of the following legal grounds where applicable:\n\nConsent: where you have provided clear consent for specific processing.\nLegitimate organizational interest: for operating the platform, maintaining transparency, and managing donor and sponsor relationships.\nContractual necessity: for processing account registration, donations, and sponsorships.\nLegal or financial obligation: for maintaining financial records, audit trails, and compliance with applicable laws.\nProtection of users, students, donors, and platform security.',
  },
  {
    heading: 'Student and Child Data Protection',
    content: 'We take student data protection seriously. The following principles guide our handling of student information:\n\nStudent data is handled with extra care and respect.\nOnly necessary student information is displayed publicly.\nSensitive student information is not exposed on public pages.\nAdmins and Super Admins control what student data is visible.\nImages and stories involving students are managed responsibly.\nPublic student profiles avoid displaying unnecessary sensitive information.\nAccess to student records is restricted based on role and authorization.\nWe do not share student data for advertising or marketing purposes.',
  },
  {
    heading: 'Donation and Financial Data',
    content: 'Donation records may include amount, date, purpose, status, and allocation category. The platform displays donation transparency information to donors through their dashboards. Sensitive payment credentials are not stored directly on our platform unless handled through a secure payment provider. Transaction references may be stored for accountability and reconciliation purposes. Donation records are retained for financial reporting and transparency obligations.',
  },
  {
    heading: 'Data Sharing',
    content: 'We may share data only when necessary with:\n\nAuthorized school and NGO staff.\nPayment processors for donation processing.\nHosting, database, and authentication providers such as Supabase or equivalent infrastructure.\nLegal, accounting, compliance, or security parties when required by law.\nService providers who help operate and maintain the platform.\n\nWe do not sell personal data to third parties. Student data is not shared for advertising purposes. Donor data is not sold or traded.',
  },
  {
    heading: 'Data Storage and Security',
    content: 'We implement reasonable security measures to protect your data. These include:\n\nSecure database storage through Supabase and PostgreSQL.\nAuthentication controls with hashed passwords through our auth provider.\nRow Level Security (RLS) policies to restrict data access.\nRole-based access control (RBAC) to limit access based on authorization.\nAdmin permission restrictions to prevent unauthorized changes.\nAudit fields and logs where implemented for accountability.\nSecure session handling practices.\nHTTPS in production environments.\nRegular review of permissions and access controls.\n\nWe do not falsely claim encryption, backups, monitoring, or compliance certifications unless they are already implemented.',
  },
  {
    heading: 'Data Retention',
    content: 'We retain data as follows:\n\nAccount data is retained while the account is active.\nDonation records are retained for financial, reporting, and transparency purposes.\nContact messages are retained only as needed for response and record-keeping.\nStudent sponsorship records are retained for educational and program accountability.\nUsers may request deletion where legally and operationally possible.\nSome records may need to be retained for fraud prevention, accounting, dispute resolution, or legal obligations.',
  },
  {
    heading: 'Your Rights',
    content: 'Where applicable, you may have the following rights regarding your personal data:\n\nAccess your personal data held by the organization.\nRequest correction of inaccurate or incomplete data.\nRequest deletion where legally and operationally feasible.\nWithdraw consent where processing is based on consent.\nRequest data export where technically feasible.\nContact the organization about privacy concerns or questions.\n\nTo exercise these rights, please contact us using the information below.',
  },
  {
    heading: 'Cookies and Tracking',
    content: 'We may use essential cookies and session storage for authentication and platform functionality. Authentication tokens are used to maintain secure sessions. If analytics cookies are implemented in the future, users will be informed. Users can manage cookie preferences through their browser settings. Disabling essential cookies may affect platform functionality.',
  },
  {
    heading: 'Third-Party Services',
    content: 'Our platform relies on the following services:\n\nSupabase for database, authentication, and storage.\nPayment gateway providers for processing donations.\nHosting providers for website infrastructure.\n\nThese third-party services have their own privacy policies and data handling practices. We encourage you to review their policies.',
  },
  {
    heading: 'Updates to This Policy',
    content: 'This Privacy Policy may be updated from time to time to reflect changes in our practices, legal requirements, or platform features. The "Last Updated" date at the top of this page indicates when the policy was last reviewed. We encourage you to review this policy periodically. Continued use of the platform after changes constitutes acceptance of the updated policy where applicable.',
  },
]

export function PrivacyPage() {
  const [legalPage, setLegalPage] = useState<LegalPageWithSections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPublishedLegalPageByType('privacy_policy')
      if (page) {
        setLegalPage(page)
      } else {
        const section = await getSectionContent('privacy_content')
        if (section?.content) {
          const c = section.content as { sections?: { heading: string; content: string }[]; title?: string }
          setLegalPage({
            id: '',
            title: c.title || section.title || 'Privacy Policy',
            slug: 'privacy',
            type: 'privacy_policy',
            meta_title: '',
            meta_description: '',
            status: 'published',
            effective_date: null,
            last_reviewed_at: null,
            published_at: null,
            created_by: null,
            updated_by: null,
            created_at: '',
            updated_at: '',
            sections: c.sections || [],
          })
        }
      }
    } catch {
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <DetailPageSkeleton />

  const sections = legalPage?.sections && legalPage.sections.length > 0
    ? legalPage.sections
    : FALLBACK_SECTIONS

  const lastUpdated = legalPage?.updated_at || legalPage?.published_at

  return (
    <div className="bg-[var(--color-background)] min-h-screen">
      <section className="relative py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-[var(--color-primary-light)]/20 to-[var(--color-secondary-light)]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6">
              {legalPage?.title || 'Privacy Policy'}
            </h1>
            {lastUpdated && (
              <p className="text-xs sm:text-sm text-[var(--color-text-muted)]">
                Last updated: {new Date(lastUpdated).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {sections.map((section, idx) => (
            <Card key={idx} variant="bordered" padding="lg" className="max-w-none">
              {section.heading && (
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4">{section.heading}</h2>
              )}
              <div className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {section.content}
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
