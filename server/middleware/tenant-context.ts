import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage';

// Extend Express Request to include eventContext
declare global {
  namespace Express {
    interface Request {
      eventContext?: {
        eventId: number;
        eventTitle: string;
        hasPermission: boolean;
      };
    }
  }
}

/**
 * Source priority for event context:
 * 1. Query parameter - ?eventId=X
 * 2. Request body - { eventId: X }
 * 3. Route parameter - /api/events/:eventId/...
 * 4. Session - req.session.currentEvent
 */
export async function tenantContext(req: Request, res: Response, next: NextFunction) {
  console.log(`🔒 Tenant Context - Session ID: ${req.sessionID}`);
  
  // Skip tenant context for authentication routes
  if (
    req.path.startsWith('/api/auth') || 
    req.path === '/api/register' || 
    req.path === '/api/login' || 
    req.path === '/api/logout'
  ) {
    console.log('🔒 Tenant Context - Skipping authentication route');
    return next();
  }
  
  try {
    // Step 1: Determine the event ID from various sources
    let eventId: number | undefined;
    let source = 'none';
    
    // Source 1: Query parameter
    if (req.query.eventId) {
      eventId = parseInt(req.query.eventId as string);
      if (!isNaN(eventId)) {
        source = 'query';
        console.log(`🔒 Tenant Context - Using event ID ${eventId} from query parameter`);
      }
    }
    
    // Source 2: Request body
    if (!eventId && req.body && req.body.eventId) {
      eventId = parseInt(req.body.eventId);
      if (!isNaN(eventId)) {
        source = 'body';
        console.log(`🔒 Tenant Context - Using event ID ${eventId} from request body`);
      }
    }
    
    // Source 3: Route parameter
    if (!eventId && req.params.eventId) {
      eventId = parseInt(req.params.eventId);
      if (!isNaN(eventId)) {
        source = 'params';
        console.log(`🔒 Tenant Context - Using event ID ${eventId} from route parameter`);
      }
    }
    
    // Source 4: Session
    if (!eventId && req.session && req.session.currentEvent) {
      eventId = req.session.currentEvent.id;
      if (!isNaN(eventId)) {
        source = 'session';
        console.log(`🔒 Tenant Context - Using event ID ${eventId} from session`);
      }
    }
    
    // Step 2: Validate and store event context if event ID is found
    if (eventId) {
      // Verify event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        // Event not found - only error if event ID was explicitly provided
        if (source !== 'session') {
          console.warn(`🔒 Tenant Context - Event ID ${eventId} not found`);
          return res.status(404).json({ 
            message: 'Event not found',
            details: `The event with ID ${eventId} does not exist` 
          });
        } else {
          // Clear the invalid event from session
          delete req.session.currentEvent;
          console.warn(`🔒 Tenant Context - Removed invalid event ID ${eventId} from session`);
        }
      } else {
        // Check if user has permission to access this event
        let hasPermission = false;
        if (req.user) {
          const user = req.user as any;
          hasPermission = user.role === 'admin' || user.id === event.createdBy;
          
          if (!hasPermission) {
            console.warn(`🔒 Tenant Context - User ${user.id} has no permission for event ${eventId}`);
            return res.status(403).json({ 
              message: 'Access denied',
              details: 'You do not have permission to access this event' 
            });
          }
        }
        
        // Store event context in request object
        req.eventContext = {
          eventId: event.id,
          eventTitle: event.title,
          hasPermission
        };
        
        // Ensure the session has the current event
        if (source !== 'session' || !req.session.currentEvent || req.session.currentEvent.id !== event.id) {
          req.session.currentEvent = {
            ...event,
            primaryColor: req.session.currentEvent?.primaryColor || null,
            secondaryColor: req.session.currentEvent?.secondaryColor || null,
            whatsappFrom: req.session.currentEvent?.whatsappFrom || null
          };
          console.log(`🔒 Tenant Context - Updated session with event: ${event.title} (ID: ${event.id})`);
        }
        
        console.log(`🔒 Tenant Context - Event context set: ${event.title} (ID: ${event.id})`);
      }
    } else {
      // No event context found - some routes require it
      const requiresContext = [
        '/api/guests',
        '/api/ceremonies',
        '/api/accommodations',
        '/api/travel',
        '/api/meal'
      ];
      
      const routeRequiresContext = requiresContext.some(route => req.path.includes(route));
      
      if (routeRequiresContext) {
        console.warn(`🔒 Tenant Context - No event context found for route requiring context: ${req.path}`);
        return res.status(400).json({ 
          message: 'Event context required',
          details: 'This operation requires an event context. Please select an event or provide an event ID.' 
        });
      } else {
        console.log(`🔒 Tenant Context - No event context found, but not required for: ${req.path}`);
      }
    }
    
    next();
  } catch (error) {
    console.error('🔒 Tenant Context - Error processing tenant context:', error);
    next(error);
  }
}

/**
 * Helper function to extract event ID from request
 * Uses the same priority order as the middleware
 */
export function getEventIdFromRequest(req: Request): number | null {
  // First check if we have processed event context
  if (req.eventContext?.eventId) {
    return req.eventContext.eventId;
  }
  
  // Otherwise try all sources
  let eventId: number | null = null;
  
  // Query parameter
  if (req.query.eventId) {
    const parsedId = parseInt(req.query.eventId as string);
    if (!isNaN(parsedId)) {
      eventId = parsedId;
    }
  }
  
  // Request body
  if (!eventId && req.body && req.body.eventId) {
    const parsedId = parseInt(req.body.eventId);
    if (!isNaN(parsedId)) {
      eventId = parsedId;
    }
  }
  
  // Route parameter
  if (!eventId && req.params.eventId) {
    const parsedId = parseInt(req.params.eventId);
    if (!isNaN(parsedId)) {
      eventId = parsedId;
    }
  }
  
  // Session
  if (!eventId && req.session && req.session.currentEvent) {
    eventId = req.session.currentEvent.id;
  }
  
  return eventId;
}

/**
 * Function to ensure an API route has tenant context
 * Use this as an additional middleware for routes that must have tenant context
 */
export function requireTenantContext(req: Request, res: Response, next: NextFunction) {
  if (!req.eventContext) {
    return res.status(400).json({ 
      message: 'Event context required',
      details: 'This operation requires an event context. Please select an event or provide an event ID.' 
    });
  }
  
  next();
}