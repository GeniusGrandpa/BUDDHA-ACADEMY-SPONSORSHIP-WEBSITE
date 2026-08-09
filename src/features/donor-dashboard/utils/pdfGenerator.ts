import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import type { Donation } from '../../../types/database'
import { formatCurrency, type Currency } from '../../../utils/currency'

interface ReceiptInfo {
  receipt_number: string
  amount: number
  certificate_type: string
  title: string
  description: string | null
  issued_date: string
  donation_id: string | null
}

const BRAND_COLOR: [number, number, number] = [217, 119, 6]
const ACCENT_COLOR: [number, number, number] = [234, 88, 12]
const TEXT_DARK = '#1f2937'
const TEXT_MUTED = '#6b7280'

function addHeader(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth()

  doc.setFillColor(...BRAND_COLOR)
  doc.rect(0, 0, pageWidth, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...BRAND_COLOR)
  doc.text('Buddha Academy', pageWidth / 2, 28, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text('Education Sponsorship Program • Kathmandu, Nepal', pageWidth / 2, 35, { align: 'center' })
  doc.text('buddhaacademy.edu.np • info@buddhaacademy.edu.np', pageWidth / 2, 41, { align: 'center' })

  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(0.5)
  doc.line(20, 46, pageWidth - 20, 46)
}

function addFooter(doc: jsPDF): void {
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setDrawColor(217, 119, 6)
  doc.setLineWidth(0.3)
  doc.line(20, pageHeight - 30, pageWidth - 20, pageHeight - 30)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(TEXT_MUTED)
  doc.text('Thank you for your generous support!', pageWidth / 2, pageHeight - 22, { align: 'center' })
  doc.text('© Buddha Academy • This is a computer-generated document.', pageWidth / 2, pageHeight - 16, { align: 'center' })
}

export function generateReceiptPDF(
  receipt: ReceiptInfo,
  donor: { name: string; email: string },
  currency: Currency = 'NPR',
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(TEXT_DARK)
  doc.text('Donation Receipt', pageWidth / 2, 58, { align: 'center' })

  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Receipt #: ${receipt.receipt_number}`, pageWidth / 2, 66, { align: 'center' })
  doc.text(`Issued: ${new Date(receipt.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 72, { align: 'center' })

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  doc.line(20, 78, pageWidth - 20, 78)

  autoTable(doc, {
    startY: 84,
    theme: 'plain',
    head: [],
    body: [
      ['Donor Name', donor.name],
      ['Email Address', donor.email],
      ['Receipt Number', receipt.receipt_number],
      ['Date Issued', new Date(receipt.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })],
      ['Certificate Type', receipt.certificate_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
      ...(receipt.description ? [['Description', receipt.description]] : []),
    ],
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: TEXT_DARK },
      1: { cellWidth: 'auto', textColor: '#374151' },
    },
    styles: { fontSize: 10, cellPadding: 2.5 },
    tableLineWidth: 0,
  })

  const bodyStart = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12

  doc.setFillColor(254, 243, 199)
  doc.setDrawColor(...BRAND_COLOR)
  doc.roundedRect(20, bodyStart, pageWidth - 40, 28, 3, 3, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(TEXT_DARK)
  doc.text('Amount Received:', 30, bodyStart + 12)

  doc.setFontSize(16)
  doc.setTextColor(...ACCENT_COLOR)
  doc.text(formatCurrency(receipt.amount, currency), pageWidth / 2 + 30, bodyStart + 12, { align: 'right' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(TEXT_MUTED)
  const words = numberToWords(receipt.amount)
  doc.text(`In words: ${currency} ${words}`, 30, bodyStart + 22)

  const detailsStart = bodyStart + 42

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(TEXT_DARK)
  doc.text('Receipt Details', 20, detailsStart)

  autoTable(doc, {
    startY: detailsStart + 4,
    theme: 'grid',
    head: [['Field', 'Details']],
    body: [
      ['Receipt Title', receipt.title],
      ['Certificate Type', receipt.certificate_type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())],
      ['Transaction ID', receipt.donation_id || 'N/A'],
      ['Donation Amount', formatCurrency(receipt.amount, currency)],
    ],
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9.5 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: TEXT_DARK },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
  })

  addFooter(doc)
  doc.save(`receipt-${receipt.receipt_number}.pdf`)
}

export function generateCertificatePDF(
  certificate: ReceiptInfo,
  donor: { name: string; email: string },
  currency: Currency = 'NPR',
): void {
  const doc = new jsPDF({ orientation: 'landscape' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  const borderMargin = 12
  doc.setDrawColor(...BRAND_COLOR)
  doc.setLineWidth(1.5)
  doc.rect(borderMargin, borderMargin, pageWidth - borderMargin * 2, pageHeight - borderMargin * 2)

  doc.setDrawColor(252, 211, 77)
  doc.setLineWidth(0.5)
  const innerMargin = 16
  doc.rect(innerMargin, innerMargin, pageWidth - innerMargin * 2, pageHeight - innerMargin * 2)

  doc.setFillColor(255, 251, 235)
  doc.rect(innerMargin + 2, innerMargin + 2, pageWidth - (innerMargin + 2) * 2, pageHeight - (innerMargin + 2) * 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(32)
  doc.setTextColor(...BRAND_COLOR)
  doc.text('Certificate of Appreciation', pageWidth / 2, 48, { align: 'center' })

  doc.setFontSize(12)
  doc.setTextColor(TEXT_MUTED)
  doc.text('Buddha Academy • Education Sponsorship Program', pageWidth / 2, 58, { align: 'center' })

  doc.setDrawColor(217, 119, 6)
  doc.setLineWidth(0.5)
  doc.line(60, 65, pageWidth - 60, 65)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(TEXT_DARK)
  doc.text('This certificate is proudly presented to', pageWidth / 2, 80, { align: 'center' })

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(...ACCENT_COLOR)
  doc.text(donor.name, pageWidth / 2, 100, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(TEXT_DARK)
  doc.text(`In recognition of your ${certificate.title.toLowerCase()}`, pageWidth / 2, 118, { align: 'center' })
  doc.text(`with a generous contribution of ${formatCurrency(certificate.amount, currency)}`, pageWidth / 2, 130, { align: 'center' })
  doc.text(`${new Date(certificate.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, 142, { align: 'center' })

  if (certificate.description) {
    doc.setFontSize(10)
    doc.setTextColor(TEXT_MUTED)
    doc.text(`"${certificate.description}"`, pageWidth / 2, 158, { align: 'center' })
  }

  doc.setDrawColor(229, 231, 235)
  doc.setLineWidth(0.3)
  const sigY = 190
  doc.line(50, sigY, 140, sigY)
  doc.line(pageWidth - 50, sigY, pageWidth - 140, sigY)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_DARK)
  doc.text('Principal', 95, sigY + 6, { align: 'center' })
  doc.text('Buddha Academy', pageWidth - 95, sigY + 6, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Certificate #: ${certificate.receipt_number}`, pageWidth / 2, pageHeight - 28, { align: 'center' })
  doc.text(`Issued: ${new Date(certificate.issued_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth / 2, pageHeight - 22, { align: 'center' })

  doc.save(`certificate-${certificate.receipt_number}.pdf`)
}

export function generateDonationHistoryPDF(
  donations: Donation[],
  donor: { name: string },
  currency: Currency = 'NPR',
): void {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Donation History Report', pageWidth / 2, 58, { align: 'center' })

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Donor: ${donor.name}`, 20, 68)

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
  doc.text(`Total Donations: ${donations.length}`, 20, 75)
  doc.text(`Total Amount: ${formatCurrency(totalDonated, currency)}`, pageWidth - 20, 75, { align: 'right' })
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, pageWidth - 20, 82, { align: 'right' })

  const tableData = donations.map(d => [
    new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    d.frequency.charAt(0).toUpperCase() + d.frequency.slice(1),
    d.student_id || 'General',
    formatCurrency(d.amount, currency),
    d.status.charAt(0).toUpperCase() + d.status.slice(1),
  ])

  autoTable(doc, {
    startY: 92,
    head: [['Date', 'Frequency', 'Designation', 'Amount', 'Status']],
    body: tableData,
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 30 },
      2: { cellWidth: 40 },
      3: { cellWidth: 35, halign: 'right' },
      4: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 20, right: 20 },
    foot: [
      ['', '', 'Total', formatCurrency(totalDonated, currency), `${donations.length} donations`],
    ],
    footStyles: {
      fillColor: [254, 243, 199],
      fontStyle: 'bold',
      fontSize: 9,
      textColor: TEXT_DARK,
      halign: 'right',
    },
  })

  const tableEnd = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_DARK)
  doc.text('Summary', 20, tableEnd)

  const summaryStart = tableEnd + 4
  const summaryData = [
    ['Total Donations', donations.length.toString()],
    ['Total Amount', formatCurrency(totalDonated, currency)],
    ['Average Donation', donations.length > 0 ? formatCurrency(Math.round(totalDonated / donations.length), currency) : formatCurrency(0, currency)],
    ['Latest Donation', donations.length > 0 ? new Date(donations[0].created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'],
    ['Oldest Donation', donations.length > 0 ? new Date(donations[donations.length - 1].created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'],
  ]

  autoTable(doc, {
    startY: summaryStart,
    theme: 'grid',
    head: [['Metric', 'Value']],
    body: summaryData,
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: '#ffffff',
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 50, textColor: TEXT_DARK },
      1: { cellWidth: 'auto' },
    },
    margin: { left: 20, right: 20 },
  })

  addFooter(doc)

  const filename = `donation-history-${donor.name.replace(/\s+/g, '-').toLowerCase()}.pdf`
  doc.save(filename)
}

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (data.length === 0) return

  const headers = Object.keys(data[0])
  const csvRows: string[] = [headers.join(',')]

  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header]
      const escaped = String(val ?? '').replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(','))
  }

  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function numberToWords(num: number): string {
  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

  if (num === 0) return 'Zero'

  function convertLessThanThousand(n: number): string {
    if (n === 0) return ''
    if (n < 20) return units[n]
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + units[n % 10] : '')
    return units[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '')
  }

  const crore = Math.floor(num / 10000000)
  const lakh = Math.floor((num % 10000000) / 100000)
  const thousand = Math.floor((num % 100000) / 1000)
  const hundred = Math.floor((num % 1000) / 100)
  const remainder = num % 100

  let result = ''
  if (crore > 0) result += convertLessThanThousand(crore) + ' Crore '
  if (lakh > 0) result += convertLessThanThousand(lakh) + ' Lakh '
  if (thousand > 0) result += convertLessThanThousand(thousand) + ' Thousand '
  if (hundred > 0 || (result === '' && remainder > 0)) {
    if (hundred > 0) result += convertLessThanThousand(hundred) + ' Hundred '
  }
  if (remainder > 0) {
    if (result !== '' && hundred === 0) result += 'and '
    result += convertLessThanThousand(remainder)
  }

  return result.trim()
}
