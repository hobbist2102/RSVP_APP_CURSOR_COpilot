/**
 * RSVP API routes
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { RSVPService, RSVPResponseSchema } from '../services/rsvp';
import { EmailService } from '../services/email';
import { WhatsAppService } from '../services/whatsapp';

const router = Router();

/**
 * Test endpoint to verify RSVP routes are configured correctly
 */
router.get('/test', (req: Request, res: Response) => {
  res.json({ 
    success: true, 
    message: 'RSVP API is working correctly',
    timestamp: new Date().toISOString()
  });
});

/**
 * Verify RSVP token and return guest information
 */
router.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;
  
  if (!token || typeof token !== 'string') {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid token format' 
    });
  }
  
  // Verify token
  const tokenData = RSVPService.verifyToken(token);
  
  if (!tokenData) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
  
  const { guestId, eventId } = tokenData;
  
  try {
    // Get guest and event information
    const guest = await storage.getGuest(guestId);
    if (!guest) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest not found' 
      });
    }
    
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get ceremonies for this event
    const ceremonies = await storage.getCeremoniesByEvent(eventId);
    
    // Get guest's ceremony selections
    const guestCeremonies = await storage.getGuestCeremoniesByGuest(guestId);
    
    // Get meal options for each ceremony
    const mealOptionsByCeremony: Record<number, any[]> = {};
    for (const ceremony of ceremonies) {
      const options = await storage.getMealOptionsByCeremony(ceremony.id);
      if (options.length > 0) {
        mealOptionsByCeremony[ceremony.id] = options;
      }
    }
    
    // Return guest, event and ceremony information
    return res.json({
      success: true,
      guest: {
        id: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        rsvpStatus: guest.rsvpStatus,
        plusOneAllowed: guest.plusOneAllowed,
        plusOneConfirmed: guest.plusOneConfirmed,
        plusOneName: guest.plusOneName,
        accommodationPreference: guest.accommodationPreference,
        dietaryRestrictions: guest.dietaryRestrictions,
        childrenDetails: guest.childrenDetails,
      },
      event: {
        id: event.id,
        title: event.title,
        coupleNames: event.coupleNames,
        startDate: event.startDate,
        endDate: event.endDate,
        location: event.location,
        description: event.description,
        rsvpDeadline: event.rsvpDeadline,
      },
      ceremonies: ceremonies.map(ceremony => ({
        id: ceremony.id,
        name: ceremony.name,
        date: ceremony.date,
        startTime: ceremony.startTime,
        endTime: ceremony.endTime,
        location: ceremony.location,
        description: ceremony.description,
        attireCode: ceremony.attireCode,
        attending: guestCeremonies.find(gc => gc.ceremonyId === ceremony.id)?.attending || false,
        mealOptions: mealOptionsByCeremony[ceremony.id] || []
      }))
    });
  } catch (error) {
    console.error('Error verifying RSVP token:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing RSVP verification' 
    });
  }
});

/**
 * Submit RSVP response
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    // Validate request body against schema
    const validationResult = RSVPResponseSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid RSVP data', 
        errors: validationResult.error.errors 
      });
    }
    
    const response = validationResult.data;
    
    // Process RSVP response
    const result = await RSVPService.processRSVPResponse(response);
    
    if (!result.success) {
      return res.status(400).json(result);
    }
    
    // Send confirmation email if guest has email
    const guest = await storage.getGuest(response.guestId);
    const event = await storage.getEvent(response.eventId);
    
    if (guest && event && guest.email) {
      const emailService = EmailService.fromEvent(event);
      
      if (emailService.isConfigured()) {
        await emailService.sendEmail({
          to: guest.email,
          subject: `Your RSVP for ${event.title} - ${response.attending ? 'Confirmed' : 'Declined'}`,
          text: `Dear ${guest.firstName},\n\nThank you for your RSVP response for ${event.title}.\n\nYour response: ${response.attending ? 'Attending' : 'Not attending'}\n\nWe ${response.attending ? 'look forward to seeing you!' : 'will miss you at the event.'}\n\nRegards,\n${event.coupleNames}`,
          html: `<p>Dear ${guest.firstName},</p><p>Thank you for your RSVP response for ${event.title}.</p><p><strong>Your response:</strong> ${response.attending ? 'Attending' : 'Not attending'}</p><p>We ${response.attending ? 'look forward to seeing you!' : 'will miss you at the event.'}</p><p>Regards,<br>${event.coupleNames}</p>`
        });
      }
    }
    
    // Send confirmation WhatsApp if guest has phone number
    if (guest && event && guest.phone) {
      const whatsappService = WhatsAppService.fromEvent(event);
      
      if (whatsappService.isConfigured()) {
        await whatsappService.sendMessage(
          guest, 
          response.attending ? 'rsvp_confirmation' : 'rsvp_declined',
          {
            event_name: event.title,
            couple_names: event.coupleNames,
            rsvp_status: response.attending ? 'confirmed' : 'declined'
          }
        );
      }
    }
    
    return res.json({
      success: true,
      message: 'RSVP response submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing RSVP submission' 
    });
  }
});

/**
 * Generate RSVP links for guests
 */
