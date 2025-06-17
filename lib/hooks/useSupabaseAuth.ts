'use client'

import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/config'

export interface FamilyMember {
  id: string
  family_id: string
  user_id: string
  role: 'admin' | 'parent' | 'child'
  display_name: string
  joined_at: string
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('Getting initial session...')
      const { data: { session: initialSession }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting initial session:', error)
      }
      
      console.log('Initial session:', {
        hasSession: !!initialSession,
        hasUser: !!initialSession?.user,
        userId: initialSession?.user?.id,
        userEmail: initialSession?.user?.email
      })
      
      setSession(initialSession)
      setUser(initialSession?.user ?? null)
      
      if (initialSession?.user) {
        await loadFamilyMember(initialSession.user.id)
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          userEmail: session?.user?.email
        })
        
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          await loadFamilyMember(session.user.id)
        } else {
          setFamilyMember(null)
        }
        
        setLoading(false)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const loadFamilyMember = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading family member:', error)
        return
      }

      setFamilyMember(data)
    } catch (error) {
      console.error('Error loading family member:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })
    
    if (error) {
      throw new Error(`Signup failed: ${error.message}`)
    }
    
    return data
  }

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    
    setUser(null)
    setSession(null)
    setFamilyMember(null)
  }

  const createFamily = async (familyName: string) => {
    if (!user) {
      throw new Error('No authenticated user found. Please log in again.')
    }

    console.log('Starting family creation process:', {
      familyName,
      userId: user.id,
      userEmail: user.email
    })

    try {
      // Create family
      console.log('Creating family record...')
      const { data: family, error: familyError } = await supabase
        .from('families')
        .insert({
          name: familyName,
          created_by: user.id,
        })
        .select()
        .single()

      if (familyError) {
        console.error('Family creation error:', familyError)
        throw new Error(`Failed to create family: ${familyError.message}`)
      }

      console.log('Family created successfully:', family)

      // Add user as admin member
      console.log('Adding user as admin member...')
      const { data: member, error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: family.id,
          user_id: user.id,
          role: 'admin',
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        })
        .select()
        .single()

      if (memberError) {
        console.error('Member creation error:', memberError)
        // Try to clean up the family record if member creation fails
        await supabase.from('families').delete().eq('id', family.id)
        throw new Error(`Failed to add family member: ${memberError.message}`)
      }

      console.log('Family member created successfully:', member)

      setFamilyMember(member)
      return { family, member }
    } catch (error: any) {
      console.error('Error in createFamily:', error)
      // Re-throw with more user-friendly message if needed
      if (error.message.includes('duplicate key')) {
        throw new Error('A family with this name already exists. Please choose a different name.')
      }
      throw error
    }
  }

  const joinFamily = async (familyId: string, role: 'parent' | 'child' = 'parent') => {
    if (!user) throw new Error('No authenticated user')

    const { data: member, error } = await supabase
      .from('family_members')
      .insert({
        family_id: familyId,
        user_id: user.id,
        role,
        display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
      })
      .select()
      .single()

    if (error) throw error

    setFamilyMember(member)
    return member
  }

  return {
    user,
    session,
    familyMember,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    createFamily,
    joinFamily,
  }
}