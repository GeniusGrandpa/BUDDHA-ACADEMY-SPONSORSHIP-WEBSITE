import { useState, useEffect, useRef } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../providers/AuthContext'
import { supabase } from '../../../lib/supabase'
import type { Role, PermissionCode } from '../types/permissions'
import { hasPermission, hasAnyPermission, isAdminOrAbove } from '../services/permissions'
import { getDashboardForRole } from '../../../config/navigation'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
  requiredRoles?: Role[]
  requiredPermission?: PermissionCode
  requiredAnyPermission?: PermissionCode[]
}

function SigningOut() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-2xl text-red-600 font-bold">!</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Access Revoked</h1>
        <p className="text-gray-600 mb-2">
          Your session has been terminated because your account does not have permission for this area.
        </p>
        <p className="text-gray-500 text-sm">Redirecting to login...</p>
        <div className="mt-4 flex justify-center">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-orange-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-600 text-sm">Verifying access...</p>
      </div>
    </div>
  )
}

export function ProtectedRoute({
  children,
  adminOnly = false,
  requiredRoles,
  requiredPermission,
  requiredAnyPermission,
}: ProtectedRouteProps) {
  const { user, profile, loading, signOut, refreshProfile } = useAuth()
  const location = useLocation()
  const signedOut = useRef(false)
  const [serverRole, setServerRole] = useState<string | null>(null)
  const [serverStatus, setServerStatus] = useState<string | null>(null)
  const [checkingServer, setCheckingServer] = useState(true)
  const userRole = (serverRole || profile?.role) as Role | undefined

  useEffect(() => {
    if (!user) {
      setCheckingServer(false)
      return
    }

    let cancelled = false
    setCheckingServer(true)

    ;(async () => {
      try {
        const result = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', user.id)
          .maybeSingle()
        if (cancelled) return
        const data = result.data as { role: string; status: string } | null
        if (!result.error && data) {
          setServerRole(data.role)
          setServerStatus(data.status)

          if (data.role !== profile?.role || data.status !== profile?.status) {
            refreshProfile()
          }
        }
      } catch {
      }
      if (!cancelled) setCheckingServer(false)
    })()

    return () => { cancelled = true }
  }, [user, user?.id, location.pathname, profile?.role, profile?.status, refreshProfile])

  const effectiveStatus = serverStatus || profile?.status

  useEffect(() => {
    if ((effectiveStatus === 'suspended' || effectiveStatus === 'banned') && !signedOut.current) {
      signedOut.current = true
      signOut()
    }
  }, [effectiveStatus, signOut])

  if (loading || checkingServer) {
    return <LoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (effectiveStatus === 'suspended' || effectiveStatus === 'banned') {
    return <SigningOut />
  }

  const denied =
    (adminOnly && !isAdminOrAbove(userRole)) ||
    (requiredRoles !== undefined && requiredRoles.length > 0 && (!userRole || !requiredRoles.includes(userRole))) ||
    (requiredPermission !== undefined && !hasPermission(userRole, requiredPermission)) ||
    (requiredAnyPermission !== undefined && !hasAnyPermission(userRole, requiredAnyPermission))

  if (denied) {
    const redirect = profile?.role ? getDashboardForRole(profile.role as Role) : '/'
    return <Navigate to={redirect} replace />
  }

  return <>{children}</>
}
