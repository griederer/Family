import { useEffect, useState } from 'react'
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useAuthStore } from '@/lib/store/useAuthStore'

export interface FamilyMember {
  id: string
  familyId: string
  email: string
  displayName: string
  photoURL?: string
  role: 'admin' | 'parent' | 'child'
  dateJoined: any
  lastActive: any
}

export interface AuthUser extends User {
  familyMember?: FamilyMember
}

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore()
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const memberData = await getFamilyMemberData(user.uid)
        setFamilyMember(memberData)
        setUser(user)
      } else {
        setFamilyMember(null)
        setUser(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [setUser, setLoading])

  const getFamilyMemberData = async (userId: string): Promise<FamilyMember | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists() && userDoc.data().familyId) {
        const familyId = userDoc.data().familyId
        const memberDoc = await getDoc(doc(db, 'families', familyId, 'members', userId))
        
        if (memberDoc.exists()) {
          return {
            id: userId,
            familyId,
            ...memberDoc.data()
          } as FamilyMember
        }
      }
      return null
    } catch (error) {
      console.error('Error fetching family member data:', error)
      return null
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      return result.user
    } catch (error) {
      throw error
    }
  }

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      await updateProfile(result.user, {
        displayName
      })

      // Create user document
      await setDoc(doc(db, 'users', result.user.uid), {
        email,
        displayName,
        photoURL: result.user.photoURL,
        createdAt: serverTimestamp(),
        familyId: null // Will be set during family creation/joining
      })

      return result.user
    } catch (error) {
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      
      // Create user document if it doesn't exist
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          familyId: null
        })
      }

      return result.user
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error) {
      throw error
    }
  }

  return {
    user,
    familyMember,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    logout,
    resetPassword,
    isAuthenticated: !!user,
    isParent: familyMember?.role === 'parent' || familyMember?.role === 'admin',
    isAdmin: familyMember?.role === 'admin',
    isChild: familyMember?.role === 'child'
  }
}