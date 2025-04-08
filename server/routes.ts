import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
import { 
  insertUserSchema, 
  insertGuestSchema, 
  insertCeremonySchema,
  insertWeddingEventSchema,
  insertGuestCeremonySchema,
  insertTravelInfoSchema,
  insertAccommodationSchema,
  insertRoomAllocationSchema,
  insertMealOptionSchema,
  insertGuestMealSelectionSchema,
  insertCoupleMessageSchema,
  insertRelationshipTypeSchema,
  insertWhatsappTemplateSchema
} from "@shared/schema";
import { z } from "zod";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session setup
  const sessionStore = MemoryStore(session);
  app.use(session({
    secret: 'wedding-rsvp-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: false, // Set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
      path: '/'
    },
    store: new sessionStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    })
  }));
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (user.password !== password) { // In production, use proper password hashing
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated()) {
      console.log('User is authenticated:', req.user);
      return next();
    }
    console.log('Authentication failed - session info:', req.session);
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  const isAdmin = (req: Request, res: Response, next: any) => {
    if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
      return next();
    }
    res.status(403).json({ message: 'Forbidden' });
  };
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Create new user
      const user = await storage.createUser(userData);
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          console.error('Login after registration failed:', err);
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        
        console.log('Registration and login successful, user:', user);
        console.log('Session after registration:', req.session);
        res.status(201).json({ user });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', passport.authenticate('local'), (req, res) => {
    // Log the session after login to debug
    console.log('Login successful, session:', req.session);
    console.log('User after login:', req.user);
    res.json({ user: req.user });
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Logout failed' });
      }
      res.json({ message: 'Logged out successfully' });
    });
  });
  
  app.get('/api/auth/user', (req, res) => {
    console.log('Checking user authentication, session ID:', req.sessionID);
    if (req.isAuthenticated() && req.user) {
      console.log('User is authenticated:', req.user);
      res.json({ user: req.user });
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
  // User routes
  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
  // Wedding Event routes
  app.get('/api/events', isAuthenticated, async (req, res) => {
    try {
      const events = await storage.getAllEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });
  
  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  });
  
  app.post('/api/events', isAuthenticated, async (req, res) => {
    try {
      console.log('Received event data:', req.body);
      // Get the authenticated user from the request
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      // Create a complete event data object with the authenticated user's ID
      const eventData = {
        ...req.body,
        createdBy: (req.user as any).id // Add the user ID from the session
      };
      
      console.log('Complete event data with user ID:', eventData);
      
      // Validate the event data
      const validatedData = insertWeddingEventSchema.parse(eventData);
      console.log('Parsed event data:', validatedData);
      
      // Create the event
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation errors:', error.errors);
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create event' });
    }
  });
  
  app.put('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const eventData = insertWeddingEventSchema.partial().parse(req.body);
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: 'Event not found' });
      }
      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update event' });
    }
  });
  
  app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
      // Verify the event exists first
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Verify the user has permission to delete this event
      if (req.user && req.user.id !== event.createdBy && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Unauthorized to delete this event' });
      }
      
      const success = await storage.deleteEvent(eventId);
      if (!success) {
        return res.status(404).json({ message: 'Event not found or could not be deleted' });
      }
      
      res.json({ message: 'Event and all related data successfully deleted' });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });
  
  // API route for current event, used by event selector
  app.get('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      // This endpoint doesn't actually fetch from storage - it's used as a query key
      // The current event is stored in the react-query cache by the EventSelector component
      res.json({});
    } catch (error) {
      console.error(`Error with current event: ${error}`);
      res.status(500).json({ message: 'Error processing current event' });
    }
  });
  
  // Guest routes
  app.get('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guests = await storage.getGuestsByEvent(eventId);
      res.json(guests);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch guests' });
    }
  });
  
  app.get('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      res.json(guest);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch guest' });
    }
  });
  
  app.post('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guestData = insertGuestSchema.parse({ ...req.body, eventId });
      const guest = await storage.createGuest(guestData);
      res.status(201).json(guest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create guest' });
    }
  });
  
  app.put('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const guestData = insertGuestSchema.partial().parse(req.body);
      const updatedGuest = await storage.updateGuest(guestId, guestData);
      if (!updatedGuest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      res.json(updatedGuest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update guest' });
    }
  });
  
  app.delete('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      const success = await storage.deleteGuest(guestId);
      if (!success) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      res.json({ message: 'Guest deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete guest' });
    }
  });
  
  // Excel import/export
  app.post('/api/events/:eventId/guests/import', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const eventId = parseInt(req.params.eventId);
      const workbook = XLSX.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const guests = jsonData.map((row: any) => ({
        eventId,
        firstName: row['First Name'] || '',
        lastName: row['Last Name'] || '',
        email: row['Email'] || '',
        phone: row['Phone'] || '',
        address: row['Address'] || '',
        isFamily: row['Is Family'] === 'Yes',
        relationship: row['Relationship'] || '',
        rsvpStatus: row['RSVP Status'] || 'pending',
        plusOneAllowed: row['Plus One Allowed'] === 'Yes',
        plusOneName: row['Plus One Name'] || '',
        numberOfChildren: parseInt(row['Number of Children'] || '0'),
        childrenNames: row['Children Names'] || '',
        dietaryRestrictions: row['Dietary Restrictions'] || '',
        tableAssignment: row['Table Assignment'] || '',
        giftTracking: row['Gift Tracking'] || '',
        notes: row['Notes'] || ''
      }));
      
      // Validate guest data
      const validGuests = [];
      
      for (const guestData of guests) {
        try {
          const validatedGuest = insertGuestSchema.parse(guestData);
          validGuests.push(validatedGuest);
        } catch (error) {
          // Skip invalid guest data
          console.error('Invalid guest data:', guestData, error);
        }
      }
      
      const createdGuests = await storage.bulkCreateGuests(validGuests);
      
      res.status(201).json({
        message: `Imported ${createdGuests.length} guests successfully`,
        guests: createdGuests
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to import guests' });
    }
  });
  
  app.get('/api/events/:eventId/guests/export', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guests = await storage.getGuestsByEvent(eventId);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const worksheet = XLSX.utils.json_to_sheet(guests.map(guest => ({
        'First Name': guest.firstName,
        'Last Name': guest.lastName,
        'Email': guest.email,
        'Phone': guest.phone,
        'Address': guest.address,
        'Is Family': guest.isFamily ? 'Yes' : 'No',
        'Relationship': guest.relationship,
        'RSVP Status': guest.rsvpStatus,
        'Plus One Allowed': guest.plusOneAllowed ? 'Yes' : 'No',
        'Plus One Name': guest.plusOneName,
        'Number of Children': guest.numberOfChildren,
        'Children Names': guest.childrenNames,
        'Dietary Restrictions': guest.dietaryRestrictions,
        'Table Assignment': guest.tableAssignment,
        'Gift Tracking': guest.giftTracking,
        'Notes': guest.notes
      })));
      
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Guests');
      
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      res.setHeader('Content-Disposition', `attachment; filename="${event.title} - Guest List.xlsx"`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(buffer);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export guests' });
    }
  });
  
  // Ceremony routes
  app.get('/api/events/:eventId/ceremonies', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const ceremonies = await storage.getCeremoniesByEvent(eventId);
      res.json(ceremonies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ceremonies' });
    }
  });
  
  app.post('/api/events/:eventId/ceremonies', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const ceremonyData = insertCeremonySchema.parse({ ...req.body, eventId });
      const ceremony = await storage.createCeremony(ceremonyData);
      res.status(201).json(ceremony);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create ceremony' });
    }
  });
  
  app.put('/api/ceremonies/:id', isAuthenticated, async (req, res) => {
    try {
      const ceremonyId = parseInt(req.params.id);
      const ceremonyData = insertCeremonySchema.partial().parse(req.body);
      const updatedCeremony = await storage.updateCeremony(ceremonyId, ceremonyData);
      if (!updatedCeremony) {
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      res.json(updatedCeremony);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update ceremony' });
    }
  });
  
  app.delete('/api/ceremonies/:id', isAuthenticated, async (req, res) => {
    try {
      const ceremonyId = parseInt(req.params.id);
      const success = await storage.deleteCeremony(ceremonyId);
      if (!success) {
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      res.json({ message: 'Ceremony deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete ceremony' });
    }
  });
  
  // Guest Ceremony Attendance routes
  app.get('/api/ceremonies/:ceremonyId/attendance', isAuthenticated, async (req, res) => {
    try {
      const ceremonyId = parseInt(req.params.ceremonyId);
      const attendances = await storage.getGuestCeremoniesByCeremony(ceremonyId);
      res.json(attendances);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  });
  
  app.get('/api/guests/:guestId/attendance', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const attendances = await storage.getGuestCeremoniesByGuest(guestId);
      res.json(attendances);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch attendance' });
    }
  });
  
  app.post('/api/guests/:guestId/attendance', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const attendanceData = insertGuestCeremonySchema.parse({ ...req.body, guestId });
      
      // Check if already exists
      const existing = await storage.getGuestCeremony(guestId, attendanceData.ceremonyId);
      if (existing) {
        const updated = await storage.updateGuestCeremony(existing.id, { attending: attendanceData.attending });
        return res.json(updated);
      }
      
      const attendance = await storage.createGuestCeremony(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create attendance' });
    }
  });
  
  // Travel routes
  app.get('/api/guests/:guestId/travel', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const travel = await storage.getTravelInfoByGuest(guestId);
      if (!travel) {
        return res.status(404).json({ message: 'Travel info not found' });
      }
      res.json(travel);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch travel info' });
    }
  });
  
  app.post('/api/guests/:guestId/travel', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const travelData = insertTravelInfoSchema.parse({ ...req.body, guestId });
      
      // Check if already exists
      const existing = await storage.getTravelInfoByGuest(guestId);
      if (existing) {
        const updated = await storage.updateTravelInfo(existing.id, travelData);
        return res.json(updated);
      }
      
      const travel = await storage.createTravelInfo(travelData);
      res.status(201).json(travel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create travel info' });
    }
  });
  
  app.put('/api/travel/:id', isAuthenticated, async (req, res) => {
    try {
      const travelId = parseInt(req.params.id);
      const travelData = insertTravelInfoSchema.partial().parse(req.body);
      const updatedTravel = await storage.updateTravelInfo(travelId, travelData);
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel info not found' });
      }
      res.json(updatedTravel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update travel info' });
    }
  });
  
  // Accommodation routes
  app.get('/api/events/:eventId/accommodations', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const accommodations = await storage.getAccommodationsByEvent(eventId);
      res.json(accommodations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch accommodations' });
    }
  });
  
  app.post('/api/events/:eventId/accommodations', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const accommodationData = insertAccommodationSchema.parse({ ...req.body, eventId });
      const accommodation = await storage.createAccommodation(accommodationData);
      res.status(201).json(accommodation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create accommodation' });
    }
  });
  
  app.put('/api/accommodations/:id', isAuthenticated, async (req, res) => {
    try {
      const accommodationId = parseInt(req.params.id);
      const accommodationData = insertAccommodationSchema.partial().parse(req.body);
      const updatedAccommodation = await storage.updateAccommodation(accommodationId, accommodationData);
      if (!updatedAccommodation) {
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      res.json(updatedAccommodation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update accommodation' });
    }
  });
  
  // Room Allocation routes
  app.get('/api/accommodations/:accommodationId/allocations', isAuthenticated, async (req, res) => {
    try {
      const accommodationId = parseInt(req.params.accommodationId);
      const allocations = await storage.getRoomAllocationsByAccommodation(accommodationId);
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch allocations' });
    }
  });
  
  app.get('/api/guests/:guestId/allocations', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const allocations = await storage.getRoomAllocationsByGuest(guestId);
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch allocations' });
    }
  });
  
  app.post('/api/allocations', isAuthenticated, async (req, res) => {
    try {
      const allocationData = insertRoomAllocationSchema.parse(req.body);
      const allocation = await storage.createRoomAllocation(allocationData);
      
      // Update allocated rooms count
      const accommodation = await storage.getAccommodation(allocationData.accommodationId);
      if (accommodation) {
        await storage.updateAccommodation(allocationData.accommodationId, {
          allocatedRooms: accommodation.allocatedRooms + 1
        });
      }
      
      res.status(201).json(allocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create allocation' });
    }
  });
  
  app.put('/api/allocations/:id', isAuthenticated, async (req, res) => {
    try {
      const allocationId = parseInt(req.params.id);
      const allocationData = insertRoomAllocationSchema.partial().parse(req.body);
      const updatedAllocation = await storage.updateRoomAllocation(allocationId, allocationData);
      if (!updatedAllocation) {
        return res.status(404).json({ message: 'Allocation not found' });
      }
      res.json(updatedAllocation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update allocation' });
    }
  });
  
  // Meal Option routes
  app.get('/api/ceremonies/:ceremonyId/meals', isAuthenticated, async (req, res) => {
    try {
      const ceremonyId = parseInt(req.params.ceremonyId);
      const meals = await storage.getMealOptionsByCeremony(ceremonyId);
      res.json(meals);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch meals' });
    }
  });
  
  app.post('/api/ceremonies/:ceremonyId/meals', isAuthenticated, async (req, res) => {
    try {
      const ceremonyId = parseInt(req.params.ceremonyId);
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      const mealData = insertMealOptionSchema.parse({ 
        ...req.body, 
        ceremonyId,
        eventId: ceremony.eventId
      });
      
      const meal = await storage.createMealOption(mealData);
      res.status(201).json(meal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create meal option' });
    }
  });
  
  app.put('/api/meals/:id', isAuthenticated, async (req, res) => {
    try {
      const mealId = parseInt(req.params.id);
      const mealData = insertMealOptionSchema.partial().parse(req.body);
      const updatedMeal = await storage.updateMealOption(mealId, mealData);
      if (!updatedMeal) {
        return res.status(404).json({ message: 'Meal option not found' });
      }
      res.json(updatedMeal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update meal option' });
    }
  });
  
  // Guest Meal Selection routes
  app.get('/api/guests/:guestId/meal-selections', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const selections = await storage.getGuestMealSelectionsByGuest(guestId);
      res.json(selections);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch meal selections' });
    }
  });
  
  app.post('/api/guests/:guestId/meal-selections', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      const selectionData = insertGuestMealSelectionSchema.parse({ ...req.body, guestId });
      const selection = await storage.createGuestMealSelection(selectionData);
      res.status(201).json(selection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create meal selection' });
    }
  });
  
  app.put('/api/meal-selections/:id', isAuthenticated, async (req, res) => {
    try {
      const selectionId = parseInt(req.params.id);
      const selectionData = insertGuestMealSelectionSchema.partial().parse(req.body);
      const updatedSelection = await storage.updateGuestMealSelection(selectionId, selectionData);
      if (!updatedSelection) {
        return res.status(404).json({ message: 'Meal selection not found' });
      }
      res.json(updatedSelection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update meal selection' });
    }
  });
  
  // Couple Message routes
  app.get('/api/events/:eventId/messages', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const messages = await storage.getCoupleMessagesByEvent(eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });
  
  app.post('/api/events/:eventId/messages', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const messageData = insertCoupleMessageSchema.parse({ ...req.body, eventId });
      const message = await storage.createCoupleMessage(messageData);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create message' });
    }
  });
  
  // RSVP public endpoint
  app.post('/api/rsvp', async (req, res) => {
    try {
      const { eventId, email, firstName, lastName, rsvpStatus, plusOneName, numberOfChildren, childrenNames, dietaryRestrictions, message } = req.body;
      
      if (!eventId || !email || !firstName || !lastName || !rsvpStatus) {
        return res.status(400).json({ message: 'Missing required fields' });
      }
      
      // Check if guest exists
      let guest = await storage.getGuestByEmail(eventId, email);
      
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found. Please contact the event organizer.' });
      }
      
      // Update guest RSVP status
      guest = await storage.updateGuest(guest.id, {
        rsvpStatus,
        plusOneName: plusOneName || guest.plusOneName,
        numberOfChildren: numberOfChildren !== undefined ? numberOfChildren : guest.numberOfChildren,
        childrenNames: childrenNames || guest.childrenNames,
        dietaryRestrictions: dietaryRestrictions || guest.dietaryRestrictions
      });
      
      // Add message if provided
      if (message) {
        await storage.createCoupleMessage({
          eventId,
          guestId: guest.id,
          message
        });
      }
      
      res.json({ 
        message: 'RSVP submitted successfully',
        guest
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to submit RSVP' });
    }
  });
  
  // Statistics
  app.get('/api/events/:eventId/statistics', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const guests = await storage.getGuestsByEvent(eventId);
      
      const stats = {
        total: guests.length,
        confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
        declined: guests.filter(g => g.rsvpStatus === 'declined').length,
        pending: guests.filter(g => g.rsvpStatus === 'pending').length,
        plusOnes: guests.filter(g => g.plusOneName).length,
        children: guests.reduce((acc, g) => acc + g.numberOfChildren, 0),
        rsvpRate: guests.length > 0 ? 
          (guests.filter(g => g.rsvpStatus !== 'pending').length / guests.length) * 100 : 0
      };
      
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch statistics' });
    }
  });
  
  // Relationship Type routes
  app.get('/api/relationship-types', isAuthenticated, async (req, res) => {
    try {
      const relationshipTypes = await storage.getAllRelationshipTypes();
      res.json(relationshipTypes);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch relationship types' });
    }
  });
  
  app.get('/api/relationship-types/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const relationshipType = await storage.getRelationshipType(id);
      if (!relationshipType) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json(relationshipType);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch relationship type' });
    }
  });
  
  app.post('/api/relationship-types', isAuthenticated, async (req, res) => {
    try {
      const data = insertRelationshipTypeSchema.parse(req.body);
      const relationshipType = await storage.createRelationshipType(data);
      res.status(201).json(relationshipType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create relationship type' });
    }
  });
  
  app.put('/api/relationship-types/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertRelationshipTypeSchema.partial().parse(req.body);
      const relationshipType = await storage.updateRelationshipType(id, data);
      if (!relationshipType) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json(relationshipType);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update relationship type' });
    }
  });
  
  app.delete('/api/relationship-types/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteRelationshipType(id);
      if (!success) {
        return res.status(404).json({ message: 'Relationship type not found' });
      }
      res.json({ message: 'Relationship type deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete relationship type' });
    }
  });
  
  // WhatsApp Template routes
  app.get('/api/events/:eventId/whatsapp-templates', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const templates = await storage.getWhatsappTemplatesByEvent(eventId);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch WhatsApp templates' });
    }
  });
  
  app.get('/api/events/:eventId/whatsapp-templates/category/:category', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const { category } = req.params;
      const templates = await storage.getWhatsappTemplatesByCategory(eventId, category);
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch WhatsApp templates' });
    }
  });
  
  app.get('/api/whatsapp-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.getWhatsappTemplate(id);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch WhatsApp template' });
    }
  });
  
  app.post('/api/events/:eventId/whatsapp-templates', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const data = insertWhatsappTemplateSchema.parse({ ...req.body, eventId });
      const template = await storage.createWhatsappTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create WhatsApp template' });
    }
  });
  
  app.put('/api/whatsapp-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertWhatsappTemplateSchema.partial().parse(req.body);
      const template = await storage.updateWhatsappTemplate(id, data);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update WhatsApp template' });
    }
  });
  
  app.delete('/api/whatsapp-templates/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWhatsappTemplate(id);
      if (!success) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json({ message: 'WhatsApp template deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to delete WhatsApp template' });
    }
  });
  
  app.post('/api/whatsapp-templates/:id/mark-used', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const template = await storage.markWhatsappTemplateAsUsed(id);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: 'Failed to mark WhatsApp template as used' });
    }
  });
  
  return httpServer;
}
