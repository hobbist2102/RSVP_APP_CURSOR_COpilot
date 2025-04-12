import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";
// Import session type extensions
import './types';
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
  insertWhatsappTemplateSchema,
  guests
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Session setup
  const sessionStore = MemoryStore(session);
  app.use(session({
    secret: 'wedding-rsvp-secret',
    resave: true, // Changed to true to ensure session is saved after each request
    saveUninitialized: true, // Changed to true to create session unconditionally
    cookie: { 
      secure: false, // False for development, should be conditional in production
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
    console.log('Authentication failed - session:', req.sessionID);
    res.status(401).json({ message: 'Please log in again' });
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
        
        // Save the session explicitly before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            console.error('Session save error:', saveErr);
            return res.status(500).json({ message: 'Registration successful but session save failed' });
          }
          
          console.log('Session after registration (saved):', req.session);
          res.status(201).json({ user });
        });
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to register user' });
    }
  });
  
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: Error | null, user: Express.User | false, info: { message: string } | undefined) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info?.message || 'Invalid credentials' });
      }
      
      req.login(user, (loginErr: Error | null) => {
        if (loginErr) {
          return next(loginErr);
        }
        
        // Log the session after login to debug
        console.log('Login successful, session:', req.session);
        console.log('User after login:', req.user);
        
        // Save the session before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            return next(saveErr);
          }
          return res.json({ user: req.user });
        });
      });
    })(req, res, next);
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
    console.log('Session object:', req.session);
    
    if (req.isAuthenticated() && req.user) {
      console.log('User is authenticated:', req.user);
      // Ensure we return a consistent user object
      const user = {
        id: (req.user as any).id,
        username: (req.user as any).username,
        name: (req.user as any).name || 'User',
        email: (req.user as any).email || '',
        role: (req.user as any).role || 'couple',
      };
      return res.json({ user });
    } else {
      console.log('User is not authenticated');
      return res.status(401).json({ message: 'Not authenticated' });
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
      if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
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
      console.log('GET /api/current-event - Session ID:', req.sessionID);
      
      // Case 1: Event exists in session
      if (req.session && req.session.currentEvent) {
        const eventId = req.session.currentEvent.id;
        console.log(`Found event ID ${eventId} in session, verifying it exists`);
        
        // Verify that the session event still exists in the database
        const storedEvent = await storage.getEvent(eventId);
        if (storedEvent) {
          console.log(`Current event from session: ${storedEvent.title} (ID: ${eventId})`);
          
          // Return the database version to ensure we have the latest data
          return res.json(storedEvent);
        } else {
          console.log(`Event ID ${eventId} in session no longer exists in database, fetching new default event`);
          // Session has a deleted event, clear it to fetch a new one
          delete req.session.currentEvent;
          
          // Save session immediately after deleting the invalid event
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                console.error('Error saving session after removing invalid event:', err);
                reject(err);
              } else {
                console.log('Session saved after removing invalid event');
                resolve();
              }
            });
          });
        }
      } else {
        console.log('No current event found in session');
      }
      
      // Case 2: No valid event in session, get the first event from the database
      const events = await storage.getAllEvents();
      if (events && events.length > 0) {
        console.log(`No current event in session, defaulting to first event: ${events[0].title} (ID: ${events[0].id})`);
        
        // Store in session for future requests with required properties
        req.session.currentEvent = {
          ...events[0],
          primaryColor: null,
          secondaryColor: null,
          whatsappFrom: null
        };
        
        // Explicitly save the session to ensure it's persisted
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) {
              console.error('Error saving session with default event:', err);
              reject(err);
            } else {
              console.log('Session saved with default event');
              resolve();
            }
          });
        });
        
        return res.json(events[0]);
      }
      
      // Case 3: No events exist in database
      console.log('No events found in database for current-event endpoint');
      return res.status(404).json({ 
        message: 'No events found',
        details: 'Please create an event before proceeding' 
      });
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching current event: ${err.message}`);
      return res.status(500).json({ 
        message: 'Error fetching current event',
        details: err.message 
      });
    }
  });
  
  // API route to set current event
  app.post('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      console.log('POST /api/current-event - Session ID:', req.sessionID);
      const { eventId } = req.body;
      
      // Input validation
      if (!eventId) {
        console.warn('Missing eventId in request body');
        return res.status(400).json({ 
          message: 'Event ID is required',
          details: 'Please provide a valid event ID in the request body' 
        });
      }
      
      const parsedEventId = Number(eventId);
      if (isNaN(parsedEventId)) {
        console.warn(`Invalid eventId format: ${eventId}`);
        return res.status(400).json({ 
          message: 'Invalid Event ID format',
          details: 'Event ID must be a valid number' 
        });
      }
      
      // Get the event details
      console.log(`Attempting to fetch event with ID: ${parsedEventId}`);
      const event = await storage.getEvent(parsedEventId);
      
      if (!event) {
        console.warn(`Failed to set current event: Event ID ${parsedEventId} not found`);
        return res.status(404).json({ 
          message: 'Event not found',
          details: `No event exists with ID ${parsedEventId}` 
        });
      }
      
      // Verify the current user has permission to access this event
      if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
        console.warn(`User ${(req.user as any).id} attempted to access event ${parsedEventId} without permission`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'You do not have permission to access this event' 
        });
      }
      
      // Store in session with required additional properties
      req.session.currentEvent = {
        ...event,
        primaryColor: null,
        secondaryColor: null,
        whatsappFrom: null
      };
      console.log(`Setting current event in session: ${event.title} (ID: ${event.id})`);
      
      // Explicitly save the session to ensure it's persisted
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            console.error('Error saving session with current event:', err);
            reject(err);
          } else {
            console.log('Session saved with new current event');
            resolve();
          }
        });
      });
      
      console.log(`Successfully set current event to: ${event.title}`);
      
      // Return the full event details to ensure client has latest data
      return res.json(event);
    } catch (error) {
      const err = error as Error;
      console.error(`Error setting current event: ${err.message}`, err);
      return res.status(500).json({ 
        message: 'Error setting current event',
        details: err.message 
      });
    }
  });
  
  // Guest routes
  app.get('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Verify that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        console.warn(`Event ID ${eventId} not found when retrieving guests`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Store current event in session for context in future requests
      req.session.currentEvent = {
        ...event,
        primaryColor: null,
        secondaryColor: null,
        whatsappFrom: null
      };
      console.log(`Set session current event to: ${event.title} (ID: ${eventId})`);
      
      // Get guests for this event with added validation
      const guests = await storage.getGuestsByEvent(eventId);
      
      // Enhanced logging to debug the Don ji issue
      console.log(`Retrieved ${guests.length} guests for event ${eventId}`);
      
      // If this is Rocky Rani event, let's add detailed logging
      if (eventId === 4) {
        const guestNames = guests.map(g => `${g.id}: ${g.firstName} ${g.lastName}`).join(', ');
        console.log(`Rocky Rani guests: ${guestNames || 'None'}`);
        
        // Let's explicitly check for Don ji
        const donJi = guests.find(g => 
          g.firstName === 'Don' && g.lastName === 'ji'
        );
        
        if (donJi) {
          console.log(`Found Don ji with ID ${donJi.id} in event ${eventId}`);
        } else {
          console.log(`Don ji not found in event ${eventId} results, checking database directly...`);
          
          // Double-check database directly with raw SQL using the postgres client
          try {
            const { pgClient } = await import('./db');
            const result = await pgClient`
              SELECT id, first_name as "firstName", last_name as "lastName", event_id as "eventId"
              FROM guests
              WHERE event_id = ${eventId} AND first_name = 'Don' AND last_name = 'ji'
            `;
            
            if (result && result.length > 0) {
              console.log(`Found Don ji in direct DB query. ID: ${result[0].id}`);
              
              // Something is wrong - Don ji exists in DB but wasn't returned by storage.getGuestsByEvent
              console.error(`DATA DISCREPANCY: Don ji (ID: ${result[0].id}) exists in database but was not returned by storage.getGuestsByEvent`);
              
              // Let's re-fetch from postgres directly and add to response to fix immediate issue
              console.log(`Adding Don ji to response directly from database query`);
              const donJiFromDB = result[0];
              guests.push(donJiFromDB as any);
            } else {
              console.log(`Don ji not found in database for event ${eventId}`);
            }
          } catch (dbError) {
            console.error(`Error checking for Don ji directly in database:`, dbError);
          }
        }
      }
      
      res.json(guests);
    } catch (error) {
      console.error(`Error fetching guests for event:`, error);
      res.status(500).json({ message: 'Failed to fetch guests' });
    }
  });
  
  app.get('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      console.log(`GET /api/guests/:id - Session ID: ${req.sessionID}`);
      const guestIdParam = req.params.id;
      
      if (!guestIdParam) {
        console.warn('Missing guest ID in request');
        return res.status(400).json({ 
          message: 'Guest ID is required',
          details: 'Please provide a valid guest ID' 
        });
      }
      
      const guestId = parseInt(guestIdParam);
      if (isNaN(guestId)) {
        console.warn(`Invalid guest ID format: ${guestIdParam}`);
        return res.status(400).json({ 
          message: 'Invalid guest ID format',
          details: 'Guest ID must be a valid number' 
        });
      }
      
      // First try to get event context from query parameters
      let eventId = undefined;
      if (req.query.eventId) {
        eventId = parseInt(req.query.eventId as string);
        if (isNaN(eventId)) {
          console.warn(`Invalid event ID format in query: ${req.query.eventId}`);
          return res.status(400).json({ 
            message: 'Invalid event ID format',
            details: 'Event ID must be a valid number' 
          });
        }
        console.log(`Using event context from query parameter: ${eventId}`);
      }
      
      // If no event context in query, try to get it from session
      if (!eventId && req.session.currentEvent) {
        eventId = req.session.currentEvent.id;
        console.log(`Using session event context: ${eventId} for guest lookup`);
      }
      
      let guest;
      
      if (eventId) {
        // First verify the event exists
        const event = await storage.getEvent(eventId);
        if (!event) {
          console.warn(`Event ID ${eventId} not found when retrieving guest`);
          return res.status(404).json({ 
            message: 'Event not found',
            details: `The specified event ID ${eventId} does not exist` 
          });
        }
        
        // Verify the current user has permission to access this event
        if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
          console.warn(`User ${(req.user as any).id} attempted to access event ${eventId} without permission`);
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'You do not have permission to access this event' 
          });
        }
        
        // Use event context to ensure guest belongs to this event
        console.log(`Fetching guest ${guestId} with event context ${eventId}`);
        guest = await storage.getGuestWithEventContext(guestId, eventId);
      } else {
        console.warn(`WARNING: No event context available for guest ${guestId} lookup`);
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      if (!guest) {
        console.warn(`Guest ${guestId} not found in event ${eventId}`);
        return res.status(404).json({ 
          message: 'Guest not found in this event',
          details: `Guest ${guestId} does not exist or does not belong to event ${eventId}` 
        });
      }
      
      console.log(`Successfully retrieved guest ${guestId} from event ${eventId}`);
      return res.json(guest);
    } catch (error) {
      const err = error as Error;
      console.error(`Error fetching guest: ${err.message}`, err);
      return res.status(500).json({ 
        message: 'Failed to fetch guest',
        details: err.message 
      });
    }
  });
  
  app.post('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      // Verify that the event exists before creating a guest
      console.log(`Verifying event ${eventId} exists before creating guest`);
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Attempted to create guest for non-existent event ID: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      console.log(`Event ${eventId} verified, creating guest`);
      const guestData = insertGuestSchema.parse({ ...req.body, eventId });
      const guest = await storage.createGuest(guestData);
      
      console.log(`Guest created successfully for event ${eventId}: ${guest.id}`);
      res.status(201).json(guest);
    } catch (error) {
      console.error(`Error creating guest:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create guest' });
    }
  });
  
  app.put('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      console.log(`Processing update for guest ID: ${guestId}`);
      
      // First try to get event context from query parameters
      let contextEventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        console.log(`Using session event context: ${contextEventId} for guest update`);
      }
      
      // Validate input data
      const guestData = insertGuestSchema.partial().parse(req.body);
      console.log(`Validated guest data: ${JSON.stringify(guestData)}`);
      
      // Verify this guest belongs to the correct event
      let currentGuest;
      
      if (contextEventId) {
        // If event context is provided, verify guest belongs to this event
        console.log(`Verifying guest ${guestId} belongs to event ${contextEventId}`);
        currentGuest = await storage.getGuestWithEventContext(guestId, contextEventId);
        
        if (!currentGuest) {
          console.warn(`Guest with ID ${guestId} not found in event ${contextEventId}`);
          return res.status(404).json({ 
            message: 'Guest not found in this event',
            details: `Guest ${guestId} does not belong to event ${contextEventId}` 
          });
        }
      } else {
        // If we really have no event context (should be rare), log this unusual case
        console.warn(`WARNING: Updating guest ${guestId} without event context - this may lead to data leakage across events`);
        currentGuest = await storage.getGuest(guestId);
        if (!currentGuest) {
          console.warn(`Guest with ID ${guestId} not found`);
          return res.status(404).json({ message: 'Guest not found' });
        }
      }
      
      // Keep the eventId the same (prevent changing event association)
      const eventId = currentGuest.eventId;
      console.log(`Preserving eventId: ${eventId} for guest ${guestId}`);
      
      try {
        // Update with error handling
        const updatedGuest = await storage.updateGuest(guestId, { ...guestData, eventId });
        
        if (!updatedGuest) {
          console.warn(`Update failed for guest ${guestId} - no guest returned`);
          return res.status(404).json({ message: 'Guest not found or update failed' });
        }
        
        console.log(`Successfully updated guest ${guestId}`);
        return res.json(updatedGuest);
      } catch (error) {
        const dbError = error as Error;
        console.error(`Database error updating guest ${guestId}:`, dbError);
        return res.status(500).json({ 
          message: 'Database error occurred during update',
          details: dbError.message || 'Unknown database error' 
        });
      }
    } catch (err) {
      const error = err as Error;
      if (error instanceof z.ZodError) {
        console.error(`Validation error when updating guest:`, error.errors);
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error updating guest:", error);
      res.status(500).json({ message: 'Failed to update guest', details: error.message });
    }
  });
  
  app.delete('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      console.log(`DELETE /api/guests/:id - Session ID: ${req.sessionID}`);
      const guestIdParam = req.params.id;
      
      if (!guestIdParam) {
        console.warn('Missing guest ID in request');
        return res.status(400).json({ 
          message: 'Guest ID is required',
          details: 'Please provide a valid guest ID' 
        });
      }
      
      const guestId = parseInt(guestIdParam);
      if (isNaN(guestId)) {
        console.warn(`Invalid guest ID format: ${guestIdParam}`);
        return res.status(400).json({ 
          message: 'Invalid guest ID format',
          details: 'Guest ID must be a valid number' 
        });
      }
      
      // First try to get event context from query parameters
      let contextEventId = undefined;
      if (req.query.eventId) {
        contextEventId = parseInt(req.query.eventId as string);
        if (isNaN(contextEventId)) {
          console.warn(`Invalid event ID format in query: ${req.query.eventId}`);
          return res.status(400).json({ 
            message: 'Invalid event ID format',
            details: 'Event ID must be a valid number' 
          });
        }
        console.log(`Using event context from query parameter: ${contextEventId}`);
      }
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        console.log(`Using session event context: ${contextEventId} for guest deletion`);
      }
      
      // Always require event context for guest operations
      if (!contextEventId) {
        console.warn(`No event context available for guest ${guestId} deletion`);
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        console.warn(`Event ID ${contextEventId} not found when deleting guest`);
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify the current user has permission to access this event
      if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
        console.warn(`User ${(req.user as any).id} attempted to access event ${contextEventId} without permission`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'You do not have permission to access this event' 
        });
      }
      
      // Verify this guest belongs to the correct event
      const guest = await storage.getGuestWithEventContext(guestId, contextEventId);
      if (!guest) {
        console.warn(`Guest with ID ${guestId} not found in event ${contextEventId}`);
        return res.status(404).json({ 
          message: 'Guest not found in this event',
          details: `Guest ${guestId} does not belong to event ${contextEventId}` 
        });
      }
      
      // Proceed with deletion
      const success = await storage.deleteGuest(guestId);
      if (!success) {
        console.warn(`Deletion failed for guest ${guestId}`);
        return res.status(500).json({ 
          message: 'Guest deletion failed',
          details: 'The deletion operation could not be completed' 
        });
      }
      
      console.log(`Successfully deleted guest ${guestId} from event ${contextEventId}`);
      return res.json({ 
        message: 'Guest deleted successfully',
        guestId: guestId,
        eventId: contextEventId
      });
    } catch (error) {
      const err = error as Error;
      console.error(`Error deleting guest: ${err.message}`, err);
      return res.status(500).json({ 
        message: 'Failed to delete guest',
        details: err.message 
      });
    }
  });
  
  // Excel import/export
  app.post('/api/events/:eventId/guests/import', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const eventId = parseInt(req.params.eventId);
      
      // Verify that the event exists before creating any guests
      console.log(`Verifying event ${eventId} exists before importing guests`);
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Attempted to import guests for non-existent event ID: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const workbook = XLSX.read(req.file.buffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log(`Processing ${jsonData.length} rows from Excel import for event ${eventId}`);
      
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
        childrenDetails: (row['Number of Children'] && parseInt(row['Number of Children']) > 0) ? 
          Array(parseInt(row['Number of Children'])).fill({name: '', age: 0}) : [],
        childrenNotes: row['Children Notes'] || '',
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
      
      console.log(`Validated ${validGuests.length} guests out of ${guests.length} for import`);
      
      const createdGuests = await storage.bulkCreateGuests(validGuests);
      
      console.log(`Successfully imported ${createdGuests.length} guests for event ${eventId}`);
      res.status(201).json({
        message: `Imported ${createdGuests.length} guests successfully`,
        guests: createdGuests
      });
    } catch (error) {
      console.error(`Error importing guests:`, error);
      res.status(500).json({ 
        message: 'Failed to import guests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
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
        'Number of Children': guest.childrenDetails && Array.isArray(guest.childrenDetails) ? guest.childrenDetails.length : 0,
        'Children Notes': guest.childrenNotes || '',
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
      
      // Verify that the event exists before creating a ceremony
      console.log(`Verifying event ${eventId} exists before creating ceremony`);
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Attempted to create ceremony for non-existent event ID: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      console.log(`Event ${eventId} verified, creating ceremony`);
      const ceremonyData = insertCeremonySchema.parse({ ...req.body, eventId });
      const ceremony = await storage.createCeremony(ceremonyData);
      
      console.log(`Ceremony created successfully for event ${eventId}: ${ceremony.id}`);
      res.status(201).json(ceremony);
    } catch (error) {
      console.error(`Error creating ceremony:`, error);
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
      
      // Verify that the event exists before creating an accommodation
      console.log(`Verifying event ${eventId} exists before creating accommodation`);
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Attempted to create accommodation for non-existent event ID: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      console.log(`Event ${eventId} verified, creating accommodation`);
      const accommodationData = insertAccommodationSchema.parse({ ...req.body, eventId });
      const accommodation = await storage.createAccommodation(accommodationData);
      
      console.log(`Accommodation created successfully for event ${eventId}: ${accommodation.id}`);
      res.status(201).json(accommodation);
    } catch (error) {
      console.error(`Error creating accommodation:`, error);
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
          allocatedRooms: (accommodation.allocatedRooms || 0) + 1
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

      // Verify that the event exists before creating a message
      console.log(`Verifying event ${eventId} exists before creating couple message`);
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        console.warn(`Attempted to create couple message for non-existent event ID: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      console.log(`Event ${eventId} verified, creating couple message`);
      const messageData = insertCoupleMessageSchema.parse({ ...req.body, eventId });
      const message = await storage.createCoupleMessage(messageData);
      
      console.log(`Couple message created successfully for event ${eventId}`);
      res.status(201).json(message);
    } catch (error) {
      console.error(`Error creating couple message:`, error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create message' });
    }
  });
  
  // RSVP public endpoint
  app.post('/api/rsvp', async (req, res) => {
    try {
      const { eventId, email, firstName, lastName, rsvpStatus, plusOneName, childrenDetails, childrenNotes, dietaryRestrictions, message } = req.body;
      
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
        childrenDetails: childrenDetails || guest.childrenDetails,
        childrenNotes: childrenNotes || guest.childrenNotes,
        dietaryRestrictions: dietaryRestrictions || guest.dietaryRestrictions
      });
      
      // Add message if provided
      if (message && guest) {
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
        children: guests.reduce((acc, g) => acc + (g.childrenDetails && Array.isArray(g.childrenDetails) ? g.childrenDetails.length : 0), 0),
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
