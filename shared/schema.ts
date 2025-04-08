import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull().default("staff"), // staff, admin, couple
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Wedding Events
export const weddingEvents = pgTable("wedding_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  coupleNames: text("couple_names").notNull(),
  date: date("date").notNull(),
  location: text("location").notNull(),
  description: text("description"),
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
  phone: text("phone"),
  address: text("address"),
  isFamily: boolean("is_family").default(false),
  relationship: text("relationship"),
  rsvpStatus: text("rsvp_status").default("pending"), // pending, confirmed, declined
  plusOneAllowed: boolean("plus_one_allowed").default(false),
  plusOneName: text("plus_one_name"),
  numberOfChildren: integer("number_of_children").default(0),
  childrenNames: text("children_names"),
  dietaryRestrictions: text("dietary_restrictions"),
  tableAssignment: text("table_assignment"),
  giftTracking: text("gift_tracking"),
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

// Accommodations
export const accommodations = pgTable("accommodations", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
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
  checkIn: date("check_in"),
  checkOut: date("check_out"),
  specialRequests: text("special_requests"),
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
