/**
 * Schema Bridge Module
 * 
 * This module acts as a bridge between V4's Drizzle schema and the shared/schema.ts
 * ensuring type consistency and data integrity across the platform.
 */

import { z } from 'zod'
import { 
  UserRoleSchema, 
  RsvpStatusSchema, 
  GuestSideSchema, 
  CommunicationTypeSchema,
  AttendanceStatusSchema
} from '@/lib/validations/schemas'

// Re-export with consistent naming
export const userRoleSchema = UserRoleSchema
export const rsvpStatusSchema = RsvpStatusSchema
export const guestSideSchema = GuestSideSchema
export const communicationChannelSchema = CommunicationTypeSchema
export const attendanceStatusSchema = AttendanceStatusSchema

// Define additional schemas not in validations
export const relationshipTypeSchema = z.enum(['family', 'friend', 'colleague', 'other'])
export const roomTypeSchema = z.enum(['single', 'double', 'twin', 'suite', 'family'])
export const bedTypeSchema = z.enum(['single', 'double', 'queen', 'king', 'twin'])

// Base user schema
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  role: userRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Base wedding event schema
export const weddingEventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  weddingDate: z.date(),
  venue: z.string().min(1).max(255),
  createdBy: z.string().uuid(),
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Base guest schema
export const guestSchema = z.object({
  id: z.string().uuid(),
  eventId: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  side: guestSideSchema,
  relationship: relationshipTypeSchema,
  rsvpStatus: rsvpStatusSchema.default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Insert schemas (for creating new records)
export const insertUserSchema = userSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const insertWeddingEventSchema = weddingEventSchema.omit({ id: true, createdAt: true, updatedAt: true })
export const insertGuestSchema = guestSchema.omit({ id: true, createdAt: true, updatedAt: true })

// Update schemas (for updating existing records)
export const updateUserSchema = insertUserSchema.partial()
export const updateWeddingEventSchema = insertWeddingEventSchema.partial()
export const updateGuestSchema = insertGuestSchema.partial()

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type User = z.infer<typeof userSchema>
export type WeddingEvent = z.infer<typeof weddingEventSchema>
export type Guest = z.infer<typeof guestSchema>

export type UserRole = z.infer<typeof userRoleSchema>
export type RsvpStatus = z.infer<typeof rsvpStatusSchema>
export type GuestSide = z.infer<typeof guestSideSchema>
export type RelationshipType = z.infer<typeof relationshipTypeSchema>
export type CommunicationChannel = z.infer<typeof communicationChannelSchema>
export type RoomType = z.infer<typeof roomTypeSchema>
export type BedType = z.infer<typeof bedTypeSchema>

// ============================================================================
// V4 EXTENDED SCHEMAS
// ============================================================================

// Extended schemas for V4-specific features
export const createUserSchema = insertUserSchema.extend({
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const updateUserProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  avatar: z.string().url().optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = createUserSchema

// RSVP-specific schemas
export const rsvpResponseSchema = z.object({
  guestId: z.string().uuid(),
  rsvpStatus: rsvpStatusSchema,
  attendingCeremony: z.boolean().default(true),
  attendingReception: z.boolean().default(true),
  mealPreference: z.enum(['vegetarian', 'vegan', 'gluten_free', 'standard']).optional(),
  dietaryRestrictions: z.string().max(500).optional(),
  specialRequests: z.string().max(1000).optional(),
  plusOneCount: z.number().min(0).max(5).default(0),
})

// ============================================================================
// CONSTANTS
// ============================================================================

export const RSVP_STATUSES = ['pending', 'attending', 'not_attending', 'maybe'] as const
export const GUEST_SIDES = ['bride', 'groom', 'mutual'] as const
export const USER_ROLES = ['super_admin', 'admin', 'planner', 'couple', 'guest'] as const
export const RELATIONSHIP_TYPES = ['family', 'friend', 'colleague', 'other'] as const
export const COMMUNICATION_CHANNELS = ['email', 'whatsapp', 'sms', 'phone'] as const
export const ROOM_TYPES = ['single', 'double', 'twin', 'suite', 'family'] as const
export const BED_TYPES = ['single', 'double', 'queen', 'king', 'twin'] as const

// ============================================================================
// TYPE GUARDS
// ============================================================================

export const isValidUserRole = (role: string): role is UserRole => {
  return USER_ROLES.includes(role as UserRole)
}

export const isValidRsvpStatus = (status: string): status is RsvpStatus => {
  return RSVP_STATUSES.includes(status as RsvpStatus)
}

export const isValidGuestSide = (side: string): side is GuestSide => {
  return GUEST_SIDES.includes(side as GuestSide)
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getUserRoleDisplayName = (role: UserRole): string => {
  const roleMap: Record<UserRole, string> = {
    super_admin: 'Super Admin',
    admin: 'Admin',
    planner: 'Planner',
    couple: 'Couple',
    guest: 'Guest',
  }
  return roleMap[role]
}

export const getRsvpStatusDisplayName = (status: RsvpStatus): string => {
  const statusMap: Record<RsvpStatus, string> = {
    pending: 'Pending',
    attending: 'Attending',
    not_attending: 'Not Attending',
    maybe: 'Maybe',
  }
  return statusMap[status]
}

export const getGuestSideDisplayName = (side: GuestSide): string => {
  const sideMap: Record<GuestSide, string> = {
    bride: "Bride's Side",
    groom: "Groom's Side",
    mutual: 'Mutual Friends',
  }
  return sideMap[side]
}

// ============================================================================
// CONFIGURATION INTERFACES
// ============================================================================

export interface EmailProviderConfig {
  provider: 'resend' | 'sendgrid' | 'gmail' | 'outlook' | 'smtp'
  apiKey?: string
  clientId?: string
  clientSecret?: string
  refreshToken?: string
  userEmail?: string
  host?: string
  port?: number
  secure?: boolean
  user?: string
  pass?: string
}

export interface WhatsAppConfig {
  provider: 'business_api' | 'twilio' | 'web_js'
  phoneNumberId?: string
  accessToken?: string
  accountId?: string
  webhookVerifyToken?: string
  twilioAccountSid?: string
  twilioAuthToken?: string
  twilioNumber?: string
  sessionPath?: string
}

export interface PushSubscriptionData {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

// All exports are already declared above with individual export statements