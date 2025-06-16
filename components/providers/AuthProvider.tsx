'use client'

import { useAuth } from '@/lib/hooks/useAuth'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Initialize auth state
  useAuth()
  
  return <>{children}</>
}