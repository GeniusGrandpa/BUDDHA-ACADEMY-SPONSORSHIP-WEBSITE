import { useEffect, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Tr } from '../components/Translated'
import { getPublishedLegalPageByType, type LegalPageWithSections } from '../services/legal-pages'
import { getSectionContent } from '../services/cms-content'
import { DetailPageSkeleton } from '../components/ui/LoadingSkeleton'

const FALLBACK_SECTIONS = [
  {
    heading: 'Introduction',
    content: 'Welcome to the Buddha Academy Sponsorship Platform. By accessing or using this website, you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, please do not use our platform. This platform supports student sponsorships, donations, community programs, and communication between donors, sponsors, staff, and the community.',
  },
  {
    heading: 'Eligibility',
    content: 'By using this platform, you confirm that:\n\nYou provide accurate and truthful information when creating an account or making a donation.\nDonors and sponsors use the platform responsibly and in good faith.\nAdmin users are authorized by the organization to perform their roles.\nYou are at least 18 years old or accessing the platform under the supervision of a guardian.',
  },
  {
    heading: 'User Accounts',
    content: 'When you create an account on our platform:\n\nYou are responsible for maintaining the security of your account credentials.\nYou must not share your login credentials with others.\nUnauthorized access to other accounts is strictly prohibited.\nYou must notify us promptly if you suspect unauthorized use of your account.\nAccounts may be suspended or restricted for misuse, violation of terms, or security concerns.',
  },
  {
    heading: 'Donations and Sponsorships',
    content: 'The following terms apply to donations and sponsorships:\n\nDonations are made voluntarily and are not refundable unless otherwise stated by the organization.\nSponsorships support students and programs based on organization rules, student availability, and program needs.\nDonation allocation information is shown for transparency purposes in donor dashboards.\nThe platform does not guarantee specific outcomes from donations or sponsorships unless officially promised by the organization.\nDonation records are visible in donor dashboards for transparency.\nRefund requests are handled by the organization on a case-by-case basis.\nPayment processing may be handled by third-party providers.',
  },
  {
    heading: 'Content Accuracy',
    content: 'We aim to keep all information on the platform accurate and up to date. However:\n\nStudent, program, donation, event, and news information may change over time.\nWebsite content is provided for transparency and informational purposes.\nWe reserve the right to update or correct content without prior notice.\nWe are not liable for errors or omissions in content where reasonable efforts have been made to ensure accuracy.',
  },
  {
    heading: 'Student and Community Content',
    content: 'Student stories, photos, and profiles must be treated with respect:\n\nUsers must not misuse student information, photos, or personal stories.\nPublic content must not be copied, exploited, or used for harmful purposes.\nStudent images and information are shared for sponsorship and program transparency, not for commercial use.\nUsers must report any misuse of student content to the organization immediately.',
  },
  {
    heading: 'Acceptable Use',
    content: 'Users must not engage in the following activities:\n\nAttempting unauthorized access to any part of the platform.\nAbusing donation systems, including fraudulent transactions or chargeback abuse.\nUploading harmful content, malware, or malicious code.\nMisusing student or donor information for any unauthorized purpose.\nInterfering with platform security, performance, or availability.\nScraping sensitive data from the platform.\nImpersonating other users, staff, or representatives of the organization.\nUsing the website for fraud, harassment, illegal activity, or any purpose that violates applicable laws.',
  },
  {
    heading: 'Admin and Super Admin Responsibilities',
    content: 'Users with admin or super admin access must:\n\nManage content responsibly and accurately.\nAvoid exposing sensitive student or donor data to unauthorized parties.\nSuper Admins are responsible for role and permission management.\nFollow least-privilege access principles, granting only necessary permissions.\nEnsure dashboard changes are accurate, respectful, and properly authorized.\nMaintain confidentiality of sensitive organizational and user data.',
  },
  {
    heading: 'Intellectual Property',
    content: 'All website content, including design, text, images, branding, and platform code, belongs to Buddha Academy or respective owners unless otherwise indicated. Users may not reuse, reproduce, or distribute content without permission. Donor and student data must not be copied, scraped, or redistributed.',
  },
  {
    heading: 'Third-Party Links and Services',
    content: 'Our platform may link to external websites and services. We are not responsible for the content, privacy practices, or terms of third-party websites. Payment processing, authentication, and hosting services have their own terms and policies. We encourage you to review the terms of any third-party services you access through our platform.',
  },
  {
    heading: 'Limitation of Liability',
    content: 'To the fullest extent permitted by applicable law:\n\nThe platform is provided for informational, donation, sponsorship, and organizational management purposes.\nThe organization is not liable for issues caused by third-party services, user misuse, technical interruptions, or unauthorized actions outside its control.\nWe do not guarantee uninterrupted or error-free operation of the platform.\nOur liability is limited to the amount of your donation or sponsorship in dispute, where applicable and permitted by law.',
  },
  {
    heading: 'Account Suspension or Termination',
    content: 'We reserve the right to:\n\nSuspend or terminate accounts for misuse, fraud, unauthorized access, or violation of these terms.\nRevoke admin or staff access when no longer authorized by the organization.\nRemove content that violates these terms or applicable laws.\nTerminate or restrict access to the platform without prior notice where necessary for security or compliance.',
  },
  {
    heading: 'Changes to Terms',
    content: 'These Terms & Conditions may be updated from time to time. The "Last Updated" date at the top of this page indicates when the terms were last reviewed. Continued use of the platform after changes are posted constitutes acceptance of the updated terms where applicable. We encourage you to review these terms periodically.',
  },
  {
    heading: 'Contact Us',
    content: 'If you have any questions about these Terms & Conditions, please contact us:\n\nBuddha Academy\nBoudha, Kathmandu, Nepal\nEmail: info@buddhaacademy.edu.np\nPhone: +977 1 1234567',
  },
]

export function TermsPage() {
  const [legalPage, setLegalPage] = useState<LegalPageWithSections | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    try {
      const page = await getPublishedLegalPageByType('terms_conditions')
      if (page) {
        setLegalPage(page)
      } else {
        const section = await getSectionContent('terms_content')
        if (section?.content) {
          const c = section.content as { sections?: { heading: string; content: string }[]; title?: string }
          setLegalPage({
            id: '',
            title: c.title || section.title || 'Terms & Conditions',
            slug: 'terms',
            type: 'terms_conditions',
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
            sections: (c.sections || []) as LegalPageWithSections['sections'],
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
              <Tr text={legalPage?.title || 'Terms & Conditions'} />
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
                <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-4"><Tr text={section.heading} /></h2>
              )}
              <div className="text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                <Tr text={section.content} />
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
