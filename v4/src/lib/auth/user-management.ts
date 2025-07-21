import { createClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

type Profile = Database['public']['Tables']['profiles']['Row']
type NewProfile = Database['public']['Tables']['profiles']['Insert']
type UpdateProfile = Database['public']['Tables']['profiles']['Update']

export class UserManagementService {
  private supabase = createClient()
  private serviceClient = createServiceRoleClient()

  // Create new user with profile (admin only)
  async createUser(userData: {
    email: string
    password: string
    name: string
    role?: 'admin' | 'staff' | 'couple'
    phone?: string
    company?: string
  }) {
    try {
      // Use service role client to create user
      const { data: authUser, error: authError } = await this.serviceClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: userData.name,
          role: userData.role || 'staff',
          phone: userData.phone,
          company: userData.company,
        }
      })

      if (authError) {
        throw new Error(`Failed to create user: ${authError.message}`)
      }

      if (!authUser.user) {
        throw new Error('User creation failed: No user returned')
      }

      // Profile should be created automatically by the trigger
      // Let's verify it was created
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.user.id)
        .single()

      if (profileError) {
        console.error('Profile creation failed:', profileError)
        // Try to create it manually if trigger failed
        const { data: manualProfile, error: manualError } = await this.supabase
          .from('profiles')
          .insert({
            id: authUser.user.id,
            name: userData.name,
            email: userData.email,
            role: userData.role || 'staff',
            phone: userData.phone,
            company: userData.company,
          })
          .select()
          .single()

        if (manualError) {
          throw new Error(`Failed to create profile: ${manualError.message}`)
        }

        return {
          user: authUser.user,
          profile: manualProfile
        }
      }

      return {
        user: authUser.user,
        profile
      }
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No profile found
        }
        throw new Error(`Failed to get user profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  // Update user profile
  async updateUserProfile(userId: string, updates: UpdateProfile): Promise<Profile> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw error
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get users: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting all users:', error)
      throw error
    }
  }

  // Update user role (admin only)
  async updateUserRole(userId: string, role: 'admin' | 'staff' | 'couple'): Promise<Profile> {
    try {
      // Update profile role
      const { data, error } = await this.supabase
        .from('profiles')
        .update({ 
          role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update user role: ${error.message}`)
      }

      // Also update auth user metadata
      const { error: authError } = await this.serviceClient.auth.admin.updateUserById(
        userId,
        {
          user_metadata: { role }
        }
      )

      if (authError) {
        console.warn('Failed to update auth metadata:', authError.message)
        // Don't throw here as profile update succeeded
      }

      return data
    } catch (error) {
      console.error('Error updating user role:', error)
      throw error
    }
  }

  // Delete user (admin only)
  async deleteUser(userId: string): Promise<void> {
    try {
      // Delete from auth (this will cascade to profile via foreign key)
      const { error: authError } = await this.serviceClient.auth.admin.deleteUser(userId)

      if (authError) {
        throw new Error(`Failed to delete user: ${authError.message}`)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      throw error
    }
  }

  // Check if user has specific role
  async hasRole(userId: string, role: 'admin' | 'staff' | 'couple'): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId)
      return profile?.role === role
    } catch (error) {
      console.error('Error checking user role:', error)
      return false
    }
  }

  // Check if user is admin
  async isAdmin(userId: string): Promise<boolean> {
    return await this.hasRole(userId, 'admin')
  }

  // Grant event access to user
  async grantEventAccess(
    eventId: number, 
    userId: string, 
    role: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer'
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('event_users')
        .insert({
          event_id: eventId,
          user_id: userId,
          role
        })

      if (error) {
        throw new Error(`Failed to grant event access: ${error.message}`)
      }
    } catch (error) {
      console.error('Error granting event access:', error)
      throw error
    }
  }

  // Revoke event access from user
  async revokeEventAccess(eventId: number, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('event_users')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to revoke event access: ${error.message}`)
      }
    } catch (error) {
      console.error('Error revoking event access:', error)
      throw error
    }
  }

  // Get user's event access
  async getUserEventAccess(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('event_users')
        .select(`
          event_id,
          role,
          created_at,
          wedding_events (
            id,
            title,
            couple_names,
            start_date,
            end_date
          )
        `)
        .eq('user_id', userId)

      if (error) {
        throw new Error(`Failed to get user event access: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting user event access:', error)
      return []
    }
  }

  // Send password reset email
  async sendPasswordReset(email: string): Promise<void> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
      })

      if (error) {
        throw new Error(`Failed to send password reset: ${error.message}`)
      }
    } catch (error) {
      console.error('Error sending password reset:', error)
      throw error
    }
  }

  // Verify if user can access specific event
  async canAccessEvent(userId: string, eventId: number): Promise<boolean> {
    try {
      // Check if user is event creator
      const { data: event, error: eventError } = await this.supabase
        .from('wedding_events')
        .select('created_by')
        .eq('id', eventId)
        .single()

      if (eventError) {
        return false
      }

      if (event.created_by === userId) {
        return true
      }

      // Check if user has explicit access
      const { data: access, error: accessError } = await this.supabase
        .from('event_users')
        .select('id')
        .eq('event_id', eventId)
        .eq('user_id', userId)
        .single()

      if (accessError && accessError.code !== 'PGRST116') {
        return false
      }

      // Check if user is admin
      const isAdmin = await this.isAdmin(userId)
      
      return !!access || isAdmin
    } catch (error) {
      console.error('Error checking event access:', error)
      return false
    }
  }
}

// Export singleton instance
export const userManagement = new UserManagementService()