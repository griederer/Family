'use client'

import { useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DebugAuthPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  
  const { user, signIn, signUp } = useAuth()

  const handleSignIn = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await signIn(email, password)
      setMessage(`Sign in successful: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      setMessage(`Sign in error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async () => {
    setIsLoading(true)
    setMessage('')
    
    try {
      const result = await signUp(email, password, 'Test User')
      setMessage(`Sign up result: ${JSON.stringify(result, null, 2)}`)
    } catch (error: any) {
      setMessage(`Sign up error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Debug Authentication</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Current User State:</h3>
            <pre className="bg-muted p-3 rounded text-sm overflow-auto">
              {JSON.stringify({ user: user ? { id: user.id, email: user.email } : null }, null, 2)}
            </pre>
          </div>

          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleSignIn} disabled={isLoading || !email || !password}>
              Sign In
            </Button>
            <Button onClick={handleSignUp} disabled={isLoading || !email || !password} variant="outline">
              Sign Up
            </Button>
          </div>

          {message && (
            <div className="bg-muted p-3 rounded">
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}