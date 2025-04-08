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
  coupleMessages, type CoupleMessage, type InsertCoupleMessage
} from "@shared/schema";

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
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined> {
    const existingEvent = this.eventsMap.get(id);
    if (!existingEvent) return undefined;
    
    const updatedEvent = { ...existingEvent, ...event };
    this.eventsMap.set(id, updatedEvent);
    return updatedEvent;
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
}

export const storage = new MemStorage();
