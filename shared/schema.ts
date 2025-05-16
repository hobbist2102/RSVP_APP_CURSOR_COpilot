import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: text("role").notNull().default("staff"), // staff, admin, couple
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Wedding Events
export const weddingEvents = pgTable("wedding_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  coupleNames: text("couple_names").notNull(),
  brideName: text("bride_name").notNull(),
  groomName: text("groom_name").notNull(),
  startDate: date("start_date").notNull(), // Start date of the wedding events
  endDate: date("end_date").notNull(),     // End date of the wedding events
  date: date("date"),                      // Keeping for backward compatibility
  location: text("location").notNull(),
  description: text("description"),
  rsvpDeadline: date("rsvp_deadline"),    // Deadline for RSVP submissions
  // RSVP Settings
  allowPlusOnes: boolean("allow_plus_ones").default(true),
  allowChildrenDetails: boolean("allow_children_details").default(true),
  customRsvpUrl: text("custom_rsvp_url"),
  // Email Configuration
  emailProvider: text("email_provider").default("resend"), // 'resend', 'sendgrid', etc.
  emailApiKey: text("email_api_key"),                      // API key for the email provider
  emailFromAddress: text("email_from_address"),            // The "from" email address
  emailFromDomain: text("email_from_domain"),              // Domain for the email
  emailConfigured: boolean("email_configured").default(false),
  // WhatsApp Business API Integration
  whatsappBusinessPhoneId: text("whatsapp_business_phone_id"),
  whatsappBusinessNumber: text("whatsapp_business_number"),
  whatsappBusinessAccountId: text("whatsapp_business_account_id"),
  whatsappAccessToken: text("whatsapp_access_token"),
  whatsappConfigured: boolean("whatsapp_configured").default(false),
  // Email Communication Settings
  emailFrom: text("email_from"),
  emailReplyTo: text("email_reply_to"),
  useGmail: boolean("use_gmail").default(false),
  useOutlook: boolean("use_outlook").default(false),
  useSendGrid: boolean("use_sendgrid").default(false),
  // Gmail settings
  gmailClientId: text("gmail_client_id"),
  gmailClientSecret: text("gmail_client_secret"),
  gmailRedirectUri: text("gmail_redirect_uri"),
  gmailAccount: text("gmail_account"),
  gmailAccessToken: text("gmail_access_token"),
  gmailRefreshToken: text("gmail_refresh_token"),
  gmailTokenExpiry: timestamp("gmail_token_expiry"),
  // Gmail Direct SMTP settings (alternative to OAuth)
  useGmailDirectSMTP: boolean("use_gmail_direct_smtp").default(false),
  gmailPassword: text("gmail_password"),
  gmailSmtpHost: text("gmail_smtp_host").default("smtp.gmail.com"),
  gmailSmtpPort: integer("gmail_smtp_port").default(587),
  gmailSmtpSecure: boolean("gmail_smtp_secure").default(false),
  // Outlook settings
  outlookClientId: text("outlook_client_id"),
  outlookClientSecret: text("outlook_client_secret"),
  outlookRedirectUri: text("outlook_redirect_uri"),
  outlookAccount: text("outlook_account"),
  outlookAccessToken: text("outlook_access_token"),
  outlookRefreshToken: text("outlook_refresh_token"),
  outlookTokenExpiry: timestamp("outlook_token_expiry"),
  // SendGrid settings
  sendGridApiKey: text("sendgrid_api_key"),
  // Travel & Accommodation Settings
  
  // Accommodation Settings
  accommodationMode: text("accommodation_mode").default("none"), // 'all', 'none', 'selected', 'special_deal'
  accommodationSpecialDeals: text("accommodation_special_deals"), // Details for special hotel deals
  accommodationInstructions: text("accommodation_instructions"), // Instructions for booking
  accommodationHotelName: text("accommodation_hotel_name"), // For special deals or when providing for all
  accommodationHotelAddress: text("accommodation_hotel_address"),
  accommodationHotelPhone: text("accommodation_hotel_phone"),
  accommodationHotelWebsite: text("accommodation_hotel_website"),
  accommodationSpecialRates: text("accommodation_special_rates"), // Rate codes or discount information
  
  // Transport Settings
  transportMode: text("transport_mode").default("none"), // 'all', 'none', 'selected', 'special_deal'
  transportSpecialDeals: text("transport_special_deals"), // Details for special transport arrangements
  transportInstructions: text("transport_instructions"), // Instructions for arranging transport
  transportProviderName: text("transport_provider_name"), // For special deals
  transportProviderContact: text("transport_provider_contact"),
  transportProviderWebsite: text("transport_provider_website"),
  
  // Flight Settings
  flightMode: text("flight_mode").default("none"), // 'all', 'none', 'selected', 'special_deal'
  flightSpecialDeals: text("flight_special_deals"), // Details for special airline deals
  flightInstructions: text("flight_instructions"), // Instructions for booking flights
  recommendedAirlines: text("recommended_airlines"),
  airlineDiscountCodes: text("airline_discount_codes"),
  
  // Supporting old fields for backward compatibility
  offerTravelAssistance: boolean("offer_travel_assistance").default(false),
  transportationProvided: boolean("transportation_provided").default(false),
  defaultArrivalLocation: text("default_arrival_location"),
  defaultDepartureLocation: text("default_departure_location"),
  defaultHotelName: text("default_hotel_name"),
  defaultHotelAddress: text("default_hotel_address"),
  defaultHotelPhone: text("default_hotel_phone"),
  defaultHotelWebsite: text("default_hotel_website"),
  specialHotelRates: text("special_hotel_rates"),
  bookingInstructions: text("booking_instructions"),
  // General metadata
  createdBy: integer("created_by").notNull(),
});

