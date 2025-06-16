'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireFamily?: boolean
  requireParent?: boolean
  requireAdmin?: boolean
  fallback?: React.ReactNode
}

export function ProtectedRoute({ 
  children, 
  requireFamily = false,
  requireParent = false,
  requireAdmin = false,
  fallback = <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
  </div>
}: ProtectedRouteProps) {
  const { user, familyMember, loading } = useAuth()
  const router = useRouter()

  // Computed properties
  const isParent = familyMember?.role === 'parent' || familyMember?.role === 'admin'
  const isAdmin = familyMember?.role === 'admin'

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login')
        return
      }

      if (requireFamily && !familyMember) {
        router.push('/auth/onboarding')
        return
      }

      if (requireParent && !isParent) {
        router.push('/dashboard')
        return
      }

      if (requireAdmin && !isAdmin) {
        router.push('/dashboard')
        return
      }
    }
  }, [user, familyMember, loading, requireFamily, requireParent, requireAdmin, isParent, isAdmin, router])

  if (loading) {
    return fallback
  }

  if (!user) {
    return null
  }

  if (requireFamily && !familyMember) {
    return null
  }

  if (requireParent && !isParent) {
    return null
  }

  if (requireAdmin && !isAdmin) {
    return null
  }

  return <>{children}</>
}