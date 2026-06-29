import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { getDonationsByDonor } from '../services/donations'
import { getSponsorshipsByDonor } from '../services/sponsorships'
import type { Donation, Sponsorship, Student } from '../types/database'
import { DashboardSkeleton } from '../components/ui/LoadingSkeleton'

type SponsorshipWithStudent = Sponsorship & { student: Student }

export function DashboardPage() {
  const { user, profile } = useAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [sponsorships, setSponsorships] = useState<SponsorshipWithStudent[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    try {
      const [donationsData, sponsorshipsData] = await Promise.all([
        getDonationsByDonor(user!.id),
        getSponsorshipsByDonor(user!.id),
      ])
      setDonations(donationsData)
      setSponsorships(sponsorshipsData as SponsorshipWithStudent[])
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) loadData()
  }, [user, loadData])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0)
  const activeSponsorships = sponsorships.filter(s => s.status === 'active').length

  if (loading) return <DashboardSkeleton />

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'Donor'}!
          </h1>
          <p className="text-gray-600">
            Track your sponsored children and donation history.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card variant="bordered" className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <div>
              <div className="text-sm opacity-90">Total Donated</div>
              <div className="text-3xl font-bold">${totalDonated}</div>
            </div>
          </Card>

          <Card variant="bordered">
            <div>
              <div className="text-sm text-gray-600">Active Sponsorships</div>
              <div className="text-3xl font-bold text-gray-900">{activeSponsorships}</div>
            </div>
          </Card>

          <Card variant="bordered">
            <div>
              <div className="text-sm text-gray-600">Total Donations</div>
              <div className="text-3xl font-bold text-gray-900">{donations.length}</div>
            </div>
          </Card>

          <Card variant="bordered">
            <div>
              <div className="text-sm text-gray-600">Member Since</div>
              <div className="text-lg font-bold text-gray-900">
                {profile?.created_at ? formatDate(profile.created_at) : 'N/A'}
              </div>
            </div>
          </Card>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sponsored Children</h2>
          {sponsorships.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sponsorships.map((sponsorship) => {
                const student = sponsorship.student
                return (
                  <Card key={sponsorship.id} variant="bordered" className="hover:shadow-lg transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                      <img
                        src={student?.photo_url || 'https://images.pexels.com/photos/1171086/pexels-photo-1171086.jpeg?auto=compress&cs=tinysrgb&w=200'}
                        alt={student?.name || 'Student'}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{student?.name}</h3>
                        <p className="text-sm text-gray-600">Age {student?.age} · Grade {student?.grade}</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly Amount</span>
                        <span className="font-medium text-gray-900">${sponsorship.amount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <Badge variant={(sponsorship.status === 'active' ? 'success' : 'default') as 'success' | 'default'}>
                          {sponsorship.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started</span>
                        <span className="text-gray-900">{formatDate(sponsorship.start_date)}</span>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card variant="bordered" className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sponsored Children Yet</h3>
              <p className="text-gray-600 mb-4">
                Start sponsoring a child today and make a lasting impact.
              </p>
              <Link to="/students">
                <Button>Browse Students</Button>
              </Link>
            </Card>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Donation History</h2>
          {donations.length > 0 ? (
            <Card variant="bordered" className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frequency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donations.map((donation) => (
                      <tr key={donation.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(donation.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${donation.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                          {donation.frequency}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Badge variant={(donation.status === 'completed' || donation.status === 'verified' || donation.status === 'received' ? 'success' : 'default') as 'success' | 'default'}>
                            {donation.status === 'completed' ? 'Verified' : donation.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card variant="bordered" className="text-center py-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Donations Yet</h3>
              <p className="text-gray-600 mb-4">
                Make your first donation and start making a difference.
              </p>
              <Link to="/donate">
                <Button>Make a Donation</Button>
              </Link>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}
