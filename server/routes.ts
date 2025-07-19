import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

import multer from "multer";
import * as XLSX from "sheetjs-style";
import { format } from "date-fns";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import crypto from 'crypto';
import { isAuthenticated, isAdmin } from './middleware';
import { ensureAdminUserExists, getDefaultCredentials } from './auth/production-auth';
// Import session type extensions
import './types';
// Import PostgreSQL session store
import pgSession from 'connect-pg-simple';
// Import pg for PostgreSQL connection compatible with connect-pg-simple
import { Pool } from 'pg';
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
  guests,
  weddingEvents
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
// Wizard functionality handled by standard API endpoints
import { eq, and, or } from "drizzle-orm";
// Import RSVP service and routes
import { RSVPService } from "./services/rsvp";
import { registerRSVPRoutes } from "./routes/rsvp";
// Performance optimization routes imported dynamically

// Import WhatsApp routes (temporarily disabled)
import { registerWhatsAppRoutes } from "./routes/whatsapp";

// Import Hotel routes
import { registerHotelRoutes } from "./routes/hotels";

// Import RSVP follow-up routes
import rsvpFollowupRoutes from "./routes/rsvp-followup";

// Import OAuth routes
import oauthRoutes from "./routes/oauth";

// Import Integration routes
import { registerIntegrationRoutes } from "./routes/integration-routes";

// Import Master Guest Data routes
import { registerMasterGuestDataRoutes } from "./routes/master-guest-data";

// Import Event Settings routes
import eventSettingsRoutes from "./routes/event-settings";

// Import Auto-Assignment routes
import { registerAutoAssignmentRoutes } from "./routes/auto-assignments";

// Import Email Templates routes
import communicationTemplatesRoutes from "./routes/communication-templates";

// Import Transport routes
import transportRoutes from "./routes/transport";
import flightCoordinationRoutes from "./routes/flight-coordination";
import vehicleManagementRoutes from "./routes/vehicle-management";

// Import New Domain Routes
import registerAuthRoutes, { isAuthenticated, isAdmin } from "./routes/auth";
import registerStatisticsRoutes from "./routes/statistics";
import registerRelationshipTypeRoutes from "./routes/relationship-types";

// Integration routes now handled via registerIntegrationRoutes function

// Standard API routes handle all operations




// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// WhatsApp routes will be registered at the end of this file

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication system on startup
  await ensureAdminUserExists();
  
  // Performance monitoring middleware - optimized
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) { // Log slower requests (>500ms)
        console.log(`SLOW: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    
    next();
  });
  
  // Special handling for client-side routes that should be handled by React router
  app.get('/guest-rsvp/:token', (req, res, next) => {
    next(); // Pass through to client-side router
  });
  
  app.get('/guest-rsvp', (req, res, next) => {
    next(); // Pass through to client-side router
  });
  const httpServer = createServer(app);
  
  // Configure PostgreSQL session store for production-ready session management
  const PostgreSqlStore = pgSession(session);
  
  // Create a PostgreSQL connection pool for session storage
  // Deployment-optimized configuration for faster session handling
  const sessionPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5, // Smaller pool for deployment efficiency
    ssl: false, // Replit uses internal SSL, disable client SSL
    idleTimeoutMillis: 30000, // Shorter idle timeout for deployment
    connectionTimeoutMillis: 5000, // Faster connection timeout
    // Add error handling for the session pool
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000
  });

  // Add session pool error handling
  sessionPool.on('error', (err) => {
    
  });

  sessionPool.on('connect', () => {
    
  });
  
  // Configure session management with PostgreSQL store
  try {
    const sessionStore = new PostgreSqlStore({
      pool: sessionPool,
      tableName: 'session', // Table name for sessions
      createTableIfMissing: true // Auto-create the session table if missing
    });

    // Add session store error handling
    sessionStore.on('error', (error) => {
      // Session store error handling
    });
    // Replit-optimized session configuration for reliable persistence
    app.use(session({
      store: sessionStore,
    secret: process.env.SESSION_SECRET || 'wedding-rsvp-secret-key-production',
    resave: false, // Don't save session if unmodified (better for performance)
    saveUninitialized: false, // Don't create session until something stored
    rolling: true, // Reset expiration with each request
    name: 'connect.sid', // Use standard session name for better browser compatibility
    cookie: { 
      secure: false, // Always false for Replit deployment (uses HTTP proxy)
      maxAge: 24 * 60 * 60 * 1000, // 24 hours for more stable sessions
      httpOnly: false, // Allow JavaScript access for browser environments
      sameSite: 'lax', // Use lax for better compatibility with Replit
      path: '/',
      domain: undefined // Let browser handle domain correctly
    }
    }));
  } catch (sessionError) {
    // Fallback to memory store if PostgreSQL session store fails
    console.warn('⚠️ CRITICAL: PostgreSQL session store failed - falling back to in-memory sessions');
    console.warn('⚠️ WARNING: Sessions will not persist across server restarts');
    console.warn('⚠️ SESSION ERROR:', sessionError instanceof Error ? sessionError.message : String(sessionError));
    console.warn('⚠️ Action needed: Verify DATABASE_URL and PostgreSQL connection');
    
    app.use(session({
      secret: process.env.SESSION_SECRET || 'wedding-rsvp-secret-key-production',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      name: 'connect.sid',
      cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: 'lax' as const,
        path: '/',
        domain: undefined
      }
    }));
  }
  
  // Passport setup with enhanced session handling
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Simple CSRF protection without deprecated csurf package
  const generateCSRFToken = () => {
    return crypto.randomBytes(32).toString('hex');
  };

  // CSRF token endpoint moved to auth.ts
  
  // Passport configuration moved to auth.ts
  
  // Auth routes moved to auth.ts
  
  // System info route for deployment debugging
  app.get('/api/system/info', async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allEvents = await storage.getAllEvents();
      const defaultCreds = getDefaultCredentials();
      
      res.json({
        users: allUsers.map(u => ({ id: u.id, username: u.username, name: u.name, role: u.role })),
        events: allEvents.map(e => ({ id: e.id, title: e.title, createdBy: e.createdBy })),
        defaultCredentials: defaultCreds,
        authentication: {
          isAuthenticated: req.isAuthenticated(),
          user: req.user ? {
            id: (req.user as Record<string, unknown>).id,
            username: (req.user as Record<string, unknown>).username,
            role: (req.user as Record<string, unknown>).role
          } : null
        }
      });
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to get system info' });
    }
  });
  
  // User management route moved to auth.ts
  
  // Wedding Event routes
  // Special route for events with role-based access control
  app.get('/api/events-direct', async (req, res) => {
    try {
      // Check the user's login status
      if (!req.isAuthenticated()) {
        
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      // Get user info
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      // Get all events from database
      const allEvents = await storage.getAllEvents();
      
      // Apply proper access control based on role - PERMANENT FIX
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'planner') {
        // Admin, staff, and planner users see all events
        
        return res.json(allEvents);
      } else {
        // Regular users see only their own events
        const userEvents = allEvents.filter(event => event.createdBy === userId);
        
        return res.json(userEvents);
      }
    } catch (error) {
      
      return res.status(500).json({ message: 'Server error' });
    }
  });

  // Standard events route - ROBUST DEPLOYMENT FIX with enhanced error handling
  app.get('/api/events', isAuthenticated, async (req, res) => {
    const startTime = Date.now();
    const requestId = Math.random().toString(36).substring(7);
    
    try {
      
      
      // Enhanced user validation
      if (!req.user) {
        
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      const username = (req.user as any).username;
      
      
      
      // Add database connection retry logic
      let allEvents = [];
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          const dbStartTime = Date.now();
          allEvents = await storage.getAllEvents();
          const dbTime = Date.now() - dbStartTime;
          
          break;
        } catch (dbError) {
          retryCount++;
          
          if (retryCount >= maxRetries) {
            throw dbError;
          }
          // Wait 100ms before retry
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Role-based access control with enhanced logging
      let resultEvents = [];
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'planner') {
        resultEvents = allEvents;
        
      } else {
        resultEvents = allEvents.filter(event => event.createdBy === userId);
        
      }
      
      const totalTime = Date.now() - startTime;
      
      
      // Add cache control headers for deployment stability
      res.set({
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      });
      
      return res.json(resultEvents);
      
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      
      // Enhanced error response for debugging
      return res.status(500).json({ 
        message: 'Failed to fetch events',
        requestId,
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });
  
  // Optimized batch endpoint for dashboard data
  app.get('/api/events/:id/dashboard-batch', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Fetch all dashboard data in parallel for maximum performance
      const [event, guests, stats, ceremonies] = await Promise.all([
        storage.getEvent(eventId),
        storage.getGuestsByEvent(eventId),
        storage.getEventStats(eventId),
        storage.getCeremoniesByEvent(eventId)
      ]);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json({
        event,
        guests: guests || [],
        stats: stats || { total: 0, confirmed: 0, pending: 0, declined: 0 },
        ceremonies: ceremonies || []
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });

  app.get('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
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
    const startTime = Date.now();
    try {
      
      
      // Get the authenticated user from the request
      if (!req.user) {
        return res.status(401).json({ message: 'User not authenticated' });
      }
      
      const authTime = Date.now();
      
      
      // Create a complete event data object with the authenticated user's ID
      const eventData = {
        ...req.body,
        createdBy: (req.user as any).id // Add the user ID from the session
      };
      
      const dataTime = Date.now();
      
      
      try {
        // Validate the event data
        const validatedData = insertWeddingEventSchema.parse(eventData);
        const validationTime = Date.now();
        
        
        // Create the event
        const event = await storage.createEvent(validatedData);
        const dbTime = Date.now();
        
        
        const totalTime = Date.now() - startTime;
        
        
        res.status(201).json(event);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          
          return res.status(400).json({ message: validationError.errors });
        }
        throw validationError;
      }
    } catch (error) {
      const totalTime = Date.now() - startTime;
      
      if (error instanceof Error) {
        
      }
      res.status(500).json({ message: 'Failed to create event', details: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.put('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      
      
      const eventData = insertWeddingEventSchema.partial().parse(req.body);
      
      
      // Check if there's actually data to update
      if (Object.keys(eventData).length === 0) {
        
        const currentEvent = await storage.getEvent(eventId);
        if (!currentEvent) {
          return res.status(404).json({ message: 'Event not found' });
        }
        return res.json(currentEvent);
      }
      
      const updatedEvent = await storage.updateEvent(eventId, eventData);
      if (!updatedEvent) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      
      res.json(updatedEvent);
    } catch (error) {
      
      if (error instanceof z.ZodError) {
        
        return res.status(400).json({ message: 'Validation failed', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to update event', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.delete('/api/events/:id', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
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
      
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });
  
  // API route for current event, used by event selector
  app.get('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      
      
      // Case 1: Event exists in session
      if (req.session && req.session.currentEvent) {
        const eventId = req.session.currentEvent.id;
        
        
        // Always fetch fresh data from database, don't trust session cache
        const storedEvent = await storage.getEvent(eventId);
        if (storedEvent) {
          
          
          
          // Update session with fresh data from database
          req.session.currentEvent = storedEvent;
          
          // Save session immediately
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                
                reject(err);
              } else {
                
                resolve();
              }
            });
          });
          
          // Return the database version to ensure we have the latest data
          return res.json(storedEvent);
        } else {
          
          // Session has a deleted event, clear it to fetch a new one
          delete req.session.currentEvent;
          
          // Save session immediately after deleting the invalid event
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) {
                
                reject(err);
              } else {
                
                resolve();
              }
            });
          });
        }
      } else {
        
      }
      
      // Case 2: No valid event in session, get the first event from the database
      const events = await storage.getAllEvents();
      if (events && events.length > 0) {
        
        
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
              
              reject(err);
            } else {
              
              resolve();
            }
          });
        });
        
        return res.json(events[0]);
      }
      
      // Case 3: No events exist in database
      
      return res.status(404).json({ 
        message: 'No events found',
        details: 'Please create an event before proceeding' 
      });
    } catch (error) {
      const err = error as Error;
      
      return res.status(500).json({ 
        message: 'Error fetching current event',
        details: err.message 
      });
    }
  });
  
  // API route to set current event
  app.post('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      
      const { eventId } = req.body;
      
      // Input validation
      if (!eventId) {
        
        return res.status(400).json({ 
          message: 'Event ID is required',
          details: 'Please provide a valid event ID in the request body' 
        });
      }
      
      const parsedEventId = Number(eventId);
      if (isNaN(parsedEventId)) {
        
        return res.status(400).json({ 
          message: 'Invalid Event ID format',
          details: 'Event ID must be a valid number' 
        });
      }
      
      // Get the event details
      
      const event = await storage.getEvent(parsedEventId);
      
      if (!event) {
        
        return res.status(404).json({ 
          message: 'Event not found',
          details: `No event exists with ID ${parsedEventId}` 
        });
      }
      
      // Verify the current user has permission to access this event
      if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
        
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
      
      
      // Explicitly save the session to ensure it's persisted
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) {
            
            reject(err);
          } else {
            
            resolve();
          }
        });
      });
      
      
      
      // Return the full event details to ensure client has latest data
      return res.json(event);
    } catch (error) {
      const err = error as Error;
      
      return res.status(500).json({ 
        message: 'Error setting current event',
        details: err.message 
      });
    }
  });


  
  // Guest routes - now handled by integration routes registration above

  // Legacy comprehensive guest data endpoint REMOVED - use /api/events/:eventId/guests instead

  app.get('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Verify that the event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Store current event in session for context in future requests
      req.session.currentEvent = {
        ...event,
        primaryColor: null,
        secondaryColor: null,
        whatsappFrom: null
      };
      
      
      // Get guests for this event with added validation
      let guests;
      try {
        guests = await storage.getGuestsByEvent(eventId);
        
        if (!Array.isArray(guests)) {
          
          guests = []; // Default to empty array if not an array
        }
        
        // Enhanced logging to debug the Don ji issue
        
      } catch (error) {
        
        return res.status(500).json({ message: 'Failed to fetch guests' });
      }
      
      // If this is Rocky Rani event, let's add detailed logging
      if (eventId === 4 && Array.isArray(guests)) {
        const guestNames = guests.map(g => `${g.id}: ${g.firstName} ${g.lastName}`).join(', ');
        
        
        // Let's explicitly check for Don ji
        const donJi = guests.find(g => 
          g.firstName === 'Don' && g.lastName === 'ji'
        );
        
        if (donJi) {
          
        } else {
          
          
          // Double-check database directly with raw SQL using the postgres client
          try {
            const { pgClient } = await import('./db');
            const result = await pgClient`
              SELECT id, first_name as "firstName", last_name as "lastName", event_id as "eventId"
              FROM guests
              WHERE event_id = ${eventId} AND first_name = 'Don' AND last_name = 'ji'
            `;
            
            if (result && result.length > 0) {
              
              
              // Something is wrong - Don ji exists in DB but wasn't returned by storage.getGuestsByEvent
              
              
              // Let's re-fetch from postgres directly and add to response to fix immediate issue
              
              const donJiFromDB = result[0];
              guests.push(donJiFromDB as any);
            } else {
              
            }
          } catch (dbError) {
            
          }
        }
      }
      
      // Add effective contact information to each guest
      const guestsWithEffectiveContacts = guests.map(guest => {
        const effectiveContact = storage.getEffectiveGuestContact(guest);
        return {
          ...guest,
          effectiveContact,
          // For backwards compatibility, also include the contact info directly
          primaryContactEmail: effectiveContact.email,
          primaryContactPhone: effectiveContact.phone,
          primaryContactName: effectiveContact.name,
          isUsingPlusOneContact: effectiveContact.contactType === 'plus_one'
        };
      });
      
      res.json(guestsWithEffectiveContacts);
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to fetch guests' });
    }
  });
  
  app.get('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      
      const guestIdParam = req.params.id;
      
      if (!guestIdParam) {
        
        return res.status(400).json({ 
          message: 'Guest ID is required',
          details: 'Please provide a valid guest ID' 
        });
      }
      
      const guestId = parseInt(guestIdParam);
      if (isNaN(guestId)) {
        
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
          
          return res.status(400).json({ 
            message: 'Invalid event ID format',
            details: 'Event ID must be a valid number' 
          });
        }
        
      }
      
      // If no event context in query, try to get it from session
      if (!eventId && req.session.currentEvent) {
        eventId = req.session.currentEvent.id;
        
      }
      
      let guest;
      
      if (eventId) {
        // First verify the event exists
        const event = await storage.getEvent(eventId);
        if (!event) {
          
          return res.status(404).json({ 
            message: 'Event not found',
            details: `The specified event ID ${eventId} does not exist` 
          });
        }
        
        // Verify the current user has permission to access this event
        if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
          
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'You do not have permission to access this event' 
          });
        }
        
        // Use event context to ensure guest belongs to this event
        
        guest = await storage.getGuest(guestId);
        
        // Verify guest belongs to event
        if (guest && guest.eventId !== eventId) {
          return res.status(404).json({ 
            message: 'Guest not found in this event',
            details: `Guest ${guestId} does not belong to event ${eventId}` 
          });
        }
      } else {
        
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found in this event',
          details: `Guest ${guestId} does not exist or does not belong to event ${eventId}` 
        });
      }
      
      
      return res.json(guest);
    } catch (error) {
      const err = error as Error;
      
      return res.status(500).json({ 
        message: 'Failed to fetch guest',
        details: err.message 
      });
    }
  });
  
  app.post('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Verify that the event exists before creating a guest
      
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      
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
      if (isNaN(guestId)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      
      
      // First try to get event context from query parameters
      let contextEventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        
      }
      
      // Validate input data
      const guestData = insertGuestSchema.partial().parse(req.body);
      
      
      // Verify this guest belongs to the correct event
      let currentGuest;
      
      if (contextEventId) {
        // If event context is provided, verify guest belongs to this event
        
        currentGuest = await storage.getGuest(guestId);
        
        // Verify guest belongs to event
        if (currentGuest && currentGuest.eventId !== contextEventId) {
          return res.status(404).json({ 
            message: 'Guest not found in this event',
            details: `Guest ${guestId} does not belong to event ${contextEventId}` 
          });
        }
        
        if (!currentGuest) {
          
          return res.status(404).json({ 
            message: 'Guest not found in this event',
            details: `Guest ${guestId} does not belong to event ${contextEventId}` 
          });
        }
      } else {
        // If we really have no event context (should be rare), log this unusual case
        
        currentGuest = await storage.getGuest(guestId);
        if (!currentGuest) {
          
          return res.status(404).json({ message: 'Guest not found' });
        }
      }
      
      // Keep the eventId the same (prevent changing event association)
      const eventId = currentGuest.eventId;
      
      
      try {
        // Update with error handling
        const updatedGuest = await storage.updateGuest(guestId, { ...guestData, eventId });
        
        if (!updatedGuest) {
          
          return res.status(404).json({ message: 'Guest not found or update failed' });
        }
        
        
        return res.json(updatedGuest);
      } catch (error) {
        const dbError = error as Error;
        
        return res.status(500).json({ 
          message: 'Database error occurred during update',
          details: dbError.message || 'Unknown database error' 
        });
      }
    } catch (err) {
      const error = err as Error;
      if (error instanceof z.ZodError) {
        
        return res.status(400).json({ message: error.errors });
      }
      
      res.status(500).json({ message: 'Failed to update guest', details: error.message });
    }
  });
  
  app.delete('/api/guests/:id', isAuthenticated, async (req, res) => {
    try {
      
      const guestIdParam = req.params.id;
      
      if (!guestIdParam) {
        
        return res.status(400).json({ 
          message: 'Guest ID is required',
          details: 'Please provide a valid guest ID' 
        });
      }
      
      const guestId = parseInt(guestIdParam);
      if (isNaN(guestId)) {
        
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
          
          return res.status(400).json({ 
            message: 'Invalid event ID format',
            details: 'Event ID must be a valid number' 
          });
        }
        
      }
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        
      }
      
      // Always require event context for guest operations
      if (!contextEventId) {
        
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify the current user has permission to access this event
      if (req.user && (req.user as any).id !== event.createdBy && (req.user as any).role !== 'admin') {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'You do not have permission to access this event' 
        });
      }
      
      // Verify this guest belongs to the correct event
      const guest = await storage.getGuest(guestId);
      
      // Verify guest belongs to event
      if (guest && guest.eventId !== contextEventId) {
        return res.status(404).json({ 
          message: 'Guest not found in this event',
          details: `Guest ${guestId} does not belong to event ${contextEventId}` 
        });
      }
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found in this event',
          details: `Guest ${guestId} does not belong to event ${contextEventId}` 
        });
      }
      
      // Proceed with deletion
      const success = await storage.deleteGuest(guestId);
      if (!success) {
        
        return res.status(500).json({ 
          message: 'Guest deletion failed',
          details: 'The deletion operation could not be completed' 
        });
      }
      
      
      return res.json({ 
        message: 'Guest deleted successfully',
        guestId: guestId,
        eventId: contextEventId
      });
    } catch (error) {
      const err = error as Error;
      
      return res.status(500).json({ 
        message: 'Failed to delete guest',
        details: err.message 
      });
    }
  });

  // Endpoint for updating guest's RSVP contact preference
  app.patch('/api/guests/:id/contact-preference', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.id);
      if (isNaN(guestId)) {
        return res.status(400).json({ message: "Invalid guest ID" });
      }
      const { plusOneRsvpContact } = req.body;
      
      // Validate input
      if (typeof plusOneRsvpContact !== 'boolean') {
        return res.status(400).json({ 
          message: 'Invalid input: plusOneRsvpContact must be a boolean' 
        });
      }
      
      // Get the current guest to validate plus-one exists
      const currentGuest = await storage.getGuest(guestId);
      if (!currentGuest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      // Validate that the guest has a confirmed plus-one if they want to switch contact
      if (plusOneRsvpContact && (!currentGuest.plusOneConfirmed || !currentGuest.plusOneName)) {
        return res.status(400).json({ 
          message: 'Cannot set plus-one as RSVP contact: No confirmed plus-one exists' 
        });
      }
      
      // Update the guest's contact preference
      const updatedGuest = await storage.updateGuest(guestId, { 
        plusOneRsvpContact 
      });
      
      if (!updatedGuest) {
        return res.status(404).json({ message: 'Failed to update guest' });
      }
      
      // Return updated guest with effective contact information
      const effectiveContact = storage.getEffectiveGuestContact(updatedGuest);
      res.json({
        ...updatedGuest,
        effectiveContact,
        primaryContactEmail: effectiveContact.email,
        primaryContactPhone: effectiveContact.phone,
        primaryContactName: effectiveContact.name,
        isUsingPlusOneContact: effectiveContact.contactType === 'plus_one'
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update contact preference' });
    }
  });
  
  // Excel import/export
  app.post('/api/events/:eventId/guests/import', isAuthenticated, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Verify that the event exists before creating any guests
      
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
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
          
        }
      }
      
      
      
      const createdGuests = await storage.bulkCreateGuests(validGuests);
      
      
      res.status(201).json({
        message: `Imported ${createdGuests.length} guests successfully`,
        guests: createdGuests
      });
    } catch (error) {
      
      res.status(500).json({ 
        message: 'Failed to import guests',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.get('/api/events/:eventId/guests/export', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
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
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const ceremonies = await storage.getCeremoniesByEvent(eventId);
      res.json(ceremonies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ceremonies' });
    }
  });

  // Alternative route for ceremonies by event (for venues step)
  app.get('/api/ceremonies/by-event/:eventId', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const ceremonies = await storage.getCeremoniesByEvent(eventId);
      res.json(ceremonies);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch ceremonies' });
    }
  });
  
  app.post('/api/events/:eventId/ceremonies', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Verify that the event exists before creating a ceremony
      
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      
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
      
      // First try to get event context from query parameters
      let contextEventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        
      }
      
      // Always require event context for multi-tenant operations
      if (!contextEventId) {
        
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify this ceremony belongs to the correct event
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      if (ceremony.eventId !== contextEventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'This ceremony does not belong to the selected event' 
        });
      }
      
      // Proceed with update, ensuring eventId remains unchanged
      const ceremonyData = insertCeremonySchema.partial().parse({
        ...req.body, 
        eventId: ceremony.eventId // Keep the original eventId to prevent event reassignment
      });
      
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
      
      // First try to get event context from query parameters
      let contextEventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        
      }
      
      // Always require event context for multi-tenant operations
      if (!contextEventId) {
        
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify this ceremony belongs to the correct event
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      if (ceremony.eventId !== contextEventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'This ceremony does not belong to the selected event' 
        });
      }
      
      // Proceed with deletion since we've verified this ceremony belongs to the event
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
      const ceremonyId = attendanceData.ceremonyId;
      
      // First get the guest with event context
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      // Then get the ceremony
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        
        return res.status(404).json({ 
          message: 'Ceremony not found' 
        });
      }
      
      // Verify both guest and ceremony belong to the same event
      if (guest.eventId !== ceremony.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and ceremony must belong to the same event'
        });
      }
      
      // Check if already exists
      const existing = await storage.getGuestCeremony(guestId, ceremonyId);
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
      
      // First verify the guest exists and get their event context
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      
      
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
      
      // First get the current travel information
      const currentTravel = await storage.getTravelInfo(travelId);
      if (!currentTravel) {
        
        return res.status(404).json({ message: 'Travel info not found' });
      }
      
      // If guestId is being changed, verify event context
      if (travelData.guestId && travelData.guestId !== currentTravel.guestId) {
        // Get the original guest
        const originalGuest = await storage.getGuest(currentTravel.guestId);
        if (!originalGuest) {
          
          return res.status(404).json({ message: 'Original guest not found' });
        }
        
        // Get the new guest
        const newGuest = await storage.getGuest(travelData.guestId);
        if (!newGuest) {
          
          return res.status(404).json({ message: 'New guest not found' });
        }
        
        // Verify both guests belong to the same event
        if (originalGuest.eventId !== newGuest.eventId) {
          
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Cannot transfer travel information between guests from different events'
          });
        }
        
        
      }
      
      
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
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      
      // First check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const accommodations = await storage.getAccommodationsByEvent(eventId);
      
      
      // Fetch hotel information for accommodations with hotelId
      const accommodationsWithHotelDetails = await Promise.all(
        accommodations.map(async (acc) => {
          if (acc.hotelId) {
            try {
              const hotel = await storage.getHotel(acc.hotelId);
              return {
                ...acc,
                hotel: hotel ? {
                  id: hotel.id,
                  name: hotel.name,
                  address: hotel.address
                } : null
              };
            } catch (err) {
              
              return acc;
            }
          }
          return acc;
        })
      );
      
      res.json(accommodationsWithHotelDetails);
    } catch (error) {
      
      res.status(500).json({ 
        message: 'Failed to fetch accommodations',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  app.post('/api/events/:eventId/accommodations', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Verify that the event exists before creating an accommodation
      
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      
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
      
      // First get the current accommodation to verify event context
      const currentAccommodation = await storage.getAccommodation(accommodationId);
      if (!currentAccommodation) {
        
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      
      // Verify eventId hasn't changed or if it has, it's a valid operation
      if (accommodationData.eventId && accommodationData.eventId !== currentAccommodation.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of an accommodation'
        });
      }
      
      
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
      
      // First verify that the accommodation exists and note its event context
      const accommodation = await storage.getAccommodation(accommodationId);
      if (!accommodation) {
        
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      
      
      const allocations = await storage.getRoomAllocationsByAccommodation(accommodationId);
      res.json(allocations);
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to fetch allocations' });
    }
  });
  
  app.get('/api/guests/:guestId/allocations', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      
      // First verify that the guest exists and note its event context
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      
      const allocations = await storage.getRoomAllocationsByGuest(guestId);
      res.json(allocations);
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to fetch allocations' });
    }
  });
  
  app.post('/api/allocations', isAuthenticated, async (req, res) => {
    try {
      const allocationData = insertRoomAllocationSchema.parse(req.body);
      const guestId = allocationData.guestId;
      const accommodationId = allocationData.accommodationId;
      
      // First get the guest and accommodation to verify they belong to the same event
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      const accommodation = await storage.getAccommodation(accommodationId);
      if (!accommodation) {
        
        return res.status(404).json({ 
          message: 'Accommodation not found' 
        });
      }
      
      // Verify that guest and accommodation belong to the same event
      if (guest.eventId !== accommodation.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and accommodation must belong to the same event'
        });
      }
      
      
      const allocation = await storage.createRoomAllocation(allocationData);
      
      // Update allocated rooms count
      
      await storage.updateAccommodation(accommodationId, {
        allocatedRooms: (accommodation.allocatedRooms || 0) + 1
      });
      
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
      
      // First get the current allocation
      const currentAllocation = await storage.getRoomAllocation(allocationId);
      if (!currentAllocation) {
        
        return res.status(404).json({ message: 'Allocation not found' });
      }
      
      // Handle event context validation if changing guest or accommodation
      if (allocationData.guestId || allocationData.accommodationId) {
        // Get the current guest and accommodation to establish event context
        const currentGuest = await storage.getGuest(currentAllocation.guestId);
        if (!currentGuest) {
          
          return res.status(404).json({ message: 'Current guest not found' });
        }
        
        const currentAccommodation = await storage.getAccommodation(currentAllocation.accommodationId);
        if (!currentAccommodation) {
          
          return res.status(404).json({ message: 'Current accommodation not found' });
        }
        
        // Verify current guest and accommodation belong to same event
        if (currentGuest.eventId !== currentAccommodation.eventId) {
          
        }
        
        const eventId = currentGuest.eventId;
        
        // If changing guest, verify new guest is in same event
        if (allocationData.guestId && allocationData.guestId !== currentAllocation.guestId) {
          const newGuest = await storage.getGuest(allocationData.guestId);
          if (!newGuest) {
            
            return res.status(404).json({ message: 'New guest not found' });
          }
          
          if (newGuest.eventId !== eventId) {
            
            return res.status(403).json({
              message: 'Access denied',
              details: 'Cannot assign room allocation to guest from different event'
            });
          }
        }
        
        // If changing accommodation, verify new accommodation is in same event
        if (allocationData.accommodationId && allocationData.accommodationId !== currentAllocation.accommodationId) {
          const newAccommodation = await storage.getAccommodation(allocationData.accommodationId);
          if (!newAccommodation) {
            
            return res.status(404).json({ message: 'New accommodation not found' });
          }
          
          if (newAccommodation.eventId !== eventId) {
            
            return res.status(403).json({
              message: 'Access denied',
              details: 'Cannot assign room allocation to accommodation from different event'
            });
          }
        }
      }
      
      
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
      
      // First verify that the ceremony exists and get its event context
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      
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
      
      // First get the current meal option to verify event and ceremony context
      const currentMeal = await storage.getMealOption(mealId);
      if (!currentMeal) {
        
        return res.status(404).json({ message: 'Meal option not found' });
      }
      
      // Verify eventId hasn't changed or if it has, it's a valid operation
      if (mealData.eventId && mealData.eventId !== currentMeal.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of a meal option'
        });
      }
      
      // If ceremonyId is being changed, verify the new ceremony belongs to the same event
      if (mealData.ceremonyId && mealData.ceremonyId !== currentMeal.ceremonyId) {
        const newCeremony = await storage.getCeremony(mealData.ceremonyId);
        if (!newCeremony) {
          
          return res.status(404).json({ message: 'New ceremony not found' });
        }
        
        if (newCeremony.eventId !== currentMeal.eventId) {
          
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Cannot associate meal option with a ceremony from a different event'
          });
        }
      }
      
      
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
      
      // First verify that the guest exists and note its event context
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      
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
      const ceremonyId = selectionData.ceremonyId;
      const mealOptionId = selectionData.mealOptionId;
      
      // First get the guest
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      // Then get the ceremony
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        
        return res.status(404).json({ 
          message: 'Ceremony not found' 
        });
      }
      
      // Verify both guest and ceremony belong to the same event
      if (guest.eventId !== ceremony.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and ceremony must belong to the same event'
        });
      }
      
      // Get the meal option and verify it belongs to the ceremony
      const mealOption = await storage.getMealOption(mealOptionId);
      if (!mealOption) {
        
        return res.status(404).json({ 
          message: 'Meal option not found' 
        });
      }
      
      // Verify meal option belongs to the specified ceremony
      if (mealOption.ceremonyId !== ceremonyId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Meal option does not belong to the specified ceremony'
        });
      }
      
      
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
      
      // First get the current meal selection
      const currentSelection = await storage.getGuestMealSelection(selectionId);
      if (!currentSelection) {
        
        return res.status(404).json({ message: 'Meal selection not found' });
      }
      
      // If ceremony ID is being changed, verify it belongs to the same event
      if (selectionData.ceremonyId && selectionData.ceremonyId !== currentSelection.ceremonyId) {
        // Get the guest
        const guest = await storage.getGuest(currentSelection.guestId);
        if (!guest) {
          
          return res.status(404).json({ message: 'Guest not found' });
        }
        
        // Get the new ceremony
        const newCeremony = await storage.getCeremony(selectionData.ceremonyId);
        if (!newCeremony) {
          
          return res.status(404).json({ message: 'Ceremony not found' });
        }
        
        // Verify both guest and ceremony belong to the same event
        if (guest.eventId !== newCeremony.eventId) {
          
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Guest and ceremony must belong to the same event'
          });
        }
      }
      
      // If meal option ID is being changed, verify it belongs to the ceremony
      if (selectionData.mealOptionId && selectionData.mealOptionId !== currentSelection.mealOptionId) {
        const ceremonyId = selectionData.ceremonyId || currentSelection.ceremonyId;
        const mealOption = await storage.getMealOption(selectionData.mealOptionId);
        
        if (!mealOption) {
          
          return res.status(404).json({ message: 'Meal option not found' });
        }
        
        if (mealOption.ceremonyId !== ceremonyId) {
          
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Meal option does not belong to the specified ceremony'
          });
        }
      }
      
      
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
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      const messages = await storage.getCoupleMessagesByEvent(eventId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch messages' });
    }
  });
  
  app.post('/api/events/:eventId/messages', async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // Verify that the event exists before creating a message
      
      const eventExists = await storage.eventExists(eventId);
      if (!eventExists) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      
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
  
  // Statistics route moved to statistics.ts
  
  // Relationship Type routes moved to relationship-types.ts
  
  // WhatsApp Template routes MOVED to whatsapp.ts - registerWhatsAppRoutes() handles these
  // Register New Domain Routes (extracted from monolithic file)
  registerAuthRoutes(app);
  registerStatisticsRoutes(app, isAuthenticated);
  registerRelationshipTypeRoutes(app, isAuthenticated);
  
  // Register RSVP routes
  // These handle verification of RSVP tokens, submission of RSVP responses, 
  // and generation of RSVP links for guests
  registerRSVPRoutes(app, isAuthenticated, isAdmin);
  
  // Register WhatsApp routes
  registerWhatsAppRoutes(app, isAuthenticated, isAdmin);
  
  // Register Hotel routes
  registerHotelRoutes(app, isAuthenticated, isAdmin);
  
  // Register Auto Assignment routes
  registerAutoAssignmentRoutes(app, isAuthenticated, isAdmin);
  
  // Performance-optimized routes are loaded dynamically below
  
  // Register ultra-fast travel batch routes
  const travelBatchRoutes = await import('./routes/travel-batch');
  app.use('/api', travelBatchRoutes.default);
  
  // Dashboard routes handled by standard API endpoints
  
  // Register RSVP Follow-up routes
  app.use('/api', isAuthenticated, rsvpFollowupRoutes);
  
  // Register Transport routes
  app.use('/api', isAuthenticated, transportRoutes);

  // Register Travel routes
  const travelRoutes = await import('./routes/travel');
  app.use('/api', travelRoutes.default);
  
  // Register OAuth routes
  app.use('/api/oauth', oauthRoutes);
  
  // Register Event Settings routes
  app.use('/api/event-settings', eventSettingsRoutes);
  
  // Register Email Templates routes without authentication middleware (routes handle their own auth)
  app.use('/api', communicationTemplatesRoutes);

  // Communication Configuration and Stats Endpoints
  app.get('/api/events/:eventId/communication/config', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const event = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
      if (event.length === 0) {
        return res.status(404).json({ message: "Event not found" });
      }

      const eventData = event[0];
      
      // Return communication configuration with sensible defaults
      const communicationConfig = {
        eventId,
        familySettings: {
          communicationStyle: eventData.communicationStyle || 'modern',
          approvalRequired: eventData.approvalRequired || false,
          disablePreAssignmentNotifications: eventData.disablePreAssignmentNotifications || false,
          language: eventData.language || 'english'
        },
        moduleConfigurations: {
          rsvp: {
            enabled: true,
            reminderFrequency: eventData.rsvpReminderFrequency || 7,
            maxReminders: eventData.maxRsvpReminders || 3,
            stage2AutoTrigger: eventData.stage2AutoTrigger !== false
          },
          accommodation: {
            enabled: eventData.accommodationMode !== 'disabled',
            preAssignmentNotifications: !eventData.disablePreAssignmentNotifications,
            checkInReminders: eventData.checkInReminders !== false,
            notificationTiming: {
              preAssignment: eventData.preAssignmentNotificationDays || 0,
              checkInReminder: eventData.checkInReminderHours || 24
            }
          },
          transport: {
            enabled: eventData.transportMode !== 'disabled',
            driverAssignmentNotifications: eventData.driverAssignmentNotifications !== false,
            pickupConfirmations: eventData.pickupConfirmations !== false,
            notificationTiming: {
              driverAssignment: eventData.driverAssignmentDays || 2,
              pickupConfirmation: eventData.pickupConfirmationHours || 24
            }
          },
          venue: {
            enabled: true,
            ceremonyUpdates: eventData.ceremonyUpdates !== false,
            weatherAlerts: eventData.weatherAlerts || false,
            finalDetailsPackage: eventData.finalDetailsPackage !== false
          }
        }
      };

      res.json(communicationConfig);
    } catch (error) {
      console.error('Error fetching communication config:', error);
      res.status(500).json({ message: 'Failed to fetch communication configuration' });
    }
  });

  app.put('/api/events/:eventId/communication/config', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      const { familySettings, moduleConfigurations } = req.body;

      // Update event with communication settings
      const updateData: any = {};
      
      if (familySettings) {
        if (familySettings.communicationStyle) updateData.communicationStyle = familySettings.communicationStyle;
        if (familySettings.approvalRequired !== undefined) updateData.approvalRequired = familySettings.approvalRequired;
        if (familySettings.disablePreAssignmentNotifications !== undefined) updateData.disablePreAssignmentNotifications = familySettings.disablePreAssignmentNotifications;
        if (familySettings.language) updateData.language = familySettings.language;
      }

      if (moduleConfigurations) {
        const { rsvp, accommodation, transport, venue } = moduleConfigurations;
        
        if (rsvp) {
          if (rsvp.reminderFrequency) updateData.rsvpReminderFrequency = rsvp.reminderFrequency;
          if (rsvp.maxReminders) updateData.maxRsvpReminders = rsvp.maxReminders;
          if (rsvp.stage2AutoTrigger !== undefined) updateData.stage2AutoTrigger = rsvp.stage2AutoTrigger;
        }

        if (accommodation) {
          if (accommodation.preAssignmentNotifications !== undefined) updateData.disablePreAssignmentNotifications = !accommodation.preAssignmentNotifications;
          if (accommodation.checkInReminders !== undefined) updateData.checkInReminders = accommodation.checkInReminders;
          if (accommodation.notificationTiming?.preAssignment) updateData.preAssignmentNotificationDays = accommodation.notificationTiming.preAssignment;
          if (accommodation.notificationTiming?.checkInReminder) updateData.checkInReminderHours = accommodation.notificationTiming.checkInReminder;
        }

        if (transport) {
          if (transport.driverAssignmentNotifications !== undefined) updateData.driverAssignmentNotifications = transport.driverAssignmentNotifications;
          if (transport.pickupConfirmations !== undefined) updateData.pickupConfirmations = transport.pickupConfirmations;
          if (transport.notificationTiming?.driverAssignment) updateData.driverAssignmentDays = transport.notificationTiming.driverAssignment;
          if (transport.notificationTiming?.pickupConfirmation) updateData.pickupConfirmationHours = transport.notificationTiming.pickupConfirmation;
        }

        if (venue) {
          if (venue.ceremonyUpdates !== undefined) updateData.ceremonyUpdates = venue.ceremonyUpdates;
          if (venue.weatherAlerts !== undefined) updateData.weatherAlerts = venue.weatherAlerts;
          if (venue.finalDetailsPackage !== undefined) updateData.finalDetailsPackage = venue.finalDetailsPackage;
        }
      }

      await db.update(weddingEvents).set(updateData).where(eq(weddingEvents.id, eventId));

      res.json({ message: 'Communication configuration updated successfully' });
    } catch (error) {
      console.error('Error updating communication config:', error);
      res.status(500).json({ message: 'Failed to update communication configuration' });
    }
  });

  app.get('/api/events/:eventId/communication/stats', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // Get all guests for the event
      const allGuests = await db.select().from(guests).where(eq(guests.eventId, eventId));
      
      // Calculate stats
      const totalGuests = allGuests.length;
      
      const rsvpStatus = {
        confirmed: allGuests.filter(g => g.rsvpStatus === 'confirmed').length,
        pending: allGuests.filter(g => g.rsvpStatus === 'pending').length,
        declined: allGuests.filter(g => g.rsvpStatus === 'declined').length
      };

      const accommodationStatus = {
        assigned: allGuests.filter(g => g.needsAccommodation && g.accommodationAssigned).length,
        pending: allGuests.filter(g => g.needsAccommodation && !g.accommodationAssigned).length
      };

      const transportStatus = {
        assigned: allGuests.filter(g => g.needsTransportation && g.transportGroupId).length,
        pending: allGuests.filter(g => g.needsTransportation && !g.transportGroupId).length
      };

      const communicationStatus = {
        emailAvailable: allGuests.filter(g => g.email && g.email.includes('@')).length,
        whatsappAvailable: allGuests.filter(g => g.whatsappNumber && g.whatsappAvailable).length,
        unreachable: allGuests.filter(g => (!g.email || !g.email.includes('@')) && (!g.whatsappNumber || !g.whatsappAvailable)).length
      };

      const stats = {
        totalGuests,
        rsvpStatus,
        accommodationStatus,
        transportStatus,
        communicationStatus
      };

      res.json(stats);
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      res.status(500).json({ message: 'Failed to fetch communication statistics' });
    }
  });

  app.get('/api/events/:eventId/communication/automations', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }

      // For now, return mock automation data
      // TODO: Implement real automation tracking
      const mockAutomations = [
        {
          id: 'rsvp-reminder-1',
          name: 'RSVP Reminder - Pending Guests',
          module: 'RSVP',
          type: 'time_based',
          status: 'active',
          nextRun: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
          guestsAffected: 15,
          lastRun: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
        },
        {
          id: 'stage2-trigger',
          name: 'Stage 2 Details Collection',
          module: 'RSVP',
          type: 'status_based',
          status: 'active',
          guestsAffected: 8,
          lastRun: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];

             res.json(mockAutomations);
     } catch (error) {
       console.error('Error fetching automations:', error);
       res.status(500).json({ message: 'Failed to fetch automations' });
     }
   });

   // Unified Messaging Endpoint
   app.post('/api/events/:eventId/communication/send-message', isAuthenticated, async (req, res) => {
     try {
       const eventId = parseInt(req.params.eventId);
       if (isNaN(eventId)) {
         return res.status(400).json({ message: "Invalid event ID" });
       }

       const { 
         audienceFilter, 
         channel, 
         subject, 
         message, 
         urgency = 'normal',
         guestIds 
       } = req.body;

       if (!message) {
         return res.status(400).json({ message: "Message content is required" });
       }

       // Get target guests based on audience filter
       let targetGuests;
       if (guestIds && guestIds.length > 0) {
         // Specific guest IDs provided
         targetGuests = await db
           .select()
           .from(guests)
           .where(
             and(
               eq(guests.eventId, eventId),
               or(...guestIds.map((id: number) => eq(guests.id, id)))
             )
           );
       } else {
         // Apply audience filter
         targetGuests = await db.select().from(guests).where(eq(guests.eventId, eventId));
         
         // Apply filters based on audienceFilter
         switch (audienceFilter) {
           case 'confirmed':
             targetGuests = targetGuests.filter(g => g.rsvpStatus === 'confirmed');
             break;
           case 'pending':
             targetGuests = targetGuests.filter(g => g.rsvpStatus === 'pending');
             break;
           case 'bride-side':
             targetGuests = targetGuests.filter(g => g.side === 'bride');
             break;
           case 'groom-side':
             targetGuests = targetGuests.filter(g => g.side === 'groom');
             break;
           case 'accommodation-needed':
             targetGuests = targetGuests.filter(g => g.needsAccommodation);
             break;
                       case 'transport-needed':
              targetGuests = targetGuests.filter(g => g.needsTransportation);
              break;
           default:
             // 'all' - no additional filtering
             break;
         }
       }

       if (targetGuests.length === 0) {
         return res.status(400).json({ message: "No guests match the specified criteria" });
       }

       // Send messages based on channel preference
       const results = {
         sent: 0,
         failed: 0,
         errors: [] as string[]
       };

       for (const guest of targetGuests) {
         try {
           let sent = false;

           // Determine which channels to use
           const useEmail = channel === 'email' || channel === 'smart';
           const useWhatsApp = channel === 'whatsapp' || channel === 'smart';

                       // Try WhatsApp first if enabled and available
            if (useWhatsApp && guest.whatsappNumber && guest.whatsappAvailable) {
                           try {
                // Use existing WhatsApp service
                const WhatsAppManager = (await import('./services/whatsapp/whatsapp-manager')).default;
                const manager = WhatsAppManager.getInstance();
                await manager.sendTextMessage(eventId, guest.whatsappNumber, message);
                sent = true;
              } catch (whatsappError) {
                console.error(`WhatsApp failed for guest ${guest.id}:`, whatsappError);
                // Continue to try email if smart mode
              }
           }

           // Try email if WhatsApp failed or not available (in smart mode) or if email mode
           if (!sent && useEmail && guest.email && guest.email.includes('@')) {
                           try {
                // Use existing email service
                const { emailService } = await import('./services/email/email-service');
                await emailService.sendEmail({
                  to: guest.email,
                  from: 'wedding@example.com', // TODO: Use event's configured from address
                  subject: subject || 'Wedding Update',
                  text: message,
                  html: message.replace(/\n/g, '<br>')
                });
                sent = true;
              } catch (emailError) {
                console.error(`Email failed for guest ${guest.id}:`, emailError);
              }
           }

           if (sent) {
             results.sent++;
           } else {
             results.failed++;
             results.errors.push(`Failed to reach guest ${guest.firstName} ${guest.lastName}`);
           }
         } catch (error) {
           results.failed++;
           results.errors.push(`Error processing guest ${guest.firstName} ${guest.lastName}: ${error}`);
         }
       }

       res.json({
         message: `Message processing complete. Sent: ${results.sent}, Failed: ${results.failed}`,
         results,
         targetGuestsCount: targetGuests.length
       });
     } catch (error) {
       console.error('Error sending messages:', error);
       res.status(500).json({ message: 'Failed to send messages' });
     }
   });
  
  // Wizard Data Endpoint - combine all wizard step data
  app.get('/api/events/:id/wizard-data', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Get event data
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Get ceremonies data
      const ceremonies = await storage.getCeremonies(eventId);
      
      // Get accommodations data
      const accommodations = await storage.getAccommodations(eventId);
      
      // Basic progress calculation
      const progress = {
        basicInfoComplete: !!(event.title && event.coupleNames && event.brideName && event.groomName),
        venuesComplete: ceremonies.length > 0,
        rsvpComplete: !!event.rsvpDeadline,
        accommodationComplete: event.accommodationMode && event.accommodationMode !== 'none',
        transportComplete: event.transportMode && event.transportMode !== 'none',
        communicationComplete: !!(event.brevoApiKey || event.emailConfigured),
        aiComplete: false
      };
      
      const wizardData = {
        basicInfo: event,
        ceremonies: ceremonies || [],
        accommodationConfig: {
          mode: event.accommodationMode,
          accommodations: accommodations || []
        },
        transportConfig: {
          mode: event.transportMode,
          flightMode: event.flightMode
        },
        communicationConfig: {
          emailProvider: event.emailProvider,
          brevoApiKey: event.brevoApiKey,
          emailConfigured: event.emailConfigured
        },
        progress,
        completionStatus: progress
      };
      
      res.json(wizardData);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch wizard data' });
    }
  });

  // Register Wizard routes
  // Wizard routes handled by standard API endpoints
  
  // Add a test email endpoint for debugging
  app.post('/api/test-email', async (req: Request, res: Response) => {
    try {
      const { eventId, email } = req.body;
      
      if (!eventId || !email) {
        return res.status(400).json({
          success: false,
          message: 'Both eventId and email are required'
        });
      }
      
      
      
      // Get the event data
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event not found'
        });
      }
      
      // Import EmailService
      const { EmailService } = await import('./services/email');
      
      // Create an email service for this event
      
      const emailService = EmailService.fromEvent(event);
      
      // Check if the email service is configured
      if (!emailService.isConfigured()) {
        
        return res.status(400).json({
          success: false,
          message: 'Email service not properly configured for this event'
        });
      }
      
      // Send a test email
      
      const result = await emailService.sendEmail({
        to: email,
        subject: `Test Email from ${event.title}`,
        html: `
          <h1>Test Email from Wedding RSVP System</h1>
          <p>This is a test email from the Wedding RSVP system for ${event.title}.</p>
          <p>If you're seeing this, email sending is working correctly!</p>
          <p>Email Provider: ${event.emailProvider || 'Default'}</p>
          <p>Email Configuration: ${event.useGmailDirectSMTP ? 'Direct SMTP' : 'OAuth'}</p>
          <p>Time: ${new Date().toISOString()}</p>
        `,
        text: `Test Email from Wedding RSVP System\n\nThis is a test email from the Wedding RSVP system for ${event.title}.\n\nIf you're seeing this, email sending is working correctly!\n\nEmail Provider: ${event.emailProvider || 'Default'}\nEmail Configuration: ${event.useGmailDirectSMTP ? 'Direct SMTP' : 'OAuth'}\nTime: ${new Date().toISOString()}`
      });
      
      
      
      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'Failed to send test email',
          error: result.error
        });
      }
      
      return res.json({
        success: true,
        message: `Test email sent successfully to ${email}`
      });
    } catch (error) {
      
      return res.status(500).json({
        success: false,
        message: 'An error occurred while sending test email',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // NOTE: Transport routes are already registered above (line ~2888)
  // Removed duplicate registration: app.use('/api/transport', transportRoutes);
  
  // Register Flight Coordination routes
  app.use('/api', flightCoordinationRoutes);
  
  // Register Vehicle Management routes
  app.use('/api', vehicleManagementRoutes);
  
  // Standard API endpoints handle all operations
  
  // NOTE: WhatsApp routes are already registered above (line ~2873)
  // Removed duplicate registration: registerWhatsAppRoutes(app, isAuthenticated, isAdmin);
  
  // Register Integration routes for comprehensive guest data filtering
  registerIntegrationRoutes(app, isAuthenticated);
  
  // Register Master Guest Data routes for bi-directional data flow
  registerMasterGuestDataRoutes(app, isAuthenticated);

  return httpServer;
}
