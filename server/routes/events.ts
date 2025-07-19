import { Express, Request, Response } from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { insertWeddingEventSchema } from '../../shared/schema';

export default function registerEventRoutes(app: Express, isAuthenticated: any) {
  // Get all events for authenticated user
  app.get('/api/events', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const startTime = Date.now();
      const requestId = Math.random().toString(36).substring(7);
      
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
          allEvents = await storage.getAllEvents();
          break; // Success, exit retry loop
        } catch (dbError) {
          retryCount++;
          console.error(`Database retry ${retryCount}/${maxRetries} for user ${username}:`, dbError);
          if (retryCount >= maxRetries) {
            throw dbError; // Re-throw after max retries
          }
          // Wait briefly before retry
          await new Promise(resolve => setTimeout(resolve, 100 * retryCount));
        }
      }
      
      // Apply proper access control based on role
      if (userRole === 'admin' || userRole === 'staff' || userRole === 'planner') {
        // Admin, staff, and planner users see all events
        res.json(allEvents);
      } else {
        // Couple users only see events they created
        const userEvents = allEvents.filter(event => event.createdBy === userId);
        res.json(userEvents);
      }
      
      const duration = Date.now() - startTime;
      if (duration > 200) {
        console.log(`SLOW events query for ${username}: ${duration}ms`);
      }
    } catch (error) {
      console.error('Events fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch events' });
    }
  });

  // Get specific event by ID
  app.get('/api/events/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Event fetch error:', error);
      res.status(500).json({ message: 'Failed to fetch event' });
    }
  });

  // Create new event
  app.post('/api/events', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const userId = (req.user as any).id;
      const eventData = insertWeddingEventSchema.parse({
        ...req.body,
        createdBy: userId
      });
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error('Event creation error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to create event' });
    }
  });

  // Update event
  app.put('/api/events/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const updateData = insertWeddingEventSchema.partial().parse(req.body);
      const event = await storage.updateEvent(id, updateData);
      
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json(event);
    } catch (error) {
      console.error('Event update error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: 'Failed to update event' });
    }
  });

  // Delete event
  app.delete('/api/events/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const success = await storage.deleteEvent(id);
      if (!success) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      res.json({ message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Event deletion error:', error);
      res.status(500).json({ message: 'Failed to delete event' });
    }
  });

  // Dashboard batch data endpoint
  app.get('/api/events/:id/dashboard-batch', isAuthenticated, async (req: Request, res: Response) => {
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
      
      // Get dashboard data in batch to reduce API calls
      const [guests, ceremonies, accommodations] = await Promise.all([
        storage.getGuestsByEvent(eventId),
        storage.getCeremonies(eventId),
        storage.getAccommodations(eventId)
      ]);
      
      const dashboardData = {
        event,
        guests: guests || [],
        ceremonies: ceremonies || [],
        accommodations: accommodations || [],
        stats: {
          totalGuests: guests?.length || 0,
          confirmedGuests: guests?.filter(g => g.rsvpStatus === 'confirmed').length || 0,
          pendingGuests: guests?.filter(g => g.rsvpStatus === 'pending').length || 0
        }
      };
      
      res.json(dashboardData);
    } catch (error) {
      console.error('Dashboard batch error:', error);
      res.status(500).json({ message: 'Failed to fetch dashboard data' });
    }
  });
}