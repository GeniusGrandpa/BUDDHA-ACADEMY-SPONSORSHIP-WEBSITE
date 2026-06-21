import { useState } from 'react'
import { Card } from '../../components/ui/Card'
import { FileText, Download, Filter, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { formatNPR } from '../../utils/currency'

const BRAND_COLOR: [number, number, number] = [217, 119, 6]
const TEXT_DARK = '#1f2937'
const TEXT_MUTED = '#6b7280'

type ReportType = 'donation' | 'student' | 'financial' | 'sponsorship' | 'volunteer' | 'impact'

interface ReportConfig {
  key: ReportType
  title: string
  description: string
  icon: typeof FileText
}

const reportTypes: ReportConfig[] = [
  { key: 'donation', title: 'Donation Report', description: 'Summary of all donations by date, amount, and donor', icon: FileText },
  { key: 'student', title: 'Student Report', description: 'Overview of student enrollment and sponsorship status', icon: FileText },
  { key: 'financial', title: 'Financial Report', description: 'Detailed financial breakdown including income and expenses', icon: FileText },
  { key: 'sponsorship', title: 'Sponsorship Report', description: 'Track active sponsorships and renewal status', icon: FileText },
  { key: 'volunteer', title: 'Volunteer Report', description: 'Volunteer participation hours and activity summary', icon: FileText },
  { key: 'impact', title: 'Impact Report', description: 'Key metrics and impact statistics for the academy', icon: FileText },
]

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
  doc.text('Education Sponsorship Program \u2022 Kathmandu, Nepal', pageWidth / 2, 35, { align: 'center' })
  doc.text('buddhaacademy.edu.np \u2022 info@buddhaacademy.edu.np', pageWidth / 2, 41, { align: 'center' })
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
  doc.text('\u00a9 Buddha Academy \u2022 Generated report', pageWidth / 2, pageHeight - 16, { align: 'center' })
}

async function generateDonationReport(): Promise<void> {
  const { data: donations, error } = await supabase
    .from('donations')
    .select('*, profiles:donor_id(full_name, email)')
    .order('created_at', { ascending: false })

  if (error || !donations?.length) {
    alert('No donation data available')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Donation Report', pageWidth / 2, 58, { align: 'center' })

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Total Donations: ${donations.length}  |  Total Amount: ${formatNPR(totalAmount)}`, 20, 68)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 68, { align: 'right' })

  const tableData = donations.slice(0, 100).map(d => [
    new Date(d.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    (d.profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown',
    formatNPR(d.amount),
    d.frequency,
    d.status,
  ])

  autoTable(doc, {
    startY: 76,
    head: [['Date', 'Donor', 'Amount', 'Frequency', 'Status']],
    body: tableData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 50 }, 2: { cellWidth: 35, halign: 'right' }, 3: { cellWidth: 28 }, 4: { cellWidth: 22 } },
    margin: { left: 20, right: 20 },
    foot: [['', '', formatNPR(totalAmount), `${donations.length} donations`, '']],
    footStyles: { fillColor: [254, 243, 199], fontStyle: 'bold', fontSize: 9, textColor: TEXT_DARK, halign: 'right' },
  })

  if (donations.length > 100) {
    const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
    doc.setFontSize(9)
    doc.setTextColor(TEXT_MUTED)
    doc.text(`* Showing latest 100 of ${donations.length} donations`, 20, finalY + 8)
  }

  addFooter(doc)
  doc.save('donation-report.pdf')
}

async function generateStudentReport(): Promise<void> {
  const { data: students, error } = await supabase
    .from('students')
    .select('*')
    .order('name')

  if (error || !students?.length) {
    alert('No student data available')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Student Report', pageWidth / 2, 58, { align: 'center' })

  const sponsored = students.filter(s => s.sponsorship_status !== 'available').length
  const available = students.filter(s => s.sponsorship_status === 'available').length

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Total Students: ${students.length}  |  Sponsored: ${sponsored}  |  Available: ${available}`, 20, 68)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 68, { align: 'right' })

  const tableData = students.map(s => [
    s.name,
    s.grade,
    s.class_section || '-',
    s.sponsorship_status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    formatNPR(s.sponsorship_amount),
  ])

  autoTable(doc, {
    startY: 76,
    head: [['Name', 'Grade', 'Section', 'Status', 'Sponsorship Amount']],
    body: tableData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 22 }, 2: { cellWidth: 22 }, 3: { cellWidth: 36 }, 4: { cellWidth: 35, halign: 'right' } },
    margin: { left: 20, right: 20 },
  })

  addFooter(doc)
  doc.save('student-report.pdf')
}

