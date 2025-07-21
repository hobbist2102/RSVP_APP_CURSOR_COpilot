import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import type { CreateEventInput, UpdateEventInput, EventSettingsInput } from '@/lib/validations/events'

type WeddingEvent = Database['public']['Tables']['wedding_events']['Row']
type NewWeddingEvent = Database['public']['Tables']['wedding_events']['Insert']

export class EventService {
  private supabase = createClient()

  // Create new event
  async createEvent(eventData: CreateEventInput, createdBy: string): Promise<WeddingEvent> {
    try {
      const { data, error } = await this.supabase
        .from('wedding_events')
        .insert({
          title: eventData.title,
          couple_names: eventData.coupleNames,
          bride_name: eventData.brideName,
          groom_name: eventData.groomName,
          start_date: eventData.startDate,
          end_date: eventData.endDate,
          location: eventData.location,
          description: eventData.description,
          rsvp_deadline: eventData.rsvpDeadline,
          allow_plus_ones: eventData.allowPlusOnes,
          allow_children_details: eventData.allowChildrenDetails,
          custom_rsvp_url: eventData.customRsvpUrl,
          rsvp_welcome_title: eventData.rsvpWelcomeTitle,
          rsvp_welcome_message: eventData.rsvpWelcomeMessage,
          rsvp_custom_branding: eventData.rsvpCustomBranding,
          rsvp_show_select_all: eventData.rsvpShowSelectAll,
          email_provider: eventData.emailProvider,
          email_from_address: eventData.emailFromAddress,
          email_from_name: eventData.emailFromName,
          email_configured: eventData.emailConfigured,
          whatsapp_configured: eventData.whatsappConfigured,
          whatsapp_business_phone_id: eventData.whatsappBusinessPhoneId,
          whatsapp_access_token: eventData.whatsappAccessToken,
          primary_color: eventData.primaryColor,
          secondary_color: eventData.secondaryColor,
          logo_url: eventData.logoUrl,
          banner_url: eventData.bannerUrl,
          created_by: createdBy,
        })
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating event:', error)
      throw error
    }
  }

