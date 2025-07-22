import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  date,
  pgEnum,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums
export const userRoleEnum = pgEnum('user_role', [
  'super_admin',
  'admin', 
  'planner',
  'couple',
  'guest'
])

export const eventStatusEnum = pgEnum('event_status', [
  'draft',
  'active',
  'completed',
  'cancelled'
])

export const guestSideEnum = pgEnum('guest_side', [
  'bride',
  'groom',
  'mutual'
])

export const rsvpStatusEnum = pgEnum('rsvp_status', [
  'pending',
  'attending',
  'not_attending',
  'maybe'
])

export const attendanceStatusEnum = pgEnum('attendance_status', [
  'yes',
  'no',
  'maybe'
])

export const severityEnum = pgEnum('severity', [
  'low',
  'medium',
  'high',
  'critical'
])

export const communicationTypeEnum = pgEnum('communication_type', [
  'email',
  'whatsapp',
  'sms'
])

export const communicationStatusEnum = pgEnum('communication_status', [
  'pending',
  'sent',
  'delivered',
  'failed',
  'bounced'
])

export const templateCategoryEnum = pgEnum('template_category', [
  'invitation',
  'reminder',
  'confirmation',
  'update',
  'thank_you'
])

// Core Tables

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password_hash: varchar('password_hash', { length: 255 }),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').default('couple').notNull(),
  email_verified: boolean('email_verified').default(false),
  avatar_url: varchar('avatar_url', { length: 500 }),
  phone: varchar('phone', { length: 20 }),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  preferences: text('preferences'), // JSON field for user preferences
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  emailIndex: uniqueIndex('users_email_idx').on(table.email),
  roleIndex: index('users_role_idx').on(table.role),
}))

// Events table - Multi-tenant boundary
export const events = pgTable('events', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  couple_names: varchar('couple_names', { length: 255 }).notNull(),
  bride_name: varchar('bride_name', { length: 100 }),
  groom_name: varchar('groom_name', { length: 100 }),
  wedding_date: date('wedding_date').notNull(),
  venue_name: varchar('venue_name', { length: 255 }),
  venue_address: text('venue_address'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  status: eventStatusEnum('status').default('draft').notNull(),
  description: text('description'),
  cover_image_url: varchar('cover_image_url', { length: 500 }),
  website_url: varchar('website_url', { length: 500 }),
  contact_email: varchar('contact_email', { length: 255 }),
  contact_phone: varchar('contact_phone', { length: 20 }),
  max_guests: integer('max_guests'),
  budget: decimal('budget', { precision: 10, scale: 2 }),
  currency: varchar('currency', { length: 3 }).default('USD'),
  created_by: uuid('created_by').references(() => users.id).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  createdByIndex: index('events_created_by_idx').on(table.created_by),
  statusIndex: index('events_status_idx').on(table.status),
  dateIndex: index('events_date_idx').on(table.wedding_date),
}))

// Event Users - Many-to-many relationship for event access
export const eventUsers = pgTable('event_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  role: userRoleEnum('role').notNull(),
  permissions: text('permissions'), // JSON array of permissions
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventUserIndex: uniqueIndex('event_users_event_user_idx').on(table.event_id, table.user_id),
  eventIndex: index('event_users_event_idx').on(table.event_id),
  userIndex: index('event_users_user_idx').on(table.user_id),
}))

// Ceremonies table
export const ceremonies = pgTable('ceremonies', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  ceremony_date: date('ceremony_date').notNull(),
  start_time: varchar('start_time', { length: 10 }), // HH:MM format
  end_time: varchar('end_time', { length: 10 }),
  venue_name: varchar('venue_name', { length: 255 }),
  venue_address: text('venue_address'),
  dress_code: varchar('dress_code', { length: 255 }),
  is_main_ceremony: boolean('is_main_ceremony').default(false),
  max_guests: integer('max_guests'),
  requires_rsvp: boolean('requires_rsvp').default(true),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('ceremonies_event_idx').on(table.event_id),
  dateIndex: index('ceremonies_date_idx').on(table.ceremony_date),
  orderIndex: index('ceremonies_order_idx').on(table.event_id, table.display_order),
}))

