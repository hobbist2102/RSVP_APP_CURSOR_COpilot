import { z } from 'zod'

// Enums for validation
export const UserRoleSchema = z.enum(['super_admin', 'admin', 'planner', 'couple', 'guest'])
export const EventStatusSchema = z.enum(['draft', 'active', 'completed', 'cancelled'])
export const GuestSideSchema = z.enum(['bride', 'groom', 'mutual'])
export const RsvpStatusSchema = z.enum(['pending', 'attending', 'not_attending', 'maybe'])
export const AttendanceStatusSchema = z.enum(['yes', 'no', 'maybe'])
export const CommunicationTypeSchema = z.enum(['email', 'whatsapp', 'sms'])
export const CommunicationStatusSchema = z.enum(['pending', 'sent', 'delivered', 'failed', 'bounced'])
export const TemplateCategorySchema = z.enum(['invitation', 'reminder', 'confirmation', 'update', 'thank_you'])

// User Schemas
export const CreateUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  phone: z.string().optional(),
  role: UserRoleSchema.default('couple'),
})

export const UpdateUserSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
  avatarUrl: z.string().url().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = CreateUserSchema.extend({
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

// Event Schemas
export const CreateEventSchema = z.object({
  name: z.string().min(1, 'Event name is required').max(255),
  coupleNames: z.string().min(1, 'Couple names are required').max(255),
  brideName: z.string().max(100).optional(),
  groomName: z.string().max(100).optional(),
  weddingDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  timezone: z.string().default('UTC'),
  description: z.string().optional(),
  coverImageUrl: z.string().url().optional(),
  websiteUrl: z.string().url().optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  maxGuests: z.number().positive().optional(),
  budget: z.number().positive().optional(),
  currency: z.string().length(3).default('USD'),
})

export const UpdateEventSchema = CreateEventSchema.partial().extend({
  status: EventStatusSchema.optional(),
})

// Guest Schemas
export const CreateGuestSchema = z.object({
  eventId: z.string().uuid(),
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  side: GuestSideSchema,
  relationship: z.string().max(100).optional(),
  ageGroup: z.string().max(20).optional(),
  plusOneAllowed: z.boolean().default(false),
  dietaryRequirements: z.string().optional(),
  specialRequests: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
  languagePreference: z.string().length(2).default('en'),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const UpdateGuestSchema = CreateGuestSchema.partial().omit({ eventId: true }).extend({
  rsvpStatus: RsvpStatusSchema.optional(),
  plusOneName: z.string().optional(),
  plusOneEmail: z.string().email().optional(),
  plusOnePhone: z.string().optional(),
})

export const BulkGuestImportSchema = z.object({
  guests: z.array(CreateGuestSchema.omit({ eventId: true })),
  eventId: z.string().uuid(),
})

// Ceremony Schemas
export const CreateCeremonySchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1, 'Ceremony name is required').max(255),
  description: z.string().optional(),
  ceremonyDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: 'Invalid date format'
  }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)').optional(),
  venueName: z.string().max(255).optional(),
  venueAddress: z.string().optional(),
  dressCode: z.string().max(255).optional(),
  isMainCeremony: z.boolean().default(false),
  maxGuests: z.number().positive().optional(),
  requiresRsvp: z.boolean().default(true),
  displayOrder: z.number().default(0),
})

export const UpdateCeremonySchema = CreateCeremonySchema.partial().omit({ eventId: true })

// RSVP Schemas
export const RsvpStage1Schema = z.object({
  guestId: z.string().uuid(),
  attending: z.boolean(),
  plusOneAttending: z.boolean().optional(),
})

export const RsvpStage2Schema = z.object({
  guestId: z.string().uuid(),
  ceremonies: z.array(z.object({
    ceremonyId: z.string().uuid(),
    attending: AttendanceStatusSchema,
    mealPreference: z.string().optional(),
    plusOneAttending: AttendanceStatusSchema.optional(),
    plusOneMealPreference: z.string().optional(),
    specialRequirements: z.string().optional(),
  })),
  dietaryRequirements: z.string().optional(),
  specialRequests: z.string().optional(),
  accessibilityNeeds: z.string().optional(),
})