async function generateFinancialReport(): Promise<void> {
  const { data: donations, error: donError } = await supabase
    .from('donations')
    .select('amount, status, frequency, created_at')
    .order('created_at', { ascending: false })

  const { data: allocations } = await supabase
    .from('donation_allocations')
    .select('category, amount')

  const { data: goals } = await supabase
    .from('donation_goals')
    .select('*')

  if (donError) {
    alert('Failed to load financial data')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Financial Report', pageWidth / 2, 58, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 58, { align: 'right' })

  const verified = donations?.filter(d => d.status === 'verified' || d.status === 'completed') || []
  const totalIncome = verified.reduce((sum, d) => sum + d.amount, 0)
  const monthlyRecurring = verified.filter(d => d.frequency === 'monthly').reduce((sum, d) => sum + d.amount, 0)

  const summaryData = [
    ['Total Verified Income', formatNPR(totalIncome)],
    ['Total Donations', String(donations?.length || 0)],
    ['Verified Donations', String(verified.length)],
    ['Monthly Recurring', formatNPR(monthlyRecurring)],
    ['Active Fundraising Goals', String(goals?.filter(g => g.is_active).length || 0)],
  ]

  autoTable(doc, {
    startY: 68,
    theme: 'grid',
    head: [['Metric', 'Value']],
    body: summaryData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, textColor: TEXT_DARK }, 1: { cellWidth: 'auto' } },
    margin: { left: 20, right: 20 },
  })

  let startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10

  if (allocations && allocations.length > 0) {
    const allocMap: Record<string, number> = {}
    allocations.forEach(a => { allocMap[a.category] = (allocMap[a.category] || 0) + a.amount })

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(TEXT_DARK)
    doc.text('Fund Allocation Breakdown', 20, startY)
    startY += 6

    autoTable(doc, {
      startY,
      theme: 'grid',
      head: [['Category', 'Amount']],
      body: Object.entries(allocMap).map(([cat, amt]) => [cat, formatNPR(amt)]),
      headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 80, textColor: TEXT_DARK }, 1: { cellWidth: 'auto', halign: 'right' } },
      margin: { left: 20, right: 20 },
    })
  }

  const activeGoals = goals?.filter(g => g.is_active) || []
  if (activeGoals.length > 0) {
    startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(TEXT_DARK)
    doc.text('Active Fundraising Goals', 20, startY)
    startY += 6

    autoTable(doc, {
      startY,
      theme: 'grid',
      head: [['Goal', 'Raised', 'Target', 'Progress']],
      body: activeGoals.map(g => [g.title, formatNPR(g.raised_amount), formatNPR(g.target_amount), `${Math.round((g.raised_amount / g.target_amount) * 100)}%`]),
      headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: 20, right: 20 },
    })
  }

  addFooter(doc)
  doc.save('financial-report.pdf')
}

async function generateSponsorshipReport(): Promise<void> {
  const { data: sponsorships, error } = await supabase
    .from('sponsorships')
    .select('*, students:student_id(name), profiles:donor_id(full_name)')
    .order('created_at', { ascending: false })

  if (error || !sponsorships?.length) {
    alert('No sponsorship data available')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Sponsorship Report', pageWidth / 2, 58, { align: 'center' })

  const active = sponsorships.filter(s => s.status === 'active').length
  const totalAmount = sponsorships.reduce((sum, s) => sum + s.amount, 0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Total Sponsorships: ${sponsorships.length}  |  Active: ${active}`, 20, 68)
  doc.text(`Total Monthly: ${formatNPR(totalAmount)}`, pageWidth - 20, 68, { align: 'right' })

  const tableData = sponsorships.map(s => [
    (s.students as { name: string } | null)?.name || 'Unknown',
    (s.profiles as { full_name: string } | null)?.full_name || 'Unknown',
    formatNPR(s.amount),
    s.status,
    new Date(s.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
    s.end_date ? new Date(s.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-',
  ])

  autoTable(doc, {
    startY: 76,
    head: [['Student', 'Donor', 'Amount', 'Status', 'Start Date', 'End Date']],
    body: tableData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 30, halign: 'right' }, 3: { cellWidth: 22 }, 4: { cellWidth: 28 }, 5: { cellWidth: 28 } },
    margin: { left: 20, right: 20 },
  })

  addFooter(doc)
  doc.save('sponsorship-report.pdf')
}

async function generateVolunteerReport(): Promise<void> {
  const { data: assignments, error } = await supabase
    .from('volunteer_assignments')
    .select('*, profiles:volunteer_id(full_name, email)')
    .order('start_date', { ascending: false })

  if (error || !assignments?.length) {
    alert('No volunteer data available')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Volunteer Report', pageWidth / 2, 58, { align: 'center' })

  const completed = assignments.filter(a => a.status === 'completed')
  const totalHours = completed.reduce((sum, a) => sum + (a.hours_logged || 0), 0)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Total Assignments: ${assignments.length}  |  Completed: ${completed.length}`, 20, 68)
  doc.text(`Total Hours Logged: ${totalHours}`, pageWidth - 20, 68, { align: 'right' })

  const tableData = assignments.map(a => [
    (a.profiles as unknown as { full_name: string } | null)?.full_name || 'Unknown',
    a.event_name,
    a.role || '-',
    a.status,
    a.hours_logged ? `${a.hours_logged}h` : '-',
    new Date(a.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
  ])

  autoTable(doc, {
    startY: 76,
    head: [['Volunteer', 'Event', 'Role', 'Status', 'Hours', 'Start Date']],
    body: tableData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 8.5 },
    alternateRowStyles: { fillColor: [255, 251, 235] },
    columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 40 }, 2: { cellWidth: 25 }, 3: { cellWidth: 22 }, 4: { cellWidth: 16, halign: 'center' }, 5: { cellWidth: 28 } },
    margin: { left: 20, right: 20 },
  })

  addFooter(doc)
  doc.save('volunteer-report.pdf')
}