  // Get event by ID (with RLS enforcement)
  async getEvent(eventId: number): Promise<WeddingEvent | null> {
    try {
      const { data, error } = await this.supabase
        .from('wedding_events')
        .select('*')
        .eq('id', eventId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No event found or no access
        }
        throw new Error(`Failed to get event: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error getting event:', error)
      return null
    }
  }

  // Get all events for current user (with RLS enforcement)
  async getUserEvents(): Promise<WeddingEvent[]> {
    try {
      const { data, error } = await this.supabase
        .from('wedding_events')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get events: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting user events:', error)
      throw error
    }
  }

  // Update event
  async updateEvent(eventId: number, updates: UpdateEventInput): Promise<WeddingEvent> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Map frontend fields to database fields
      if (updates.title !== undefined) updateData.title = updates.title
      if (updates.coupleNames !== undefined) updateData.couple_names = updates.coupleNames
      if (updates.brideName !== undefined) updateData.bride_name = updates.brideName
      if (updates.groomName !== undefined) updateData.groom_name = updates.groomName
      if (updates.startDate !== undefined) updateData.start_date = updates.startDate
      if (updates.endDate !== undefined) updateData.end_date = updates.endDate
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.rsvpDeadline !== undefined) updateData.rsvp_deadline = updates.rsvpDeadline
      if (updates.allowPlusOnes !== undefined) updateData.allow_plus_ones = updates.allowPlusOnes
      if (updates.allowChildrenDetails !== undefined) updateData.allow_children_details = updates.allowChildrenDetails
      if (updates.customRsvpUrl !== undefined) updateData.custom_rsvp_url = updates.customRsvpUrl
      if (updates.rsvpWelcomeTitle !== undefined) updateData.rsvp_welcome_title = updates.rsvpWelcomeTitle
      if (updates.rsvpWelcomeMessage !== undefined) updateData.rsvp_welcome_message = updates.rsvpWelcomeMessage
      if (updates.rsvpCustomBranding !== undefined) updateData.rsvp_custom_branding = updates.rsvpCustomBranding
      if (updates.rsvpShowSelectAll !== undefined) updateData.rsvp_show_select_all = updates.rsvpShowSelectAll
      if (updates.emailProvider !== undefined) updateData.email_provider = updates.emailProvider
      if (updates.emailFromAddress !== undefined) updateData.email_from_address = updates.emailFromAddress
      if (updates.emailFromName !== undefined) updateData.email_from_name = updates.emailFromName
      if (updates.emailConfigured !== undefined) updateData.email_configured = updates.emailConfigured
      if (updates.whatsappConfigured !== undefined) updateData.whatsapp_configured = updates.whatsappConfigured
      if (updates.whatsappBusinessPhoneId !== undefined) updateData.whatsapp_business_phone_id = updates.whatsappBusinessPhoneId
      if (updates.whatsappAccessToken !== undefined) updateData.whatsapp_access_token = updates.whatsappAccessToken
      if (updates.primaryColor !== undefined) updateData.primary_color = updates.primaryColor
      if (updates.secondaryColor !== undefined) updateData.secondary_color = updates.secondaryColor
      if (updates.logoUrl !== undefined) updateData.logo_url = updates.logoUrl
      if (updates.bannerUrl !== undefined) updateData.banner_url = updates.bannerUrl

      const { data, error } = await this.supabase
        .from('wedding_events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update event: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating event:', error)
      throw error
    }
  }

  // Delete event
  async deleteEvent(eventId: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('wedding_events')
        .delete()
        .eq('id', eventId)

      if (error) {
        throw new Error(`Failed to delete event: ${error.message}`)
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      throw error
    }
  }

  // Update event settings
  async updateEventSettings(eventId: number, settings: EventSettingsInput): Promise<WeddingEvent> {
    try {
      const updateData: any = {
        updated_at: new Date().toISOString(),
      }

      // Map settings to database fields
      Object.entries(settings).forEach(([key, value]) => {
        if (value !== undefined) {
          // Convert camelCase to snake_case for database
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase()
          updateData[dbKey] = value
        }
      })

      const { data, error } = await this.supabase
        .from('wedding_events')
        .update(updateData)
        .eq('id', eventId)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update event settings: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error updating event settings:', error)
      throw error
    }
  }

  // Get event statistics
  async getEventStats(eventId: number) {
    try {
      // Get basic event info
      const event = await this.getEvent(eventId)
      if (!event) {
        throw new Error('Event not found')
      }

      // Get guest statistics
      const { data: guestStats, error: guestError } = await this.supabase
        .from('guests')
        .select('id, rsvp_status, plus_one_confirmed')
        .eq('event_id', eventId)

      if (guestError) {
        throw new Error(`Failed to get guest stats: ${guestError.message}`)
      }

      // Get ceremony count
      const { count: ceremonyCount, error: ceremonyError } = await this.supabase
        .from('ceremonies')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)

      if (ceremonyError) {
        throw new Error(`Failed to get ceremony count: ${ceremonyError.message}`)
      }

      // Calculate RSVP statistics
      const totalGuests = guestStats?.length || 0
      const confirmedGuests = guestStats?.filter(g => g.rsvp_status === 'confirmed').length || 0
      const declinedGuests = guestStats?.filter(g => g.rsvp_status === 'declined').length || 0
      const pendingGuests = guestStats?.filter(g => g.rsvp_status === 'pending').length || 0
      const plusOnesConfirmed = guestStats?.filter(g => g.plus_one_confirmed).length || 0

      return {
        event: {
          id: event.id,
          title: event.title,
          couple_names: event.couple_names,
          start_date: event.start_date,
          end_date: event.end_date,
          location: event.location,
        },
        guests: {
          total: totalGuests,
          confirmed: confirmedGuests,
          declined: declinedGuests,
          pending: pendingGuests,
          plus_ones_confirmed: plusOnesConfirmed,
          confirmation_rate: totalGuests > 0 ? Math.round((confirmedGuests / totalGuests) * 100) : 0,
        },
        ceremonies: {
          total: ceremonyCount || 0,
        },
      }
    } catch (error) {
      console.error('Error getting event stats:', error)
      throw error
    }
  }

  // Get event guests (for event-specific guest management)
  async getEventGuests(eventId: number) {
    try {
      const { data, error } = await this.supabase
        .from('guests')
        .select(`
          *,
          guest_ceremonies (
            ceremony_id,
            attending,
            meal_preference,
            ceremonies (
              id,
              name,
              date,
              start_time
            )
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })

      if (error) {
        throw new Error(`Failed to get event guests: ${error.message}`)
      }

      return data || []
    } catch (error) {
      console.error('Error getting event guests:', error)
      throw error
    }
  }
}

// Export singleton instance
export const eventService = new EventService()