import { useState, useCallback, useMemo, useEffect, useRef, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { supabase } from '../../../lib/supabase'
import { useAuth } from '../../../context/AuthContext'
import { useDashboardData } from '../hooks/useDashboardData'
import { useDonorTransactions } from '../hooks/useDonorTransactions'
import { useNotifications } from '../hooks/useNotifications'
import { useSponsorshipTimeline } from '../hooks/useSponsorshipTimeline'
import { useTeacherReports } from '../hooks/useTeacherReports'

import { DashboardLayout } from '../layouts/DashboardLayout'
import { DashboardCard } from '../../../components/ui/DashboardCard'
import { DashboardStatCard } from '../../../components/ui/DashboardStatCard'
import { SponsoredStudents } from '../components/SponsoredStudents'
import { SkeletonLoading } from '../components/SkeletonLoading'
import { TransactionSection } from '../components/transactions/TransactionSection'

import { ImpactTransparency } from '../components/ImpactTransparency'
import { StudentProgressUpdates } from '../components/StudentProgressUpdates'
import { SponsorshipTimeline } from '../components/SponsorshipTimeline'
import { ReceiptDownloads } from '../components/ReceiptDownloads'
import { NotificationCenter } from '../components/NotificationCenter'
import { ActivityFeed } from '../../../components/activities/ActivityFeed'
import { DonationChart } from '../charts/DonationChart'
import { ImpactTimeline } from '../components/ImpactTimeline'
import type { Section } from '../components/Sidebar'
import type { Notification as NotifType } from '../../../types/features'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { Textarea } from '../../../components/ui/Textarea'
import { ProfileSkeleton } from '../../../components/ui/LoadingSkeleton'
import { useLanguage, languages } from '../../../context/LanguageContext'
import { formatNPR } from '../../../utils/currency'
import { COUNTRY_CODES } from '../../../data/countryCodes'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 18) return 'Good Afternoon'
  return 'Good Evening'
}