// Guests table
export const guests = pgTable('guests', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  address: text('address'),
  side: guestSideEnum('side').notNull(),
  relationship: varchar('relationship', { length: 100 }),
  age_group: varchar('age_group', { length: 20 }),
  rsvp_status: rsvpStatusEnum('rsvp_status').default('pending').notNull(),
  rsvp_token: varchar('rsvp_token', { length: 255 }).unique(),
  rsvp_submitted_at: timestamp('rsvp_submitted_at'),
  plus_one_allowed: boolean('plus_one_allowed').default(false),
  plus_one_name: varchar('plus_one_name', { length: 255 }),
  plus_one_email: varchar('plus_one_email', { length: 255 }),
  plus_one_phone: varchar('plus_one_phone', { length: 20 }),
  dietary_requirements: text('dietary_requirements'),
  special_requests: text('special_requests'),
  accessibility_needs: text('accessibility_needs'),
  language_preference: varchar('language_preference', { length: 10 }).default('en'),
  invitation_sent: boolean('invitation_sent').default(false),
  invitation_sent_at: timestamp('invitation_sent_at'),
  reminder_sent: boolean('reminder_sent').default(false),
  reminder_sent_at: timestamp('reminder_sent_at'),
  notes: text('notes'),
  tags: text('tags'), // JSON array for guest tags
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('guests_event_idx').on(table.event_id),
  rsvpStatusIndex: index('guests_rsvp_status_idx').on(table.event_id, table.rsvp_status),
  rsvpTokenIndex: uniqueIndex('guests_rsvp_token_idx').on(table.rsvp_token),
  emailIndex: index('guests_email_idx').on(table.email),
  sideIndex: index('guests_side_idx').on(table.event_id, table.side),
  nameIndex: index('guests_name_idx').on(table.first_name, table.last_name),
}))

// Guest Ceremonies - Many-to-many relationship
export const guestCeremonies = pgTable('guest_ceremonies', {
  id: uuid('id').defaultRandom().primaryKey(),
  guest_id: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  ceremony_id: uuid('ceremony_id').references(() => ceremonies.id, { onDelete: 'cascade' }).notNull(),
  attendance_status: attendanceStatusEnum('attendance_status').default('yes').notNull(),
  meal_preference: varchar('meal_preference', { length: 100 }),
  plus_one_attendance: attendanceStatusEnum('plus_one_attendance'),
  plus_one_meal_preference: varchar('plus_one_meal_preference', { length: 100 }),
  special_requirements: text('special_requirements'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  guestCeremonyIndex: uniqueIndex('guest_ceremonies_guest_ceremony_idx').on(table.guest_id, table.ceremony_id),
  guestIndex: index('guest_ceremonies_guest_idx').on(table.guest_id),
  ceremonyIndex: index('guest_ceremonies_ceremony_idx').on(table.ceremony_id),
  attendanceIndex: index('guest_ceremonies_attendance_idx').on(table.ceremony_id, table.attendance_status),
}))

// RSVP Responses - Detailed response tracking
export const rsvpResponses = pgTable('rsvp_responses', {
  id: uuid('id').defaultRandom().primaryKey(),
  guest_id: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  stage: integer('stage').notNull(), // 1 or 2 for two-stage RSVP
  response_data: text('response_data').notNull(), // JSON with all response data
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  submitted_at: timestamp('submitted_at').defaultNow().notNull(),
}, (table) => ({
  guestIndex: index('rsvp_responses_guest_idx').on(table.guest_id),
  eventIndex: index('rsvp_responses_event_idx').on(table.event_id),
  stageIndex: index('rsvp_responses_stage_idx').on(table.guest_id, table.stage),
}))

