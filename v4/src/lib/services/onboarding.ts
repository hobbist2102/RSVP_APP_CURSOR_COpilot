import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import type { 
  EmailProviderConfig, 
  WhatsAppConfig, 
  AdminProfile, 
  BrandingConfig, 
  EventDefaults,
  OnboardingComplete 
} from '@/lib/validations/admin'

export class OnboardingService {
  private supabase = createClient()
  private serviceClient = createServiceRoleClient()

  // Save email provider configuration
  async saveEmailProvider(config: EmailProviderConfig, adminId: string) {
    try {
      // Store in admin's profile or a separate config table
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          email_config: config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save email provider: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error saving email provider:', error)
      throw error
    }
  }

  // Save WhatsApp configuration
  async saveWhatsAppConfig(config: WhatsAppConfig, adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          whatsapp_config: config,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save WhatsApp config: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error saving WhatsApp config:', error)
      throw error
    }
  }

  // Update admin profile
  async updateAdminProfile(profile: AdminProfile, adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          company: profile.company,
          bio: profile.bio,
          role: 'admin',
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update admin profile: ${error.message}`)
      }

      // Also update auth user metadata
      const { error: authError } = await this.serviceClient.auth.admin.updateUserById(
        adminId,
        {
          user_metadata: {
            name: profile.name,
            role: 'admin',
            phone: profile.phone,
            company: profile.company,
          }
        }
      )

      if (authError) {
        console.warn('Failed to update auth metadata:', authError.message)
      }

      return data
    } catch (error) {
      console.error('Error updating admin profile:', error)
      throw error
    }
  }

  // Save branding configuration
  async saveBranding(branding: BrandingConfig, adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          branding_config: branding,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save branding: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error saving branding:', error)
      throw error
    }
  }

  // Save event defaults
  async saveEventDefaults(defaults: EventDefaults, adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          event_defaults: defaults,
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to save event defaults: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error saving event defaults:', error)
      throw error
    }
  }

  // Complete onboarding process
  async completeOnboarding(config: OnboardingComplete, adminId: string) {
    try {
      // Save all configurations in a single transaction
      const { data, error } = await this.supabase
        .from('profiles')
        .update({
          name: config.adminProfile.name,
          email: config.adminProfile.email,
          phone: config.adminProfile.phone,
          company: config.adminProfile.company,
          bio: config.adminProfile.bio,
          role: 'admin',
          email_config: config.emailProvider,
          whatsapp_config: config.whatsappConfig,
          branding_config: config.branding,
          event_defaults: config.eventDefaults,
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', adminId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to complete onboarding: ${error.message}`)
      }

      // Update auth metadata
      const { error: authError } = await this.serviceClient.auth.admin.updateUserById(
        adminId,
        {
          user_metadata: {
            name: config.adminProfile.name,
            role: 'admin',
            phone: config.adminProfile.phone,
            company: config.adminProfile.company,
            onboarding_completed: true,
          }
        }
      )

      if (authError) {
        console.warn('Failed to update auth metadata:', authError.message)
      }

      return data
    } catch (error) {
      console.error('Error completing onboarding:', error)
      throw error
    }
  }

  // Check if admin has completed onboarding
  async isOnboardingComplete(adminId: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', adminId)
        .eq('role', 'admin')
        .single()

      if (error) {
        console.error('Error checking onboarding status:', error)
        return false
      }

      return !!data?.onboarding_completed
    } catch (error) {
      console.error('Error in isOnboardingComplete:', error)
      return false
    }
  }

  // Get admin configuration
  async getAdminConfig(adminId: string) {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          phone,
          company,
          bio,
          role,
          email_config,
          whatsapp_config,
          branding_config,
          event_defaults,
          onboarding_completed,
          onboarding_completed_at,
          created_at,
          updated_at
        `)
        .eq('id', adminId)
        .eq('role', 'admin')
        .single()

      if (error) {
        throw new Error(`Failed to get admin config: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error getting admin config:', error)
      throw error
    }
  }

  // Upload file to Supabase Storage
  async uploadFile(
    file: File, 
    bucket: string = 'assets', 
    path?: string
  ): Promise<string> {
    try {
      const fileName = path || `${Date.now()}-${file.name}`
      
      const { data, error } = await this.supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        throw new Error(`Failed to upload file: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = this.supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return publicUrl
    } catch (error) {
      console.error('Error uploading file:', error)
      throw error
    }
  }

  // Test email configuration
  async testEmailConfig(config: EmailProviderConfig): Promise<boolean> {
    try {
      // This would integrate with the email service to send a test email
      // For now, just validate the configuration
      const requiredFields = ['provider', 'fromEmail', 'fromName']
      
      for (const field of requiredFields) {
        if (!config[field as keyof EmailProviderConfig]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Provider-specific validation
      switch (config.provider) {
        case 'sendgrid':
        case 'brevo':
          if (!config.apiKey) {
            throw new Error('API key is required for this provider')
          }
          break
        case 'gmail':
        case 'outlook':
          if (!config.clientId || !config.clientSecret) {
            throw new Error('OAuth2 credentials are required for this provider')
          }
          break
        case 'smtp':
          if (!config.host || !config.port || !config.username || !config.password) {
            throw new Error('SMTP credentials are required')
          }
          break
      }

      return true
    } catch (error) {
      console.error('Email config test failed:', error)
      throw error
    }
  }

  // Test WhatsApp configuration
  async testWhatsAppConfig(config: WhatsAppConfig): Promise<boolean> {
    try {
      // Basic validation for required fields
      const requiredFields = ['provider', 'phoneNumberId', 'accessToken', 'webhookVerifyToken']
      
      for (const field of requiredFields) {
        if (!config[field as keyof WhatsAppConfig]) {
          throw new Error(`Missing required field: ${field}`)
        }
      }

      // Provider-specific validation
      if (config.provider === 'meta' && !config.businessAccountId) {
        console.warn('Business Account ID is recommended for Meta WhatsApp API')
      }

      return true
    } catch (error) {
      console.error('WhatsApp config test failed:', error)
      throw error
    }
  }
}

// Export singleton instance
export const onboardingService = new OnboardingService()