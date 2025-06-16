'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/hooks/useAuth'
import { doc, setDoc, collection, addDoc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Users, Plus, UserPlus } from 'lucide-react'

export default function OnboardingPage() {
  const [step, setStep] = useState<'choice' | 'create' | 'join'>('choice')
  const [familyName, setFamilyName] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { user } = useAuth()
  const router = useRouter()

  const createFamily = async () => {
    if (!user || !familyName.trim()) return

    setIsLoading(true)
    setError('')

    try {
      // Create family document
      const familyRef = doc(collection(db, 'families'))
      const familyId = familyRef.id
      
      await setDoc(familyRef, {
        name: familyName,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        memberCount: 1,
        inviteCode: generateInviteCode()
      })

      // Add user as admin member
      await setDoc(doc(db, 'families', familyId, 'members', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: 'admin',
        dateJoined: serverTimestamp(),
        lastActive: serverTimestamp()
      })

      // Update user document with family ID
      await updateDoc(doc(db, 'users', user.uid), {
        familyId: familyId
      })

      router.push('/dashboard')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const joinFamily = async () => {
    if (!user || !inviteCode.trim()) return

    setIsLoading(true)
    setError('')

    try {
      // TODO: Implement family lookup by invite code
      // This would require a cloud function or different data structure
      setError('Join family feature coming soon!')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const generateInviteCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase()
  }

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
            <Button 
              className="w-full h-16" 
              onClick={() => setStep('create')}
              variant="outline"
            >
              <div className="flex flex-col items-center">
                <Plus className="w-6 h-6 mb-1" />
                <span>Create New Family</span>
                <span className="text-xs text-muted-foreground">Start fresh with your family</span>
              </div>
            </Button>
            
            <Button 
              className="w-full h-16" 
              onClick={() => setStep('join')}
              variant="outline"
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
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('choice')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={createFamily}
                disabled={isLoading || !familyName.trim()}
                className="flex-1"
              >
                {isLoading ? 'Creating...' : 'Create Family'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

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
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setStep('choice')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={joinFamily}
                disabled={isLoading || !inviteCode.trim()}
                className="flex-1"
              >
                {isLoading ? 'Joining...' : 'Join Family'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}