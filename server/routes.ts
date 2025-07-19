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
  guests
} from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
// Wizard functionality handled by standard API endpoints
import { eq } from "drizzle-orm";
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

// Integration routes now handled via registerIntegrationRoutes function

// Standard API routes handle all operations




// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// WhatsApp routes will be registered at the end of this file

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication system on startup
  await ensureAdminUserExists();
  
  // Apply comprehensive logging middleware early in the pipeline (DISABLED - causing memory exhaustion)
  // app.use(loggingMiddleware);
  // app.use(authLoggingMiddleware);
  
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
  
  // Optimized middleware - removed excessive debug logging for performance
  
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      
      // Handle both hashed passwords and plain text passwords (for backward compatibility)
      let passwordMatch = false;
      
      if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
        // Password is already hashed, use bcrypt comparison
        passwordMatch = await bcrypt.compare(password, user.password);
      } else {
        // Legacy plain-text password - direct comparison with automatic upgrade
        passwordMatch = user.password === password;
        
        if (passwordMatch) {
          // Upgrade the plain-text password to a hashed one
          try {
            const hashedPassword = await bcrypt.hash(password, 10);
            await storage.updateUserPassword(user.id, hashedPassword);
            // Password successfully upgraded to hashed format
          } catch (hashError) {
            
          }
        }
      }
      
      if (!passwordMatch) {
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
      if (!user) {
        return done(null, false);
      }
      
      // Create a safe version of the user without the password
      const { password, ...safeUser } = user;
      return done(null, safeUser);
    } catch (error) {
      
      return done(error, false);
    }
  });
  
  // Optimized authentication middleware without excessive logging
  
  // Auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const secureUserData = {
        ...userData,
        password: hashedPassword
      };
      
      // Create new user with hashed password
      const user = await storage.createUser(secureUserData);
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          
          return res.status(500).json({ message: 'Registration successful but login failed' });
        }
        
        // Registration and login successful
        
        // Save the session explicitly before responding
        req.session.save((saveErr) => {
          if (saveErr) {
            
            return res.status(500).json({ message: 'Registration successful but session save failed' });
          }
          
          // Session saved after registration
          
          // Create a safe user object without the password
          const { password, ...safeUser } = user;
          res.status(201).json({ user: safeUser });
        });
      });
    } catch (error) {
      
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
        
        // Create a safe user object without the password
        const safeUser = { ...user } as any;
        if (safeUser.password) {
          delete safeUser.password;
        }
          
        // Force immediate session save and wait for completion
        req.session.save((saveErr) => {
          if (saveErr) {
            
            return next(saveErr);
          }
          
          // Session saved and login successful
          
          return res.json({ user: safeUser });
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
  
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      // Ensure we return a consistent user object
      const user = {
        id: (req.user as any).id,
        username: (req.user as any).username,
        name: (req.user as any).name || 'User',
        email: (req.user as any).email || '',
        role: (req.user as any).role || 'couple',
      };
      return res.json({ user, authenticated: true });
    } else {
      return res.status(401).json({ message: 'Not authenticated', authenticated: false });
    }
  });

  app.get('/api/auth/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
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
      return res.status(401).json({ message: 'Not authenticated' });
    }
  });
  
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
            id: (req.user as any).id,
            username: (req.user as any).username,
            role: (req.user as any).role
          } : null
        }
      });
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to get system info' });
    }
  });
  
  // User routes
  app.post('/api/users', isAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const secureUserData = {
        ...userData,
        password: hashedPassword
      };
      
      const user = await storage.createUser(secureUserData);
      
      // Don't return the password in the response
      const { password, ...safeUserData } = user;
      res.status(201).json(safeUserData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create user' });
    }
  });
  
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

  // Original comprehensive guest data endpoint (for backward compatibility)
  app.get('/api/events/:eventId/guests-comprehensive-legacy', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
      
      // Verify event exists and user has access
      const event = await storage.getEvent(eventId);
      if (!event) {
        
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Get all guests for the event
      const guests = await storage.getGuestsByEvent(eventId);
      
      
      // Get comprehensive data for each guest
      const comprehensiveGuests = await Promise.all(
        guests.map(async (guest: any) => {
          try {
            // Get accommodation information
            let accommodation = null;
            try {
              const accommodations = await storage.getAccommodationsByEvent(eventId);
              accommodation = accommodations.find((acc: any) => acc.guestId === guest.id);
            } catch (accError) {
              
            }
            
            // Get travel information
            let travelInfo = null;
            try {
              const travelInfos = await storage.getTravelInfoByEvent(eventId);
              travelInfo = travelInfos.find((travel: any) => travel.guestId === guest.id);
            } catch (travelError) {
              
            }
            
            // Get meal selections
            let mealSelections = [];
            try {
              mealSelections = await storage.getMealSelectionsByGuest(guest.id);
            } catch (mealError) {
              
            }
            
            // Get ceremony attendance
            let ceremonyAttendance = [];
            try {
              ceremonyAttendance = await storage.getGuestCeremoniesByGuest(guest.id);
            } catch (ceremonyError) {
              
            }
            
            return {
              ...guest,
              accommodation,
              travelInfo,
              mealSelections,
              ceremonyAttendance
            };
          } catch (guestError) {
            
            return guest; // Return basic guest data if comprehensive fetch fails
          }
        })
      );
      
      
      res.json(comprehensiveGuests);
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to fetch comprehensive guest data' });
    }
  });

  app.get('/api/events/:eventId/guests', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      
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

  // Alternative route for ceremonies by event (for venues step)
  app.get('/api/ceremonies/by-event/:eventId', isAuthenticated, async (req, res) => {
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
      
      // Fetch the current template to check event context
      const currentTemplate = await storage.getWhatsappTemplate(id);
      if (!currentTemplate) {
        
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      // If eventId is being changed, prevent it
      if (data.eventId && data.eventId !== currentTemplate.eventId) {
        
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of a WhatsApp template'
        });
      }
      
      
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
      
      // First verify the template exists before deletion and note its event context
      const template = await storage.getWhatsappTemplate(id);
      if (!template) {
        
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      
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
      
      // First verify the template exists
      const existingTemplate = await storage.getWhatsappTemplate(id);
      if (!existingTemplate) {
        
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      
      const template = await storage.markWhatsappTemplateAsUsed(id);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to mark WhatsApp template as used' });
    }
  });

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
  
  // Wizard Data Endpoint - combine all wizard step data
  app.get('/api/events/:id/wizard-data', isAuthenticated, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      
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
  
  // Register transport routes
  app.use('/api/transport', transportRoutes);
  
  // Register Flight Coordination routes
  app.use('/api', flightCoordinationRoutes);
  
  // Register Vehicle Management routes
  app.use('/api', vehicleManagementRoutes);
  
  // Standard API endpoints handle all operations
  


  // Register WhatsApp routes
  registerWhatsAppRoutes(app, isAuthenticated, isAdmin);
  
  // Register Integration routes for comprehensive guest data filtering
  registerIntegrationRoutes(app, isAuthenticated);
  
  // Register Master Guest Data routes for bi-directional data flow
  registerMasterGuestDataRoutes(app, isAuthenticated);

  return httpServer;
}
