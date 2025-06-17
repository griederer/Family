'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DemoPage() {
  const router = useRouter()

  useEffect(() => {
    // Set a demo user in localStorage to bypass auth
    const demoUser = {
      id: 'demo-user-123',
      email: 'demo@familyhub.app',
      user_metadata: {
        display_name: 'Demo User'
      }
    }
    
    const demoFamilyMember = {
      id: 'demo-member-123',
      family_id: 'demo-family-123',
      user_id: 'demo-user-123',
      role: 'admin',
      display_name: 'Demo User',
      joined_at: new Date().toISOString()
    }

    // Store demo data
    localStorage.setItem('demo_user', JSON.stringify(demoUser))
    localStorage.setItem('demo_family_member', JSON.stringify(demoFamilyMember))
    localStorage.setItem('demo_mode', 'true')

    // Redirect to dashboard
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Setting up demo mode...</p>
    </div>
  )
}