router.post('/generate-links', async (req: Request, res: Response) => {
  try {
    const { eventId, baseUrl } = req.body;
    
    if (!eventId || !baseUrl) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID and base URL are required' 
      });
    }
    
    // Check if event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get all guests for this event
    const guests = await storage.getGuestsByEvent(eventId);
    
    // Generate RSVP links for each guest
    const guestLinks = guests.map(guest => {
      const rsvpLink = RSVPService.generateRSVPLink(baseUrl, guest, event);
      return {
        id: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        rsvpLink
      };
    });
    
    return res.json({
      success: true,
      guests: guestLinks
    });
  } catch (error) {
    console.error('Error generating RSVP links:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error generating RSVP links' 
    });
  }
});

/**
 * Send RSVP invites to guests
 */
router.post('/send-invites', async (req: Request, res: Response) => {
  try {
    const { eventId, guestIds, baseUrl, channel } = req.body;
    
    if (!eventId || !baseUrl || !guestIds || !Array.isArray(guestIds) || !channel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Event ID, guest IDs, channel, and base URL are required' 
      });
    }
    
    // Validate channel
    if (!['email', 'whatsapp', 'both'].includes(channel)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid channel. Must be "email", "whatsapp", or "both"' 
      });
    }
    
    // Check if event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Initialize services
    const emailService = channel !== 'whatsapp' ? EmailService.fromEvent(event) : null;
    const whatsappService = channel !== 'email' ? WhatsAppService.fromEvent(event) : null;
    
    // Check if services are configured
    if (channel === 'email' && !emailService?.isConfigured()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email service is not configured for this event' 
      });
    }
    
    if (channel === 'whatsapp' && !whatsappService?.isConfigured()) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp service is not configured for this event' 
      });
    }
    
    // Get guests
    const results: Array<{
      guestId: number;
      name?: string;
      email?: string;
      phone?: string;
      success: boolean;
      message?: string;
      emailSent?: boolean;
      whatsappSent?: boolean;
      rsvpLink?: string;
    }> = [];
    for (const guestId of guestIds) {
      const guest = await storage.getGuest(guestId);
      
      if (!guest) {
        results.push({
          guestId,
          success: false,
          message: 'Guest not found'
        });
        continue;
      }
      
      // Generate RSVP link
      const rsvpLink = RSVPService.generateRSVPLink(baseUrl, guest, event);
      let emailSent = false;
      let whatsappSent = false;
      
      // Send email if configured and guest has email
      if (emailService?.isConfigured() && guest.email && (channel === 'email' || channel === 'both')) {
        const emailResult = await emailService.sendRSVPEmail(guest, event, rsvpLink);
        emailSent = emailResult.success;
      }
      
      // Send WhatsApp if configured and guest has phone
      if (whatsappService?.isConfigured() && guest.phone && (channel === 'whatsapp' || channel === 'both')) {
        const whatsappResult = await whatsappService.sendRSVPInvitation(guest, event, rsvpLink);
        whatsappSent = whatsappResult.success;
      }
      
      results.push({
        guestId: guest.id,
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email || undefined,
        phone: guest.phone || undefined,
        success: true,
        emailSent,
        whatsappSent,
        rsvpLink
      });
    }
    
    return res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error sending RSVP invites:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error sending RSVP invites' 
    });
  }
});

/**
 * Function to register RSVP routes with the Express app
 * @param app Express application
 * @param isAuthenticated Authentication middleware
 * @param isAdmin Admin authentication middleware
 */