export const insertWeddingEventSchema = createInsertSchema(weddingEvents).omit({
  id: true,
});

// Guests
export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  gender: text("gender"), // male, female, other
  salutation: text("salutation"), // Mr, Mrs, Ms, Dr, etc.
  countryCode: text("country_code"),
  phone: text("phone"),
  whatsappSame: boolean("whatsapp_same").default(true),
  whatsappCountryCode: text("whatsapp_country_code"),
  whatsappNumber: text("whatsapp_number"),
  whatsappAvailable: boolean("whatsapp_available").default(false),
  address: text("address"),
  side: text("side").notNull(), // "bride" or "groom"
  isFamily: boolean("is_family").default(false), // is a family member
  relationship: text("relationship"),
  rsvpStatus: text("rsvp_status").default("pending"), // pending, confirmed, declined
  rsvpDate: date("rsvp_date"),                        // Date when the RSVP was submitted
  plusOneAllowed: boolean("plus_one_allowed").default(false),
  plusOneConfirmed: boolean("plus_one_confirmed").default(false), // Whether plus one is confirmed by guest
  plusOneName: text("plus_one_name"),
  plusOneEmail: text("plus_one_email"),
  plusOnePhone: text("plus_one_phone"),
  plusOneCountryCode: text("plus_one_country_code"),
  plusOneRelationship: text("plus_one_relationship"), // relationship to main guest
  plusOneRsvpContact: boolean("plus_one_rsvp_contact").default(false), // switch RSVP contact to plus one
  plusOneGender: text("plus_one_gender"), // male, female, other
  plusOneSalutation: text("plus_one_salutation"), // Mr, Mrs, Ms, Dr, etc.
  childrenDetails: jsonb("children_details").default("[]"), // array of {name, age, gender, salutation}
  childrenNotes: text("children_notes"), // special notes about children
  // Legacy fields for backward compatibility
  numberOfChildren: integer("number_of_children").default(0), // Deprecated - use childrenDetails.length instead
  childrenNames: text("children_names"),                      // Deprecated - use childrenDetails instead
  dietaryRestrictions: text("dietary_restrictions"),
  allergies: text("allergies"),
  tableAssignment: text("table_assignment"),
  giftTracking: text("gift_tracking"),
  needsAccommodation: boolean("needs_accommodation").default(false),
  accommodationPreference: text("accommodation_preference"), // Guest's preference for accommodation type
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertGuestSchema = createInsertSchema(guests).omit({
  id: true,
  createdAt: true,
});

// Events/Ceremonies
export const ceremonies = pgTable("ceremonies", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  date: date("date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  location: text("location").notNull(),
  description: text("description"),
  attireCode: text("attire_code"),
});

