import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export function AdminUsersPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      navigate('/super-admin/users', { replace: true })
    }
  }, [profile, navigate])

  return null
}
