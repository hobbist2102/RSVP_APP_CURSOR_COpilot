import {
  users, type User, type InsertUser,
  weddingEvents, type WeddingEvent, type InsertWeddingEvent,
  guests, type Guest, type InsertGuest,
  ceremonies, type Ceremony, type InsertCeremony,
  guestCeremonies, type GuestCeremony, type InsertGuestCeremony,
  travelInfo, type TravelInfo, type InsertTravelInfo,
  accommodations, type Accommodation, type InsertAccommodation,
  roomAllocations, type RoomAllocation, type InsertRoomAllocation,
  mealOptions, type MealOption, type InsertMealOption,
  guestMealSelections, type GuestMealSelection, type InsertGuestMealSelection,
  coupleMessages, type CoupleMessage, type InsertCoupleMessage,
  relationshipTypes, type RelationshipType, type InsertRelationshipType,
  whatsappTemplates, type WhatsappTemplate, type InsertWhatsappTemplate
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event operations
  getEvent(id: number): Promise<WeddingEvent | undefined>;
  getAllEvents(): Promise<WeddingEvent[]>;
  getEventsByUser(userId: number): Promise<WeddingEvent[]>;
  createEvent(event: InsertWeddingEvent): Promise<WeddingEvent>;
  updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
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
    return this.guestsMap.get(id);
  }
  
  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    return Array.from(this.guestsMap.values()).filter(
      (guest) => guest.eventId === eventId
    );
  }
  
  async getGuestByEmail(eventId: number, email: string): Promise<Guest | undefined> {
    return Array.from(this.guestsMap.values()).find(
      (guest) => guest.eventId === eventId && guest.email === email
    );
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
    
    const updatedGuest = { ...existingGuest, ...guest };
    this.guestsMap.set(id, updatedGuest);
    return updatedGuest;
  }
  
  async deleteGuest(id: number): Promise<boolean> {
    return this.guestsMap.delete(id);
  }
  
  async bulkCreateGuests(guests: InsertGuest[]): Promise<Guest[]> {
    const createdGuests: Guest[] = [];
    
    for (const guest of guests) {
      const newGuest = await this.createGuest(guest);
      createdGuests.push(newGuest);
    }
    
    return createdGuests;
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
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(users).values(user).returning();
    return result[0];
  }

  // Event operations
  async getEvent(id: number): Promise<WeddingEvent | undefined> {
    const result = await db.select().from(weddingEvents).where(eq(weddingEvents.id, id));
    return result[0];
  }

  async getAllEvents(): Promise<WeddingEvent[]> {
    return await db.select().from(weddingEvents);
  }

  async getEventsByUser(userId: number): Promise<WeddingEvent[]> {
    return await db.select().from(weddingEvents).where(eq(weddingEvents.createdBy, userId));
  }

  async createEvent(event: InsertWeddingEvent): Promise<WeddingEvent> {
    const result = await db.insert(weddingEvents).values(event).returning();
    return result[0];
  }

  async updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined> {
    const result = await db.update(weddingEvents)
      .set(event)
      .where(eq(weddingEvents.id, id))
      .returning();
    return result[0];
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    // Delete in cascade order - first delete all related data
    
    // Get all guests for this event
    const eventGuests = await db.select().from(guests).where(eq(guests.eventId, id));
    
    for (const guest of eventGuests) {
      // Delete guest ceremonies
      await db.delete(guestCeremonies).where(eq(guestCeremonies.guestId, guest.id));
      
      // Delete guest travel info
      await db.delete(travelInfo).where(eq(travelInfo.guestId, guest.id));
      
      // Delete guest room allocations
      await db.delete(roomAllocations).where(eq(roomAllocations.guestId, guest.id));
      
      // Delete guest meal selections
      await db.delete(guestMealSelections).where(eq(guestMealSelections.guestId, guest.id));
      
      // Delete guest couple messages
      await db.delete(coupleMessages).where(eq(coupleMessages.guestId, guest.id));
    }
    
    // Delete all guests
    await db.delete(guests).where(eq(guests.eventId, id));
    
    // Get all ceremonies for this event
    const eventCeremonies = await db.select().from(ceremonies).where(eq(ceremonies.eventId, id));
    
    // Delete meal options for each ceremony
    for (const ceremony of eventCeremonies) {
      await db.delete(mealOptions).where(eq(mealOptions.ceremonyId, ceremony.id));
    }
    
    // Delete all ceremonies
    await db.delete(ceremonies).where(eq(ceremonies.eventId, id));
    
    // Delete accommodations
    await db.delete(accommodations).where(eq(accommodations.eventId, id));
    
    // Delete WhatsApp templates
    await db.delete(whatsappTemplates).where(eq(whatsappTemplates.eventId, id));
    
    // Finally delete the event itself
    const result = await db.delete(weddingEvents).where(eq(weddingEvents.id, id));
    return !!result;
  }

  // Guest operations
  async getGuest(id: number): Promise<Guest | undefined> {
    const result = await db.select().from(guests).where(eq(guests.id, id));
    return result[0];
  }

  async getGuestsByEvent(eventId: number): Promise<Guest[]> {
    return await db.select().from(guests).where(eq(guests.eventId, eventId));
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
    const result = await db.update(guests)
      .set(guest)
      .where(eq(guests.id, id))
      .returning();
    return result[0];
  }

  async deleteGuest(id: number): Promise<boolean> {
    const result = await db.delete(guests).where(eq(guests.id, id));
    return !!result;
  }

  async bulkCreateGuests(guests: InsertGuest[]): Promise<Guest[]> {
    if (guests.length === 0) return [];
    const result = await db.insert(guests).values(guests).returning();
    return result;
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
}

// Use DatabaseStorage for PostgreSQL database
export const storage = new DatabaseStorage();
