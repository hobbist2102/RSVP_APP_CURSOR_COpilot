import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for setting the current event
const setCurrentEventSchema = z.object({
  eventId: z.number().int().positive()
});

// Define interface for event with required additional properties
interface SessionEvent {
  id: number;
  title: string;
  coupleNames: string;
  brideName: string;
  groomName: string;
  startDate: string;
  endDate: string;
  location: string;
  description: string | null;
  date: string | null;
  createdBy: number;
  
  // Required additional properties for session
  primaryColor: string | null;
  secondaryColor: string | null;
  
  // WhatsApp configuration fields
  whatsappFrom: string | null;
  whatsappBusinessPhoneId: string | null;
  whatsappBusinessNumber: string | null;
  whatsappBusinessAccountId: string | null;
  whatsappAccessToken: string | null;
  whatsappConfigured: boolean | null;
  
  // Email configuration fields
  emailProvider: string | null;
  emailApiKey: string | null;
  emailFromAddress: string | null;
  emailFromDomain: string | null;
  emailConfigured: boolean | null;
  
  // Additional permission field
  hasPermission?: boolean;
  
  // Allow additional properties
  [key: string]: any;
}

/**
 * GET /api/current-event
 * Get the current event from session
 */
router.get('/current-event', async (req, res) => {
  try {
    // Get the current event from session
    if (req.session.currentEvent) {
      return res.json(req.session.currentEvent);
    }
    
    // If no event in session but user is logged in, try to get their most recent event
    if (req.isAuthenticated()) {
      const user = req.user as any;
      const events = await storage.getEventsByUser(user.id);
      
      if (events.length > 0) {
        // Sort by created date if available, otherwise use database order
        // Note: If createdAt doesn't exist, we'll just use the first event
        const sortedEvents = [...events];
        
        // Set the first event as current
        const currentEvent = sortedEvents[0];
        
        // Add required properties for session storage
        const sessionEvent: SessionEvent = {
          ...currentEvent,
          primaryColor: null,
          secondaryColor: null,
          
          // WhatsApp configuration fields
          whatsappFrom: null,
          whatsappBusinessPhoneId: null,
          whatsappBusinessNumber: null,
          whatsappBusinessAccountId: null,
          whatsappAccessToken: null,
          whatsappConfigured: null,
          
          // Email configuration fields
          emailProvider: null,
          emailApiKey: null,
          emailFromAddress: null,
          emailFromDomain: null,
          emailConfigured: null,
          
          // Permission field
          hasPermission: req.isAuthenticated() ? true : false
        };
        
        req.session.currentEvent = sessionEvent;
        
        return res.json(sessionEvent);
      }
    }
    
    // No current event
    return res.status(204).end();
  } catch (error) {
    console.error('Error getting current event:', error);
    return res.status(500).json({ message: 'Failed to get current event' });
  }
});

/**
 * POST /api/current-event
 * Set the current event in session
 */
router.post('/current-event', async (req, res) => {
  try {
    // Parse and validate the request
    const { eventId } = setCurrentEventSchema.parse(req.body);
    
    // Get the event to verify it exists and user has access
    const event = await storage.getEvent(eventId);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    // If user is authenticated, check if they have access to this event
    if (req.isAuthenticated()) {
      const user = req.user as any;
      const hasAccess = user.role === 'admin' || event.createdBy === user.id;
      
      if (!hasAccess) {
        return res.status(403).json({ message: 'You do not have access to this event' });
      }
    }
    
    // Add required properties for session storage
    const sessionEvent: SessionEvent = {
      ...event,
      primaryColor: req.session.currentEvent?.primaryColor || null,
      secondaryColor: req.session.currentEvent?.secondaryColor || null,
      
      // WhatsApp configuration fields
      whatsappFrom: req.session.currentEvent?.whatsappFrom || null,
      whatsappBusinessPhoneId: req.session.currentEvent?.whatsappBusinessPhoneId || null,
      whatsappBusinessNumber: req.session.currentEvent?.whatsappBusinessNumber || null,
      whatsappBusinessAccountId: req.session.currentEvent?.whatsappBusinessAccountId || null,
      whatsappAccessToken: req.session.currentEvent?.whatsappAccessToken || null,
      whatsappConfigured: req.session.currentEvent?.whatsappConfigured || null,
      
      // Email configuration fields
      emailProvider: req.session.currentEvent?.emailProvider || null,
      emailApiKey: req.session.currentEvent?.emailApiKey || null,
      emailFromAddress: req.session.currentEvent?.emailFromAddress || null,
      emailFromDomain: req.session.currentEvent?.emailFromDomain || null,
      emailConfigured: req.session.currentEvent?.emailConfigured || null,
      
      // Permission field
      hasPermission: req.isAuthenticated() ? true : false
    };
    
    // Set the current event in session
    req.session.currentEvent = sessionEvent;
    
    return res.json(sessionEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
    }
    
    console.error('Error setting current event:', error);
    return res.status(500).json({ message: 'Failed to set current event' });
  }
});

/**
 * DELETE /api/current-event
 * Clear the current event from session
 */
router.delete('/current-event', (req, res) => {
  try {
    // Clear the current event from session
    delete req.session.currentEvent;
    
    return res.status(204).end();
  } catch (error) {
    console.error('Error clearing current event:', error);
    return res.status(500).json({ message: 'Failed to clear current event' });
  }
});

export default router;