// Accommodations table
export const accommodations = pgTable('accommodations', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // hotel, guesthouse, etc.
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  website: varchar('website', { length: 500 }),
  description: text('description'),
  amenities: text('amenities'), // JSON array
  check_in_time: varchar('check_in_time', { length: 10 }),
  check_out_time: varchar('check_out_time', { length: 10 }),
  distance_from_venue: decimal('distance_from_venue', { precision: 5, scale: 2 }),
  rating: decimal('rating', { precision: 2, scale: 1 }),
  price_range: varchar('price_range', { length: 50 }),
  total_rooms: integer('total_rooms'),
  blocked_rooms: integer('blocked_rooms').default(0),
  booking_deadline: date('booking_deadline'),
  special_rates: boolean('special_rates').default(false),
  contact_person: varchar('contact_person', { length: 255 }),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('accommodations_event_idx').on(table.event_id),
  typeIndex: index('accommodations_type_idx').on(table.type),
}))

// Room Types
export const roomTypes = pgTable('room_types', {
  id: uuid('id').defaultRandom().primaryKey(),
  accommodation_id: uuid('accommodation_id').references(() => accommodations.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  capacity: integer('capacity').notNull(),
  bed_type: varchar('bed_type', { length: 100 }),
  amenities: text('amenities'), // JSON array
  price_per_night: decimal('price_per_night', { precision: 8, scale: 2 }),
  total_rooms: integer('total_rooms').notNull(),
  available_rooms: integer('available_rooms').notNull(),
  images: text('images'), // JSON array of image URLs
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  accommodationIndex: index('room_types_accommodation_idx').on(table.accommodation_id),
}))

// Guest Accommodations
export const guestAccommodations = pgTable('guest_accommodations', {
  id: uuid('id').defaultRandom().primaryKey(),
  guest_id: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  accommodation_id: uuid('accommodation_id').references(() => accommodations.id, { onDelete: 'cascade' }).notNull(),
  room_type_id: uuid('room_type_id').references(() => roomTypes.id, { onDelete: 'cascade' }),
  room_number: varchar('room_number', { length: 50 }),
  check_in_date: date('check_in_date'),
  check_out_date: date('check_out_date'),
  number_of_guests: integer('number_of_guests').default(1),
  booking_status: varchar('booking_status', { length: 50 }).default('assigned'),
  booking_reference: varchar('booking_reference', { length: 255 }),
  special_requests: text('special_requests'),
  total_cost: decimal('total_cost', { precision: 8, scale: 2 }),
  payment_status: varchar('payment_status', { length: 50 }).default('pending'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  guestIndex: index('guest_accommodations_guest_idx').on(table.guest_id),
  accommodationIndex: index('guest_accommodations_accommodation_idx').on(table.accommodation_id),
  statusIndex: index('guest_accommodations_status_idx').on(table.booking_status),
}))

// Transportation table
export const transportation = pgTable('transportation', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // shuttle, taxi, car_rental, etc.
  provider: varchar('provider', { length: 255 }),
  contact_person: varchar('contact_person', { length: 255 }),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  vehicle_type: varchar('vehicle_type', { length: 100 }),
  capacity: integer('capacity'),
  pickup_location: text('pickup_location'),
  dropoff_location: text('dropoff_location'),
  departure_time: timestamp('departure_time'),
  arrival_time: timestamp('arrival_time'),
  cost_per_person: decimal('cost_per_person', { precision: 8, scale: 2 }),
  total_cost: decimal('total_cost', { precision: 8, scale: 2 }),
  booking_deadline: date('booking_deadline'),
  special_instructions: text('special_instructions'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('transportation_event_idx').on(table.event_id),
  typeIndex: index('transportation_type_idx').on(table.type),
  timeIndex: index('transportation_time_idx').on(table.departure_time),
}))

