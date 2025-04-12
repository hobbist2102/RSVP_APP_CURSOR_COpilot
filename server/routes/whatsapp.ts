/**
 * WhatsApp API routes
 */
import { Router } from 'express';
import { storage } from '../storage';
import { WhatsAppService } from '../services/whatsapp';
import { z } from 'zod';

const router = Router();

/**
 * Test endpoint to verify WhatsApp routes are configured correctly
 */
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'WhatsApp API is working correctly',
    timestamp: new Date().toISOString()
  });
});

/**
 * Send a WhatsApp message to a guest
 */
router.post('/send-message', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      guestId: z.number(),
      eventId: z.number(),
      templateName: z.string(),
      parameters: z.record(z.string(), z.any()).optional().default({})
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { guestId, eventId, templateName, parameters } = validationResult.data;
    
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
    
    // Create WhatsApp service
    const whatsappService = WhatsAppService.fromEvent(event);
    
    // Check if WhatsApp is configured
    if (!whatsappService.isConfigured()) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp is not configured for this event',
        details: 'Please configure WhatsApp credentials in event settings'
      });
    }
    
    // Send message
    const result = await whatsappService.sendMessage(guest, templateName, parameters);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to send WhatsApp message',
        error: result.error
      });
    }
    
    return res.json({
      success: true,
      message: 'WhatsApp message sent successfully',
      messageId: result.id
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing WhatsApp message request' 
    });
  }
});

/**
 * Send WhatsApp messages to multiple guests
 */
router.post('/send-bulk', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      eventId: z.number(),
      guestIds: z.array(z.number()),
      templateName: z.string(),
      parameters: z.record(z.string(), z.any()).optional().default({})
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid request data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { eventId, guestIds, templateName, parameters } = validationResult.data;
    
    // Get event information
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Create WhatsApp service
    const whatsappService = WhatsAppService.fromEvent(event);
    
    // Check if WhatsApp is configured
    if (!whatsappService.isConfigured()) {
      return res.status(400).json({ 
        success: false, 
        message: 'WhatsApp is not configured for this event',
        details: 'Please configure WhatsApp credentials in event settings'
      });
    }
    
    // Send messages to all guests
    const results = [];
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
      
      const result = await whatsappService.sendMessage(guest, templateName, parameters);
      
      results.push({
        guestId,
        name: `${guest.firstName} ${guest.lastName}`,
        success: result.success,
        messageId: result.id,
        error: result.error
      });
    }
    
    return res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error sending bulk WhatsApp messages:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error processing bulk WhatsApp message request' 
    });
  }
});

/**
 * Configure WhatsApp settings for an event
 */
router.post('/configure', async (req, res) => {
  try {
    // Validate request body
    const schema = z.object({
      eventId: z.number(),
      accessToken: z.string(),
      businessPhoneId: z.string(),
      businessNumber: z.string().optional(),
      businessAccountId: z.string().optional()
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid configuration data', 
        errors: validationResult.error.errors 
      });
    }
    
    const { 
      eventId, 
      accessToken, 
      businessPhoneId, 
      businessNumber, 
      businessAccountId 
    } = validationResult.data;
    
    // Get event information
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Update event with WhatsApp settings
    const updatedEvent = await storage.updateEvent(eventId, {
      whatsappAccessToken: accessToken,
      whatsappBusinessPhoneId: businessPhoneId,
      whatsappBusinessNumber: businessNumber || null,
      whatsappBusinessAccountId: businessAccountId || null,
      whatsappConfigured: true
    });
    
    if (!updatedEvent) {
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update event with WhatsApp settings' 
      });
    }
    
    // Create WhatsApp service with new credentials to test configuration
    const whatsappService = WhatsAppService.fromEvent(updatedEvent);
    
    return res.json({
      success: true,
      message: 'WhatsApp configuration updated successfully',
      configured: whatsappService.isConfigured()
    });
  } catch (error) {
    console.error('Error configuring WhatsApp:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error updating WhatsApp configuration' 
    });
  }
});

/**
 * Get WhatsApp configuration status for an event
 */
router.get('/status/:eventId', async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }
    
    // Get event information
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Create WhatsApp service to check configuration
    const whatsappService = WhatsAppService.fromEvent(event);
    
    return res.json({
      success: true,
      eventId: event.id,
      configured: whatsappService.isConfigured(),
      // Don't return sensitive credentials, just status
      hasAccessToken: !!event.whatsappAccessToken,
      hasBusinessPhoneId: !!event.whatsappBusinessPhoneId,
      hasBusinessNumber: !!event.whatsappBusinessNumber,
      hasBusinessAccountId: !!event.whatsappBusinessAccountId
    });
  } catch (error) {
    console.error('Error checking WhatsApp status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Error checking WhatsApp configuration status' 
    });
  }
});

/**
 * Function to register WhatsApp routes with the Express app
 * @param app Express application
 * @param isAuthenticated Authentication middleware
 * @param isAdmin Admin authentication middleware
 */
export function registerWhatsAppRoutes(app, isAuthenticated, isAdmin) {
  // Test endpoint accessible without authentication for basic connectivity testing
  app.get('/api/whatsapp/test', (req, res) => {
    res.json({ 
      success: true, 
      message: 'WhatsApp API is working correctly',
      timestamp: new Date().toISOString()
    });
  });
  
  // All other WhatsApp endpoints require authentication
  app.use('/api/whatsapp', isAuthenticated, router);
}

// Also export the router as default for more flexible usage
export default router;