export const CombinedRsvpSchema = RsvpStage1Schema.merge(RsvpStage2Schema)

// Accommodation Schemas
export const CreateAccommodationSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1, 'Accommodation name is required').max(255),
  type: z.string().min(1, 'Type is required').max(50),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  checkInTime: z.string().optional(),
  checkOutTime: z.string().optional(),
  distanceFromVenue: z.number().positive().optional(),
  rating: z.number().min(0).max(5).optional(),
  priceRange: z.string().optional(),
  totalRooms: z.number().positive().optional(),
  blockedRooms: z.number().min(0).default(0),
  bookingDeadline: z.string().optional(),
  specialRates: z.boolean().default(false),
  contactPerson: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateAccommodationSchema = CreateAccommodationSchema.partial().omit({ eventId: true })

export const CreateRoomTypeSchema = z.object({
  accommodationId: z.string().uuid(),
  name: z.string().min(1, 'Room type name is required').max(255),
  description: z.string().optional(),
  capacity: z.number().positive('Capacity must be positive'),
  bedType: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  pricePerNight: z.number().positive().optional(),
  totalRooms: z.number().positive('Total rooms must be positive'),
  availableRooms: z.number().min(0, 'Available rooms cannot be negative'),
  images: z.array(z.string().url()).optional(),
})

export const UpdateRoomTypeSchema = CreateRoomTypeSchema.partial().omit({ accommodationId: true })

// Transportation Schemas
export const CreateTransportationSchema = z.object({
  eventId: z.string().uuid(),
  name: z.string().min(1, 'Transportation name is required').max(255),
  type: z.string().min(1, 'Type is required').max(50),
  provider: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  vehicleType: z.string().optional(),
  capacity: z.number().positive().optional(),
  pickupLocation: z.string().optional(),
  dropoffLocation: z.string().optional(),
  departureTime: z.string().optional(),
  arrivalTime: z.string().optional(),
  costPerPerson: z.number().positive().optional(),
  totalCost: z.number().positive().optional(),
  bookingDeadline: z.string().optional(),
  specialInstructions: z.string().optional(),
  notes: z.string().optional(),
})

export const UpdateTransportationSchema = CreateTransportationSchema.partial().omit({ eventId: true })

// Communication Schemas
export const CreateTemplateSchema = z.object({
  eventId: z.string().uuid().optional(),
  name: z.string().min(1, 'Template name is required').max(255),
  type: CommunicationTypeSchema,
  category: TemplateCategorySchema,
  subject: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  variables: z.array(z.string()).optional(),
  isDefault: z.boolean().default(false),
  isActive: z.boolean().default(true),
  language: z.string().length(2).default('en'),
})

export const UpdateTemplateSchema = CreateTemplateSchema.partial().omit({ eventId: true })

export const SendCommunicationSchema = z.object({
  eventId: z.string().uuid(),
  templateId: z.string().uuid().optional(),
  recipientIds: z.array(z.string().uuid()).min(1, 'At least one recipient is required'),
  type: CommunicationTypeSchema,
  subject: z.string().max(500).optional(),
  content: z.string().min(1, 'Content is required'),
  scheduledFor: z.string().optional(),
})

