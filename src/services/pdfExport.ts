import { formatNPR } from '../utils/currency'
import { getSupabaseClient } from '../lib/supabase'
const supabase = getSupabaseClient()

interface ReceiptData {
  donorName: string
  donorEmail: string
  amount: number
  transactionId: string
  date: string
  allocationCategory?: string
  studentName?: string
  isSponsorship?: boolean
}

interface CertificateData {
  recipientName: string
  certificateType: 'sponsorship' | 'thank_you' | 'volunteer'
  studentName?: string
  date: string
  hours?: number
  message?: string
}

export async function downloadDonationReceipt(data: ReceiptData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20
  const contentWidth = pageWidth - 2 * margin

  doc.setFillColor(5, 150, 105)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setFontSize(22)
  doc.setTextColor(255, 255, 255)
  doc.text('Buddha Academy', pageWidth / 2, 18, { align: 'center' })
  doc.setFontSize(10)
  doc.text('Nurturing Minds, Building Futures — Kathmandu, Nepal', pageWidth / 2, 28, { align: 'center' })

  doc.setFontSize(18)
  doc.setTextColor(5, 150, 105)
  doc.text('Donation Receipt', pageWidth / 2, 55, { align: 'center' })

  doc.setDrawColor(5, 150, 105)
  doc.setLineWidth(0.5)
  doc.line(margin, 62, pageWidth - margin, 62)

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Receipt Date: ${new Date(data.date).toLocaleDateString()}`, margin, 75)
  doc.text(`Receipt #: RCP-${data.transactionId.slice(0, 8).toUpperCase()}`, margin, 82)

  doc.setFontSize(11)
  doc.setTextColor(55, 65, 81)
  let y = 100

  doc.text(`Donor Name:`, margin, y)
  doc.setFont('helvetica', 'bold')
  doc.text(data.donorName, margin + 40, y)
  y += 8
  doc.setFont('helvetica', 'normal')
  doc.text(`Email:`, margin, y)
  doc.text(data.donorEmail, margin + 40, y)
  y += 8
  doc.text(`Transaction ID:`, margin, y)
  doc.text(data.transactionId, margin + 40, y)
  y += 8
  doc.text(`Allocation:`, margin, y)
  doc.text(data.allocationCategory || 'General Support', margin + 40, y)

  y += 20
  doc.setFillColor(240, 253, 244)
  doc.roundedRect(margin, y, contentWidth, 30, 4, 4, 'F')

  doc.setFontSize(14)
  doc.setTextColor(5, 150, 105)
  doc.setFont('helvetica', 'bold')
  doc.text(`Donation Amount: ${formatNPR(data.amount)}`, margin + 10, y + 12)
  doc.setFont('helvetica', 'normal')

  y += 50
  doc.setFontSize(10)
  doc.setTextColor(55, 65, 81)
  doc.text('Thank you for your generous support. Your contribution directly', margin, y)
  doc.text('helps provide education, meals, and care for children at Buddha Academy.', margin, y + 6)
  y += 20

  if (data.studentName) {
    doc.setFontSize(11)
    doc.setTextColor(5, 150, 105)
    doc.setFont('helvetica', 'bold')
    doc.text(`Sponsored Student: ${data.studentName}`, margin, y)
    doc.setFont('helvetica', 'normal')
    y += 12
  }

  doc.setFontSize(9)
  doc.setTextColor(148, 163, 184)
  doc.text('This is a computer-generated receipt and does not require a physical signature.', margin, y)
  y += 5
  doc.text('For questions, contact: info@buddhaacademy.org.np', margin, y)

  doc.setFontSize(8)
  doc.setTextColor(156, 163, 175)
  doc.text('© Buddha Academy. All rights reserved.', pageWidth / 2, 285, { align: 'center' })

  doc.save(`donation-receipt-${data.transactionId.slice(0, 8)}.pdf`)
}