async function generateImpactReport(): Promise<void> {
  const { data: metrics, error } = await supabase
    .from('impact_metrics')
    .select('*')
    .order('month', { ascending: false })
    .limit(12)

  const { data: students } = await supabase
    .from('students')
    .select('id')

  if (error) {
    alert('Failed to load impact data')
    return
  }

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  addHeader(doc)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(TEXT_DARK)
  doc.text('Impact Report', pageWidth / 2, 58, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(TEXT_MUTED)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth - 20, 58, { align: 'right' })

  const totalMeals = metrics?.reduce((sum, m) => sum + m.meals_funded, 0) || 0
  const totalBooks = metrics?.reduce((sum, m) => sum + m.books_distributed, 0) || 0
  const totalUniforms = metrics?.reduce((sum, m) => sum + m.uniforms_provided, 0) || 0
  const latestMetrics = metrics?.[0]

  const summaryData: string[][] = [
    ['Total Students Supported', String(students?.length || 0)],
    ['Meals Funded (All Time)', String(totalMeals)],
    ['Books Distributed (All Time)', String(totalBooks)],
    ['Uniforms Provided (All Time)', String(totalUniforms)],
  ]

  if (latestMetrics) {
    summaryData.push(
      ['', ''],
      ['Latest Month', new Date(latestMetrics.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'long' })],
      ['Meals Funded', String(latestMetrics.meals_funded)],
      ['Books Distributed', String(latestMetrics.books_distributed)],
      ['Uniforms Provided', String(latestMetrics.uniforms_provided)],
      ['Attendance Rate', latestMetrics.attendance_rate ? `${latestMetrics.attendance_rate}%` : 'N/A'],
    )
  }

  autoTable(doc, {
    startY: 68,
    theme: 'grid',
    head: [['Metric', 'Value']],
    body: summaryData,
    headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60, textColor: TEXT_DARK }, 1: { cellWidth: 'auto' } },
    margin: { left: 20, right: 20 },
  })

  if (metrics && metrics.length > 1) {
    let startY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(TEXT_DARK)
    doc.text('Monthly Trend (Last 12 Months)', 20, startY)
    startY += 6

    autoTable(doc, {
      startY,
      head: [['Month', 'Meals', 'Books', 'Uniforms', 'Students']],
      body: metrics.map(m => [
        new Date(m.month + '-01').toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
        String(m.meals_funded),
        String(m.books_distributed),
        String(m.uniforms_provided),
        String(m.students_supported),
      ]),
      headStyles: { fillColor: BRAND_COLOR, textColor: '#ffffff', fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 8.5 },
      alternateRowStyles: { fillColor: [255, 251, 235] },
      columnStyles: { 0: { cellWidth: 35 }, 1: { cellWidth: 24, halign: 'center' }, 2: { cellWidth: 24, halign: 'center' }, 3: { cellWidth: 24, halign: 'center' }, 4: { cellWidth: 24, halign: 'center' } },
      margin: { left: 20, right: 20 },
    })
  }

  addFooter(doc)
  doc.save('impact-report.pdf')
}

const generators: Record<ReportType, () => Promise<void>> = {
  donation: generateDonationReport,
  student: generateStudentReport,
  financial: generateFinancialReport,
  sponsorship: generateSponsorshipReport,
  volunteer: generateVolunteerReport,
  impact: generateImpactReport,
}

export function AdminReportsPage() {
  const [loading, setLoading] = useState<ReportType | null>(null)

  async function handleGenerate(key: ReportType) {
    setLoading(key)
    try {
      await generators[key]()
    } catch (err) {
      console.error('Report generation failed:', err)
      alert('Failed to generate report. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600">Generate and download system reports</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => {
          const Icon = report.icon
          const isLoading = loading === report.key
          return (
            <Card key={report.key} variant="bordered" hover>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">{report.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{report.description}</p>
                  <button
                    onClick={() => handleGenerate(report.key)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                    {isLoading ? 'Generating...' : 'Download Report'}
                  </button>
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