// Event Settings Schema
export const UpdateEventSettingsSchema = z.object({
  rsvpDeadline: z.string().optional(),
  allowPlusOnes: z.boolean().default(true),
  requireMealSelection: z.boolean().default(false),
  requireAccommodation: z.boolean().default(false),
  requireTransportation: z.boolean().default(false),
  enableTwoStageRsvp: z.boolean().default(true),
  customFields: z.array(z.object({
    name: z.string(),
    type: z.enum(['text', 'email', 'phone', 'select', 'checkbox', 'textarea']),
    required: z.boolean().default(false),
    options: z.array(z.string()).optional(),
  })).optional(),
  emailSettings: z.object({
    provider: z.enum(['resend', 'gmail', 'outlook', 'smtp']),
    fromName: z.string(),
    fromEmail: z.string().email(),
    replyTo: z.string().email().optional(),
  }).optional(),
  whatsappSettings: z.object({
    provider: z.enum(['business_api', 'twilio', 'web_js']),
    phoneNumber: z.string(),
    apiKey: z.string().optional(),
  }).optional(),
  themeSettings: z.object({
    primaryColor: z.string(),
    secondaryColor: z.string(),
    fontFamily: z.string(),
    logoUrl: z.string().url().optional(),
  }).optional(),
  privacySettings: z.object({
    guestDataRetention: z.number().positive().default(365),
    allowGuestDataExport: z.boolean().default(true),
    requireCookieConsent: z.boolean().default(true),
  }).optional(),
  notificationSettings: z.object({
    emailNotifications: z.boolean().default(true),
    whatsappNotifications: z.boolean().default(false),
    smsNotifications: z.boolean().default(false),
  }).optional(),
  language: z.string().length(2).default('en'),
  timezone: z.string().default('UTC'),
  currency: z.string().length(3).default('USD'),
})

// API Response Schemas
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  data: z.any().optional(),
  message: z.string().optional(),
  meta: z.object({
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      pages: z.number(),
    }).optional(),
    timestamp: z.string(),
    version: z.string().optional(),
  }).optional(),
})

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string(),
    message: z.string(),
    details: z.any().optional(),
  }),
  meta: z.object({
    timestamp: z.string(),
    requestId: z.string(),
  }),
})

// Pagination Schema
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
})

// Search and Filter Schemas
export const GuestFilterSchema = z.object({
  side: GuestSideSchema.optional(),
  rsvpStatus: RsvpStatusSchema.optional(),
  hasEmail: z.boolean().optional(),
  hasPhone: z.boolean().optional(),
  plusOneAllowed: z.boolean().optional(),
  search: z.string().optional(),
}).merge(PaginationSchema)

export const EventFilterSchema = z.object({
  status: EventStatusSchema.optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
}).merge(PaginationSchema)

// Export type inferences
export type CreateUser = z.infer<typeof CreateUserSchema>
export type UpdateUser = z.infer<typeof UpdateUserSchema>
export type Login = z.infer<typeof LoginSchema>
export type Register = z.infer<typeof RegisterSchema>

export type CreateEvent = z.infer<typeof CreateEventSchema>
export type UpdateEvent = z.infer<typeof UpdateEventSchema>

export type CreateGuest = z.infer<typeof CreateGuestSchema>
export type UpdateGuest = z.infer<typeof UpdateGuestSchema>
export type BulkGuestImport = z.infer<typeof BulkGuestImportSchema>

export type CreateCeremony = z.infer<typeof CreateCeremonySchema>
export type UpdateCeremony = z.infer<typeof UpdateCeremonySchema>

export type RsvpStage1 = z.infer<typeof RsvpStage1Schema>
export type RsvpStage2 = z.infer<typeof RsvpStage2Schema>
export type CombinedRsvp = z.infer<typeof CombinedRsvpSchema>

export type CreateAccommodation = z.infer<typeof CreateAccommodationSchema>
export type UpdateAccommodation = z.infer<typeof UpdateAccommodationSchema>
export type CreateRoomType = z.infer<typeof CreateRoomTypeSchema>
export type UpdateRoomType = z.infer<typeof UpdateRoomTypeSchema>

export type CreateTransportation = z.infer<typeof CreateTransportationSchema>
export type UpdateTransportation = z.infer<typeof UpdateTransportationSchema>

export type CreateTemplate = z.infer<typeof CreateTemplateSchema>
export type UpdateTemplate = z.infer<typeof UpdateTemplateSchema>
export type SendCommunication = z.infer<typeof SendCommunicationSchema>

export type UpdateEventSettings = z.infer<typeof UpdateEventSettingsSchema>

export type GuestFilter = z.infer<typeof GuestFilterSchema>
export type EventFilter = z.infer<typeof EventFilterSchema>
export type Pagination = z.infer<typeof PaginationSchema>