// Guest Transportation
export const guestTransportation = pgTable('guest_transportation', {
  id: uuid('id').defaultRandom().primaryKey(),
  guest_id: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  transportation_id: uuid('transportation_id').references(() => transportation.id, { onDelete: 'cascade' }).notNull(),
  pickup_location: text('pickup_location'),
  dropoff_location: text('dropoff_location'),
  pickup_time: timestamp('pickup_time'),
  number_of_passengers: integer('number_of_passengers').default(1),
  booking_status: varchar('booking_status', { length: 50 }).default('assigned'),
  booking_reference: varchar('booking_reference', { length: 255 }),
  special_requests: text('special_requests'),
  cost: decimal('cost', { precision: 8, scale: 2 }),
  payment_status: varchar('payment_status', { length: 50 }).default('pending'),
  notes: text('notes'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  guestIndex: index('guest_transportation_guest_idx').on(table.guest_id),
  transportationIndex: index('guest_transportation_transportation_idx').on(table.transportation_id),
  statusIndex: index('guest_transportation_status_idx').on(table.booking_status),
}))

// Communication Templates
export const communicationTemplates = pgTable('communication_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  type: communicationTypeEnum('type').notNull(),
  category: templateCategoryEnum('category').notNull(),
  subject: varchar('subject', { length: 500 }),
  content: text('content').notNull(),
  variables: text('variables'), // JSON array of available variables
  is_default: boolean('is_default').default(false),
  is_active: boolean('is_active').default(true),
  language: varchar('language', { length: 10 }).default('en'),
  created_by: uuid('created_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('communication_templates_event_idx').on(table.event_id),
  typeIndex: index('communication_templates_type_idx').on(table.type),
  categoryIndex: index('communication_templates_category_idx').on(table.category),
}))

// Communications - Message history
export const communications = pgTable('communications', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  template_id: uuid('template_id').references(() => communicationTemplates.id),
  recipient_id: uuid('recipient_id').references(() => guests.id, { onDelete: 'cascade' }),
  recipient_email: varchar('recipient_email', { length: 255 }),
  recipient_phone: varchar('recipient_phone', { length: 20 }),
  type: communicationTypeEnum('type').notNull(),
  subject: varchar('subject', { length: 500 }),
  content: text('content').notNull(),
  status: communicationStatusEnum('status').default('pending').notNull(),
  sent_at: timestamp('sent_at'),
  delivered_at: timestamp('delivered_at'),
  opened_at: timestamp('opened_at'),
  clicked_at: timestamp('clicked_at'),
  error_message: text('error_message'),
  provider_id: varchar('provider_id', { length: 255 }),
  provider_response: text('provider_response'),
  retry_count: integer('retry_count').default(0),
  scheduled_for: timestamp('scheduled_for'),
  sent_by: uuid('sent_by').references(() => users.id),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('communications_event_idx').on(table.event_id),
  recipientIndex: index('communications_recipient_idx').on(table.recipient_id),
  statusIndex: index('communications_status_idx').on(table.status),
  typeIndex: index('communications_type_idx').on(table.type),
  scheduledIndex: index('communications_scheduled_idx').on(table.scheduled_for),
}))