export function registerRSVPRoutes(
  app: any, // Using any temporarily to avoid type errors 
  isAuthenticated: (req: Request, res: Response, next: any) => void,
  isAdmin: (req: Request, res: Response, next: any) => void
) {
  // Public endpoints for RSVP verification and submission
  // Using specific routes instead of router to ensure proper API handling
  
  // Test endpoint
  app.get('/api/rsvp/test', (req: Request, res: Response) => {
    res.json({ 
      success: true, 
      message: 'RSVP API is working correctly',
      timestamp: new Date().toISOString()
    });
  });
  
  // Verify token endpoint
  app.get('/api/rsvp/verify', async (req: Request, res: Response) => {
    try {
      const { token } = req.query;
      
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid token format' 
        });
      }
      
      // Verify token
      const tokenData = RSVPService.verifyToken(token);
      
      if (!tokenData) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
      
      const { guestId, eventId } = tokenData;
      
      // Get guest with event context to enforce isolation
      const guest = await storage.getGuestWithEventContext(guestId, eventId);
      if (!guest) {
        return res.status(404).json({ 
          success: false, 
          message: 'Guest not found or does not belong to this event' 
        });
      }
      
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }
      
      // Get ceremonies for this event
      const ceremonies = await storage.getCeremoniesByEvent(eventId);
      
      // Get guest's ceremony selections
      const guestCeremonies = await storage.getGuestCeremoniesByGuest(guestId);
      
      // Get meal options for each ceremony
      const mealOptionsByCeremony: Record<number, any[]> = {};
      for (const ceremony of ceremonies) {
        const options = await storage.getMealOptionsByCeremony(ceremony.id);
        if (options.length > 0) {
          mealOptionsByCeremony[ceremony.id] = options;
        }
      }
      
      // Return guest, event and ceremony information
      return res.json({
        success: true,
        guest: {
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          firstName: guest.firstName,
          lastName: guest.lastName,
          email: guest.email,
          phone: guest.phone,
          rsvpStatus: guest.rsvpStatus,
          plusOneAllowed: guest.plusOneAllowed,
          plusOneName: guest.plusOneName,
          dietaryRestrictions: guest.dietaryRestrictions,
          childrenDetails: guest.childrenDetails,
        },
        event: {
          id: event.id,
          title: event.title,
          coupleNames: event.coupleNames,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          description: event.description,
        },
        ceremonies: ceremonies.map(ceremony => ({
          id: ceremony.id,
          name: ceremony.name,
          date: ceremony.date,
          startTime: ceremony.startTime,
          endTime: ceremony.endTime,
          location: ceremony.location,
          description: ceremony.description,
          attireCode: ceremony.attireCode,
          attending: guestCeremonies.find(gc => gc.ceremonyId === ceremony.id)?.attending || false,
          mealOptions: mealOptionsByCeremony[ceremony.id] || []
        }))
      });
    } catch (error) {
      console.error('Error verifying RSVP token:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing RSVP verification' 
      });
    }
  });
  
  // Submit RSVP response endpoint
  app.post('/api/rsvp/submit', async (req: Request, res: Response) => {
    try {
      // Validate request body against schema
      const validationResult = RSVPResponseSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid RSVP data', 
          errors: validationResult.error.errors 
        });
      }
      
      const response = validationResult.data;
      
      // Process RSVP response
      const result = await RSVPService.processRSVPResponse(response);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      // Send confirmation email if guest has email
      // Use event context verification to maintain isolation
      const guest = await storage.getGuestWithEventContext(response.guestId, response.eventId);
      const event = await storage.getEvent(response.eventId);
      
      if (guest && event && guest.email) {
        const emailService = EmailService.fromEvent(event);
        
        if (emailService.isConfigured()) {
          await emailService.sendEmail({
            to: guest.email,
            subject: `Your RSVP for ${event.title} - ${response.attending ? 'Confirmed' : 'Declined'}`,
            text: `Dear ${guest.firstName},\n\nThank you for your RSVP response for ${event.title}.\n\nYour response: ${response.attending ? 'Attending' : 'Not attending'}\n\nWe ${response.attending ? 'look forward to seeing you!' : 'will miss you at the event.'}\n\nRegards,\n${event.coupleNames}`,
            html: `<p>Dear ${guest.firstName},</p><p>Thank you for your RSVP response for ${event.title}.</p><p><strong>Your response:</strong> ${response.attending ? 'Attending' : 'Not attending'}</p><p>We ${response.attending ? 'look forward to seeing you!' : 'will miss you at the event.'}</p><p>Regards,<br>${event.coupleNames}</p>`
          });
        }
      }
      
      // Send confirmation WhatsApp if guest has phone
      if (guest && event && guest.phone) {
        const whatsappService = WhatsAppService.fromEvent(event);
        
        if (whatsappService.isConfigured()) {
          await whatsappService.sendMessage(
            guest, 
            response.attending ? 'rsvp_confirmation' : 'rsvp_declined',
            {
              event_name: event.title,
              couple_names: event.coupleNames,
              rsvp_status: response.attending ? 'confirmed' : 'declined'
            }
          );
        }
      }
      
      return res.json({
        success: true,
        message: 'RSVP response submitted successfully'
      });
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error processing RSVP submission' 
      });
    }
  });
  
  // Admin-only endpoints for generating and sending RSVP links
  app.post('/api/admin/rsvp/generate-links', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { eventId, baseUrl } = req.body;
      
      if (!eventId || !baseUrl) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event ID and base URL are required' 
        });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }
      
      // Get all guests for this event
      const guests = await storage.getGuestsByEvent(eventId);
      
      // Generate RSVP links for each guest
      const guestLinks = guests.map(guest => {
        const rsvpLink = RSVPService.generateRSVPLink(baseUrl, guest, event);
        return {
          id: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email || undefined,
          phone: guest.phone || undefined,
          rsvpLink
        };
      });
      
      return res.json({
        success: true,
        guests: guestLinks
      });
    } catch (error) {
      console.error('Error generating RSVP links:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error generating RSVP links' 
      });
    }
  });
  
  app.post('/api/admin/rsvp/send-invites', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const { eventId, guestIds, baseUrl, channel } = req.body;
      
      if (!eventId || !baseUrl || !guestIds || !Array.isArray(guestIds) || !channel) {
        return res.status(400).json({ 
          success: false, 
          message: 'Event ID, guest IDs, channel, and base URL are required' 
        });
      }
      
      // Validate channel
      if (!['email', 'whatsapp', 'both'].includes(channel)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid channel. Must be "email", "whatsapp", or "both"' 
        });
      }
      
      // Check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ 
          success: false, 
          message: 'Event not found' 
        });
      }
      
      // Initialize services
      const emailService = channel !== 'whatsapp' ? EmailService.fromEvent(event) : null;
      const whatsappService = channel !== 'email' ? WhatsAppService.fromEvent(event) : null;
      
      // Check if services are configured
      if (channel === 'email' && !emailService?.isConfigured()) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email service is not configured for this event' 
        });
      }
      
      if (channel === 'whatsapp' && !whatsappService?.isConfigured()) {
        return res.status(400).json({ 
          success: false, 
          message: 'WhatsApp service is not configured for this event' 
        });
      }
      
      // Get guests
      const results: Array<{
        guestId: number;
        name?: string;
        email?: string;
        phone?: string;
        success: boolean;
        message?: string;
        emailSent?: boolean;
        whatsappSent?: boolean;
        rsvpLink?: string;
      }> = [];
      for (const guestId of guestIds) {
        // Use event context verification to maintain isolation
        const guest = await storage.getGuestWithEventContext(guestId, eventId);
        
        if (!guest) {
          results.push({
            guestId,
            success: false,
            message: 'Guest not found or does not belong to this event'
          });
          continue;
        }
        
        // Generate RSVP link
        const rsvpLink = RSVPService.generateRSVPLink(baseUrl, guest, event);
        let emailSent = false;
        let whatsappSent = false;
        
        // Send email if configured and guest has email
        if (emailService?.isConfigured() && guest.email && (channel === 'email' || channel === 'both')) {
          const emailResult = await emailService.sendRSVPEmail(guest, event, rsvpLink);
          emailSent = emailResult.success;
        }
        
        // Send WhatsApp if configured and guest has phone
        if (whatsappService?.isConfigured() && guest.phone && (channel === 'whatsapp' || channel === 'both')) {
          const whatsappResult = await whatsappService.sendRSVPInvitation(guest, event, rsvpLink);
          whatsappSent = whatsappResult.success;
        }
        
        results.push({
          guestId: guest.id,
          name: `${guest.firstName} ${guest.lastName}`,
          email: guest.email || undefined,
          phone: guest.phone || undefined,
          success: true,
          emailSent,
          whatsappSent,
          rsvpLink
        });
      }
      
      return res.json({
        success: true,
        results
      });
    } catch (error) {
      console.error('Error sending RSVP invites:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error sending RSVP invites' 
      });
    }
  });
}

// Also export the router as default for more flexible usage
export default router;