export async function downloadSponsorshipCertificate(data: CertificateData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFillColor(255, 255, 255)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setDrawColor(5, 150, 105)
  doc.setLineWidth(2)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.5)
  doc.rect(8, 8, pageWidth - 16, pageHeight - 16)

  doc.setFontSize(28)
  doc.setTextColor(5, 150, 105)
  doc.text('Certificate of Appreciation', pageWidth / 2, 50, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text('Presented to', pageWidth / 2, 70, { align: 'center' })

  doc.setFontSize(24)
  doc.setTextColor(55, 65, 81)
  doc.setFont('helvetica', 'bold')
  doc.text(data.recipientName, pageWidth / 2, 90, { align: 'center' })
  doc.setFont('helvetica', 'normal')

  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text('In recognition of your generous sponsorship and commitment to', pageWidth / 2, 110, { align: 'center' })
  doc.text(`providing quality education for children at Buddha Academy.`, pageWidth / 2, 122, { align: 'center' })

  if (data.studentName) {
    doc.setFontSize(13)
    doc.setTextColor(5, 150, 105)
    doc.setFont('helvetica', 'bold')
    doc.text(`Supporting: ${data.studentName}`, pageWidth / 2, 142, { align: 'center' })
    doc.setFont('helvetica', 'normal')
  }

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, pageWidth / 2, 165, { align: 'center' })
  doc.text('Kathmandu, Nepal', pageWidth / 2, 177, { align: 'center' })

  if (data.message) {
    doc.setFontSize(10)
    doc.setTextColor(55, 65, 81)
    doc.text(`"${data.message}"`, pageWidth / 2, 200, { align: 'center' })
  }

  doc.setFontSize(9)
  doc.setTextColor(156, 163, 175)
  doc.text('© Buddha Academy — Nurturing Minds, Building Futures', pageWidth / 2, 280, { align: 'center' })

  doc.save(`sponsorship-certificate-${data.recipientName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

export async function downloadThankYouCertificate(data: CertificateData): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFillColor(255, 247, 237)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(1.5)
  doc.rect(5, 5, pageWidth - 10, pageHeight - 10)

  doc.setFontSize(26)
  doc.setTextColor(180, 83, 9)
  doc.text('Thank You', pageWidth / 2, 55, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(180, 83, 9)
  doc.text('With heartfelt gratitude to', pageWidth / 2, 75, { align: 'center' })

  doc.setFontSize(22)
  doc.setTextColor(55, 65, 81)
  doc.setFont('helvetica', 'bold')
  doc.text(data.recipientName, pageWidth / 2, 95, { align: 'center' })
  doc.setFont('helvetica', 'normal')

  doc.setFontSize(12)
  doc.setTextColor(100, 116, 139)
  doc.text('Your kindness and generosity are transforming lives.', pageWidth / 2, 115, { align: 'center' })
  doc.text('Because of you, children at Buddha Academy can dream bigger.', pageWidth / 2, 127, { align: 'center' })

  if (data.hours) {
    doc.setFontSize(13)
    doc.setTextColor(5, 150, 105)
    doc.text(`Volunteer Hours: ${data.hours}`, pageWidth / 2, 150, { align: 'center' })
  }

  doc.setFontSize(10)
  doc.setTextColor(100, 116, 139)
  doc.text(`Date: ${new Date(data.date).toLocaleDateString()}`, pageWidth / 2, 170, { align: 'center' })

  doc.setFontSize(9)
  doc.setTextColor(156, 163, 175)
  doc.text('© Buddha Academy — Nurturing Minds, Building Futures', pageWidth / 2, 280, { align: 'center' })

  doc.save(`thank-you-${data.recipientName.replace(/\s+/g, '-').toLowerCase()}.pdf`)
}

export async function downloadYearlySummary(params: {
  donorName: string
  year: number
  totalDonated: number
  donations: Array<{ date: string; amount: number; status: string }>
  studentsSponsored: string[]
}): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF('p', 'mm', 'a4')
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 20

  doc.setFillColor(5, 150, 105)
  doc.rect(0, 0, pageWidth, 40, 'F')

  doc.setFontSize(20)
  doc.setTextColor(255, 255, 255)
  doc.text('Buddha Academy', pageWidth / 2, 18, { align: 'center' })
  doc.setFontSize(10)
  doc.text(`Yearly Contribution Summary — ${params.year}`, pageWidth / 2, 30, { align: 'center' })

  doc.setFontSize(14)
  doc.setTextColor(5, 150, 105)
  doc.text(`Donor: ${params.donorName}`, margin, 55)

  doc.setFillColor(240, 253, 244)
  doc.roundedRect(margin, 65, pageWidth - 2 * margin, 20, 4, 4, 'F')
  doc.setFontSize(16)
  doc.setTextColor(5, 150, 105)
  doc.setFont('helvetica', 'bold')
  doc.text(`Total Contributed: ${formatNPR(params.totalDonated)}`, margin + 10, 78)
  doc.setFont('helvetica', 'normal')

  let y = 100
  doc.setFontSize(12)
  doc.setTextColor(55, 65, 81)
  doc.setFont('helvetica', 'bold')
  doc.text('Donation History', margin, y)
  doc.setFont('helvetica', 'normal')
  y += 10

  if (params.donations.length > 0) {
    for (const donation of params.donations) {
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      doc.text(new Date(donation.date).toLocaleDateString(), margin, y)
      doc.text(`${formatNPR(donation.amount)}`, margin + 40, y)
      doc.setTextColor(donation.status === 'verified' ? '#059669' : '#d97706')
      doc.text(donation.status, margin + 90, y)
      y += 7

      if (y > 260) {
        doc.addPage()
        y = 20
      }
    }
  }

  y += 10
  if (params.studentsSponsored.length > 0) {
    doc.setFontSize(12)
    doc.setTextColor(55, 65, 81)
    doc.setFont('helvetica', 'bold')
    doc.text('Sponsored Students', margin, y)
    y += 8
    doc.setFont('helvetica', 'normal')
    params.studentsSponsored.forEach(name => {
      doc.setFontSize(10)
      doc.setTextColor(75, 85, 99)
      doc.text(`• ${name}`, margin + 5, y)
      y += 6
    })
  }

  doc.setFontSize(9)
  doc.setTextColor(156, 163, 175)
  y = Math.max(y, 260)
  doc.text('© Buddha Academy. All rights reserved.', pageWidth / 2, y + 10, { align: 'center' })

  doc.save(`yearly-summary-${params.year}.pdf`)
}

export async function savePdfExport(params: {
  userId: string
  type: 'donation_receipt' | 'thank_you' | 'sponsorship_appreciation' | 'volunteer'
  title: string
  amount?: number
  donationId?: string
  sponsorshipId?: string
}): Promise<void> {
  await supabase.from('certificates').insert({
    user_id: params.userId,
    certificate_type: params.type,
    title: params.title,
    amount: params.amount || null,
    donation_id: params.donationId || null,
    sponsorship_id: params.sponsorshipId || null,
  })
}
