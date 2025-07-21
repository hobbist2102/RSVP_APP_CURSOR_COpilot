import { pgTable, text, serial, integer, boolean, timestamp, date, jsonb, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

// Core Users table for Supabase Auth integration
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().references(() => "auth.users.id", { onDelete: "cascade" }),
  username: text("username").unique(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("staff"), // admin, staff, couple
  phone: text("phone"),
  company: text("company"),
  avatar: text("avatar"),
  bio: text("bio"),
  lastLogin: timestamp("last_login"),
  
  // Admin onboarding configuration
  emailConfig: jsonb("email_config"), // EmailProviderConfig
  whatsappConfig: jsonb("whatsapp_config"), // WhatsAppConfig
  brandingConfig: jsonb("branding_config"), // BrandingConfig
  eventDefaults: jsonb("event_defaults"), // EventDefaults
  onboardingCompleted: boolean("onboarding_completed").default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Wedding Events with multi-tenant architecture
export const weddingEvents = pgTable("wedding_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  coupleNames: text("couple_names").notNull(),
  brideName: text("bride_name").notNull(),
  groomName: text("groom_name").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  rsvpDeadline: date("rsvp_deadline"),
  
  // RSVP Settings
  allowPlusOnes: boolean("allow_plus_ones").default(true),
  allowChildrenDetails: boolean("allow_children_details").default(true),
  customRsvpUrl: text("custom_rsvp_url"),
  rsvpWelcomeTitle: text("rsvp_welcome_title"),
  rsvpWelcomeMessage: text("rsvp_welcome_message"),
  rsvpCustomBranding: text("rsvp_custom_branding"),
  rsvpShowSelectAll: boolean("rsvp_show_select_all").default(true),
  
  // Communication Configuration
  emailProvider: text("email_provider").default("resend"),
  emailFromAddress: text("email_from_address"),
  emailFromName: text("email_from_name"),
  emailConfigured: boolean("email_configured").default(false),
  
  // WhatsApp Configuration
  whatsappConfigured: boolean("whatsapp_configured").default(false),
  whatsappBusinessPhoneId: text("whatsapp_business_phone_id"),
  whatsappAccessToken: text("whatsapp_access_token"),
  
  // Branding
  primaryColor: text("primary_color").default("#7A51E1"),
  secondaryColor: text("secondary_color").default("#E3C76F"),
  logoUrl: text("logo_url"),
  bannerUrl: text("banner_url"),
  
  // Ownership and audit
  createdBy: uuid("created_by").notNull().references(() => profiles.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Event access control for multi-tenancy
export const eventUsers = pgTable("event_users", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => weddingEvents.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("viewer"), // owner, admin, editor, viewer
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Ceremonies within events
export const ceremonies = pgTable("ceremonies", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => weddingEvents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  attireCode: text("attire_code"),
  ceremonyType: text("ceremony_type"),
  maxCapacity: integer("max_capacity"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Guests
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => weddingEvents.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  countryCode: text("country_code"),
  
  // Guest categorization
  side: text("side").notNull(), // bride, groom, both
  relationship: text("relationship"),
  isFamily: boolean("is_family").default(false),
  isVip: boolean("is_vip").default(false),
  
  // RSVP Status
  rsvpStatus: text("rsvp_status").default("pending"), // pending, confirmed, declined
  rsvpDate: timestamp("rsvp_date"),
  rsvpToken: text("rsvp_token").unique(),
  
  // Plus-one support
  plusOneAllowed: boolean("plus_one_allowed").default(false),
  plusOneConfirmed: boolean("plus_one_confirmed").default(false),
  plusOneName: text("plus_one_name"),
  plusOneEmail: text("plus_one_email"),
  plusOnePhone: text("plus_one_phone"),
  plusOneRelationship: text("plus_one_relationship"),
  
  // Additional details
  dietaryRestrictions: text("dietary_restrictions"),
  allergies: text("allergies"),
  specialRequests: text("special_requests"),
  childrenDetails: jsonb("children_details").default("[]"),
  
  // Accommodation and travel
  needsAccommodation: boolean("needs_accommodation").default(false),
  accommodationPreference: text("accommodation_preference"),
  needsFlightAssistance: boolean("needs_flight_assistance").default(false),
  arrivalDate: date("arrival_date"),
  departureDate: date("departure_date"),
  
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Guest ceremony attendance
export const guestCeremonies = pgTable("guest_ceremonies", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  ceremonyId: integer("ceremony_id").notNull().references(() => ceremonies.id, { onDelete: "cascade" }),
  attending: boolean("attending").default(false),
  mealPreference: text("meal_preference"),
  specialDietaryNeeds: text("special_dietary_needs"),
});

// Communication templates
export const communicationTemplates = pgTable("communication_templates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => weddingEvents.id, { onDelete: "cascade" }), // null for global templates
  categoryId: text("category_id").notNull(),
  templateId: text("template_id").notNull(),
  channel: text("channel").notNull(), // email, whatsapp, sms
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject"), // for email templates
  content: text("content").notNull(),
  variables: text("variables").array(), // dynamic variable placeholders
  tags: text("tags").array(),
  enabled: boolean("enabled").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hotels for accommodation
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => weddingEvents.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  website: text("website"),
  description: text("description"),
  priceRange: text("price_range"),
  distanceFromVenue: text("distance_from_venue"),
  amenities: text("amenities"),
  bookingInstructions: text("booking_instructions"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Room types
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => weddingEvents.id, { onDelete: "cascade" }),
  hotelId: integer("hotel_id").references(() => hotels.id),
  name: text("name").notNull(),
  roomType: text("room_type").notNull(),
  bedType: text("bed_type"),
  maxOccupancy: integer("max_occupancy").notNull(),
  totalRooms: integer("total_rooms").notNull(),
  allocatedRooms: integer("allocated_rooms").default(0),
  pricePerNight: text("price_per_night"),
  specialFeatures: text("special_features"),
});

// Room allocations
export const roomAllocations = pgTable("room_allocations", {
  id: serial("id").primaryKey(),
  accommodationId: integer("accommodation_id").notNull().references(() => accommodations.id),
  guestId: integer("guest_id").notNull().references(() => guests.id),
  roomNumber: text("room_number"),
  checkInDate: date("check_in_date"),
  checkOutDate: date("check_out_date"),
  confirmed: boolean("confirmed").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export schemas for validation
export const insertProfileSchema = createInsertSchema(profiles);
export const selectProfileSchema = createSelectSchema(profiles);

export const insertWeddingEventSchema = createInsertSchema(weddingEvents);
export const selectWeddingEventSchema = createSelectSchema(weddingEvents);

export const insertGuestSchema = createInsertSchema(guests);
export const selectGuestSchema = createSelectSchema(guests);

export const insertCeremonySchema = createInsertSchema(ceremonies);
export const selectCeremonySchema = createSelectSchema(ceremonies);

// Type exports
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;

export type WeddingEvent = typeof weddingEvents.$inferSelect;
export type NewWeddingEvent = typeof weddingEvents.$inferInsert;

export type Guest = typeof guests.$inferSelect;
export type NewGuest = typeof guests.$inferInsert;

export type Ceremony = typeof ceremonies.$inferSelect;
export type NewCeremony = typeof ceremonies.$inferInsert;