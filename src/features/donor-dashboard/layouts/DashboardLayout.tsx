import { useState, type ReactNode } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { Sidebar, type Section } from '../components/Sidebar'
import { Topbar } from '../components/Topbar'

interface DashboardLayoutProps {
  section: Section
  onSectionChange: (section: Section) => void
  children: ReactNode
}

export function DashboardLayout({ section, onSectionChange, children }: DashboardLayoutProps) {
  const { user, profile, signOut } = useAuth()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex overflow-hidden bg-orange-50">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(c => !c)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
        onSignOut={signOut}
        userName={profile?.full_name || 'Donor'}
        activeSection={section}
        onSectionChange={(s) => {
          onSectionChange(s)
          setMobileSidebarOpen(false)
        }}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          userName={profile?.full_name || 'Donor'}
          onMenuClick={() => setMobileSidebarOpen(true)}
          userId={user?.id}
          onSectionChange={onSectionChange}
        />

        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
