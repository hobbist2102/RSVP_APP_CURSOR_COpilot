import { createClient } from '@/lib/supabase/server'
import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'

export async function getUser(): Promise<User | null> {
  const supabase = createClient()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Error getting user:', error)
      return null
    }
    
    return user
  } catch (error) {
    console.error('Error in getUser:', error)
    return null
  }
}

export async function getUserProfile(userId: string) {
  const supabase = createClient()
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) {
      console.error('Error getting user profile:', error)
      return null
    }
    
    return data
  } catch (error) {
    console.error('Error in getUserProfile:', error)
    return null
  }
}

export async function requireAuth(): Promise<User> {
  const user = await getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  return user
}

export async function requireAdmin(): Promise<User> {
  const user = await requireAuth()
  const profile = await getUserProfile(user.id)
  
  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }
  
  return user
}

export async function signOut() {
  const supabase = createBrowserClient()
  
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      throw error
    }
    
    // Clear any client-side caches
    window.location.href = '/login'
  } catch (error) {
    console.error('Error signing out:', error)
    throw error
  }
}

export function generateRsvpToken(): string {
  // Generate a secure random token for RSVP links
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isStrongPassword(password: string): boolean {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
  return passwordRegex.test(password)
}

export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Format as (XXX) XXX-XXXX for US numbers
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  
  // Return as-is for international numbers
  return phone
}

// Client-side auth helpers
export async function signInWithOtp(email: string) {
  const supabase = createBrowserClient()
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Only allow existing users
      },
    })
    
    if (error) {
      throw error
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error sending OTP:', error)
    throw error
  }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = createBrowserClient()
  
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    })
    
    if (error) {
      throw error
    }
    
    return data
  } catch (error) {
    console.error('Error verifying OTP:', error)
    throw error
  }
}