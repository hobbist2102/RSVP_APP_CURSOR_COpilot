// Base API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  code?: string
  message?: string
  details?: any
}

export interface ApiErrorResponse {
  success: false
  error: string
  code: string
  details?: any
}

export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  message?: string
}

// Pagination Types
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  success: true
  data: T[]
  meta: PaginationMeta
}

// Authentication API Types
export interface LoginRequest {
  email: string
  password?: string
  loginType: 'password' | 'otp'
}

export interface OtpRequest {
  email: string
  token: string
  loginType: 'otp'
}

export interface AuthResponse {
  user: {
    id: string
    email: string
    email_confirmed_at?: string
    created_at: string
  }
  profile?: UserProfile
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  phone?: string
  created_at: string
  updated_at: string
  last_login?: string
}

// Event API Types
export interface EventResponse {
  id: number
  title: string
  couple_names: string
  bride_name: string
  groom_name: string
  start_date: string
  end_date: string
  location: string
  description?: string
  rsvp_deadline?: string
  allow_plus_ones: boolean
  allow_children_details: boolean
  custom_rsvp_url?: string
  rsvp_welcome_title?: string
  rsvp_welcome_message?: string
  rsvp_custom_branding?: string
  rsvp_show_select_all: boolean
  email_provider: string
  email_from_address?: string
  email_from_name?: string
  email_configured: boolean
  whatsapp_configured: boolean
  whatsapp_business_phone_id?: string
  whatsapp_access_token?: string
  primary_color: string
  secondary_color: string
  logo_url?: string
  banner_url?: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface EventStatsResponse {
  event: {
    id: number
    title: string
    couple_names: string
    start_date: string
    end_date: string
    location: string
  }
  guests: {
    total: number
    confirmed: number
    declined: number
    pending: number
    plus_ones_confirmed: number
    confirmation_rate: number
  }
  ceremonies: {
    total: number
  }
}

// Guest API Types
export interface GuestResponse {
  id: number
  event_id: number
  first_name: string
  last_name: string
  email?: string
  phone?: string
  country_code?: string
  side: 'bride' | 'groom' | 'both'
  relationship?: string
  is_family: boolean
  is_vip: boolean
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  rsvp_date?: string
  rsvp_token: string
  plus_one_allowed: boolean
  plus_one_confirmed: boolean
  plus_one_name?: string
  plus_one_email?: string
  plus_one_phone?: string
  plus_one_relationship?: string
  dietary_restrictions?: string
  allergies?: string
  special_requests?: string
  children_details: Array<{
    name: string
    age: number
    dietary_restrictions?: string
  }>
  needs_accommodation: boolean
  accommodation_preference?: string
  needs_flight_assistance: boolean
  arrival_date?: string
  departure_date?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface GuestSearchResponse extends PaginatedResponse<GuestResponse> {
  meta: PaginationMeta & {
    rsvpBreakdown: {
      confirmed: number
      pending: number
      declined: number
    }
    familyMembers: number
    vipGuests: number
    withEmail: number
    withPhone: number
    needAccommodation: number
  }
  searchQuery: any
}

export interface GuestImportResponse {
  summary: {
    total: number
    imported: number
    skipped: number
    errors: number
    successRate: number
  }
  errors?: Array<{
    row: number
    error: string
    data: any
  }>
}

export interface GuestExportResponse {
  guests: Array<Record<string, any>>
  summary: {
    total: number
    format: 'csv' | 'excel'
    exportDate: string
    filters?: any
  }
}

// Family Relationship Types
export interface FamilyRelationshipResponse {
  id: number
  primary_guest_id: number
  related_guest_id: number
  relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'other'
  description?: string
  created_at: string
  primary_guest: Partial<GuestResponse>
  related_guest: Partial<GuestResponse>
}

// RSVP API Types
export interface RsvpResponse {
  token: string
  guest: {
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    side: string
    relationship?: string
    rsvpStatus: string
    rsvpDate?: string
    plusOneAllowed: boolean
    plusOneConfirmed: boolean
    plusOneName?: string
    plusOneEmail?: string
    plusOnePhone?: string
    plusOneRelationship?: string
    dietaryRestrictions?: string
    allergies?: string
    specialRequests?: string
    childrenDetails: Array<{
      name: string
      age: number
      dietaryRestrictions?: string
    }>
    needsAccommodation: boolean
    accommodationPreference?: string
    needsFlightAssistance: boolean
    arrivalDate?: string
    departureDate?: string
    notes?: string
  }
  event: {
    id: number
    title: string
    coupleNames: string
    brideName: string
    groomName: string
    startDate: string
    endDate: string
    location: string
    description?: string
    rsvpDeadline?: string
    allowPlusOnes: boolean
    allowChildrenDetails: boolean
    rsvpWelcomeTitle?: string
    rsvpWelcomeMessage?: string
    rsvpCustomBranding?: string
    rsvpShowSelectAll: boolean
    primaryColor: string
    secondaryColor: string
    logoUrl?: string
    bannerUrl?: string
  }
  ceremonies: CeremonyResponse[]
  currentCeremonyResponses: GuestCeremonyResponse[]
}

export interface CeremonyResponse {
  id: number
  event_id: number
  name: string
  date: string
  start_time: string
  end_time: string
  location: string
  description?: string
  attire_code?: string
  ceremony_type?: string
  max_capacity?: number
  created_at: string
  updated_at: string
}

export interface GuestCeremonyResponse {
  guest_id: number
  ceremony_id: number
  attending: boolean
  meal_preference?: string
  special_dietary_needs?: string
  ceremonies: CeremonyResponse
}

export interface RsvpStatusResponse {
  guests: Array<{
    id: number
    firstName: string
    lastName: string
    email?: string
    phone?: string
    side: string
    relationship?: string
    rsvpStatus: string
    rsvpDate?: string
    plusOneAllowed: boolean
    plusOneConfirmed: boolean
    plusOneName?: string
    childrenCount: number
    event: {
      id: number
      title: string
      coupleNames: string
      startDate: string
      rsvpDeadline?: string
    } | null
    ceremonies?: GuestCeremonyResponse[]
    createdAt: string
    updatedAt: string
  }>
  statistics?: {
    overview: {
      totalGuests: number
      totalAttending: number
      guestsAttending: number
      plusOnesAttending: number
      childrenAttending: number
      responseRate: number
      confirmationRate: number
      recentResponses: number
    }
    breakdown: {
      confirmed: number
      declined: number
      pending: number
    }
    byEvent: Array<{
      eventId: number
      eventTitle?: string
      total: number
      confirmed: number
      declined: number
      pending: number
      deadline?: string
    }>
    lastUpdated: string
  }
  filters: any
}

export interface ReminderResponse {
  results: {
    total: number
    emailReminders: number
    smsReminders: number
    scheduled: number
    errors: Array<{
      guestId: number
      error: string
    }>
  }
  reminderData: {
    eventTitle: string
    targetStatus: string
    reminderType: string
    scheduledFor: string
    totalRecipients: number
  }
}

export interface ReminderHistoryResponse {
  reminders: Array<{
    id: number
    guest_id: number
    event_id: number
    reminder_type: string
    recipient_email?: string
    recipient_phone?: string
    custom_message?: string
    scheduled_for: string
    sent_at?: string
    status: 'pending' | 'sent' | 'failed' | 'scheduled'
    error_message?: string
    rsvp_url: string
    created_at: string
    guests: Partial<GuestResponse>
  }>
  statistics: {
    total: number
    pending: number
    sent: number
    failed: number
    scheduled: number
    byType: {
      email: number
      sms: number
    }
    lastSent?: string
  }
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number
  remaining: number
  resetInSeconds: number
}

export interface RateLimitExceededResponse extends ApiErrorResponse {
  code: 'RATE_LIMIT_EXCEEDED'
  details: RateLimitInfo
}

// Error Code Types
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'TOKEN_INVALID'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_EXCEEDED'
  | 'DUPLICATE_RESOURCE'
  | 'RESOURCE_CONFLICT'
  | 'EXTERNAL_SERVICE_ERROR'
  | 'DATABASE_ERROR'
  | 'INTERNAL_ERROR'

// Admin API Types
export interface OnboardingStatusResponse {
  completed: boolean
  currentStep: number
  steps: Array<{
    id: string
    title: string
    completed: boolean
    required: boolean
  }>
  user: UserProfile
}

export interface AdminStatsResponse {
  events: {
    total: number
    active: number
    completed: number
  }
  guests: {
    total: number
    confirmed: number
    pending: number
    declined: number
  }
  rsvp: {
    responseRate: number
    confirmationRate: number
    recentActivity: number
  }
  system: {
    version: string
    uptime: number
    lastUpdated: string
  }
}