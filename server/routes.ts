import express, { Express, Request, Response } from 'express';
import { createServer, Server } from 'http';
import multer from 'multer';
import path from 'path';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import XLSX from 'xlsx';
import crypto from 'crypto';

// Database and schema imports
import { storage } from './storage';
import { db } from './db';
import { weddingEvents } from '../shared/schema';
import { eq } from "drizzle-orm";

// Import domain routes
import registerAuthRoutes, { isAuthenticated, isAdmin } from "./routes/auth";
import registerStatisticsRoutes from "./routes/statistics";
import registerRelationshipTypeRoutes from "./routes/relationship-types";
import registerEventRoutes from "./routes/events";
import registerGuestRoutes from "./routes/guests";
import registerAdminRoutes from "./routes/admin";
import registerPasswordResetRoutes from "./routes/password-reset";

// Import existing domain routes
import { registerRSVPRoutes } from "./routes/rsvp";
import { registerWhatsAppRoutes } from "./routes/whatsapp";
import { registerHotelRoutes } from "./routes/hotels";
import rsvpFollowupRoutes from "./routes/rsvp-followup";
import oauthRoutes from "./routes/oauth";
import { registerIntegrationRoutes } from "./routes/integration-routes";
import { registerMasterGuestDataRoutes } from "./routes/master-guest-data";
import eventSettingsRoutes from "./routes/event-settings";
import { registerAutoAssignmentRoutes } from "./routes/auto-assignments";
import communicationTemplatesRoutes from "./routes/communication-templates";
import transportRoutes from "./routes/transport";
import flightCoordinationRoutes from "./routes/flight-coordination";
import vehicleManagementRoutes from "./routes/vehicle-management";

// Auth utilities
import { ensureAdminUserExists, getDefaultCredentials } from './auth/production-auth';

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize authentication system on startup
  await ensureAdminUserExists();
  
  // Performance monitoring middleware
  app.use((req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      if (duration > 500) {
        console.log(`SLOW: ${req.method} ${req.path} took ${duration}ms`);
      }
    });
    
    next();
  });
  
  // Special handling for client-side routes
  app.get('/guest-rsvp/:token', (req, res, next) => {
    next(); // Pass through to client-side router
  });
  
  app.get('/guest-rsvp', (req, res, next) => {
    next(); // Pass through to client-side router
  });

  const httpServer = createServer(app);

  // Configure session management
  try {
    const pgSession = (await import('connect-pg-simple')).default(session);
    
    app.use(session({
      store: new pgSession({
        conString: process.env.DATABASE_URL,
        createTableIfMissing: true,
        ttl: 24 * 60 * 60 // 24 hours
      }),
      secret: process.env.SESSION_SECRET || 'wedding-rsvp-secret-key-production',
      resave: false,
      saveUninitialized: false,
      rolling: true,
      name: 'connect.sid',
      cookie: { 
        secure: false,
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
        domain: undefined
      }
    }));
  } catch (sessionError) {
    console.warn('⚠️ CRITICAL: PostgreSQL session store failed - falling back to in-memory sessions');
    console.warn('⚠️ WARNING: Sessions will not persist across server restarts');
    
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
  
  // Passport setup
  app.use(passport.initialize());
  app.use(passport.session());

  // Events-direct route (special case for unauthenticated access)
  app.get('/api/events-direct', async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: 'Authentication required' });
      }
      
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      const allEvents = await storage.getAllEvents();
      
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'planner') {
        return res.json(allEvents);
      } else {
        const userEvents = allEvents.filter(event => event.createdBy === userId);
        return res.json(userEvents);
      }
    } catch (error) {
      console.error('Events-direct error:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // Current event management
  app.get('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      // Check session first
      if (req.session.currentEvent) {
        const event = await storage.getEvent(req.session.currentEvent.id);
        if (event) {
          return res.json(event);
        }
      }
      
      // If no session event, get user's first event
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      const allEvents = await storage.getAllEvents();
      let events;
      
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'planner') {
        events = allEvents;
      } else {
        events = allEvents.filter(event => event.createdBy === userId);
      }
      
      if (events.length > 0) {
        req.session.currentEvent = { id: events[0].id };
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json(events[0]);
      }
      
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
  
  app.post('/api/current-event', isAuthenticated, async (req, res) => {
    try {
      const { eventId } = req.body;
      
      if (!eventId) {
        return res.status(400).json({ message: 'Event ID is required' });
      }
      
      const event = await storage.getEvent(parseInt(eventId));
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Verify user has access to this event
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      if (userRole !== 'admin' && userRole !== 'staff' && userRole !== 'planner' && event.createdBy !== userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      req.session.currentEvent = { id: event.id };
      
      await new Promise<void>((resolve, reject) => {
        req.session.save((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      res.json(event);
    } catch (error) {
      const err = error as Error;
      res.status(500).json({ 
        message: 'Error setting current event',
        details: err.message 
      });
    }
  });

  // Register all domain routes
  registerAuthRoutes(app);
  registerPasswordResetRoutes(app);
  registerStatisticsRoutes(app, isAuthenticated);
  registerRelationshipTypeRoutes(app, isAuthenticated);
  registerEventRoutes(app, isAuthenticated);
  registerGuestRoutes(app, isAuthenticated);
  registerAdminRoutes(app, isAuthenticated);
  
  // Register existing domain routes
  registerRSVPRoutes(app, isAuthenticated, isAdmin);
  registerWhatsAppRoutes(app, isAuthenticated, isAdmin);
  registerHotelRoutes(app, isAuthenticated, isAdmin);
  registerAutoAssignmentRoutes(app, isAuthenticated, isAdmin);
  
  // Register dynamically loaded routes
  const travelBatchRoutes = await import('./routes/travel-batch');
  app.use('/api', travelBatchRoutes.default);
  
  const travelRoutes = await import('./routes/travel');
  app.use('/api', travelRoutes.default);
  
  // Register static routes
  app.use('/api', isAuthenticated, rsvpFollowupRoutes);
  app.use('/api', isAuthenticated, transportRoutes);
  app.use('/api/oauth', oauthRoutes);
  app.use('/api/event-settings', eventSettingsRoutes);
  app.use('/api', communicationTemplatesRoutes);
  app.use('/api', flightCoordinationRoutes);
  app.use('/api', vehicleManagementRoutes);
  
  // Register integration routes
  registerIntegrationRoutes(app, isAuthenticated);
  registerMasterGuestDataRoutes(app, isAuthenticated);

  return httpServer;
}
