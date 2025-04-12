import { Router } from 'express';
import { storage } from '../storage';
import { z } from 'zod';

const router = Router();

// Schema for setting the current event
const setCurrentEventSchema = z.object({
  eventId: z.number().int().positive()
});

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
      const events = await storage.getEventsByUser(req.user.id);
      
      if (events.length > 0) {
        // Sort by most recently created
        events.sort((a, b) => {
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        });
        
        // Set the first event as current
        const currentEvent = events[0];
        req.session.currentEvent = currentEvent;
        
        return res.json(currentEvent);
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
    
    // Set the current event in session
    req.session.currentEvent = event;
    
    return res.json(event);
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