export const insertCeremonySchema = createInsertSchema(ceremonies).omit({
  id: true,
});

// Guest Ceremony Attendance
export const guestCeremonies = pgTable("guest_ceremonies", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull(),
  ceremonyId: integer("ceremony_id").notNull(),
  attending: boolean("attending").default(false),
});

export const insertGuestCeremonySchema = createInsertSchema(guestCeremonies).omit({
  id: true,
});

// Travel Information
export const travelInfo = pgTable("travel_info", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull(),
  travelMode: text("travel_mode"), // air, road, train
  arrivalDate: date("arrival_date"),
  arrivalTime: text("arrival_time"),
  arrivalLocation: text("arrival_location"),
  departureDate: date("departure_date"),
  departureTime: text("departure_time"),
  departureLocation: text("departure_location"),
  flightNumber: text("flight_number"),
  needsTransportation: boolean("needs_transportation").default(false),
  transportationType: text("transportation_type"), // pickup, drop, both
});

export const insertTravelInfoSchema = createInsertSchema(travelInfo).omit({
  id: true,
});

// Hotels for accommodation
export const hotels = pgTable("hotels", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  phone: text("phone"),
  website: text("website"),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  priceRange: text("price_range"), // Price range (e.g., "₹5000-10000")
  distanceFromVenue: text("distance_from_venue"), // Distance from main venue
  amenities: text("amenities"), // Comma-separated list of amenities
  images: text("images"), // Comma-separated URLs of hotel images
  specialNotes: text("special_notes"), // Any special notes for guests
  bookingInstructions: text("booking_instructions"), // Instructions for booking
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertHotelSchema = createInsertSchema(hotels).omit({
  id: true,
  createdAt: true,
});

// Accommodations (room types within hotels)
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  hotelId: integer("hotel_id").references(() => hotels.id), // Link to hotel
  name: text("name").notNull(),
  roomType: text("room_type").notNull(),
  capacity: integer("capacity").notNull(),
  totalRooms: integer("total_rooms").notNull(),
  allocatedRooms: integer("allocated_rooms").default(0),
  pricePerNight: text("price_per_night"),
  specialFeatures: text("special_features"),
});

export const insertAccommodationSchema = createInsertSchema(accommodations).omit({
  id: true,
});

// Room Allocations
export const roomAllocations = pgTable("room_allocations", {
  id: serial("id").primaryKey(),
  accommodationId: integer("accommodation_id").notNull(),
  guestId: integer("guest_id").notNull(),
  roomNumber: text("room_number"),
  checkInDate: date("check_in_date"),
  checkInStatus: text("check_in_status").default("pending"), // pending, confirmed, checked-in, no-show
  checkInTime: text("check_in_time"),
  checkOutDate: date("check_out_date"),
  checkOutStatus: text("check_out_status").default("pending"), // pending, checked-out
  checkOutTime: text("check_out_time"),
  // Legacy fields for backward compatibility
  checkIn: date("check_in"),           // Deprecated - use checkInDate instead
  checkOut: date("check_out"),         // Deprecated - use checkOutDate instead
  specialRequests: text("special_requests"),
  // For tracking accompanying guests in same room
  includesPlusOne: boolean("includes_plus_one").default(false),
  includesChildren: boolean("includes_children").default(false),
  childrenCount: integer("children_count").default(0),
  additionalGuestsInfo: text("additional_guests_info"),
});

export const insertRoomAllocationSchema = createInsertSchema(roomAllocations).omit({
  id: true,
});

// Meal Options
export const mealOptions = pgTable("meal_options", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  ceremonyId: integer("ceremony_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  isVegetarian: boolean("is_vegetarian").default(false),
  isVegan: boolean("is_vegan").default(false),
  isGlutenFree: boolean("is_gluten_free").default(false),
  isNutFree: boolean("is_nut_free").default(false),
});

export const insertMealOptionSchema = createInsertSchema(mealOptions).omit({
  id: true,
});

// Guest Meal Selections
export const guestMealSelections = pgTable("guest_meal_selections", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull(),
  mealOptionId: integer("meal_option_id").notNull(),
  ceremonyId: integer("ceremony_id").notNull(),
  notes: text("notes"),
});

