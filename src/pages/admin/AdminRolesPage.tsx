import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminRolesPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      navigate('/super-admin/roles', { replace: true })
    }
  }, [profile, navigate])

  return null
}
