export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          name: string
          email: string
          role: string
          phone: string | null
          company: string | null
          avatar: string | null
          bio: string | null
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          name: string
          email: string
          role?: string
          phone?: string | null
          company?: string | null
          avatar?: string | null
          bio?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          name?: string
          email?: string
          role?: string
          phone?: string | null
          company?: string | null
          avatar?: string | null
          bio?: string | null
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      wedding_events: {
        Row: {
          id: number
          title: string
          couple_names: string
          bride_name: string
          groom_name: string
          start_date: string
          end_date: string
          location: string
          description: string | null
          rsvp_deadline: string | null
          allow_plus_ones: boolean
          allow_children_details: boolean
          custom_rsvp_url: string | null
          rsvp_welcome_title: string | null
          rsvp_welcome_message: string | null
          rsvp_custom_branding: string | null
          rsvp_show_select_all: boolean
          email_provider: string
          email_from_address: string | null
          email_from_name: string | null
          email_configured: boolean
          whatsapp_configured: boolean
          whatsapp_business_phone_id: string | null
          whatsapp_access_token: string | null
          primary_color: string
          secondary_color: string
          logo_url: string | null
          banner_url: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          title: string
          couple_names: string
          bride_name: string
          groom_name: string
          start_date: string
          end_date: string
          location: string
          description?: string | null
          rsvp_deadline?: string | null
          allow_plus_ones?: boolean
          allow_children_details?: boolean
          custom_rsvp_url?: string | null
          rsvp_welcome_title?: string | null
          rsvp_welcome_message?: string | null
          rsvp_custom_branding?: string | null
          rsvp_show_select_all?: boolean
          email_provider?: string
          email_from_address?: string | null
          email_from_name?: string | null
          email_configured?: boolean
          whatsapp_configured?: boolean
          whatsapp_business_phone_id?: string | null
          whatsapp_access_token?: string | null
          primary_color?: string
          secondary_color?: string
          logo_url?: string | null
          banner_url?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          couple_names?: string
          bride_name?: string
          groom_name?: string
          start_date?: string
          end_date?: string
          location?: string
          description?: string | null
          rsvp_deadline?: string | null
          allow_plus_ones?: boolean
          allow_children_details?: boolean
          custom_rsvp_url?: string | null
          rsvp_welcome_title?: string | null
          rsvp_welcome_message?: string | null
          rsvp_custom_branding?: string | null
          rsvp_show_select_all?: boolean
          email_provider?: string
          email_from_address?: string | null
          email_from_name?: string | null
          email_configured?: boolean
          whatsapp_configured?: boolean
          whatsapp_business_phone_id?: string | null
          whatsapp_access_token?: string | null
          primary_color?: string
          secondary_color?: string
          logo_url?: string | null
          banner_url?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      guests: {
        Row: {
          id: number
          event_id: number
          first_name: string
          last_name: string
          email: string | null
          phone: string | null
          country_code: string | null
          side: string
          relationship: string | null
          is_family: boolean
          is_vip: boolean
          rsvp_status: string
          rsvp_date: string | null
          rsvp_token: string | null
          plus_one_allowed: boolean
          plus_one_confirmed: boolean
          plus_one_name: string | null
          plus_one_email: string | null
          plus_one_phone: string | null
          plus_one_relationship: string | null
          dietary_restrictions: string | null
          allergies: string | null
          special_requests: string | null
          children_details: Json
          needs_accommodation: boolean
          accommodation_preference: string | null
          needs_flight_assistance: boolean
          arrival_date: string | null
          departure_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          event_id: number
          first_name: string
          last_name: string
          email?: string | null
          phone?: string | null
          country_code?: string | null
          side: string
          relationship?: string | null
          is_family?: boolean
          is_vip?: boolean
          rsvp_status?: string
          rsvp_date?: string | null
          rsvp_token?: string | null
          plus_one_allowed?: boolean
          plus_one_confirmed?: boolean
          plus_one_name?: string | null
          plus_one_email?: string | null
          plus_one_phone?: string | null
          plus_one_relationship?: string | null
          dietary_restrictions?: string | null
          allergies?: string | null
          special_requests?: string | null
          children_details?: Json
          needs_accommodation?: boolean
          accommodation_preference?: string | null
          needs_flight_assistance?: boolean
          arrival_date?: string | null
          departure_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          event_id?: number
          first_name?: string
          last_name?: string
          email?: string | null
          phone?: string | null
          country_code?: string | null
          side?: string
          relationship?: string | null
          is_family?: boolean
          is_vip?: boolean
          rsvp_status?: string
          rsvp_date?: string | null
          rsvp_token?: string | null
          plus_one_allowed?: boolean
          plus_one_confirmed?: boolean
          plus_one_name?: string | null
          plus_one_email?: string | null
          plus_one_phone?: string | null
          plus_one_relationship?: string | null
          dietary_restrictions?: string | null
          allergies?: string | null
          special_requests?: string | null
          children_details?: Json
          needs_accommodation?: boolean
          accommodation_preference?: string | null
          needs_flight_assistance?: boolean
          arrival_date?: string | null
          departure_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}