export const insertGuestMealSelectionSchema = createInsertSchema(guestMealSelections).omit({
  id: true,
});

// Messages for the couple
export const coupleMessages = pgTable("couple_messages", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  guestId: integer("guest_id").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCoupleMessageSchema = createInsertSchema(coupleMessages).omit({
  id: true,
  createdAt: true,
});

// Relationship Types
export const relationshipTypes = pgTable("relationship_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  category: text("category").notNull(), // family, friend, custom
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertRelationshipTypeSchema = createInsertSchema(relationshipTypes).omit({
  id: true,
  createdAt: true,
});

// WhatsApp Message Templates
export const whatsappTemplates = pgTable("whatsapp_templates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // invitation, rsvp, reminder, ceremony, travel, accommodation
  templateId: text("template_id"), // WhatsApp Business API template ID
  content: text("content").notNull(),
  parameters: jsonb("parameters").default("[]"), // Array of parameters to fill in template
  language: text("language").default("en_US"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUsed: timestamp("last_used"),
});

export const insertWhatsappTemplateSchema = createInsertSchema(whatsappTemplates).omit({
  id: true,
  createdAt: true,
  lastUsed: true,
});

// RSVP Follow-up Message Templates
export const rsvpFollowupTemplates = pgTable("rsvp_followup_templates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  type: text("type").notNull(), // "confirmation" or "decline"
  emailTemplate: text("email_template"), // HTML template for email
  emailSubject: text("email_subject"), // Subject line for email
  whatsappTemplate: text("whatsapp_template"), // Text-only template for WhatsApp
  sendImmediately: boolean("send_immediately").default(true), // Whether to send immediately after RSVP
  scheduledDate: date("scheduled_date"), // If not sending immediately, date to send
  scheduledTime: text("scheduled_time"), // If not sending immediately, time to send
  enabled: boolean("enabled").default(true), // Whether this followup is enabled
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const insertRsvpFollowupTemplateSchema = createInsertSchema(rsvpFollowupTemplates).omit({
  id: true,
  lastUpdated: true,
});

// RSVP Follow-up Message Logs - tracking sent messages
export const rsvpFollowupLogs = pgTable("rsvp_followup_logs", {
  id: serial("id").primaryKey(),
  guestId: integer("guest_id").notNull(),
  templateId: integer("template_id").notNull(),
  channel: text("channel").notNull(), // "email" or "whatsapp"
  status: text("status").notNull(), // "sent", "delivered", "failed"
  errorMessage: text("error_message"),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const insertRsvpFollowupLogSchema = createInsertSchema(rsvpFollowupLogs).omit({
  id: true,
  sentAt: true,
});

// Email Templates
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  bodyText: text("body_text"),
  category: text("category").notNull(), // invitation, rsvp, reminder, confirmation, etc.
  isDefault: boolean("is_default").default(false),
  isSystem: boolean("is_system").default(false), // System templates can't be deleted
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  isSystem: true,
  lastUpdated: true,
  createdAt: true,
});

// Email Template Styles
export const emailTemplateStyles = pgTable("email_template_styles", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  headerLogo: text("header_logo"), // URL to logo image
  headerBackground: text("header_background"), // Background color or URL
  bodyBackground: text("body_background"), // Background color or URL
  textColor: text("text_color").default("000000"),
  linkColor: text("link_color").default("0000FF"),
  buttonColor: text("button_color").default("4CAF50"),
  buttonTextColor: text("button_text_color").default("FFFFFF"),
  fontFamily: text("font_family").default("Arial, sans-serif"),
  fontSize: text("font_size").default("16px"),
  borderColor: text("border_color").default("DDDDDD"),
  footerText: text("footer_text"),
  footerBackground: text("footer_background"), // Background color or URL
  css: text("css"), // Custom CSS for advanced styling
  isDefault: boolean("is_default").default(false),
  lastUpdated: timestamp("last_updated").defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailTemplateStyleSchema = createInsertSchema(emailTemplateStyles).omit({
  id: true,
  lastUpdated: true,
  createdAt: true,
});

// Email Assets (images, banners, etc.)
export const emailAssets = pgTable("email_assets", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // logo, banner, signature, background, etc.
  url: text("url").notNull(), // URL to the asset
  width: integer("width"),
  height: integer("height"),
  altText: text("alt_text"),
  tags: text("tags"), // Comma-separated tags for organization
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailAssetSchema = createInsertSchema(emailAssets).omit({
  id: true,
  createdAt: true,
});

// Email Signatures
export const emailSignatures = pgTable("email_signatures", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(), // HTML content
  plainText: text("plain_text"), // Plain text version
  includesSocialLinks: boolean("includes_social_links").default(false),
  socialLinks: jsonb("social_links").default({}), // JSON with social media links
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertEmailSignatureSchema = createInsertSchema(emailSignatures).omit({
  id: true,
  createdAt: true,
});

// Email Sending History
export const emailHistory = pgTable("email_history", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  templateId: integer("template_id"),
  subject: text("subject").notNull(),
  sender: text("sender").notNull(),
  recipients: text("recipients").notNull(), // JSON array or comma-separated list
  ccRecipients: text("cc_recipients"), // JSON array or comma-separated list
  bccRecipients: text("bcc_recipients"), // JSON array or comma-separated list
  bodyHtml: text("body_html"),
  bodyText: text("body_text"),
  status: text("status").notNull(), // sent, delivered, failed
  errorMessage: text("error_message"),
  messageId: text("message_id"),
  openCount: integer("open_count").default(0),
  clickCount: integer("click_count").default(0),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
  deliveredAt: timestamp("delivered_at"),
});

export const insertEmailHistorySchema = createInsertSchema(emailHistory).omit({
  id: true,
  openCount: true,
  clickCount: true,
  sentAt: true,
  deliveredAt: true,
});

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type WeddingEvent = typeof weddingEvents.$inferSelect;
export type InsertWeddingEvent = z.infer<typeof insertWeddingEventSchema>;

export type Guest = typeof guests.$inferSelect;
export type InsertGuest = z.infer<typeof insertGuestSchema>;

export type Ceremony = typeof ceremonies.$inferSelect;
export type InsertCeremony = z.infer<typeof insertCeremonySchema>;

export type GuestCeremony = typeof guestCeremonies.$inferSelect;
export type InsertGuestCeremony = z.infer<typeof insertGuestCeremonySchema>;

export type TravelInfo = typeof travelInfo.$inferSelect;
export type InsertTravelInfo = z.infer<typeof insertTravelInfoSchema>;

export type Hotel = typeof hotels.$inferSelect;
export type InsertHotel = z.infer<typeof insertHotelSchema>;

export type Accommodation = typeof accommodations.$inferSelect;
export type InsertAccommodation = z.infer<typeof insertAccommodationSchema>;

export type RoomAllocation = typeof roomAllocations.$inferSelect;
export type InsertRoomAllocation = z.infer<typeof insertRoomAllocationSchema>;

export type MealOption = typeof mealOptions.$inferSelect;
export type InsertMealOption = z.infer<typeof insertMealOptionSchema>;

export type GuestMealSelection = typeof guestMealSelections.$inferSelect;
export type InsertGuestMealSelection = z.infer<typeof insertGuestMealSelectionSchema>;

export type CoupleMessage = typeof coupleMessages.$inferSelect;
export type InsertCoupleMessage = z.infer<typeof insertCoupleMessageSchema>;

export type RelationshipType = typeof relationshipTypes.$inferSelect;
export type InsertRelationshipType = z.infer<typeof insertRelationshipTypeSchema>;

export type WhatsappTemplate = typeof whatsappTemplates.$inferSelect;
export type InsertWhatsappTemplate = z.infer<typeof insertWhatsappTemplateSchema>;

export type RsvpFollowupTemplate = typeof rsvpFollowupTemplates.$inferSelect;
export type InsertRsvpFollowupTemplate = z.infer<typeof insertRsvpFollowupTemplateSchema>;

export type RsvpFollowupLog = typeof rsvpFollowupLogs.$inferSelect;
export type InsertRsvpFollowupLog = z.infer<typeof insertRsvpFollowupLogSchema>;