export function DashboardPage() {
  const { user, profile, refreshProfile } = useAuth()
  const userId = user?.id
  const [searchParams] = useSearchParams()
  const initialSection = (searchParams.get('tab') === 'notifications' ? 'updates' : 'overview') as Section

  const {
    donations,
    sponsorships,
    donorStats,
    loading,
    donorImpact,
    contributedStudents,
  } = useDashboardData(userId)

  const { transactions, loading: txLoading } = useDonorTransactions(userId)
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading: notifLoading } = useNotifications(userId)

  const { events } = useSponsorshipTimeline(userId)
  const { latestReports } = useTeacherReports(userId)

  const [section, setSection] = useState<Section>(initialSection)

  const prevDonationsRef = useRef(donations)
  useEffect(() => {
    const prev = prevDonationsRef.current
    for (const donation of donations) {
      const prevDonation = prev.find(d => d.id === donation.id)
      if (prevDonation && prevDonation.status !== 'completed' && donation.status === 'completed') {
        toast.success(
          `Donation of ${formatNPR(donation.amount)} verified! Thank you for your contribution.`,
          { duration: 5000 },
        )
      }
    }
    prevDonationsRef.current = donations
  }, [donations])

  const totalDonated = donorStats?.totalDonated ?? donations.reduce((sum, d) => sum + d.amount, 0)
  const activeSponsorships = sponsorships.filter(s => s.status === 'active')
  const totalSponsored = sponsorships.length
  const lastDonationDate = donorStats?.lastDonationDate ?? ''

  const [profileForm, setProfileForm] = useState({ full_name: '', phone: '', phone_code: '+1', country: '', bio: '' })
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)

  useEffect(() => {
    if (profile) {
      setProfileForm({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        phone_code: (profile as Record<string, unknown>).phone_code as string || '+1',
        country: profile.country || '',
        bio: profile.bio || '',
      })
    }
  }, [profile])

  const { language, setLanguage } = useLanguage()
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [timezone, setTimezone] = useState(localStorage.getItem('timezone') || 'Asia/Kathmandu')

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setProfileSaving(true)
    const { error } = await supabase.from('profiles').update({
      full_name: profileForm.full_name,
      phone: profileForm.phone || null,
      phone_code: profileForm.phone_code || null,
      country: profileForm.country,
      bio: profileForm.bio || null,
    }).eq('id', user.id)
    setProfileSaving(false)
    if (!error) {
      setProfileSaved(true)
      refreshProfile()
      setTimeout(() => setProfileSaved(false), 3000)
    }
  }

  async function handleSaveSettings(e: FormEvent) {
    e.preventDefault()
    setSettingsSaving(true)
    localStorage.setItem('timezone', timezone)
    setSettingsSaving(false)
    setSettingsSaved(true)
    setTimeout(() => setSettingsSaved(false), 3000)
  }

  const countryOptions = [
    { value: '', label: 'Select your country' },
    { value: 'United States', label: 'United States' },
    { value: 'United Kingdom', label: 'United Kingdom' },
    { value: 'Canada', label: 'Canada' },
    { value: 'Australia', label: 'Australia' },
    { value: 'Nepal', label: 'Nepal' },
    { value: 'India', label: 'India' },
    { value: 'Germany', label: 'Germany' },
    { value: 'France', label: 'France' },
    { value: 'Netherlands', label: 'Netherlands' },
    { value: 'Switzerland', label: 'Switzerland' },
    { value: 'Japan', label: 'Japan' },
    { value: 'Singapore', label: 'Singapore' },
    { value: 'Other', label: 'Other' },
  ]

  const timezoneOptions = [
    { value: 'Asia/Kathmandu', label: 'Asia/Kathmandu (UTC+5:45)' },
    { value: 'America/New_York', label: 'America/New_York (UTC-5)' },
    { value: 'America/Chicago', label: 'America/Chicago (UTC-6)' },
    { value: 'America/Denver', label: 'America/Denver (UTC-7)' },
    { value: 'America/Los_Angeles', label: 'America/Los_Angeles (UTC-8)' },
    { value: 'Europe/London', label: 'Europe/London (UTC+0)' },
    { value: 'Europe/Berlin', label: 'Europe/Berlin (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (UTC+9)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (UTC+11)' },
  ]

  const handleMarkAsRead = useCallback(async (id: string) => {
    try { await markAsRead(id) } catch { }
  }, [markAsRead])

  const handleMarkAllAsRead = useCallback(async () => {
    try { await markAllAsRead() } catch { }
  }, [markAllAsRead])

  const impactData = useMemo(() => donorImpact || {
    meals_funded: 0, books_donated: 0, students_supported: 0, uniforms_provided: 0, total_donated: totalDonated,
  }, [donorImpact, totalDonated])

  if (loading) {
    return (
      <DashboardLayout section={section} onSectionChange={setSection}>
        <div className="h-screen flex items-start justify-center pt-8">
          <div className="w-full">
            <SkeletonLoading />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout section={section} onSectionChange={setSection}>
      {section === 'overview' && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{getGreeting()}, {profile?.full_name || 'Donor'}</h1>
              <p className="text-sm text-gray-500 mt-1">
                Your support continues to make a meaningful impact at Buddha Academy.
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-400">All amounts in Nepalese Rupees (NPR)</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <DashboardStatCard
              label="Total Donated"
              value={formatNPR(totalDonated)}
              description="Lifetime contributions"
            />
            <DashboardStatCard
              label="Active Sponsorships"
              value={String(activeSponsorships.length)}
              description="Currently supporting"
            />
            <DashboardStatCard
              label="Students Supported"
              value={String(totalSponsored)}
              description={totalSponsored !== 1 ? 'Lives changed' : 'Life changed'}
            />
            <DashboardStatCard
              label="Last Donation"
              value={lastDonationDate
                ? new Date(lastDonationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '-'}
              description={lastDonationDate ? 'Most recent gift' : 'No donations yet'}
            />
          </div>

          {contributedStudents.length > 0 ? (
            <SponsoredStudents contributions={contributedStudents} />
          ) : (
            <DashboardCard title="Sponsorships" description="You haven't sponsored any students yet">
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 mb-4">Start your journey by sponsoring a child's education.</p>
                <a href="/students" className="inline-flex items-center text-sm font-medium text-orange-600 hover:text-orange-700">
                  Browse students
                </a>
              </div>
            </DashboardCard>
          )}

          {impactData.total_donated > 0 && (
            <ImpactTransparency impact={impactData} />
          )}

          <div className="grid lg:grid-cols-2 gap-6">
            <DashboardCard title="Donation History" description="Your monthly contributions over time">
              <DonationChart donations={donations} />
            </DashboardCard>
            <DashboardCard title="Impact Timeline" description="Key moments from your journey">
              <ImpactTimeline events={events} />
            </DashboardCard>
          </div>
        </div>
      )}

      {section === 'students' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Sponsored Students</h2>
            <p className="text-sm text-gray-500 mt-1">Your sponsored children and their progress</p>
          </div>
          {contributedStudents.length > 0 ? (
            <>
              <SponsoredStudents contributions={contributedStudents} />
              <StudentProgressUpdates reports={latestReports} students={sponsorships} />
            </>
          ) : (
            <DashboardCard>
              <div className="text-center py-8">
                <p className="text-sm text-gray-500">No sponsored students yet.</p>
              </div>
            </DashboardCard>
          )}
        </div>
      )}

      {section === 'donations' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Your Transactions</h2>
            <p className="text-sm text-gray-500 mt-1">Every donation, every allocation fully transparent</p>
          </div>
          <TransactionSection
            transactions={transactions}
            loading={txLoading}
            donorName={profile?.full_name || 'Donor'}
            donorEmail={user?.email || ''}
          />
          <ReceiptDownloads
            transactions={transactions}
            donorName={profile?.full_name || 'Donor'}
            donorEmail={user?.email || ''}
          />
        </div>
      )}

      {section === 'updates' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Updates & Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Latest news from your sponsored students</p>
          </div>
          <NotificationCenter
            notifications={notifications as unknown as NotifType[]}
            unreadCount={unreadCount}
            onMarkAsRead={handleMarkAsRead}
            onMarkAllAsRead={handleMarkAllAsRead}
            loading={notifLoading}
          />
          <ActivityFeed />
          <SponsorshipTimeline events={events} />
        </div>
      )}

      {section === 'profile' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Profile</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your personal information</p>
          </div>

          {!profile ? (
            <ProfileSkeleton />
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-medium shrink-0">
                  {profile.full_name?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{profile.full_name}</h3>
                  <p className="text-sm text-gray-500">{profile.email}</p>
                  <p className="text-xs text-gray-500 capitalize">{profile.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="p-6 space-y-5">
                <Input
                  label="Full Name"
                  value={profileForm.full_name}
                  onChange={(e) => setProfileForm(p => ({ ...p, full_name: e.target.value }))}
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <div className="flex gap-2">
                    <select
                      value={profileForm.phone_code}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone_code: e.target.value }))}
                      className="w-40 px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    >
                      {COUNTRY_CODES.map(cc => (
                        <option key={cc.code} value={cc.code}>{cc.label}</option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="555-000-0000"
                      className="flex-1 px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
                <Select
                  label="Country"
                  options={countryOptions}
                  value={profileForm.country}
                  onChange={(e) => setProfileForm(p => ({ ...p, country: e.target.value }))}
                />
                <Textarea
                  label="Bio"
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us a little about yourself..."
                  rows={3}
                />
                <div className="flex items-center gap-3 pt-2">
                  <Button type="submit" disabled={profileSaving}>
                    {profileSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  {profileSaved && (
                    <span className="text-sm text-emerald-600">
                      Profile updated
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {section === 'settings' && (
        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Customize your experience</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Language</h3>
              </div>
              <p className="text-sm text-gray-500 mt-1">Choose your preferred language</p>
            </div>
            <form onSubmit={handleSaveSettings} className="p-6 space-y-5">
              <Select
                label="Display Language"
                options={languages.map(l => ({ value: l.code, label: `${l.shortLabel} ${l.nativeLabel}` }))}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
              <div className="border-t border-gray-100 pt-5">
                  <div className="mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Timezone</h3>
                </div>
                <Select
                  label="Your Timezone"
                  options={timezoneOptions}
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                />
              </div>
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-base font-semibold text-gray-900 mb-1">Account</h3>
                <p className="text-sm text-gray-500 mb-4">Your account details</p>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900 font-medium">{user?.email || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role</span>
                    <span className="text-gray-900 font-medium capitalize">{profile?.role?.replace('_', ' ') || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member Since</span>
                    <span className="text-gray-900 font-medium">
                      {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '-'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" disabled={settingsSaving}>
                  {settingsSaving ? 'Saving...' : 'Save Settings'}
                </Button>
                  {settingsSaved && (
                  <span className="text-sm text-emerald-600">
                    Settings saved
                  </span>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
