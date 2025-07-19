/**
 * RSVP API routes (Simplified without WhatsApp)
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { RSVPService } from '../services/rsvp';
import { 
  RSVPResponseSchema,
  RSVPStage1Schema,
  RSVPStage2Schema,
  RSVPCombinedSchema
} from '../services/rsvp-schema';
import { EmailService } from '../services/email';

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
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
  
  try {
    // Get guest and event information
    const guest = await storage.getGuest(tokenData.guestId);
    const event = await storage.getEvent(tokenData.eventId);
    
    if (!guest || !event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Guest or event not found' 
      });
    }
    
    // Get ceremonies for this event
    const ceremonies = await storage.getCeremonies(tokenData.eventId);
    
    return res.json({
      success: true,
      guest: {
        id: guest.id,
        firstName: guest.firstName,
        lastName: guest.lastName,
        email: guest.email,
        phone: guest.phone,
        currentRsvpStatus: guest.rsvpStatus
      },
      event: {
        id: event.id,
        title: event.title,
        coupleNames: event.coupleNames,
        date: event.date,
        location: event.location,
        allowPlusOnes: event.allowPlusOnes
      },
      ceremonies,
      tokenData
    });
  } catch (error) {
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error verifying token' 
    });
  }
});

/**
 * Submit RSVP response (Stage 1)
 */
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const response = RSVPResponseSchema.parse(req.body);
    
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
    
    return res.json({
      success: true,
      message: 'RSVP response submitted successfully'
    });
  } catch (error) {
    
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing RSVP submission' 
    });
  }
});

export default router;

/**
 * Register RSVP routes with Express app
 */
export function registerRSVPRoutes(app: any, isAuthenticated: any, isAdmin: any) {
  app.use('/api/rsvp', router);
}