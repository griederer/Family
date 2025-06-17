'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { Users, Plus, UserPlus, Loader2, AlertCircle } from 'lucide-react'

type OnboardingStep = 'loading' | 'choice' | 'create' | 'join'

export default function OnboardingPage() {
  const [step, setStep] = useState<OnboardingStep>('loading')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user, loading: authLoading, createFamily: authCreateFamily, familyMember } = useAuth()
  const router = useRouter()

  // Handle authentication state and redirects
  useEffect(() => {
    console.log('Auth state changed:', { user: !!user, authLoading, familyMember: !!familyMember })
    
    if (authLoading) {
      setStep('loading')
      return
    }

    if (!user) {
      console.log('No user found, redirecting to login')
      router.push('/auth/login')
      return
    }

    if (familyMember) {
      console.log('User already has family membership, redirecting to dashboard')
      router.push('/dashboard')
      return
    }

    // User is authenticated but has no family - show choice
    setStep('choice')
  }, [user, authLoading, familyMember, router])

  const createFamily = async () => {
    const trimmedName = familyName.trim()
    
    console.log('Creating family - Start:', {
      user: !!user,
      familyName: trimmedName,
      isLoading
    })
    
    if (!user) {
      setError('You must be logged in to create a family')
      return
    }

    if (!trimmedName) {
      setError('Please enter a family name')
      return
    }

    if (isLoading) {
      console.log('Already creating family, ignoring click')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Calling authCreateFamily with name:', trimmedName)
      const result = await authCreateFamily(trimmedName)
      console.log('Family created successfully:', result)
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error creating family:', error)
      setError(error.message || 'Failed to create family. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const joinFamily = async () => {
    const trimmedCode = inviteCode.trim()
    
    console.log('Joining family - Start:', {
      user: !!user,
      inviteCode: trimmedCode,
      isLoading
    })
    
    if (!user) {
      setError('You must be logged in to join a family')
      return
    }

    if (!trimmedCode) {
      setError('Please enter an invite code')
      return
    }

    if (isLoading) {
      console.log('Already joining family, ignoring click')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting to join family with code:', trimmedCode)
      // For now, treat invite code as family ID - in production you'd have a proper invite system
      const result = await authCreateFamily(trimmedCode)
      console.log('Joined family successfully:', result)
      
      await new Promise(resolve => setTimeout(resolve, 100))
      
      router.push('/dashboard')
    } catch (error: any) {
      console.error('Error joining family:', error)
      setError(error.message || 'Failed to join family. Please check the invite code and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStepChange = (newStep: OnboardingStep) => {
    if (isLoading) return
    setError('')
    setStep(newStep)
  }

  // Loading state
  if (step === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Choice step
  if (step === 'choice') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Welcome to FamilyHub
            </CardTitle>
            <CardDescription>
              Let&apos;s set up your family organization
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            
            <Button 
              className="w-full h-16" 
              onClick={() => handleStepChange('create')}
              variant="outline"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center">
                <Plus className="w-6 h-6 mb-1" />
                <span>Create New Family</span>
                <span className="text-xs text-muted-foreground">Start fresh with your family</span>
              </div>
            </Button>
            
            <Button 
              className="w-full h-16" 
              onClick={() => handleStepChange('join')}
              variant="outline"
              disabled={isLoading}
            >
              <div className="flex flex-col items-center">
                <UserPlus className="w-6 h-6 mb-1" />
                <span>Join Existing Family</span>
                <span className="text-xs text-muted-foreground">Use an invite code</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create family step
  if (step === 'create') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Create Your Family</CardTitle>
            <CardDescription>
              Give your family organization a name
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="relative">
                <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Family Name (e.g., The Smiths)"
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  className="pl-10"
                  required
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && familyName.trim() && !isLoading) {
                      createFamily()
                    }
                  }}
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleStepChange('choice')}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={createFamily}
                disabled={isLoading || !familyName.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Family'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Join family step
  if (step === 'join') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Join Family</CardTitle>
            <CardDescription>
              Enter the invite code shared by your family
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Invite Code"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                className="text-center text-lg tracking-wider"
                maxLength={6}
                required
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && inviteCode.trim() && !isLoading) {
                    joinFamily()
                  }
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => handleStepChange('choice')}
                className="flex-1"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button 
                onClick={joinFamily}
                disabled={isLoading || !inviteCode.trim()}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  'Join Family'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}