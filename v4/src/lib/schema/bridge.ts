/**
 * Schema Bridge - Connects V4 implementation with shared schema definitions
 * 
 * This module ensures type consistency between V4's Drizzle schema and the shared schema.
 * It re-exports types, validation schemas, and constants for consistent usage across V4.
 */

// Import shared schema types and validation schemas
import {
  users as sharedUsers,
  weddingEvents as sharedWeddingEvents,
  guests as sharedGuests,
  ceremonies as sharedCeremonies,
  guestCeremonies as sharedGuestCeremonies,
  insertUserSchema,
  insertWeddingEventSchema,
  insertGuestSchema,
  insertCeremonySchema,
} from '../../../../shared/schema'

import { z } from 'zod'

// Re-export shared types for V4 consistency
export type User = typeof sharedUsers.$inferSelect
export type NewUser = typeof sharedUsers.$inferInsert
export type WeddingEvent = typeof sharedWeddingEvents.$inferSelect
export type NewWeddingEvent = typeof sharedWeddingEvents.$inferInsert
export type Guest = typeof sharedGuests.$inferSelect
export type NewGuest = typeof sharedGuests.$inferInsert
export type Ceremony = typeof sharedCeremonies.$inferSelect
export type NewCeremony = typeof sharedCeremonies.$inferInsert
export type GuestCeremony = typeof sharedGuestCeremonies.$inferSelect

// Re-export validation schemas from shared schema
export {
  insertUserSchema,
  insertWeddingEventSchema,
  insertGuestSchema,
  insertCeremonySchema,
}

// Additional V4-specific validation schemas that extend shared ones
export const createUserSchema = insertUserSchema.extend({
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const updateUserSchema = insertUserSchema.partial().omit({
  password: true,
})

export const createGuestSchema = insertGuestSchema.extend({
  // Additional V4-specific validations
  eventId: z.number().int().positive('Event ID is required'),
})

export const updateGuestSchema = createGuestSchema.partial().omit({
  eventId: true,
})

// Field mappings and constants from shared schema
export const RSVP_STATUSES = ['pending', 'confirmed', 'declined'] as const
export const GUEST_SIDES = ['bride', 'groom'] as const
export const USER_ROLES = ['admin', 'staff', 'couple'] as const

// Guest relationship types (should be consistent with shared schema)
export const RELATIONSHIP_TYPES = [
  'parent',
  'sibling',
  'child',
  'grandparent',
  'aunt_uncle',
  'cousin',
  'friend',
  'colleague',
  'other',
] as const

// Communication channels
export const COMMUNICATION_CHANNELS = ['email', 'whatsapp', 'sms'] as const

// Hotel and accommodation related types
export const ROOM_TYPES = [
  'single',
  'double',
  'twin',
  'king',
  'queen',
  'suite',
  'family',
] as const

export const BED_TYPES = [
  'single',
  'double',
  'twin',
  'king',
  'queen',
  'sofa_bed',
] as const

// Type guards and utilities
export const isValidRsvpStatus = (status: string): status is typeof RSVP_STATUSES[number] => {
  return RSVP_STATUSES.includes(status as any)
}

export const isValidGuestSide = (side: string): side is typeof GUEST_SIDES[number] => {
  return GUEST_SIDES.includes(side as any)
}

export const isValidUserRole = (role: string): role is typeof USER_ROLES[number] => {
  return USER_ROLES.includes(role as any)
}

// Email provider configurations from shared schema
export interface EmailProviderConfig {
  provider: 'sendgrid' | 'brevo' | 'gmail' | 'outlook' | 'smtp'
  apiKey?: string
  fromEmail: string
  fromName: string
  replyTo?: string
  // OAuth fields for Gmail/Outlook
  clientId?: string
  clientSecret?: string
  accessToken?: string
  refreshToken?: string
  // SMTP fields
  host?: string
  port?: number
  secure?: boolean
  username?: string
  password?: string
}

// WhatsApp provider configurations from shared schema
export interface WhatsAppConfig {
  provider: 'business_api' | 'twilio' | 'web_js'
  enabled: boolean
  // Business API fields
  phoneNumberId?: string
  accessToken?: string
  businessAccountId?: string
  // Twilio fields
  accountSid?: string
  authToken?: string
  phoneNumber?: string
  // Common fields
  fromNumber?: string
  webhookUrl?: string
}

// Push notification subscription from shared schema (for PWA)
export interface PushSubscriptionData {
  userId: string
  eventId?: number
  endpoint: string
  p256dhKey: string
  authKey: string
  topics: string[]
  isActive: boolean
}

export default {
  RSVP_STATUSES,
  GUEST_SIDES,
  USER_ROLES,
  RELATIONSHIP_TYPES,
  COMMUNICATION_CHANNELS,
  ROOM_TYPES,
  BED_TYPES,
  isValidRsvpStatus,
  isValidGuestSide,
  isValidUserRole,
}