// Event Settings
export const eventSettings = pgTable('event_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull().unique(),
  rsvp_deadline: date('rsvp_deadline'),
  allow_plus_ones: boolean('allow_plus_ones').default(true),
  require_meal_selection: boolean('require_meal_selection').default(false),
  require_accommodation: boolean('require_accommodation').default(false),
  require_transportation: boolean('require_transportation').default(false),
  enable_two_stage_rsvp: boolean('enable_two_stage_rsvp').default(true),
  custom_fields: text('custom_fields'), // JSON for custom RSVP fields
  email_settings: text('email_settings'), // JSON for email configuration
  whatsapp_settings: text('whatsapp_settings'), // JSON for WhatsApp configuration
  theme_settings: text('theme_settings'), // JSON for theme customization
  privacy_settings: text('privacy_settings'), // JSON for privacy configuration
  notification_settings: text('notification_settings'), // JSON for notification preferences
  language: varchar('language', { length: 10 }).default('en'),
  timezone: varchar('timezone', { length: 50 }).default('UTC'),
  currency: varchar('currency', { length: 3 }).default('USD'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: uniqueIndex('event_settings_event_idx').on(table.event_id),
}))

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  event_id: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }),
  user_id: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  action: varchar('action', { length: 100 }).notNull(),
  resource: varchar('resource', { length: 50 }).notNull(),
  resource_id: varchar('resource_id', { length: 255 }),
  details: text('details'), // JSON for additional context
  severity: severityEnum('severity').notNull(),
  ip_address: varchar('ip_address', { length: 45 }),
  user_agent: text('user_agent'),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  eventIndex: index('audit_logs_event_idx').on(table.event_id),
  userIndex: index('audit_logs_user_idx').on(table.user_id),
  actionIndex: index('audit_logs_action_idx').on(table.action),
  resourceIndex: index('audit_logs_resource_idx').on(table.resource, table.resource_id),
  severityIndex: index('audit_logs_severity_idx').on(table.severity),
  timeIndex: index('audit_logs_time_idx').on(table.created_at),
}))

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  createdEvents: many(events),
  eventUsers: many(eventUsers),
  communicationTemplates: many(communicationTemplates),
  communications: many(communications),
  auditLogs: many(auditLogs),
}))

export const eventsRelations = relations(events, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [events.created_by],
    references: [users.id],
  }),
  eventUsers: many(eventUsers),
  guests: many(guests),
  ceremonies: many(ceremonies),
  accommodations: many(accommodations),
  transportation: many(transportation),
  communicationTemplates: many(communicationTemplates),
  communications: many(communications),
  rsvpResponses: many(rsvpResponses),
  settings: one(eventSettings),
  auditLogs: many(auditLogs),
}))

export const eventUsersRelations = relations(eventUsers, ({ one }) => ({
  event: one(events, {
    fields: [eventUsers.event_id],
    references: [events.id],
  }),
  user: one(users, {
    fields: [eventUsers.user_id],
    references: [users.id],
  }),
}))

export const guestsRelations = relations(guests, ({ one, many }) => ({
  event: one(events, {
    fields: [guests.event_id],
    references: [events.id],
  }),
  guestCeremonies: many(guestCeremonies),
  rsvpResponses: many(rsvpResponses),
  guestAccommodations: many(guestAccommodations),
  guestTransportation: many(guestTransportation),
  communications: many(communications),
}))

export const ceremoniesRelations = relations(ceremonies, ({ one, many }) => ({
  event: one(events, {
    fields: [ceremonies.event_id],
    references: [events.id],
  }),
  guestCeremonies: many(guestCeremonies),
}))

export const guestCeremoniesRelations = relations(guestCeremonies, ({ one }) => ({
  guest: one(guests, {
    fields: [guestCeremonies.guest_id],
    references: [guests.id],
  }),
  ceremony: one(ceremonies, {
    fields: [guestCeremonies.ceremony_id],
    references: [ceremonies.id],
  }),
}))

export const accommodationsRelations = relations(accommodations, ({ one, many }) => ({
  event: one(events, {
    fields: [accommodations.event_id],
    references: [events.id],
  }),
  roomTypes: many(roomTypes),
  guestAccommodations: many(guestAccommodations),
}))

export const roomTypesRelations = relations(roomTypes, ({ one, many }) => ({
  accommodation: one(accommodations, {
    fields: [roomTypes.accommodation_id],
    references: [accommodations.id],
  }),
  guestAccommodations: many(guestAccommodations),
}))

export const guestAccommodationsRelations = relations(guestAccommodations, ({ one }) => ({
  guest: one(guests, {
    fields: [guestAccommodations.guest_id],
    references: [guests.id],
  }),
  accommodation: one(accommodations, {
    fields: [guestAccommodations.accommodation_id],
    references: [accommodations.id],
  }),
  roomType: one(roomTypes, {
    fields: [guestAccommodations.room_type_id],
    references: [roomTypes.id],
  }),
}))

