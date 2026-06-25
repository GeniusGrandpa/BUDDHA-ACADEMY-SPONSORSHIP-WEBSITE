import { useEffect, useState } from 'react'
import { Card } from '../../components/ui/Card'
import { getAllContactSubmissions, updateContactSubmissionStatus } from '../../services/contact'
import type { ContactSubmission } from '../../types/database'
import { TableSkeleton } from '../../components/ui/LoadingSkeleton'

export function AdminContactsPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = async () => {
    try {
      const data = await getAllContactSubmissions()
      setSubmissions(data)
    } catch (error) {
      console.error('Error loading submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (id: string, status: ContactSubmission['status']) => {
    try {
      await updateContactSubmissionStatus(id, status)
      setSubmissions(submissions.map(s => s.id === id ? { ...s, status } : s))
    } catch (error) {
      console.error('Error updating submission:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors = {
    unread: 'bg-red-100 text-red-700',
    read: 'bg-amber-100 text-amber-700',
    replied: 'bg-emerald-100 text-emerald-700',
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Contact Submissions</h1>
        <p className="text-gray-600">View and manage contact form messages</p>
      </div>

      {loading ? (
        <TableSkeleton />
      ) : submissions.length === 0 ? (
        <Card variant="bordered" className="text-center py-8 text-gray-500">
          No contact submissions
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card key={submission.id} variant="bordered" className={`${
              submission.status === 'unread' ? 'border-l-4 border-l-amber-500' : ''
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-medium text-gray-900">{submission.subject}</h3>
                  <div className="text-sm text-gray-600">
                    From: {submission.name} ({submission.email})
                    {submission.phone && <span className="ml-2">· {submission.phone}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[submission.status]}`}>
                    {submission.status}
                  </span>
                  <select
                    value={submission.status}
                    onChange={(e) => handleStatusChange(submission.id, e.target.value as ContactSubmission['status'])}
                    className="text-xs border rounded px-2 py-1"
                    aria-label="Change status"
                  >
                    <option value="unread">Unread</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              </div>
              <p className="text-gray-700 whitespace-pre-line">{submission.message}</p>
              <div className="mt-3 text-xs text-gray-400">
                {formatDate(submission.created_at)}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
