import express, { type Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import * as XLSX from "xlsx";
import { format } from "date-fns";
// Import session type extensions
import './types';
// Import Replit Auth
import { setupAuth, isAuthenticated, isAdmin } from "./replitAuth";
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
// Import RSVP service and routes
import { RSVPService } from "./services/rsvp";
import { registerRSVPRoutes } from "./routes/rsvp";

// Import WhatsApp routes
import { registerWhatsAppRoutes } from "./routes/whatsapp";

// Import Hotel routes
import { registerHotelRoutes } from "./routes/hotels";

// Import RSVP follow-up routes
import rsvpFollowupRoutes from "./routes/rsvp-followup";

// Import OAuth routes
import oauthRoutes from "./routes/oauth";

// Import Event Settings routes
import eventSettingsRoutes from "./routes/event-settings";

// Import Email Templates routes
import emailTemplatesRoutes from "./routes/email-templates";

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Special handling for client-side routes that should be handled by React router
  app.get('/guest-rsvp/:token', (req, res, next) => {
    console.log(`Received RSVP request with token: ${req.params.token}`);
    next(); // Pass through to client-side router
  });
  
  app.get('/guest-rsvp', (req, res, next) => {
    console.log(`Received RSVP request with query token: ${req.query.token || 'none'}`);
    next(); // Pass through to client-side router
  });
  
  // Setup Replit Auth
  await setupAuth(app);
  
  // Auth routes for Replit Auth
  app.get('/api/auth/user', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({ message: 'Failed to fetch user information' });
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
      
      try {
        // Validate the event data
        const validatedData = insertWeddingEventSchema.parse(eventData);
        console.log('Parsed event data:', validatedData);
        
        // Create the event
        const event = await storage.createEvent(validatedData);
        console.log('Event created successfully:', event);
        res.status(201).json(event);
      } catch (validationError) {
        if (validationError instanceof z.ZodError) {
          console.error('Validation errors:', validationError.errors);
          return res.status(400).json({ message: validationError.errors });
        }
        throw validationError;
      }
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      res.status(500).json({ message: 'Failed to create event', details: error instanceof Error ? error.message : String(error) });
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
      let guests;
      try {
        guests = await storage.getGuestsByEvent(eventId);
        
        if (!Array.isArray(guests)) {
          console.error(`getGuestsByEvent returned non-array: ${typeof guests}`);
          guests = []; // Default to empty array if not an array
        }
        
        // Enhanced logging to debug the Don ji issue
        console.log(`Retrieved ${guests.length} guests for event ${eventId}`);
      } catch (error) {
        console.error(`Error fetching guests for event: ${error}`);
        return res.status(500).json({ message: 'Failed to fetch guests' });
      }
      
      // If this is Rocky Rani event, let's add detailed logging
      if (eventId === 4 && Array.isArray(guests)) {
        const guestNames = guests.map(g => `${g.id}: ${g.firstName} ${g.lastName}`).join(', ');
        console.log(`DEBUG - Rocky Rani guests from database: ${guestNames || 'None'}`);
        
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
      
      // First try to get event context from query parameters
      let contextEventId = req.query.eventId ? parseInt(req.query.eventId as string) : undefined;
      
      // If no event context in query, try to get it from session
      if (!contextEventId && req.session.currentEvent) {
        contextEventId = req.session.currentEvent.id;
        console.log(`Using session event context: ${contextEventId} for ceremony update`);
      }
      
      // Always require event context for multi-tenant operations
      if (!contextEventId) {
        console.warn(`No event context available for ceremony ${ceremonyId} update`);
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        console.warn(`Event ID ${contextEventId} not found when updating ceremony`);
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify this ceremony belongs to the correct event
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        console.warn(`Ceremony with ID ${ceremonyId} not found`);
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      if (ceremony.eventId !== contextEventId) {
        console.warn(`Ceremony ${ceremonyId} belongs to event ${ceremony.eventId}, not requested event ${contextEventId}`);
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
      console.error(`Error updating ceremony:`, error);
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
        console.log(`Using session event context: ${contextEventId} for ceremony deletion`);
      }
      
      // Always require event context for multi-tenant operations
      if (!contextEventId) {
        console.warn(`No event context available for ceremony ${ceremonyId} deletion`);
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'Please provide an event ID or select an event first' 
        });
      }
      
      // Verify the event exists
      const event = await storage.getEvent(contextEventId);
      if (!event) {
        console.warn(`Event ID ${contextEventId} not found when deleting ceremony`);
        return res.status(404).json({ 
          message: 'Event not found',
          details: `The specified event ID ${contextEventId} does not exist` 
        });
      }
      
      // Verify this ceremony belongs to the correct event
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        console.warn(`Ceremony with ID ${ceremonyId} not found`);
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      if (ceremony.eventId !== contextEventId) {
        console.warn(`Ceremony ${ceremonyId} belongs to event ${ceremony.eventId}, not requested event ${contextEventId}`);
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
      
      console.log(`Successfully deleted ceremony ${ceremonyId} from event ${contextEventId}`);
      res.json({ message: 'Ceremony deleted successfully' });
    } catch (error) {
      console.error(`Error deleting ceremony:`, error);
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
        console.warn(`Guest with ID ${guestId} not found when creating attendance`);
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      // Then get the ceremony
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        console.warn(`Ceremony with ID ${ceremonyId} not found when creating attendance`);
        return res.status(404).json({ 
          message: 'Ceremony not found' 
        });
      }
      
      // Verify both guest and ceremony belong to the same event
      if (guest.eventId !== ceremony.eventId) {
        console.warn(`Cross-event operation attempted: Guest ${guestId} (event ${guest.eventId}) and Ceremony ${ceremonyId} (event ${ceremony.eventId})`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and ceremony must belong to the same event'
        });
      }
      
      // Check if already exists
      const existing = await storage.getGuestCeremony(guestId, ceremonyId);
      if (existing) {
        console.log(`Updating existing attendance for guest ${guestId} at ceremony ${ceremonyId}`);
        const updated = await storage.updateGuestCeremony(existing.id, { attending: attendanceData.attending });
        return res.json(updated);
      }
      
      console.log(`Creating new attendance for guest ${guestId} at ceremony ${ceremonyId} in event ${guest.eventId}`);
      const attendance = await storage.createGuestCeremony(attendanceData);
      res.status(201).json(attendance);
    } catch (error) {
      console.error(`Error managing guest attendance:`, error);
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
        console.warn(`Guest with ID ${guestId} not found when creating travel info`);
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      console.log(`Creating/updating travel information for guest ${guestId} (event ${guest.eventId})`);
      
      // Check if already exists
      const existing = await storage.getTravelInfoByGuest(guestId);
      if (existing) {
        console.log(`Updating existing travel info for guest ${guestId}`);
        const updated = await storage.updateTravelInfo(existing.id, travelData);
        return res.json(updated);
      }
      
      console.log(`Creating new travel info for guest ${guestId}`);
      const travel = await storage.createTravelInfo(travelData);
      res.status(201).json(travel);
    } catch (error) {
      console.error(`Error creating travel info:`, error);
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
        console.warn(`Travel info with ID ${travelId} not found when updating`);
        return res.status(404).json({ message: 'Travel info not found' });
      }
      
      // If guestId is being changed, verify event context
      if (travelData.guestId && travelData.guestId !== currentTravel.guestId) {
        // Get the original guest
        const originalGuest = await storage.getGuest(currentTravel.guestId);
        if (!originalGuest) {
          console.warn(`Original guest with ID ${currentTravel.guestId} not found when updating travel info`);
          return res.status(404).json({ message: 'Original guest not found' });
        }
        
        // Get the new guest
        const newGuest = await storage.getGuest(travelData.guestId);
        if (!newGuest) {
          console.warn(`New guest with ID ${travelData.guestId} not found when updating travel info`);
          return res.status(404).json({ message: 'New guest not found' });
        }
        
        // Verify both guests belong to the same event
        if (originalGuest.eventId !== newGuest.eventId) {
          console.warn(`Cross-event operation attempted: Original guest ${currentTravel.guestId} (event ${originalGuest.eventId}) and new guest ${travelData.guestId} (event ${newGuest.eventId})`);
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Cannot transfer travel information between guests from different events'
          });
        }
        
        console.log(`Changing travel info ${travelId} from guest ${currentTravel.guestId} to guest ${travelData.guestId} in event ${originalGuest.eventId}`);
      }
      
      console.log(`Updating travel info ${travelId}`);
      const updatedTravel = await storage.updateTravelInfo(travelId, travelData);
      if (!updatedTravel) {
        return res.status(404).json({ message: 'Travel info not found' });
      }
      res.json(updatedTravel);
    } catch (error) {
      console.error(`Error updating travel info:`, error);
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
      console.log(`Fetching accommodations for event ${eventId}`);
      
      // First check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        console.log(`Event ${eventId} not found when fetching accommodations`);
        return res.status(404).json({ message: 'Event not found' });
      }
      
      const accommodations = await storage.getAccommodationsByEvent(eventId);
      console.log(`Found ${accommodations.length} accommodations for event ${eventId}`);
      
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
                  location: hotel.location
                } : null
              };
            } catch (err) {
              console.error(`Error fetching hotel ${acc.hotelId} for accommodation ${acc.id}:`, err);
              return acc;
            }
          }
          return acc;
        })
      );
      
      res.json(accommodationsWithHotelDetails);
    } catch (error) {
      console.error('Error fetching accommodations:', error);
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
      
      // First get the current accommodation to verify event context
      const currentAccommodation = await storage.getAccommodation(accommodationId);
      if (!currentAccommodation) {
        console.warn(`Accommodation with ID ${accommodationId} not found when updating`);
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      
      // Verify eventId hasn't changed or if it has, it's a valid operation
      if (accommodationData.eventId && accommodationData.eventId !== currentAccommodation.eventId) {
        console.warn(`Attempted to change eventId from ${currentAccommodation.eventId} to ${accommodationData.eventId} for accommodation ${accommodationId}`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of an accommodation'
        });
      }
      
      console.log(`Updating accommodation ${accommodationId} in event ${currentAccommodation.eventId}`);
      const updatedAccommodation = await storage.updateAccommodation(accommodationId, accommodationData);
      if (!updatedAccommodation) {
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      res.json(updatedAccommodation);
    } catch (error) {
      console.error(`Error updating accommodation:`, error);
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
        console.warn(`Accommodation with ID ${accommodationId} not found when fetching allocations`);
        return res.status(404).json({ message: 'Accommodation not found' });
      }
      
      console.log(`Fetching allocations for accommodation ${accommodationId} in event ${accommodation.eventId}`);
      const allocations = await storage.getRoomAllocationsByAccommodation(accommodationId);
      res.json(allocations);
    } catch (error) {
      console.error(`Error fetching allocations for accommodation:`, error);
      res.status(500).json({ message: 'Failed to fetch allocations' });
    }
  });
  
  app.get('/api/guests/:guestId/allocations', isAuthenticated, async (req, res) => {
    try {
      const guestId = parseInt(req.params.guestId);
      
      // First verify that the guest exists and note its event context
      const guest = await storage.getGuest(guestId);
      if (!guest) {
        console.warn(`Guest with ID ${guestId} not found when fetching allocations`);
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      console.log(`Fetching allocations for guest ${guestId} in event ${guest.eventId}`);
      const allocations = await storage.getRoomAllocationsByGuest(guestId);
      res.json(allocations);
    } catch (error) {
      console.error(`Error fetching allocations for guest:`, error);
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
        console.warn(`Guest with ID ${guestId} not found when creating room allocation`);
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      const accommodation = await storage.getAccommodation(accommodationId);
      if (!accommodation) {
        console.warn(`Accommodation with ID ${accommodationId} not found when creating room allocation`);
        return res.status(404).json({ 
          message: 'Accommodation not found' 
        });
      }
      
      // Verify that guest and accommodation belong to the same event
      if (guest.eventId !== accommodation.eventId) {
        console.warn(`Cross-event operation attempted: Guest ${guestId} (event ${guest.eventId}) and Accommodation ${accommodationId} (event ${accommodation.eventId})`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and accommodation must belong to the same event'
        });
      }
      
      console.log(`Creating room allocation for guest ${guestId} at accommodation ${accommodationId} in event ${guest.eventId}`);
      const allocation = await storage.createRoomAllocation(allocationData);
      
      // Update allocated rooms count
      console.log(`Updating allocated rooms count for accommodation ${accommodationId}`);
      await storage.updateAccommodation(accommodationId, {
        allocatedRooms: (accommodation.allocatedRooms || 0) + 1
      });
      
      res.status(201).json(allocation);
    } catch (error) {
      console.error(`Error creating room allocation:`, error);
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
        console.warn(`Room allocation with ID ${allocationId} not found when updating`);
        return res.status(404).json({ message: 'Allocation not found' });
      }
      
      // Handle event context validation if changing guest or accommodation
      if (allocationData.guestId || allocationData.accommodationId) {
        // Get the current guest and accommodation to establish event context
        const currentGuest = await storage.getGuest(currentAllocation.guestId);
        if (!currentGuest) {
          console.warn(`Current guest with ID ${currentAllocation.guestId} not found when updating room allocation`);
          return res.status(404).json({ message: 'Current guest not found' });
        }
        
        const currentAccommodation = await storage.getAccommodation(currentAllocation.accommodationId);
        if (!currentAccommodation) {
          console.warn(`Current accommodation with ID ${currentAllocation.accommodationId} not found when updating room allocation`);
          return res.status(404).json({ message: 'Current accommodation not found' });
        }
        
        // Verify current guest and accommodation belong to same event
        if (currentGuest.eventId !== currentAccommodation.eventId) {
          console.warn(`Existing data inconsistency detected: Guest ${currentAllocation.guestId} (event ${currentGuest.eventId}) and Accommodation ${currentAllocation.accommodationId} (event ${currentAccommodation.eventId})`);
        }
        
        const eventId = currentGuest.eventId;
        
        // If changing guest, verify new guest is in same event
        if (allocationData.guestId && allocationData.guestId !== currentAllocation.guestId) {
          const newGuest = await storage.getGuest(allocationData.guestId);
          if (!newGuest) {
            console.warn(`New guest with ID ${allocationData.guestId} not found when updating room allocation`);
            return res.status(404).json({ message: 'New guest not found' });
          }
          
          if (newGuest.eventId !== eventId) {
            console.warn(`Cross-event operation attempted: New guest ${allocationData.guestId} (event ${newGuest.eventId}) used with existing context (event ${eventId})`);
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
            console.warn(`New accommodation with ID ${allocationData.accommodationId} not found when updating room allocation`);
            return res.status(404).json({ message: 'New accommodation not found' });
          }
          
          if (newAccommodation.eventId !== eventId) {
            console.warn(`Cross-event operation attempted: New accommodation ${allocationData.accommodationId} (event ${newAccommodation.eventId}) used with existing context (event ${eventId})`);
            return res.status(403).json({
              message: 'Access denied',
              details: 'Cannot assign room allocation to accommodation from different event'
            });
          }
        }
      }
      
      console.log(`Updating room allocation ${allocationId}`);
      const updatedAllocation = await storage.updateRoomAllocation(allocationId, allocationData);
      if (!updatedAllocation) {
        return res.status(404).json({ message: 'Allocation not found' });
      }
      res.json(updatedAllocation);
    } catch (error) {
      console.error(`Error updating room allocation:`, error);
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
        console.warn(`Ceremony with ID ${ceremonyId} not found when fetching meal options`);
        return res.status(404).json({ message: 'Ceremony not found' });
      }
      
      console.log(`Fetching meal options for ceremony ${ceremonyId} in event ${ceremony.eventId}`);
      const meals = await storage.getMealOptionsByCeremony(ceremonyId);
      res.json(meals);
    } catch (error) {
      console.error(`Error fetching meal options for ceremony:`, error);
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
        console.warn(`Meal option with ID ${mealId} not found when updating`);
        return res.status(404).json({ message: 'Meal option not found' });
      }
      
      // Verify eventId hasn't changed or if it has, it's a valid operation
      if (mealData.eventId && mealData.eventId !== currentMeal.eventId) {
        console.warn(`Attempted to change eventId from ${currentMeal.eventId} to ${mealData.eventId} for meal option ${mealId}`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of a meal option'
        });
      }
      
      // If ceremonyId is being changed, verify the new ceremony belongs to the same event
      if (mealData.ceremonyId && mealData.ceremonyId !== currentMeal.ceremonyId) {
        const newCeremony = await storage.getCeremony(mealData.ceremonyId);
        if (!newCeremony) {
          console.warn(`New ceremony with ID ${mealData.ceremonyId} not found when updating meal option`);
          return res.status(404).json({ message: 'New ceremony not found' });
        }
        
        if (newCeremony.eventId !== currentMeal.eventId) {
          console.warn(`Cross-event operation attempted: Moving meal option ${mealId} (event ${currentMeal.eventId}) to ceremony ${mealData.ceremonyId} (event ${newCeremony.eventId})`);
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Cannot associate meal option with a ceremony from a different event'
          });
        }
      }
      
      console.log(`Updating meal option ${mealId} in event ${currentMeal.eventId}`);
      const updatedMeal = await storage.updateMealOption(mealId, mealData);
      if (!updatedMeal) {
        return res.status(404).json({ message: 'Meal option not found' });
      }
      res.json(updatedMeal);
    } catch (error) {
      console.error(`Error updating meal option:`, error);
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
        console.warn(`Guest with ID ${guestId} not found when fetching meal selections`);
        return res.status(404).json({ message: 'Guest not found' });
      }
      
      console.log(`Fetching meal selections for guest ${guestId} in event ${guest.eventId}`);
      const selections = await storage.getGuestMealSelectionsByGuest(guestId);
      res.json(selections);
    } catch (error) {
      console.error(`Error fetching meal selections for guest:`, error);
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
        console.warn(`Guest with ID ${guestId} not found when creating meal selection`);
        return res.status(404).json({ 
          message: 'Guest not found' 
        });
      }
      
      // Then get the ceremony
      const ceremony = await storage.getCeremony(ceremonyId);
      if (!ceremony) {
        console.warn(`Ceremony with ID ${ceremonyId} not found when creating meal selection`);
        return res.status(404).json({ 
          message: 'Ceremony not found' 
        });
      }
      
      // Verify both guest and ceremony belong to the same event
      if (guest.eventId !== ceremony.eventId) {
        console.warn(`Cross-event operation attempted: Guest ${guestId} (event ${guest.eventId}) and Ceremony ${ceremonyId} (event ${ceremony.eventId})`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Guest and ceremony must belong to the same event'
        });
      }
      
      // Get the meal option and verify it belongs to the ceremony
      const mealOption = await storage.getMealOption(mealOptionId);
      if (!mealOption) {
        console.warn(`Meal option with ID ${mealOptionId} not found when creating meal selection`);
        return res.status(404).json({ 
          message: 'Meal option not found' 
        });
      }
      
      // Verify meal option belongs to the specified ceremony
      if (mealOption.ceremonyId !== ceremonyId) {
        console.warn(`Cross-ceremony operation attempted: Meal option ${mealOptionId} (ceremony ${mealOption.ceremonyId}) used with ceremony ${ceremonyId}`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Meal option does not belong to the specified ceremony'
        });
      }
      
      console.log(`Creating meal selection for guest ${guestId} at ceremony ${ceremonyId} with option ${mealOptionId} in event ${guest.eventId}`);
      const selection = await storage.createGuestMealSelection(selectionData);
      res.status(201).json(selection);
    } catch (error) {
      console.error(`Error creating meal selection:`, error);
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
        console.warn(`Meal selection with ID ${selectionId} not found when updating`);
        return res.status(404).json({ message: 'Meal selection not found' });
      }
      
      // If ceremony ID is being changed, verify it belongs to the same event
      if (selectionData.ceremonyId && selectionData.ceremonyId !== currentSelection.ceremonyId) {
        // Get the guest
        const guest = await storage.getGuest(currentSelection.guestId);
        if (!guest) {
          console.warn(`Guest with ID ${currentSelection.guestId} not found when updating meal selection`);
          return res.status(404).json({ message: 'Guest not found' });
        }
        
        // Get the new ceremony
        const newCeremony = await storage.getCeremony(selectionData.ceremonyId);
        if (!newCeremony) {
          console.warn(`Ceremony with ID ${selectionData.ceremonyId} not found when updating meal selection`);
          return res.status(404).json({ message: 'Ceremony not found' });
        }
        
        // Verify both guest and ceremony belong to the same event
        if (guest.eventId !== newCeremony.eventId) {
          console.warn(`Cross-event operation attempted: Guest ${currentSelection.guestId} (event ${guest.eventId}) and Ceremony ${selectionData.ceremonyId} (event ${newCeremony.eventId})`);
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
          console.warn(`Meal option with ID ${selectionData.mealOptionId} not found when updating meal selection`);
          return res.status(404).json({ message: 'Meal option not found' });
        }
        
        if (mealOption.ceremonyId !== ceremonyId) {
          console.warn(`Cross-ceremony operation attempted: Meal option ${selectionData.mealOptionId} (ceremony ${mealOption.ceremonyId}) used with ceremony ${ceremonyId}`);
          return res.status(403).json({ 
            message: 'Access denied',
            details: 'Meal option does not belong to the specified ceremony'
          });
        }
      }
      
      console.log(`Updating meal selection ${selectionId} for guest ${currentSelection.guestId}`);
      const updatedSelection = await storage.updateGuestMealSelection(selectionId, selectionData);
      if (!updatedSelection) {
        return res.status(404).json({ message: 'Meal selection not found' });
      }
      res.json(updatedSelection);
    } catch (error) {
      console.error(`Error updating meal selection:`, error);
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
        console.warn(`WhatsApp template with ID ${id} not found`);
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      console.log(`Successfully fetched WhatsApp template ${id} for event ${template.eventId}`);
      res.json(template);
    } catch (error) {
      console.error(`Error fetching WhatsApp template:`, error);
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
        console.warn(`WhatsApp template with ID ${id} not found when updating`);
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      // If eventId is being changed, prevent it
      if (data.eventId && data.eventId !== currentTemplate.eventId) {
        console.warn(`Attempted to change eventId from ${currentTemplate.eventId} to ${data.eventId} for WhatsApp template ${id}`);
        return res.status(403).json({ 
          message: 'Access denied',
          details: 'Cannot change the event association of a WhatsApp template'
        });
      }
      
      console.log(`Updating WhatsApp template ${id} for event ${currentTemplate.eventId}`);
      const template = await storage.updateWhatsappTemplate(id, data);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error(`Error updating WhatsApp template:`, error);
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
        console.warn(`WhatsApp template with ID ${id} not found when attempting deletion`);
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      console.log(`Deleting WhatsApp template ${id} from event ${template.eventId}`);
      const success = await storage.deleteWhatsappTemplate(id);
      if (!success) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json({ message: 'WhatsApp template deleted successfully' });
    } catch (error) {
      console.error(`Error deleting WhatsApp template:`, error);
      res.status(500).json({ message: 'Failed to delete WhatsApp template' });
    }
  });
  
  app.post('/api/whatsapp-templates/:id/mark-used', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // First verify the template exists
      const existingTemplate = await storage.getWhatsappTemplate(id);
      if (!existingTemplate) {
        console.warn(`WhatsApp template with ID ${id} not found when marking as used`);
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      
      console.log(`Marking WhatsApp template ${id} as used for event ${existingTemplate.eventId}`);
      const template = await storage.markWhatsappTemplateAsUsed(id);
      if (!template) {
        return res.status(404).json({ message: 'WhatsApp template not found' });
      }
      res.json(template);
    } catch (error) {
      console.error(`Error marking WhatsApp template as used:`, error);
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
  
  // Register RSVP Follow-up routes
  app.use('/api', isAuthenticated, rsvpFollowupRoutes);
  
  // Register OAuth routes
  app.use('/api/oauth', oauthRoutes);
  
  // Register Event Settings routes
  app.use('/api/event-settings', eventSettingsRoutes);
  
  // Register Email Templates routes
  app.use(emailTemplatesRoutes);
  
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
      
      console.log(`[TEST EMAIL] Attempting to send test email to ${email} from event ${eventId}`);
      
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
      console.log(`[TEST EMAIL] Creating email service for event ${eventId}`);
      const emailService = EmailService.fromEvent(event);
      
      // Check if the email service is configured
      if (!emailService.isConfigured()) {
        console.log(`[TEST EMAIL] Email service not configured for event ${eventId}`);
        return res.status(400).json({
          success: false,
          message: 'Email service not properly configured for this event'
        });
      }
      
      // Send a test email
      console.log(`[TEST EMAIL] Sending test email to ${email}`);
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
      
      console.log(`[TEST EMAIL] Result:`, result);
      
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
      console.error('[TEST EMAIL] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'An error occurred while sending test email',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  return httpServer;
}
