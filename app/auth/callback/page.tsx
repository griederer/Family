'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/config'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error in auth callback:', error)
          router.push('/auth/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          // Check if user has a family
          const { data: familyMember } = await supabase
            .from('family_members')
            .select('*')
            .eq('user_id', data.session.user.id)
            .single()

          if (familyMember) {
            router.push('/dashboard')
          } else {
            router.push('/auth/onboarding')
          }
        } else {
          router.push('/auth/login')
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error)
        router.push('/auth/login?error=unexpected_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  )
}