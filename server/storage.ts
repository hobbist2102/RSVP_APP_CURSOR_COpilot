import type { Json } from "drizzle-orm";

// Email configuration interface for OAuth integration
export interface EmailConfig {
  // Gmail Configuration
  gmailClientId?: string;
  gmailClientSecret?: string;
  gmailRedirectUri?: string;
  gmailAccount?: string;
  gmailAccessToken?: string;
  gmailRefreshToken?: string;
  gmailTokenExpiry?: Date;
  
  // Outlook Configuration
  outlookClientId?: string;
  outlookClientSecret?: string;
  outlookRedirectUri?: string;
  outlookAccount?: string;
  outlookAccessToken?: string;
  outlookRefreshToken?: string;
  outlookTokenExpiry?: Date;
  
  // Email Provider Settings
  useGmail?: boolean;
  useOutlook?: boolean;
  emailFrom?: string;
  emailReplyTo?: string;
  useSendGrid?: boolean;
  sendGridApiKey?: string;
  emailProvider?: string;
  emailFromAddress?: string;
  emailConfigured?: boolean;
}

import {
  users, type User, type UpsertUser,
  weddingEvents, type WeddingEvent, type InsertWeddingEvent,
  guests, type Guest, type InsertGuest,
  ceremonies, type Ceremony, type InsertCeremony,
  guestCeremonies, type GuestCeremony, type InsertGuestCeremony,
  travelInfo, type TravelInfo, type InsertTravelInfo,
  hotels, type Hotel, type InsertHotel,
  accommodations, type Accommodation, type InsertAccommodation,
  roomAllocations, type RoomAllocation, type InsertRoomAllocation,
  mealOptions, type MealOption, type InsertMealOption,
  guestMealSelections, type GuestMealSelection, type InsertGuestMealSelection,
  coupleMessages, type CoupleMessage, type InsertCoupleMessage,
  relationshipTypes, type RelationshipType, type InsertRelationshipType,
  whatsappTemplates, type WhatsappTemplate, type InsertWhatsappTemplate,
  rsvpFollowupTemplates, type RsvpFollowupTemplate, type InsertRsvpFollowupTemplate,
  rsvpFollowupLogs, type RsvpFollowupLog, type InsertRsvpFollowupLog
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Event operations
  getEvent(id: number): Promise<WeddingEvent | undefined>;
  eventExists(id: number): Promise<boolean>;
  getAllEvents(): Promise<WeddingEvent[]>;
  getEventsByUser(userId: number): Promise<WeddingEvent[]>;
  createEvent(event: InsertWeddingEvent): Promise<WeddingEvent>;
  updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  updateEventEmailConfig(id: number, config: EmailConfig): Promise<WeddingEvent | undefined>;
  
  // Guest operations
  getGuest(id: number): Promise<Guest | undefined>;
  getGuestsByEvent(eventId: number): Promise<Guest[]>;
  getGuestByEmail(eventId: number, email: string): Promise<Guest | undefined>;
  createGuest(guest: InsertGuest): Promise<Guest>;
  updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined>;
  deleteGuest(id: number): Promise<boolean>;
  bulkCreateGuests(guests: InsertGuest[]): Promise<Guest[]>;
  
  // Ceremony operations
  getCeremony(id: number): Promise<Ceremony | undefined>;
  getCeremoniesByEvent(eventId: number): Promise<Ceremony[]>;
  createCeremony(ceremony: InsertCeremony): Promise<Ceremony>;
  updateCeremony(id: number, ceremony: Partial<InsertCeremony>): Promise<Ceremony | undefined>;
  deleteCeremony(id: number): Promise<boolean>;
  
  // Guest Ceremony operations
  getGuestCeremony(guestId: number, ceremonyId: number): Promise<GuestCeremony | undefined>;
  getGuestCeremoniesByGuest(guestId: number): Promise<GuestCeremony[]>;
  getGuestCeremoniesByCeremony(ceremonyId: number): Promise<GuestCeremony[]>;
  createGuestCeremony(guestCeremony: InsertGuestCeremony): Promise<GuestCeremony>;
  updateGuestCeremony(id: number, guestCeremony: Partial<InsertGuestCeremony>): Promise<GuestCeremony | undefined>;
  
  // Travel operations
  getTravelInfo(id: number): Promise<TravelInfo | undefined>;
  getTravelInfoByGuest(guestId: number): Promise<TravelInfo | undefined>;
  createTravelInfo(travelInfo: InsertTravelInfo): Promise<TravelInfo>;
  updateTravelInfo(id: number, travelInfo: Partial<InsertTravelInfo>): Promise<TravelInfo | undefined>;
  
  // Accommodation operations
  getAccommodation(id: number): Promise<Accommodation | undefined>;
  getAccommodationsByEvent(eventId: number): Promise<Accommodation[]>;
  createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation>;
  updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined>;
  deleteAccommodation(id: number): Promise<boolean>;
  
  // Hotel operations
  getHotel(id: number): Promise<Hotel | undefined>;
  getHotelsByEvent(eventId: number): Promise<Hotel[]>;
  createHotel(hotel: InsertHotel): Promise<Hotel>;
  updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined>;
  deleteHotel(id: number): Promise<boolean>;
  
  // Room Allocation operations
  getRoomAllocation(id: number): Promise<RoomAllocation | undefined>;
  getRoomAllocationsByAccommodation(accommodationId: number): Promise<RoomAllocation[]>;
  getRoomAllocationsByGuest(guestId: number): Promise<RoomAllocation[]>;
  createRoomAllocation(roomAllocation: InsertRoomAllocation): Promise<RoomAllocation>;
  updateRoomAllocation(id: number, roomAllocation: Partial<InsertRoomAllocation>): Promise<RoomAllocation | undefined>;
  
  // Meal operations
  getMealOption(id: number): Promise<MealOption | undefined>;
  getMealOptionsByCeremony(ceremonyId: number): Promise<MealOption[]>;
  createMealOption(mealOption: InsertMealOption): Promise<MealOption>;
  updateMealOption(id: number, mealOption: Partial<InsertMealOption>): Promise<MealOption | undefined>;
  
  // Guest Meal operations
  getGuestMealSelection(id: number): Promise<GuestMealSelection | undefined>;
  getGuestMealSelectionsByGuest(guestId: number): Promise<GuestMealSelection[]>;
  getGuestMealSelectionsByCeremony(ceremonyId: number): Promise<GuestMealSelection[]>;
  createGuestMealSelection(guestMealSelection: InsertGuestMealSelection): Promise<GuestMealSelection>;
  updateGuestMealSelection(id: number, guestMealSelection: Partial<InsertGuestMealSelection>): Promise<GuestMealSelection | undefined>;
  
  // Message operations
  getCoupleMessage(id: number): Promise<CoupleMessage | undefined>;
  getCoupleMessagesByEvent(eventId: number): Promise<CoupleMessage[]>;
  getCoupleMessagesByGuest(guestId: number): Promise<CoupleMessage[]>;
  createCoupleMessage(coupleMessage: InsertCoupleMessage): Promise<CoupleMessage>;
  
  // Relationship Type operations
  getRelationshipType(id: number): Promise<RelationshipType | undefined>;
  getAllRelationshipTypes(): Promise<RelationshipType[]>;
  createRelationshipType(relationshipType: InsertRelationshipType): Promise<RelationshipType>;
  updateRelationshipType(id: number, relationshipType: Partial<InsertRelationshipType>): Promise<RelationshipType | undefined>;
  deleteRelationshipType(id: number): Promise<boolean>;
  
  // WhatsApp Template operations
  getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined>;
  getWhatsappTemplatesByEvent(eventId: number): Promise<WhatsappTemplate[]>;
  getWhatsappTemplatesByCategory(eventId: number, category: string): Promise<WhatsappTemplate[]>;
  createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate>;
  updateWhatsappTemplate(id: number, template: Partial<InsertWhatsappTemplate>): Promise<WhatsappTemplate | undefined>;
  deleteWhatsappTemplate(id: number): Promise<boolean>;
  markWhatsappTemplateAsUsed(id: number): Promise<WhatsappTemplate | undefined>;
  
  // RSVP Follow-up Template operations
  getRsvpFollowupTemplate(id: number): Promise<RsvpFollowupTemplate | undefined>;
  getRsvpFollowupTemplateByType(eventId: number, type: string): Promise<RsvpFollowupTemplate | undefined>;
  getRsvpFollowupTemplatesByEvent(eventId: number): Promise<RsvpFollowupTemplate[]>;
  createRsvpFollowupTemplate(template: InsertRsvpFollowupTemplate): Promise<RsvpFollowupTemplate>;
  updateRsvpFollowupTemplate(id: number, template: Partial<InsertRsvpFollowupTemplate>): Promise<RsvpFollowupTemplate | undefined>;
  deleteRsvpFollowupTemplate(id: number): Promise<boolean>;
  
  // RSVP Follow-up Log operations
  getRsvpFollowupLogsByGuest(guestId: number): Promise<RsvpFollowupLog[]>;
  createRsvpFollowupLog(log: InsertRsvpFollowupLog): Promise<RsvpFollowupLog>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private eventsMap: Map<number, WeddingEvent>;
  private guestsMap: Map<number, Guest>;
  private ceremoniesMap: Map<number, Ceremony>;
  private guestCeremoniesMap: Map<number, GuestCeremony>;
  private travelInfoMap: Map<number, TravelInfo>;
  private accommodationsMap: Map<number, Accommodation>;
  private roomAllocationsMap: Map<number, RoomAllocation>;
  private mealOptionsMap: Map<number, MealOption>;
  private guestMealSelectionsMap: Map<number, GuestMealSelection>;
  private coupleMessagesMap: Map<number, CoupleMessage>;
  private relationshipTypesMap: Map<number, RelationshipType>;
  private whatsappTemplatesMap: Map<number, WhatsappTemplate>;
  private rsvpFollowupTemplatesMap: Map<number, RsvpFollowupTemplate>;
  private rsvpFollowupLogsMap: Map<number, RsvpFollowupLog>;
  private hotelsMap: Map<number, Hotel>;
  
  private userIdCounter: number;
  private eventIdCounter: number;
  private guestIdCounter: number;
  private ceremonyIdCounter: number;
  private guestCeremonyIdCounter: number;
  private travelInfoIdCounter: number;
  private accommodationIdCounter: number;
  private roomAllocationIdCounter: number;
  private mealOptionIdCounter: number;
  private guestMealSelectionIdCounter: number;
  private coupleMessageIdCounter: number;
  private relationshipTypeIdCounter: number;
  private whatsappTemplateIdCounter: number;
  private rsvpFollowupTemplateIdCounter: number;
  private rsvpFollowupLogIdCounter: number;
  private hotelIdCounter: number;

  constructor() {
    this.usersMap = new Map();
    this.eventsMap = new Map();
    this.guestsMap = new Map();
    this.ceremoniesMap = new Map();
    this.guestCeremoniesMap = new Map();
    this.travelInfoMap = new Map();
    this.accommodationsMap = new Map();
    this.roomAllocationsMap = new Map();
    this.mealOptionsMap = new Map();
    this.guestMealSelectionsMap = new Map();
    this.coupleMessagesMap = new Map();
    this.relationshipTypesMap = new Map();
    this.whatsappTemplatesMap = new Map();
    this.rsvpFollowupTemplatesMap = new Map();
    this.rsvpFollowupLogsMap = new Map();
    this.hotelsMap = new Map();
    
    this.userIdCounter = 1;
    this.eventIdCounter = 1;
    this.guestIdCounter = 1;
    this.ceremonyIdCounter = 1;
    this.guestCeremonyIdCounter = 1;
    this.travelInfoIdCounter = 1;
    this.accommodationIdCounter = 1;
    this.roomAllocationIdCounter = 1;
    this.mealOptionIdCounter = 1;
    this.guestMealSelectionIdCounter = 1;
    this.coupleMessageIdCounter = 1;
    this.relationshipTypeIdCounter = 1;
    this.whatsappTemplateIdCounter = 1;
    this.rsvpFollowupTemplateIdCounter = 1;
    this.rsvpFollowupLogIdCounter = 1;
    this.hotelIdCounter = 1;
    
    // Initialize with default admin user
    this.createUser({
      username: "admin",
      password: "password",
      name: "Admin User",
      email: "admin@example.com",
      role: "admin"
    });
    
    // Create a sample wedding event
    const eventId = this.createEvent({
      title: "Sarah & Michael's Wedding",
      coupleNames: "Sarah & Michael",
      date: new Date("2024-06-15"),
      location: "Grand Palace Hotel",
      description: "A beautiful summer wedding",
      createdBy: 1
    }).id;
    
    // Create sample ceremonies
    const ceremony1 = this.createCeremony({
      eventId,
      name: "Welcome Dinner",
      date: new Date("2024-06-14"),
      startTime: "18:00",
      endTime: "22:00",
      location: "Hotel Restaurant",
      description: "Casual welcome dinner for all guests",
      attireCode: "Smart Casual"
    });
    
    const ceremony2 = this.createCeremony({
      eventId,
      name: "Wedding Ceremony",
      date: new Date("2024-06-15"),
      startTime: "14:00",
      endTime: "15:30",
      location: "Hotel Garden",
      description: "Main wedding ceremony",
      attireCode: "Formal"
    });
    
    const ceremony3 = this.createCeremony({
      eventId,
      name: "Reception",
      date: new Date("2024-06-15"),
      startTime: "18:00",
      endTime: "23:00",
      location: "Grand Ballroom",
      description: "Dinner and dancing",
      attireCode: "Formal"
    });
    
    // Create sample accommodations
    this.createAccommodation({
      eventId,
      name: "Grand Palace Hotel",
      roomType: "Standard Room",
      capacity: 2,
      totalRooms: 25,
      allocatedRooms: 20,
      pricePerNight: "$250",
      specialFeatures: "Free WiFi, Breakfast included"
    });
    
    this.createAccommodation({
      eventId,
      name: "Grand Palace Hotel",
      roomType: "Deluxe Suite",
      capacity: 2,
      totalRooms: 10,
      allocatedRooms: 8,
      pricePerNight: "$450",
      specialFeatures: "Free WiFi, Breakfast included, City view"
    });
    
    this.createAccommodation({
      eventId,
      name: "Grand Palace Hotel",
      roomType: "Presidential Suite",
      capacity: 4,
      totalRooms: 1,
      allocatedRooms: 1,
      pricePerNight: "$1200",
      specialFeatures: "Free WiFi, Breakfast included, Butler service"
    });
    
    this.createAccommodation({
      eventId,
      name: "Grand Palace Hotel",
      roomType: "Family Room",
      capacity: 4,
      totalRooms: 8,
      allocatedRooms: 5,
      pricePerNight: "$550",
      specialFeatures: "Free WiFi, Breakfast included, Two bedrooms"
    });
    
    // Create sample meal options
    this.createMealOption({
      eventId,
      ceremonyId: ceremony3.id,
      name: "Steak",
      description: "Filet mignon with roasted vegetables",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isNutFree: true
    });
    
    this.createMealOption({
      eventId,
      ceremonyId: ceremony3.id,
      name: "Salmon",
      description: "Grilled salmon with quinoa and asparagus",
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: true,
      isNutFree: true
    });
    
    this.createMealOption({
      eventId,
      ceremonyId: ceremony3.id,
      name: "Vegetarian Pasta",
      description: "Fettuccine with wild mushrooms and truffle oil",
      isVegetarian: true,
      isVegan: false,
      isGlutenFree: false,
      isNutFree: true
    });
    
    this.createMealOption({
      eventId,
      ceremonyId: ceremony3.id,
      name: "Vegan Buddha Bowl",
      description: "Quinoa bowl with roasted vegetables and tahini dressing",
      isVegetarian: true,
      isVegan: true,
      isGlutenFree: true,
      isNutFree: false
    });
    
    // Create sample guests with different RSVP statuses
    const guest1 = this.createGuest({
      eventId,
      firstName: "John",
      lastName: "Davis",
      email: "john.davis@example.com",
      phone: "123-456-7890",
      address: "123 Main St, New York, NY",
      isFamily: false,
      relationship: "Friend of Groom",
      rsvpStatus: "confirmed",
      plusOneAllowed: true,
      plusOneName: "Emily Davis",
      numberOfChildren: 0,
      childrenNames: "",
      dietaryRestrictions: "None",
      tableAssignment: "Table 1",
      giftTracking: "Wine set",
      notes: "College friend"
    });
    
    const guest2 = this.createGuest({
      eventId,
      firstName: "Rachel",
      lastName: "Lee",
      email: "rachel@example.com",
      phone: "234-567-8901",
      address: "456 Pine St, Boston, MA",
      isFamily: true,
      relationship: "Cousin of Bride",
      rsvpStatus: "declined",
      plusOneAllowed: false,
      plusOneName: "",
      numberOfChildren: 0,
      childrenNames: "",
      dietaryRestrictions: "Gluten allergy",
      tableAssignment: "",
      giftTracking: "",
      notes: "Can't attend due to prior commitment"
    });
    
    const guest3 = this.createGuest({
      eventId,
      firstName: "Mark",
      lastName: "Johnson",
      email: "mark@example.com",
      phone: "345-678-9012",
      address: "789 Oak St, Chicago, IL",
      isFamily: false,
      relationship: "Friend of Bride",
      rsvpStatus: "confirmed",
      plusOneAllowed: true,
      plusOneName: "Sarah Johnson",
      numberOfChildren: 2,
      childrenNames: "Emma, Jack",
      dietaryRestrictions: "No seafood",
      tableAssignment: "Table 5",
      giftTracking: "Crystal vase",
      notes: "Needs high chairs for children"
    });
    
    // Create guest ceremony attendance
    this.createGuestCeremony({
      guestId: guest1.id,
      ceremonyId: ceremony1.id,
      attending: true
    });
    
    this.createGuestCeremony({
      guestId: guest1.id,
      ceremonyId: ceremony2.id,
      attending: true
    });
    
    this.createGuestCeremony({
      guestId: guest1.id,
      ceremonyId: ceremony3.id,
      attending: true
    });
    
    this.createGuestCeremony({
      guestId: guest3.id,
      ceremonyId: ceremony2.id,
      attending: true
    });
    
    this.createGuestCeremony({
      guestId: guest3.id,
      ceremonyId: ceremony3.id,
      attending: true
    });
    
    // Create travel info
    this.createTravelInfo({
      guestId: guest1.id,
      travelMode: "air",
      arrivalDate: new Date("2024-06-14"),
      arrivalTime: "10:00",
      arrivalLocation: "JFK Airport",
      departureDate: new Date("2024-06-16"),
      departureTime: "14:00",
      departureLocation: "JFK Airport",
      flightNumber: "AA123",
      needsTransportation: true,
      transportationType: "both"
    });
    
    this.createTravelInfo({
      guestId: guest3.id,
      travelMode: "car",
      arrivalDate: new Date("2024-06-14"),
      arrivalTime: "16:00",
      arrivalLocation: "Hotel",
      departureDate: new Date("2024-06-16"),
      departureTime: "11:00",
      departureLocation: "Hotel",
      flightNumber: "",
      needsTransportation: false,
      transportationType: ""
    });
    
    // Create room allocations
    this.createRoomAllocation({
      accommodationId: 1,
      guestId: guest1.id,
      roomNumber: "101",
      checkIn: new Date("2024-06-14"),
      checkOut: new Date("2024-06-16"),
      specialRequests: "King bed"
    });
    
    this.createRoomAllocation({
      accommodationId: 4,
      guestId: guest3.id,
      roomNumber: "305",
      checkIn: new Date("2024-06-14"),
      checkOut: new Date("2024-06-16"),
      specialRequests: "Two cribs, adjacent to family"
    });
    
    // Create meal selections
    this.createGuestMealSelection({
      guestId: guest1.id,
      mealOptionId: 1,
      ceremonyId: ceremony3.id,
      notes: "Medium rare"
    });
    
    this.createGuestMealSelection({
      guestId: guest3.id,
      mealOptionId: 2,
      ceremonyId: ceremony3.id,
      notes: ""
    });
    
    // Create couple messages
    this.createCoupleMessage({
      eventId,
      guestId: guest1.id,
      message: "Congratulations! We are so happy to celebrate your special day with you!"
    });
    
    // Create default relationship types
    this.createRelationshipType({
      name: "Parent of Bride",
      category: "Family",
      side: "bride",
      isCustom: false,
      description: "Parent of the bride"
    });
    
    this.createRelationshipType({
      name: "Parent of Groom",
      category: "Family",
      side: "groom",
      isCustom: false,
      description: "Parent of the groom"
    });
    
    this.createRelationshipType({
      name: "Sibling of Bride",
      category: "Family",
      side: "bride",
      isCustom: false,
      description: "Brother or sister of the bride"
    });
    
    this.createRelationshipType({
      name: "Sibling of Groom",
      category: "Family",
      side: "groom",
      isCustom: false,
      description: "Brother or sister of the groom"
    });
    
    this.createRelationshipType({
      name: "Aunt/Uncle of Bride",
      category: "Family",
      side: "bride",
      isCustom: false,
      description: "Aunt or uncle of the bride"
    });
    
    this.createRelationshipType({
      name: "Aunt/Uncle of Groom",
      category: "Family",
      side: "groom",
      isCustom: false,
      description: "Aunt or uncle of the groom"
    });
    
    this.createRelationshipType({
      name: "Cousin of Bride",
      category: "Family",
      side: "bride",
      isCustom: false,
      description: "Cousin of the bride"
    });
    
    this.createRelationshipType({
      name: "Cousin of Groom",
      category: "Family",
      side: "groom",
      isCustom: false,
      description: "Cousin of the groom"
    });
    
    this.createRelationshipType({
      name: "Friend of Bride",
      category: "Friend",
      side: "bride",
      isCustom: false,
      description: "Friend of the bride"
    });
    
    this.createRelationshipType({
      name: "Friend of Groom",
      category: "Friend",
      side: "groom",
      isCustom: false,
      description: "Friend of the groom"
    });
    
    this.createRelationshipType({
      name: "Colleague of Bride",
      category: "Work",
      side: "bride",
      isCustom: false,
      description: "Work colleague of the bride"
    });
    
    this.createRelationshipType({
      name: "Colleague of Groom",
      category: "Work",
      side: "groom",
      isCustom: false,
      description: "Work colleague of the groom"
    });
    
    // Create sample WhatsApp templates
    this.createWhatsappTemplate({
      eventId,
      name: "RSVP Reminder",
      category: "rsvp",
      content: "Hello {{guest_name}}, this is a friendly reminder to RSVP for {{event_name}} by {{due_date}}. Looking forward to your response!",
      parameters: JSON.stringify(["guest_name", "event_name", "due_date"])
    });
    
    this.createWhatsappTemplate({
      eventId,
      name: "Welcome Message",
      category: "general",
      content: "Welcome {{guest_name}}! We're delighted you'll be joining us for our wedding celebrations. Here's the event link: {{event_link}}",
      parameters: JSON.stringify(["guest_name", "event_link"])
    });
    
    this.createWhatsappTemplate({
      eventId,
      name: "Travel Information",
      category: "travel",
      content: "Hello {{guest_name}}, here are the travel details for {{event_name}}. Venue: {{venue}}. If you need any assistance with transportation, please let us know.",
      parameters: JSON.stringify(["guest_name", "event_name", "venue"])
    });
    
    this.createWhatsappTemplate({
      eventId,
      name: "Accommodation Confirmation",
      category: "accommodation",
      content: "Hello {{guest_name}}, your accommodation for {{event_name}} has been confirmed. You're staying at {{hotel_name}}, Room {{room_number}}, from {{check_in_date}} to {{check_out_date}}.",
      parameters: JSON.stringify(["guest_name", "event_name", "hotel_name", "room_number", "check_in_date", "check_out_date"])
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email === email
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const newUser: User = { ...user, id, createdAt };
    this.usersMap.set(id, newUser);
    return newUser;
  }
  
  // Event methods
  async getEvent(id: number): Promise<WeddingEvent | undefined> {
    return this.eventsMap.get(id);
  }
  
  async eventExists(id: number): Promise<boolean> {
    return this.eventsMap.has(id);
  }
  
  async getAllEvents(): Promise<WeddingEvent[]> {
    return Array.from(this.eventsMap.values());
  }
  
  async getEventsByUser(userId: number): Promise<WeddingEvent[]> {
    return Array.from(this.eventsMap.values()).filter(
      (event) => event.createdBy === userId
    );
  }
  
  async createEvent(event: InsertWeddingEvent): Promise<WeddingEvent> {
    const id = this.eventIdCounter++;
    const newEvent: WeddingEvent = { ...event, id };
    this.eventsMap.set(id, newEvent);
    
    // Create default WhatsApp templates for this event
    this.createWhatsappTemplate({
      eventId: id,
      name: "RSVP Reminder",
      category: "rsvp",
      content: "Hello {{guest_name}}, this is a friendly reminder to RSVP for {{event_name}} by {{due_date}}. Looking forward to your response!",
      parameters: JSON.stringify(["guest_name", "event_name", "due_date"])
    });
    
    this.createWhatsappTemplate({
      eventId: id,
      name: "Welcome Message",
      category: "general",
      content: "Welcome {{guest_name}}! We're delighted you'll be joining us for our wedding celebrations. Here's the event link: {{event_link}}",
      parameters: JSON.stringify(["guest_name", "event_link"])
    });
    
    this.createWhatsappTemplate({
      eventId: id,
      name: "Travel Information",
      category: "travel",
      content: "Hello {{guest_name}}, here are the travel details for {{event_name}}. Venue: {{venue}}. If you need any assistance with transportation, please let us know.",
      parameters: JSON.stringify(["guest_name", "event_name", "venue"])
    });
    
    this.createWhatsappTemplate({
      eventId: id,
      name: "Accommodation Confirmation",
      category: "accommodation",
      content: "Hello {{guest_name}}, your accommodation for {{event_name}} has been confirmed. You're staying at {{hotel_name}}, Room {{room_number}}, from {{check_in_date}} to {{check_out_date}}.",
      parameters: JSON.stringify(["guest_name", "event_name", "hotel_name", "room_number", "check_in_date", "check_out_date"])
    });
    
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined> {
    const existingEvent = this.eventsMap.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...event };
    this.eventsMap.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async updateEventEmailConfig(id: number, config: EmailConfig): Promise<WeddingEvent | undefined> {
    const existingEvent = this.eventsMap.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...config };
    this.eventsMap.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    // First, delete all related data for this event
    // Find all guests for this event
    const eventGuests = Array.from(this.guestsMap.values()).filter(guest => guest.eventId === id);
    
    // Delete all guests and their related data
    for (const guest of eventGuests) {
      // Delete guest ceremonies
      const guestCeremonies = Array.from(this.guestCeremoniesMap.values()).filter(gc => gc.guestId === guest.id);
      for (const gc of guestCeremonies) {
        this.guestCeremoniesMap.delete(gc.id);
      }
      
      // Delete travel info
      const travelInfo = Array.from(this.travelInfoMap.values()).find(ti => ti.guestId === guest.id);
      if (travelInfo) {
        this.travelInfoMap.delete(travelInfo.id);
      }
      
      // Delete room allocations
      const roomAllocations = Array.from(this.roomAllocationsMap.values()).filter(ra => ra.guestId === guest.id);
      for (const ra of roomAllocations) {
        this.roomAllocationsMap.delete(ra.id);
      }
      
      // Delete meal selections
      const mealSelections = Array.from(this.guestMealSelectionsMap.values()).filter(ms => ms.guestId === guest.id);
      for (const ms of mealSelections) {
        this.guestMealSelectionsMap.delete(ms.id);
      }
      
      // Delete couple messages
      const coupleMessages = Array.from(this.coupleMessagesMap.values()).filter(cm => cm.guestId === guest.id);
      for (const cm of coupleMessages) {
        this.coupleMessagesMap.delete(cm.id);
      }
      
      // Finally delete the guest
      this.guestsMap.delete(guest.id);
    }
    
    // Delete ceremonies
    const ceremonies = Array.from(this.ceremoniesMap.values()).filter(ceremony => ceremony.eventId === id);
    for (const ceremony of ceremonies) {
      // Delete meal options for this ceremony
      const mealOptions = Array.from(this.mealOptionsMap.values()).filter(mo => mo.ceremonyId === ceremony.id);
      for (const mo of mealOptions) {
        this.mealOptionsMap.delete(mo.id);
      }
      
      this.ceremoniesMap.delete(ceremony.id);
    }
    
    // Delete accommodations
    const accommodations = Array.from(this.accommodationsMap.values()).filter(accommodation => accommodation.eventId === id);
    for (const accommodation of accommodations) {
      this.accommodationsMap.delete(accommodation.id);
    }
    
    // Delete whatsapp templates
    const templates = Array.from(this.whatsappTemplatesMap.values()).filter(template => template.eventId === id);
    for (const template of templates) {
      this.whatsappTemplatesMap.delete(template.id);
    }
    
    // Finally, delete the event itself
    return this.eventsMap.delete(id);
  }
  
  // Guest methods
  async getGuest(id: number): Promise<Guest | undefined> {
    console.log(`Looking up guest with ID: ${id}`);
    
    if (!id || isNaN(id)) {
      console.error(`Invalid guest ID provided: ${id}`);
      throw new Error('Invalid guest ID');
    }
    
    const guest = this.guestsMap.get(id);
    
    if (guest) {
      console.log(`Found guest ${id} belonging to event ${guest.eventId}`);
      // WARNING: This method does not enforce event boundaries!
      console.warn(`WARNING: Using getGuest without event context for guest ${id} - this may lead to data leakage across events`);
    } else {
      console.warn(`Guest with ID ${id} not found`);
    }
    
    return guest;
  }
  
  async getGuestWithEventContext(guestId: number, eventId: number): Promise<Guest | undefined> {
    console.log(`Fetching guest ${guestId} with event context ${eventId}`);
    
    if (!guestId || isNaN(guestId)) {
      console.error(`Invalid guest ID provided: ${guestId}`);
      throw new Error('Invalid guest ID');
    }
    
    if (!eventId || isNaN(eventId)) {
      console.error(`Invalid event ID provided: ${eventId}`);
      throw new Error('Invalid event ID');
    }
    
    try {
      // First, verify the event exists
      const event = await this.getEvent(eventId);
      if (!event) {
        console.warn(`Attempted to get guest for non-existent event ID: ${eventId}`);
        return undefined;
      }
      
      // Get the guest
      const guest = this.guestsMap.get(guestId);
      
      // Only return the guest if it belongs to the specified event
      if (guest && guest.eventId === eventId) {
        console.log(`Guest ${guestId} found in event ${eventId}`);
        return guest;
      }
      
      if (guest) {
        console.warn(`Event boundary violation: Guest ${guestId} exists but belongs to event ${guest.eventId}, not requested event ${eventId}`);
      } else {
        console.warn(`Guest ${guestId} not found`);
      }
      
      return undefined;
    } catch (error) {
      console.error(`Error in getGuestWithEventContext for guest ${guestId}, event ${eventId}:`, error);
      throw error;
    }
  }
  
  // DEPRECATED: In-memory implementation - kept for reference only, but not used
  async _legacyGetGuestsByEvent(eventId: number): Promise<Guest[]> {
    console.log(`[LEGACY] Getting guests for event ID: ${eventId} from in-memory store`);
    
    if (!eventId || isNaN(eventId)) {
      console.error(`Invalid event ID provided: ${eventId}`);
      throw new Error('Invalid event ID');
    }
    
    try {
      // First check if this event exists
      const event = await this.getEvent(eventId);
      if (!event) {
        console.warn(`Attempted to get guests for non-existent event ID: ${eventId}`);
        return []; // Return empty array for non-existent events
      }
      
      const guests = Array.from(this.guestsMap.values()).filter(
        (guest) => guest.eventId === eventId
      );
      
      console.log(`[LEGACY] Retrieved ${guests.length} guests for event ID: ${eventId}`);
      return guests;
    } catch (error) {
      console.error(`Error in legacy getGuestsByEvent for event ${eventId}:`, error);
      throw error;
    }
  }
  
  // TEMPORARY: This method forwards to the database implementation and logs the difference
  // for debugging the Don ji issue. Will be replaced with direct call to db implementation.
  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    console.log(`Legacy MemStorage.getGuestsByEvent for event ID: ${eventId}`);
    
    try {
      // Simply return guests for this event from memory
      // This ensures we don't have a circular reference with storage
      return Array.from(this.guestsMap.values()).filter(
        (guest) => guest.eventId === eventId
      );
    } catch (error) {
      console.error(`Error in legacy MemStorage.getGuestsByEvent for event ${eventId}:`, error);
      throw error;
    }
  }
  
  async getGuestByEmail(eventId: number, email: string): Promise<Guest | undefined> {
    console.log(`Looking up guest with email: ${email} in event: ${eventId}`);
    
    if (!eventId || isNaN(eventId)) {
      console.error(`Invalid event ID provided: ${eventId}`);
      throw new Error('Invalid event ID');
    }
    
    if (!email) {
      console.error('Empty email provided for guest lookup');
      throw new Error('Email is required');
    }
    
    try {
      // First check if this event exists
      const event = await this.getEvent(eventId);
      if (!event) {
        console.warn(`Attempted to get guest by email for non-existent event ID: ${eventId}`);
        return undefined;
      }
      
      const guest = Array.from(this.guestsMap.values()).find(
        (guest) => guest.eventId === eventId && guest.email === email
      );
      
      if (guest) {
        console.log(`Found guest with email ${email} in event ${eventId}`);
      } else {
        console.log(`No guest found with email ${email} in event ${eventId}`);
      }
      
      return guest;
    } catch (error) {
      console.error(`Error in getGuestByEmail for email ${email}, event ${eventId}:`, error);
      throw error;
    }
  }
  
  async createGuest(guest: InsertGuest): Promise<Guest> {
    const id = this.guestIdCounter++;
    const createdAt = new Date();
    const newGuest: Guest = { ...guest, id, createdAt };
    this.guestsMap.set(id, newGuest);
    return newGuest;
  }
  
  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    const existingGuest = this.guestsMap.get(id);
    if (!existingGuest) return undefined;
    
    // Preserve the original eventId to maintain event boundaries
    const eventId = existingGuest.eventId;
    // This ensures the eventId can't be changed - essential for maintaining event boundaries
    const updatedGuest = { ...existingGuest, ...guest, eventId };
    this.guestsMap.set(id, updatedGuest);
    return updatedGuest;
  }
  
  async deleteGuest(id: number): Promise<boolean> {
    return this.guestsMap.delete(id);
  }
  
  async bulkCreateGuests(guests: InsertGuest[]): Promise<Guest[]> {
    if (guests.length === 0) return [];
    
    // Group guests by event for more efficient verification
    const eventIds = [...new Set(guests.map(g => g.eventId))];
    console.log(`Bulk creating guests for events: ${eventIds.join(', ')}`);
    
    // Verify all events exist before proceeding
    const validEventIds: number[] = [];
    for (const eventId of eventIds) {
      if (await this.eventExists(eventId)) {
        validEventIds.push(eventId);
      } else {
        console.warn(`Attempted to bulk create guests for non-existent event ID: ${eventId}`);
      }
    }
    
    // Filter guests to only include those with valid event IDs
    const validGuests = guests.filter(g => validEventIds.includes(g.eventId));
    
    if (validGuests.length !== guests.length) {
      console.warn(`Filtered out ${guests.length - validGuests.length} guests with invalid event IDs`);
    }
    
    if (validGuests.length === 0) {
      console.warn('No valid guests to create after event validation');
      return [];
    }
    
    console.log(`Creating ${validGuests.length} guests in database`);
    try {
      const result = await db.insert(guests).values(validGuests).returning();
      return result;
    } catch (error) {
      console.error('Error in bulkCreateGuests:', error);
      throw error;
    }
  }
  
  // Ceremony methods
  async getCeremony(id: number): Promise<Ceremony | undefined> {
    return this.ceremoniesMap.get(id);
  }
  
  async getCeremoniesByEvent(eventId: number): Promise<Ceremony[]> {
    return Array.from(this.ceremoniesMap.values()).filter(
      (ceremony) => ceremony.eventId === eventId
    );
  }
  
  async createCeremony(ceremony: InsertCeremony): Promise<Ceremony> {
    const id = this.ceremonyIdCounter++;
    const newCeremony: Ceremony = { ...ceremony, id };
    this.ceremoniesMap.set(id, newCeremony);
    return newCeremony;
  }
  
  async updateCeremony(id: number, ceremony: Partial<InsertCeremony>): Promise<Ceremony | undefined> {
    const existingCeremony = this.ceremoniesMap.get(id);
    if (!existingCeremony) return undefined;
    
    const updatedCeremony = { ...existingCeremony, ...ceremony };
    this.ceremoniesMap.set(id, updatedCeremony);
    return updatedCeremony;
  }
  
  async deleteCeremony(id: number): Promise<boolean> {
    return this.ceremoniesMap.delete(id);
  }
  
  // Guest Ceremony methods
  async getGuestCeremony(guestId: number, ceremonyId: number): Promise<GuestCeremony | undefined> {
    return Array.from(this.guestCeremoniesMap.values()).find(
      (gc) => gc.guestId === guestId && gc.ceremonyId === ceremonyId
    );
  }
  
  async getGuestCeremoniesByGuest(guestId: number): Promise<GuestCeremony[]> {
    return Array.from(this.guestCeremoniesMap.values()).filter(
      (gc) => gc.guestId === guestId
    );
  }
  
  async getGuestCeremoniesByCeremony(ceremonyId: number): Promise<GuestCeremony[]> {
    return Array.from(this.guestCeremoniesMap.values()).filter(
      (gc) => gc.ceremonyId === ceremonyId
    );
  }
  
  async createGuestCeremony(guestCeremony: InsertGuestCeremony): Promise<GuestCeremony> {
    const id = this.guestCeremonyIdCounter++;
    const newGuestCeremony: GuestCeremony = { ...guestCeremony, id };
    this.guestCeremoniesMap.set(id, newGuestCeremony);
    return newGuestCeremony;
  }
  
  async updateGuestCeremony(id: number, guestCeremony: Partial<InsertGuestCeremony>): Promise<GuestCeremony | undefined> {
    const existingGuestCeremony = this.guestCeremoniesMap.get(id);
    if (!existingGuestCeremony) return undefined;
    
    const updatedGuestCeremony = { ...existingGuestCeremony, ...guestCeremony };
    this.guestCeremoniesMap.set(id, updatedGuestCeremony);
    return updatedGuestCeremony;
  }
  
  // Travel methods
  async getTravelInfo(id: number): Promise<TravelInfo | undefined> {
    return this.travelInfoMap.get(id);
  }
  
  async getTravelInfoByGuest(guestId: number): Promise<TravelInfo | undefined> {
    return Array.from(this.travelInfoMap.values()).find(
      (info) => info.guestId === guestId
    );
  }
  
  async createTravelInfo(info: InsertTravelInfo): Promise<TravelInfo> {
    const id = this.travelInfoIdCounter++;
    const newTravelInfo: TravelInfo = { ...info, id };
    this.travelInfoMap.set(id, newTravelInfo);
    return newTravelInfo;
  }
  
  async updateTravelInfo(id: number, info: Partial<InsertTravelInfo>): Promise<TravelInfo | undefined> {
    const existingInfo = this.travelInfoMap.get(id);
    if (!existingInfo) return undefined;
    
    const updatedInfo = { ...existingInfo, ...info };
    this.travelInfoMap.set(id, updatedInfo);
    return updatedInfo;
  }
  
  // Accommodation methods
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    return this.accommodationsMap.get(id);
  }
  
  async getAccommodationsByEvent(eventId: number): Promise<Accommodation[]> {
    return Array.from(this.accommodationsMap.values()).filter(
      (acc) => acc.eventId === eventId
    );
  }
  
  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const id = this.accommodationIdCounter++;
    const newAccommodation: Accommodation = { ...accommodation, id };
    this.accommodationsMap.set(id, newAccommodation);
    return newAccommodation;
  }
  
  async updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const existingAccommodation = this.accommodationsMap.get(id);
    if (!existingAccommodation) return undefined;
    
    const updatedAccommodation = { ...existingAccommodation, ...accommodation };
    this.accommodationsMap.set(id, updatedAccommodation);
    return updatedAccommodation;
  }
  
  async deleteAccommodation(id: number): Promise<boolean> {
    if (!this.accommodationsMap.has(id)) return false;
    return this.accommodationsMap.delete(id);
  }
  
  // Hotel methods
  async getHotel(id: number): Promise<Hotel | undefined> {
    return this.hotelsMap.get(id);
  }
  
  async getHotelsByEvent(eventId: number): Promise<Hotel[]> {
    return Array.from(this.hotelsMap.values()).filter(
      hotel => hotel.eventId === eventId
    );
  }
  
  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const id = this.hotelIdCounter++;
    const createdHotel: Hotel = {
      id,
      createdAt: new Date(),
      ...hotel
    };
    this.hotelsMap.set(id, createdHotel);
    return createdHotel;
  }
  
  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const existingHotel = this.hotelsMap.get(id);
    if (!existingHotel) return undefined;
    
    const updatedHotel = { ...existingHotel, ...hotel };
    this.hotelsMap.set(id, updatedHotel);
    return updatedHotel;
  }
  
  async deleteHotel(id: number): Promise<boolean> {
    if (!this.hotelsMap.has(id)) return false;
    return this.hotelsMap.delete(id);
  }
  
  // Room Allocation methods
  async getRoomAllocation(id: number): Promise<RoomAllocation | undefined> {
    return this.roomAllocationsMap.get(id);
  }
  
  async getRoomAllocationsByAccommodation(accommodationId: number): Promise<RoomAllocation[]> {
    return Array.from(this.roomAllocationsMap.values()).filter(
      (allocation) => allocation.accommodationId === accommodationId
    );
  }
  
  async getRoomAllocationsByGuest(guestId: number): Promise<RoomAllocation[]> {
    return Array.from(this.roomAllocationsMap.values()).filter(
      (allocation) => allocation.guestId === guestId
    );
  }
  
  async createRoomAllocation(roomAllocation: InsertRoomAllocation): Promise<RoomAllocation> {
    const id = this.roomAllocationIdCounter++;
    const newRoomAllocation: RoomAllocation = { ...roomAllocation, id };
    this.roomAllocationsMap.set(id, newRoomAllocation);
    return newRoomAllocation;
  }
  
  async updateRoomAllocation(id: number, roomAllocation: Partial<InsertRoomAllocation>): Promise<RoomAllocation | undefined> {
    const existingRoomAllocation = this.roomAllocationsMap.get(id);
    if (!existingRoomAllocation) return undefined;
    
    const updatedRoomAllocation = { ...existingRoomAllocation, ...roomAllocation };
    this.roomAllocationsMap.set(id, updatedRoomAllocation);
    return updatedRoomAllocation;
  }
  
  // Meal methods
  async getMealOption(id: number): Promise<MealOption | undefined> {
    return this.mealOptionsMap.get(id);
  }
  
  async getMealOptionsByCeremony(ceremonyId: number): Promise<MealOption[]> {
    return Array.from(this.mealOptionsMap.values()).filter(
      (option) => option.ceremonyId === ceremonyId
    );
  }
  
  async createMealOption(mealOption: InsertMealOption): Promise<MealOption> {
    const id = this.mealOptionIdCounter++;
    const newMealOption: MealOption = { ...mealOption, id };
    this.mealOptionsMap.set(id, newMealOption);
    return newMealOption;
  }
  
  async updateMealOption(id: number, mealOption: Partial<InsertMealOption>): Promise<MealOption | undefined> {
    const existingMealOption = this.mealOptionsMap.get(id);
    if (!existingMealOption) return undefined;
    
    const updatedMealOption = { ...existingMealOption, ...mealOption };
    this.mealOptionsMap.set(id, updatedMealOption);
    return updatedMealOption;
  }
  
  // Guest Meal methods
  async getGuestMealSelection(id: number): Promise<GuestMealSelection | undefined> {
    return this.guestMealSelectionsMap.get(id);
  }
  
  async getGuestMealSelectionsByGuest(guestId: number): Promise<GuestMealSelection[]> {
    return Array.from(this.guestMealSelectionsMap.values()).filter(
      (selection) => selection.guestId === guestId
    );
  }
  
  async getGuestMealSelectionsByCeremony(ceremonyId: number): Promise<GuestMealSelection[]> {
    return Array.from(this.guestMealSelectionsMap.values()).filter(
      (selection) => selection.ceremonyId === ceremonyId
    );
  }
  
  async createGuestMealSelection(guestMealSelection: InsertGuestMealSelection): Promise<GuestMealSelection> {
    const id = this.guestMealSelectionIdCounter++;
    const newGuestMealSelection: GuestMealSelection = { ...guestMealSelection, id };
    this.guestMealSelectionsMap.set(id, newGuestMealSelection);
    return newGuestMealSelection;
  }
  
  async updateGuestMealSelection(id: number, guestMealSelection: Partial<InsertGuestMealSelection>): Promise<GuestMealSelection | undefined> {
    const existingGuestMealSelection = this.guestMealSelectionsMap.get(id);
    if (!existingGuestMealSelection) return undefined;
    
    const updatedGuestMealSelection = { ...existingGuestMealSelection, ...guestMealSelection };
    this.guestMealSelectionsMap.set(id, updatedGuestMealSelection);
    return updatedGuestMealSelection;
  }
  
  // Message methods
  async getCoupleMessage(id: number): Promise<CoupleMessage | undefined> {
    return this.coupleMessagesMap.get(id);
  }
  
  async getCoupleMessagesByEvent(eventId: number): Promise<CoupleMessage[]> {
    return Array.from(this.coupleMessagesMap.values()).filter(
      (message) => message.eventId === eventId
    );
  }
  
  async getCoupleMessagesByGuest(guestId: number): Promise<CoupleMessage[]> {
    return Array.from(this.coupleMessagesMap.values()).filter(
      (message) => message.guestId === guestId
    );
  }
  
  async createCoupleMessage(coupleMessage: InsertCoupleMessage): Promise<CoupleMessage> {
    const id = this.coupleMessageIdCounter++;
    const createdAt = new Date();
    const newCoupleMessage: CoupleMessage = { ...coupleMessage, id, createdAt };
    this.coupleMessagesMap.set(id, newCoupleMessage);
    return newCoupleMessage;
  }
  
  // Relationship Type methods
  async getRelationshipType(id: number): Promise<RelationshipType | undefined> {
    return this.relationshipTypesMap.get(id);
  }
  
  async getAllRelationshipTypes(): Promise<RelationshipType[]> {
    return Array.from(this.relationshipTypesMap.values());
  }
  
  async createRelationshipType(relationshipType: InsertRelationshipType): Promise<RelationshipType> {
    const id = this.relationshipTypeIdCounter++;
    const createdAt = new Date();
    const newRelationshipType: RelationshipType = { ...relationshipType, id, createdAt };
    this.relationshipTypesMap.set(id, newRelationshipType);
    return newRelationshipType;
  }
  
  async updateRelationshipType(id: number, relationshipType: Partial<InsertRelationshipType>): Promise<RelationshipType | undefined> {
    const existingRelationshipType = this.relationshipTypesMap.get(id);
    if (!existingRelationshipType) return undefined;
    
    const updatedRelationshipType = { ...existingRelationshipType, ...relationshipType };
    this.relationshipTypesMap.set(id, updatedRelationshipType);
    return updatedRelationshipType;
  }
  
  async deleteRelationshipType(id: number): Promise<boolean> {
    return this.relationshipTypesMap.delete(id);
  }
  
  // WhatsApp Template methods
  async getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined> {
    return this.whatsappTemplatesMap.get(id);
  }
  
  async getWhatsappTemplatesByEvent(eventId: number): Promise<WhatsappTemplate[]> {
    return Array.from(this.whatsappTemplatesMap.values()).filter(
      (template) => template.eventId === eventId
    );
  }
  
  async getWhatsappTemplatesByCategory(eventId: number, category: string): Promise<WhatsappTemplate[]> {
    return Array.from(this.whatsappTemplatesMap.values()).filter(
      (template) => template.eventId === eventId && template.category === category
    );
  }
  
  async createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const id = this.whatsappTemplateIdCounter++;
    const createdAt = new Date();
    const newWhatsappTemplate: WhatsappTemplate = { 
      ...template, 
      id, 
      createdAt,
      lastUsed: null 
    };
    this.whatsappTemplatesMap.set(id, newWhatsappTemplate);
    return newWhatsappTemplate;
  }
  
  async updateWhatsappTemplate(id: number, template: Partial<InsertWhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const existingWhatsappTemplate = this.whatsappTemplatesMap.get(id);
    if (!existingWhatsappTemplate) return undefined;
    
    const updatedWhatsappTemplate = { ...existingWhatsappTemplate, ...template };
    this.whatsappTemplatesMap.set(id, updatedWhatsappTemplate);
    return updatedWhatsappTemplate;
  }
  
  async deleteWhatsappTemplate(id: number): Promise<boolean> {
    return this.whatsappTemplatesMap.delete(id);
  }
  
  async markWhatsappTemplateAsUsed(id: number): Promise<WhatsappTemplate | undefined> {
    const existingWhatsappTemplate = this.whatsappTemplatesMap.get(id);
    if (!existingWhatsappTemplate) return undefined;
    
    const updatedWhatsappTemplate = { 
      ...existingWhatsappTemplate, 
      lastUsed: new Date() 
    };
    this.whatsappTemplatesMap.set(id, updatedWhatsappTemplate);
    return updatedWhatsappTemplate;
  }
  
  // RSVP Follow-up Template operations
  async getRsvpFollowupTemplate(id: number): Promise<RsvpFollowupTemplate | undefined> {
    return this.rsvpFollowupTemplatesMap.get(id);
  }

  async getRsvpFollowupTemplateByType(eventId: number, type: string): Promise<RsvpFollowupTemplate | undefined> {
    return Array.from(this.rsvpFollowupTemplatesMap.values()).find(
      template => template.eventId === eventId && template.type === type
    );
  }

  async getRsvpFollowupTemplatesByEvent(eventId: number): Promise<RsvpFollowupTemplate[]> {
    return Array.from(this.rsvpFollowupTemplatesMap.values()).filter(
      template => template.eventId === eventId
    );
  }

  async createRsvpFollowupTemplate(template: InsertRsvpFollowupTemplate): Promise<RsvpFollowupTemplate> {
    const id = this.rsvpFollowupTemplateIdCounter++;
    const lastUpdated = new Date();
    const newTemplate: RsvpFollowupTemplate = { ...template, id, lastUpdated };
    this.rsvpFollowupTemplatesMap.set(id, newTemplate);
    return newTemplate;
  }

  async updateRsvpFollowupTemplate(id: number, template: Partial<InsertRsvpFollowupTemplate>): Promise<RsvpFollowupTemplate | undefined> {
    const existingTemplate = this.rsvpFollowupTemplatesMap.get(id);
    if (!existingTemplate) return undefined;
    
    const updatedTemplate: RsvpFollowupTemplate = { 
      ...existingTemplate, 
      ...template, 
      lastUpdated: new Date() 
    };
    this.rsvpFollowupTemplatesMap.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteRsvpFollowupTemplate(id: number): Promise<boolean> {
    return this.rsvpFollowupTemplatesMap.delete(id);
  }
  
  // RSVP Follow-up Log operations
  async getRsvpFollowupLogsByGuest(guestId: number): Promise<RsvpFollowupLog[]> {
    return Array.from(this.rsvpFollowupLogsMap.values()).filter(
      log => log.guestId === guestId
    );
  }

  async createRsvpFollowupLog(log: InsertRsvpFollowupLog): Promise<RsvpFollowupLog> {
    const id = this.rsvpFollowupLogIdCounter++;
    const sentAt = new Date();
    const newLog: RsvpFollowupLog = { ...log, id, sentAt };
    this.rsvpFollowupLogsMap.set(id, newLog);
    return newLog;
  }
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    if (!email) return undefined;
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Event operations
  async getEvent(id: number): Promise<WeddingEvent | undefined> {
    const result = await db.select().from(weddingEvents).where(eq(weddingEvents.id, id));
    return result[0];
  }
  
  // Helper method to check if an event exists
  async eventExists(id: number): Promise<boolean> {
    if (!id) return false;
    try {
      const result = await db.select({ id: weddingEvents.id })
        .from(weddingEvents)
        .where(eq(weddingEvents.id, id))
        .limit(1);
      return result.length > 0;
    } catch (error) {
      console.error(`Error checking event existence for ID ${id}:`, error);
      return false;
    }
  }

  async getAllEvents(): Promise<WeddingEvent[]> {
    return await db.select().from(weddingEvents);
  }

  async getEventsByUser(userId: number): Promise<WeddingEvent[]> {
    return await db.select().from(weddingEvents).where(eq(weddingEvents.createdBy, userId));
  }

  async createEvent(event: InsertWeddingEvent): Promise<WeddingEvent> {
    try {
      // Use a transaction to ensure both the event and default templates are created atomically
      return await db.transaction(async (tx) => {
        // Create the event first
        const result = await tx.insert(weddingEvents).values(event).returning();
        const newEvent = result[0];
        
        // Create default WhatsApp templates for this event
        const defaultTemplates = [
          {
            eventId: newEvent.id,
            name: "RSVP Reminder",
            category: "rsvp",
            content: "Hello {{guest_name}}, this is a friendly reminder to RSVP for {{event_name}} by {{due_date}}. Looking forward to your response!",
            parameters: JSON.stringify(["guest_name", "event_name", "due_date"]),
            language: "en_US"
          },
          {
            eventId: newEvent.id,
            name: "Welcome Message",
            category: "general",
            content: "Welcome {{guest_name}}! We're delighted you'll be joining us for our wedding celebrations. Here's the event link: {{event_link}}",
            parameters: JSON.stringify(["guest_name", "event_link"]),
            language: "en_US"
          },
          {
            eventId: newEvent.id,
            name: "Travel Information",
            category: "travel",
            content: "Hello {{guest_name}}, here are the travel details for {{event_name}}. Venue: {{venue}}. If you need any assistance with transportation, please let us know.",
            parameters: JSON.stringify(["guest_name", "event_name", "venue"]),
            language: "en_US"
          },
          {
            eventId: newEvent.id,
            name: "Accommodation Confirmation",
            category: "accommodation",
            content: "Hello {{guest_name}}, your accommodation for {{event_name}} has been confirmed. You're staying at {{hotel_name}}, Room {{room_number}}, from {{check_in_date}} to {{check_out_date}}.",
            parameters: JSON.stringify(["guest_name", "event_name", "hotel_name", "room_number", "check_in_date", "check_out_date"]),
            language: "en_US"
          }
        ];
        
        // Insert all templates in a single query
        await tx.insert(whatsappTemplates).values(defaultTemplates);
        
        return newEvent;
      });
    } catch (error) {
      console.error('Error creating event with default templates:', error);
      throw error;
    }
  }

  async updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined> {
    const result = await db.update(weddingEvents)
      .set(event)
      .where(eq(weddingEvents.id, id))
      .returning();
    return result[0];
  }
  
  async updateEventEmailConfig(id: number, config: EmailConfig): Promise<WeddingEvent | undefined> {
    const result = await db.update(weddingEvents)
      .set(config)
      .where(eq(weddingEvents.id, id))
      .returning();
    return result[0];
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    console.log(`START: Deleting event with ID ${id} and all associated data`);
    
    try {
      // Use a transaction to ensure all data is deleted atomically
      return await db.transaction(async (tx) => {
        // Get all guests for this event (we need their IDs for related data)
        console.log(`Fetching guests for event ${id}`);
        const eventGuests = await tx.select().from(guests).where(eq(guests.eventId, id));
        console.log(`Found ${eventGuests.length} guests to delete`);
        
        // If there are guests, delete all associated data first
        if (eventGuests.length > 0) {
          // Extract all guest IDs
          const guestIds = eventGuests.map(guest => guest.id);
          console.log(`Processing guest IDs: ${guestIds.join(', ')}`);
          
          // Batch delete all guest-related data using 'in' operator for efficiency
          // Delete guest ceremonies
          console.log(`Deleting guest ceremonies for guests in event ${id}`);
          await tx.delete(guestCeremonies).where(inArray(guestCeremonies.guestId, guestIds));
          
          // Delete guest travel info
          console.log(`Deleting travel info for guests in event ${id}`);
          await tx.delete(travelInfo).where(inArray(travelInfo.guestId, guestIds));
          
          // Delete guest room allocations
          console.log(`Deleting room allocations for guests in event ${id}`);
          await tx.delete(roomAllocations).where(inArray(roomAllocations.guestId, guestIds));
          
          // Delete guest meal selections
          console.log(`Deleting meal selections for guests in event ${id}`);
          await tx.delete(guestMealSelections).where(inArray(guestMealSelections.guestId, guestIds));
          
          // Delete guest couple messages
          console.log(`Deleting couple messages for guests in event ${id}`);
          await tx.delete(coupleMessages).where(inArray(coupleMessages.guestId, guestIds));
        }
        
        // Delete all guests for this event
        console.log(`Deleting all guests for event ${id}`);
        await tx.delete(guests).where(eq(guests.eventId, id));
        
        // Get all ceremonies for this event
        console.log(`Fetching ceremonies for event ${id}`);
        const eventCeremonies = await tx.select().from(ceremonies).where(eq(ceremonies.eventId, id));
        console.log(`Found ${eventCeremonies.length} ceremonies to delete`);
        
        if (eventCeremonies.length > 0) {
          // Extract ceremony IDs
          const ceremonyIds = eventCeremonies.map(ceremony => ceremony.id);
          
          // Batch delete all meal options for these ceremonies
          console.log(`Deleting meal options for ceremonies in event ${id}`);
          await tx.delete(mealOptions).where(inArray(mealOptions.ceremonyId, ceremonyIds));
        }
        
        // Delete all ceremonies
        console.log(`Deleting all ceremonies for event ${id}`);
        await tx.delete(ceremonies).where(eq(ceremonies.eventId, id));
        
        // Delete accommodations
        console.log(`Deleting accommodations for event ${id}`);
        await tx.delete(accommodations).where(eq(accommodations.eventId, id));
        
        // Delete WhatsApp templates
        console.log(`Deleting WhatsApp templates for event ${id}`);
        await tx.delete(whatsappTemplates).where(eq(whatsappTemplates.eventId, id));
        
        // Finally delete the event itself
        console.log(`Deleting the event ${id} itself`);
        const result = await tx.delete(weddingEvents).where(eq(weddingEvents.id, id));
        
        console.log(`Event ${id} deletion complete with result:`, result);
        return true;  // If we got here without errors, deletion was successful
      });
    } catch (error) {
      console.error(`ERROR deleting event ${id}:`, error);
      throw error;  // Re-throw the error to be handled by the caller
    }
  }

  // Guest operations
  async getGuest(id: number): Promise<Guest | undefined> {
    console.log(`Fetching guest with ID: ${id}`);
    console.warn(`WARNING: Using getGuest without event context for guest ${id} - this may lead to data leakage across events`);
    const result = await db.select().from(guests).where(eq(guests.id, id));
    return result[0];
  }
  
  // Get guest with event context verification to ensure multi-tenant isolation
  async getGuestWithEventContext(id: number, eventId: number): Promise<Guest | undefined> {
    if (!id || !eventId) {
      console.error('Invalid parameters for getGuestWithEventContext', { id, eventId });
      return undefined;
    }
    
    console.log(`Fetching guest with ID: ${id} in event context: ${eventId}`);
    try {
      // First verify the event exists
      const eventExists = await this.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Event ID ${eventId} does not exist in getGuestWithEventContext`);
        return undefined;
      }
      
      // Then fetch the guest with event context constraint
      const result = await db.select().from(guests).where(
        and(
          eq(guests.id, id),
          eq(guests.eventId, eventId)
        )
      );
      
      if (result.length === 0) {
        console.warn(`No guest found with ID ${id} in event ${eventId}`);
        return undefined;
      }
      
      if (result.length > 1) {
        console.warn(`Multiple guests found with ID ${id} in event ${eventId}, returning first one`);
      }
      
      console.log(`Successfully retrieved guest ${id} for event ${eventId}`);
      return result[0];
    } catch (error) {
      console.error(`Error in getGuestWithEventContext for guest ${id}, event ${eventId}:`, error);
      throw new Error(`Failed to retrieve guest with ID ${id} in event context ${eventId}`);
    }
  }

  // This is the correct implementation of getGuestsByEvent
  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    if (!eventId || isNaN(eventId)) {
      throw new Error('Invalid event ID');
    }

    console.log(`DB: Fetching guests for event: ${eventId}`);
    try {
      // First verify the event exists
      const event = await this.getEvent(eventId);
      if (!event) {
        console.warn(`DB: Event ${eventId} not found`);
        return [];
      }

      // Use a single strict database query
      const result = await db
        .select()
        .from(guests)
        .where(eq(guests.eventId, eventId));

      console.log(`DB: Retrieved ${result.length} guests for event ${eventId}`);
      
      // If this is Rocky Rani event, log more details
      if (eventId === 4) {
        console.log(`DEBUG - Rocky Rani guests from database: ${result.map(g => `${g.id}: ${g.firstName} ${g.lastName}`).join(', ') || 'None'}`);
        
        // Look for Don ji in the results
        const donJi = result.find(g => g.firstName === 'Don' && g.lastName === 'ji');
        if (donJi) {
          console.log(`DEBUG - Found Don ji in database results! ID: ${donJi.id}`);
        } else {
          console.log(`DEBUG - Don ji not found in database results! Double-checking with direct SQL...`);
          
          // Double-check with direct SQL
          try {
            const { pgClient } = await import('./db');
            const directResult = await pgClient`
              SELECT id, first_name as "firstName", last_name as "lastName", event_id as "eventId"
              FROM guests
              WHERE event_id = ${eventId} AND first_name = 'Don' AND last_name = 'ji'
            `;
            
            if (directResult && directResult.length > 0) {
              console.log(`DB-DIRECT: Found Don ji with ID ${directResult[0].id} in direct query`);
              
              // Add Don ji to the results
              console.log(`DB: Adding Don ji to results from direct query`);
              result.push(directResult[0] as any);
            } else {
              console.log(`DB-DIRECT: Don ji not found in direct database query either`);
            }
          } catch (dbError) {
            console.error(`DB-DIRECT: Error checking for Don ji:`, dbError);
          }
        }
      }
      
      return result;
    } catch (error) {
      console.error(`DB: Error fetching guests for event ${eventId}:`, error);
      throw error;
    }
  }

  async getGuestByEmail(eventId: number, email: string): Promise<Guest | undefined> {
    const result = await db.select().from(guests)
      .where(and(
        eq(guests.eventId, eventId),
        eq(guests.email, email)
      ));
    return result[0];
  }

  async createGuest(guest: InsertGuest): Promise<Guest> {
    const result = await db.insert(guests).values(guest).returning();
    return result[0];
  }

  async updateGuest(id: number, guest: Partial<InsertGuest>): Promise<Guest | undefined> {
    try {
      // First get the existing guest to check eventId
      const existingGuest = await this.getGuest(id);
      if (!existingGuest) {
        console.log(`Guest with ID ${id} not found`);
        return undefined;
      }
      
      // Make sure we preserve the original eventId
      const eventId = existingGuest.eventId;
      console.log(`Updating guest ${id} with eventId ${eventId}`);
      
      // This ensures the eventId can't be changed - essential for maintaining event boundaries
      const result = await db.update(guests)
        .set({ ...guest, eventId })
        .where(eq(guests.id, id))
        .returning();
        
      if (!result || result.length === 0) {
        console.error(`No rows returned when updating guest ${id}`);
        return undefined;
      }
      
      return result[0];
    } catch (error) {
      console.error(`Error updating guest ${id}:`, error);
      // Rethrow the error so the API can handle it appropriately
      throw error;
    }
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return !!result;
  }

  async bulkCreateGuests(guests: InsertGuest[]): Promise<Guest[]> {
    if (guests.length === 0) return [];
    
    // Group guests by event for more efficient verification
    const eventIds = [...new Set(guests.map(g => g.eventId))];
    console.log(`Bulk creating guests for events: ${eventIds.join(', ')}`);
    
    // Verify all events exist before proceeding
    const validEventIds: number[] = [];
    for (const eventId of eventIds) {
      if (await this.eventExists(eventId)) {
        validEventIds.push(eventId);
      } else {
        console.warn(`Attempted to bulk create guests for non-existent event ID: ${eventId}`);
      }
    }
    
    // Filter guests to only include those with valid event IDs
    const validGuests = guests.filter(g => validEventIds.includes(g.eventId));
    
    if (validGuests.length !== guests.length) {
      console.warn(`Filtered out ${guests.length - validGuests.length} guests with invalid event IDs`);
    }
    
    if (validGuests.length === 0) {
      console.warn('No valid guests to create after event validation');
      return [];
    }
    
    console.log(`Creating ${validGuests.length} guests in database`);
    try {
      // Use the guests schema from shared/schema.ts for the table reference
      const result = await db.insert(guests).values(validGuests).returning();
      return result;
    } catch (error) {
      console.error('Error in bulkCreateGuests:', error);
      throw error;
    }
  }

  // Ceremony operations
  async getCeremony(id: number): Promise<Ceremony | undefined> {
    const result = await db.select().from(ceremonies).where(eq(ceremonies.id, id));
    return result[0];
  }

  async getCeremoniesByEvent(eventId: number): Promise<Ceremony[]> {
    return await db.select().from(ceremonies).where(eq(ceremonies.eventId, eventId));
  }

  async createCeremony(ceremony: InsertCeremony): Promise<Ceremony> {
    const result = await db.insert(ceremonies).values(ceremony).returning();
    return result[0];
  }

  async updateCeremony(id: number, ceremony: Partial<InsertCeremony>): Promise<Ceremony | undefined> {
    const result = await db.update(ceremonies)
      .set(ceremony)
      .where(eq(ceremonies.id, id))
      .returning();
    return result[0];
  }

  async deleteCeremony(id: number): Promise<boolean> {
    const result = await db.delete(ceremonies).where(eq(ceremonies.id, id));
    return !!result;
  }

  // Guest Ceremony operations
  async getGuestCeremony(guestId: number, ceremonyId: number): Promise<GuestCeremony | undefined> {
    const result = await db.select().from(guestCeremonies)
      .where(and(
        eq(guestCeremonies.guestId, guestId),
        eq(guestCeremonies.ceremonyId, ceremonyId)
      ));
    return result[0];
  }

  async getGuestCeremoniesByGuest(guestId: number): Promise<GuestCeremony[]> {
    return await db.select().from(guestCeremonies).where(eq(guestCeremonies.guestId, guestId));
  }

  async getGuestCeremoniesByCeremony(ceremonyId: number): Promise<GuestCeremony[]> {
    return await db.select().from(guestCeremonies).where(eq(guestCeremonies.ceremonyId, ceremonyId));
  }

  async createGuestCeremony(guestCeremony: InsertGuestCeremony): Promise<GuestCeremony> {
    const result = await db.insert(guestCeremonies).values(guestCeremony).returning();
    return result[0];
  }

  async updateGuestCeremony(id: number, guestCeremony: Partial<InsertGuestCeremony>): Promise<GuestCeremony | undefined> {
    const result = await db.update(guestCeremonies)
      .set(guestCeremony)
      .where(eq(guestCeremonies.id, id))
      .returning();
    return result[0];
  }

  // Travel operations
  async getTravelInfo(id: number): Promise<TravelInfo | undefined> {
    const result = await db.select().from(travelInfo).where(eq(travelInfo.id, id));
    return result[0];
  }

  async getTravelInfoByGuest(guestId: number): Promise<TravelInfo | undefined> {
    const result = await db.select().from(travelInfo).where(eq(travelInfo.guestId, guestId));
    return result[0];
  }

  async createTravelInfo(info: InsertTravelInfo): Promise<TravelInfo> {
    const result = await db.insert(travelInfo).values(info).returning();
    return result[0];
  }

  async updateTravelInfo(id: number, info: Partial<InsertTravelInfo>): Promise<TravelInfo | undefined> {
    const result = await db.update(travelInfo)
      .set(info)
      .where(eq(travelInfo.id, id))
      .returning();
    return result[0];
  }

  // Accommodation operations
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    const result = await db.select().from(accommodations).where(eq(accommodations.id, id));
    return result[0];
  }

  async getAccommodationsByEvent(eventId: number): Promise<Accommodation[]> {
    return await db.select().from(accommodations).where(eq(accommodations.eventId, eventId));
  }

  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const result = await db.insert(accommodations).values(accommodation).returning();
    return result[0];
  }

  async updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const result = await db.update(accommodations)
      .set(accommodation)
      .where(eq(accommodations.id, id))
      .returning();
    return result[0];
  }

  // Room Allocation operations
  async getRoomAllocation(id: number): Promise<RoomAllocation | undefined> {
    const result = await db.select().from(roomAllocations).where(eq(roomAllocations.id, id));
    return result[0];
  }

  async getRoomAllocationsByAccommodation(accommodationId: number): Promise<RoomAllocation[]> {
    return await db.select().from(roomAllocations).where(eq(roomAllocations.accommodationId, accommodationId));
  }

  async getRoomAllocationsByGuest(guestId: number): Promise<RoomAllocation[]> {
    return await db.select().from(roomAllocations).where(eq(roomAllocations.guestId, guestId));
  }

  async createRoomAllocation(roomAllocation: InsertRoomAllocation): Promise<RoomAllocation> {
    const result = await db.insert(roomAllocations).values(roomAllocation).returning();
    return result[0];
  }

  async updateRoomAllocation(id: number, roomAllocation: Partial<InsertRoomAllocation>): Promise<RoomAllocation | undefined> {
    const result = await db.update(roomAllocations)
      .set(roomAllocation)
      .where(eq(roomAllocations.id, id))
      .returning();
    return result[0];
  }

  // Meal operations
  async getMealOption(id: number): Promise<MealOption | undefined> {
    const result = await db.select().from(mealOptions).where(eq(mealOptions.id, id));
    return result[0];
  }

  async getMealOptionsByCeremony(ceremonyId: number): Promise<MealOption[]> {
    return await db.select().from(mealOptions).where(eq(mealOptions.ceremonyId, ceremonyId));
  }

  async createMealOption(mealOption: InsertMealOption): Promise<MealOption> {
    const result = await db.insert(mealOptions).values(mealOption).returning();
    return result[0];
  }

  async updateMealOption(id: number, mealOption: Partial<InsertMealOption>): Promise<MealOption | undefined> {
    const result = await db.update(mealOptions)
      .set(mealOption)
      .where(eq(mealOptions.id, id))
      .returning();
    return result[0];
  }

  // Guest Meal operations
  async getGuestMealSelection(id: number): Promise<GuestMealSelection | undefined> {
    const result = await db.select().from(guestMealSelections).where(eq(guestMealSelections.id, id));
    return result[0];
  }

  async getGuestMealSelectionsByGuest(guestId: number): Promise<GuestMealSelection[]> {
    return await db.select().from(guestMealSelections).where(eq(guestMealSelections.guestId, guestId));
  }

  async getGuestMealSelectionsByCeremony(ceremonyId: number): Promise<GuestMealSelection[]> {
    return await db.select().from(guestMealSelections).where(eq(guestMealSelections.ceremonyId, ceremonyId));
  }

  async createGuestMealSelection(guestMealSelection: InsertGuestMealSelection): Promise<GuestMealSelection> {
    const result = await db.insert(guestMealSelections).values(guestMealSelection).returning();
    return result[0];
  }

  async updateGuestMealSelection(id: number, guestMealSelection: Partial<InsertGuestMealSelection>): Promise<GuestMealSelection | undefined> {
    const result = await db.update(guestMealSelections)
      .set(guestMealSelection)
      .where(eq(guestMealSelections.id, id))
      .returning();
    return result[0];
  }

  // Message operations
  async getCoupleMessage(id: number): Promise<CoupleMessage | undefined> {
    const result = await db.select().from(coupleMessages).where(eq(coupleMessages.id, id));
    return result[0];
  }

  async getCoupleMessagesByEvent(eventId: number): Promise<CoupleMessage[]> {
    return await db.select().from(coupleMessages).where(eq(coupleMessages.eventId, eventId));
  }

  async getCoupleMessagesByGuest(guestId: number): Promise<CoupleMessage[]> {
    return await db.select().from(coupleMessages).where(eq(coupleMessages.guestId, guestId));
  }

  async createCoupleMessage(coupleMessage: InsertCoupleMessage): Promise<CoupleMessage> {
    const result = await db.insert(coupleMessages).values(coupleMessage).returning();
    return result[0];
  }

  // Relationship Type operations
  async getRelationshipType(id: number): Promise<RelationshipType | undefined> {
    const result = await db.select().from(relationshipTypes).where(eq(relationshipTypes.id, id));
    return result[0];
  }

  async getAllRelationshipTypes(): Promise<RelationshipType[]> {
    return await db.select().from(relationshipTypes);
  }

  async createRelationshipType(relationshipType: InsertRelationshipType): Promise<RelationshipType> {
    const result = await db.insert(relationshipTypes).values(relationshipType).returning();
    return result[0];
  }

  async updateRelationshipType(id: number, relationshipType: Partial<InsertRelationshipType>): Promise<RelationshipType | undefined> {
    const result = await db.update(relationshipTypes)
      .set(relationshipType)
      .where(eq(relationshipTypes.id, id))
      .returning();
    return result[0];
  }

  async deleteRelationshipType(id: number): Promise<boolean> {
    const result = await db.delete(relationshipTypes).where(eq(relationshipTypes.id, id));
    return !!result;
  }

  // WhatsApp Template operations
  async getWhatsappTemplate(id: number): Promise<WhatsappTemplate | undefined> {
    const result = await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return result[0];
  }

  async getWhatsappTemplatesByEvent(eventId: number): Promise<WhatsappTemplate[]> {
    return await db.select().from(whatsappTemplates).where(eq(whatsappTemplates.eventId, eventId));
  }

  async getWhatsappTemplatesByCategory(eventId: number, category: string): Promise<WhatsappTemplate[]> {
    return await db.select().from(whatsappTemplates).where(
      and(
        eq(whatsappTemplates.eventId, eventId),
        eq(whatsappTemplates.category, category)
      )
    );
  }

  async createWhatsappTemplate(template: InsertWhatsappTemplate): Promise<WhatsappTemplate> {
    const result = await db.insert(whatsappTemplates).values(template).returning();
    return result[0];
  }

  async updateWhatsappTemplate(id: number, template: Partial<InsertWhatsappTemplate>): Promise<WhatsappTemplate | undefined> {
    const result = await db.update(whatsappTemplates)
      .set(template)
      .where(eq(whatsappTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteWhatsappTemplate(id: number): Promise<boolean> {
    const result = await db.delete(whatsappTemplates).where(eq(whatsappTemplates.id, id));
    return !!result;
  }

  async markWhatsappTemplateAsUsed(id: number): Promise<WhatsappTemplate | undefined> {
    const result = await db.update(whatsappTemplates)
      .set({ lastUsed: new Date() })
      .where(eq(whatsappTemplates.id, id))
      .returning();
    return result[0];
  }

  // RSVP Follow-up Template operations
  async getRsvpFollowupTemplate(id: number): Promise<RsvpFollowupTemplate | undefined> {
    const result = await db.select().from(rsvpFollowupTemplates).where(eq(rsvpFollowupTemplates.id, id));
    return result[0];
  }

  async getRsvpFollowupTemplateByType(eventId: number, type: string): Promise<RsvpFollowupTemplate | undefined> {
    const result = await db.select().from(rsvpFollowupTemplates).where(
      and(
        eq(rsvpFollowupTemplates.eventId, eventId),
        eq(rsvpFollowupTemplates.type, type)
      )
    );
    return result[0];
  }

  async getRsvpFollowupTemplatesByEvent(eventId: number): Promise<RsvpFollowupTemplate[]> {
    return db.select().from(rsvpFollowupTemplates).where(eq(rsvpFollowupTemplates.eventId, eventId));
  }

  async createRsvpFollowupTemplate(template: InsertRsvpFollowupTemplate): Promise<RsvpFollowupTemplate> {
    const result = await db.insert(rsvpFollowupTemplates).values(template).returning();
    return result[0];
  }

  async updateRsvpFollowupTemplate(id: number, template: Partial<InsertRsvpFollowupTemplate>): Promise<RsvpFollowupTemplate | undefined> {
    const result = await db.update(rsvpFollowupTemplates)
      .set(template)
      .where(eq(rsvpFollowupTemplates.id, id))
      .returning();
    return result[0];
  }

  async deleteRsvpFollowupTemplate(id: number): Promise<boolean> {
    const result = await db.delete(rsvpFollowupTemplates).where(eq(rsvpFollowupTemplates.id, id)).returning();
    return result.length > 0;
  }

  // RSVP Follow-up Log operations
  async getRsvpFollowupLogsByGuest(guestId: number): Promise<RsvpFollowupLog[]> {
    return db.select().from(rsvpFollowupLogs).where(eq(rsvpFollowupLogs.guestId, guestId));
  }

  async createRsvpFollowupLog(log: InsertRsvpFollowupLog): Promise<RsvpFollowupLog> {
    const result = await db.insert(rsvpFollowupLogs).values(log).returning();
    return result[0];
  }

  // Accommodation operations
  async getAccommodation(id: number): Promise<Accommodation | undefined> {
    const result = await db.select().from(accommodations).where(eq(accommodations.id, id));
    return result[0];
  }

  async getAccommodationsByEvent(eventId: number): Promise<Accommodation[]> {
    try {
      const result = await db.select().from(accommodations).where(eq(accommodations.eventId, eventId));
      return result;
    } catch (error) {
      console.error(`Error fetching accommodations for event ${eventId}:`, error);
      return [];
    }
  }

  async createAccommodation(accommodation: InsertAccommodation): Promise<Accommodation> {
    const result = await db.insert(accommodations).values(accommodation).returning();
    return result[0];
  }

  async updateAccommodation(id: number, accommodation: Partial<InsertAccommodation>): Promise<Accommodation | undefined> {
    const result = await db.update(accommodations)
      .set(accommodation)
      .where(eq(accommodations.id, id))
      .returning();
    return result[0];
  }

  async deleteAccommodation(id: number): Promise<boolean> {
    const result = await db.delete(accommodations).where(eq(accommodations.id, id)).returning();
    return result.length > 0;
  }

  // Hotel operations
  async getHotel(id: number): Promise<Hotel | undefined> {
    const result = await db.select().from(hotels).where(eq(hotels.id, id));
    return result[0];
  }

  async getHotelsByEvent(eventId: number): Promise<Hotel[]> {
    try {
      const result = await db.select().from(hotels).where(eq(hotels.eventId, eventId));
      return result;
    } catch (error) {
      console.error(`Error fetching hotels for event ${eventId}:`, error);
      return [];
    }
  }

  async createHotel(hotel: InsertHotel): Promise<Hotel> {
    const result = await db.insert(hotels).values(hotel).returning();
    return result[0];
  }

  async updateHotel(id: number, hotel: Partial<InsertHotel>): Promise<Hotel | undefined> {
    const result = await db.update(hotels)
      .set(hotel)
      .where(eq(hotels.id, id))
      .returning();
    return result[0];
  }

  async deleteHotel(id: number): Promise<boolean> {
    const result = await db.delete(hotels).where(eq(hotels.id, id)).returning();
    return result.length > 0;
  }
}

// Use DatabaseStorage for PostgreSQL database
export const storage = new DatabaseStorage();