export const transportationRelations = relations(transportation, ({ one, many }) => ({
  event: one(events, {
    fields: [transportation.event_id],
    references: [events.id],
  }),
  guestTransportation: many(guestTransportation),
}))

export const guestTransportationRelations = relations(guestTransportation, ({ one }) => ({
  guest: one(guests, {
    fields: [guestTransportation.guest_id],
    references: [guests.id],
  }),
  transportation: one(transportation, {
    fields: [guestTransportation.transportation_id],
    references: [transportation.id],
  }),
}))

export const communicationTemplatesRelations = relations(communicationTemplates, ({ one, many }) => ({
  event: one(events, {
    fields: [communicationTemplates.event_id],
    references: [events.id],
  }),
  createdBy: one(users, {
    fields: [communicationTemplates.created_by],
    references: [users.id],
  }),
  communications: many(communications),
}))

export const communicationsRelations = relations(communications, ({ one }) => ({
  event: one(events, {
    fields: [communications.event_id],
    references: [events.id],
  }),
  template: one(communicationTemplates, {
    fields: [communications.template_id],
    references: [communicationTemplates.id],
  }),
  recipient: one(guests, {
    fields: [communications.recipient_id],
    references: [guests.id],
  }),
  sentBy: one(users, {
    fields: [communications.sent_by],
    references: [users.id],
  }),
}))

export const rsvpResponsesRelations = relations(rsvpResponses, ({ one }) => ({
  guest: one(guests, {
    fields: [rsvpResponses.guest_id],
    references: [guests.id],
  }),
  event: one(events, {
    fields: [rsvpResponses.event_id],
    references: [events.id],
  }),
}))

export const eventSettingsRelations = relations(eventSettings, ({ one }) => ({
  event: one(events, {
    fields: [eventSettings.event_id],
    references: [events.id],
  }),
}))

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  event: one(events, {
    fields: [auditLogs.event_id],
    references: [events.id],
  }),
  user: one(users, {
    fields: [auditLogs.user_id],
    references: [users.id],
  }),
}))

// Export all tables and types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Event = typeof events.$inferSelect
export type NewEvent = typeof events.$inferInsert
export type Guest = typeof guests.$inferSelect
export type NewGuest = typeof guests.$inferInsert
export type Ceremony = typeof ceremonies.$inferSelect
export type NewCeremony = typeof ceremonies.$inferInsert
export type GuestCeremony = typeof guestCeremonies.$inferSelect
export type NewGuestCeremony = typeof guestCeremonies.$inferInsert
export type Accommodation = typeof accommodations.$inferSelect
export type NewAccommodation = typeof accommodations.$inferInsert
export type Transportation = typeof transportation.$inferSelect
export type NewTransportation = typeof transportation.$inferInsert
export type CommunicationTemplate = typeof communicationTemplates.$inferSelect
export type NewCommunicationTemplate = typeof communicationTemplates.$inferInsert
export type Communication = typeof communications.$inferSelect
export type NewCommunication = typeof communications.$inferInsert
export type EventSettings = typeof eventSettings.$inferSelect
export type NewEventSettings = typeof eventSettings.$inferInsert

// RSVP tokens table for secure guest access
export const rsvpTokens = pgTable('rsvp_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  guest_id: uuid('guest_id').references(() => guests.id, { onDelete: 'cascade' }).notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  used_at: timestamp('used_at'),
  is_active: boolean('is_active').default(true).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (table) => ({
  tokenIndex: index('rsvp_tokens_token_idx').on(table.token),
  guestTokenIndex: index('rsvp_tokens_guest_idx').on(table.guest_id),
  activeTokenIndex: index('rsvp_tokens_active_idx').on(table.is_active),
}))

export type RsvpToken = typeof rsvpTokens.$inferSelect
export type NewRsvpToken = typeof rsvpTokens.$inferInsert