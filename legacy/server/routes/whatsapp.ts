import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { db } from '../db';
import { guests, weddingEvents as events } from '@shared/schema';
import { eq } from 'drizzle-orm';
import WhatsAppManager from '../services/whatsapp/whatsapp-manager';
import { WhatsAppProvider } from '../services/whatsapp/whatsapp-factory';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * Register WhatsApp routes with the Express application
 */
export function registerWhatsAppRoutes(
  app: Express, 
  isAuthenticated: (req: Request, res: Response, next: NextFunction) => void,
  isAdmin: (req: Request, res: Response, next: NextFunction) => void
): void {
  const router = express.Router();
  const whatsappManager = WhatsAppManager.getInstance();
  
  // Middleware to check WhatsApp service readiness
  const checkWhatsAppReady = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const service = await whatsappManager.getService(eventId);
      if (!service.isClientReady()) {
        return res.status(403).json({ message: 'WhatsApp service not ready. Please initiate authentication.' });
      }
      
      next();
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to check WhatsApp service readiness' });
    }
  };
  
  // Get WhatsApp provider and connection status
  router.get('/provider', isAuthenticated, (req: Request, res: Response) => {
    try {
      const provider = whatsappManager.getPreferredProvider();
      res.json({ provider });
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to get WhatsApp provider' });
    }
  });
  
  // Set WhatsApp provider
  router.post('/provider', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const { provider } = req.body;
      
      if (!provider || !Object.values(WhatsAppProvider).includes(provider)) {
        return res.status(400).json({ message: 'Invalid WhatsApp provider' });
      }
      
      // If changing to Business API, ensure we have credentials
      if (provider === WhatsAppProvider.BusinessAPI) {
        const { apiKey, phoneNumberId } = req.body;
        
        if (!apiKey || !phoneNumberId) {
          return res.status(400).json({ message: 'API key and phone number ID are required for WhatsApp Business API' });
        }
        
        whatsappManager.setBusinessAPICredentials(apiKey, phoneNumberId);
      }
      
      // Disconnect any existing services
      await whatsappManager.disconnectAll();
      
      // Set the new provider
      whatsappManager.setPreferredProvider(provider as WhatsAppProvider);
      
      res.json({ message: 'WhatsApp provider updated successfully', provider });
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to set WhatsApp provider' });
    }
  });
  
  // Initialize WhatsApp service for a specific event
  router.post('/events/:eventId/initialize', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      // Update the event's WhatsApp configuration in the database
      if (req.body.whatsappConfigured !== undefined) {
        const updateData: any = {
          whatsappConfigured: req.body.whatsappConfigured
        };
        
        // For Business API, update credentials
        if (whatsappManager.getPreferredProvider() === WhatsAppProvider.BusinessAPI) {
          if (req.body.whatsappAccessToken) {
            updateData.whatsappAccessToken = req.body.whatsappAccessToken;
          }
          if (req.body.whatsappBusinessPhoneId) {
            updateData.whatsappBusinessPhoneId = req.body.whatsappBusinessPhoneId;
          }
          if (req.body.whatsappBusinessNumber) {
            updateData.whatsappBusinessNumber = req.body.whatsappBusinessNumber;
          }
          if (req.body.whatsappBusinessAccountId) {
            updateData.whatsappBusinessAccountId = req.body.whatsappBusinessAccountId;
          }
        }
        
        // Update event in database
        await db.update(events)
          .set(updateData)
          .where(eq(events.id, eventId));
      }
      
      // Initialize the service
      const service = await whatsappManager.getService(eventId);
      
      // If using Business API, check if credentials are set
      if (whatsappManager.getPreferredProvider() === WhatsAppProvider.BusinessAPI) {
        // Additional validation with Business API credentials could be added here
        res.json({ message: 'WhatsApp Business API initialized successfully', status: 'ready' });
      } else {
        // For Web.js, we need to check for QR code
        const qrCode = service.getQRCode?.() || null;
        
        if (service.isClientReady()) {
          res.json({ message: 'WhatsApp Web.js service is ready', status: 'ready' });
        } else if (qrCode) {
          res.json({ message: 'Scan QR code to authenticate', status: 'qr_needed', qrCode });
        } else {
          res.json({ message: 'Initializing WhatsApp service...', status: 'initializing' });
        }
      }
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to initialize WhatsApp service' });
    }
  });
  
  // Get QR code for WhatsApp Web authentication
  router.get('/events/:eventId/qrcode', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      if (whatsappManager.getPreferredProvider() !== WhatsAppProvider.WebJS) {
        return res.status(400).json({ message: 'QR code is only available with WhatsApp Web.js provider' });
      }
      
      const service = await whatsappManager.getService(eventId);
      const qrCode = service.getQRCode?.() || null;
      
      if (qrCode) {
        res.json({ qrCode });
      } else if (service.isClientReady()) {
        res.json({ message: 'WhatsApp Web.js service is already authenticated', status: 'ready' });
      } else {
        res.json({ message: 'QR code not available yet', status: 'initializing' });
      }
    } catch (error) {
      
      res.status(500).json({ message: 'Failed to get WhatsApp QR code' });
    }
  });
  
  // Send a message to a single recipient
  router.post('/events/:eventId/send', isAuthenticated, checkWhatsAppReady, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const { to, message } = req.body;
      
      if (!to || !message) {
        return res.status(400).json({ message: 'Phone number and message are required' });
      }
      
      const messageId = await whatsappManager.sendTextMessage(eventId, to, message);
      
      res.json({ message: 'Message sent successfully', messageId });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp message';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Send a media message to a single recipient
  router.post('/events/:eventId/send-media', isAuthenticated, checkWhatsAppReady, upload.single('media'), async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const { to, caption } = req.body;
      
      if (!to || !req.file) {
        return res.status(400).json({ message: 'Phone number and media file are required' });
      }
      
      const messageId = await whatsappManager.sendMediaMessage(eventId, to, req.file.path, caption);
      
      res.json({ message: 'Media message sent successfully', messageId });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp media message';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Send a template message (Business API only)
  router.post('/events/:eventId/send-template', isAuthenticated, checkWhatsAppReady, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      if (whatsappManager.getPreferredProvider() !== WhatsAppProvider.BusinessAPI) {
        return res.status(400).json({ message: 'Template messages are only available with WhatsApp Business API' });
      }
      
      const { to, templateName, languageCode, components } = req.body;
      
      if (!to || !templateName) {
        return res.status(400).json({ message: 'Phone number and template name are required' });
      }
      
      const messageId = await whatsappManager.sendTemplateMessage(
        eventId,
        to,
        templateName,
        languageCode || 'en_US',
        components || []
      );
      
      res.json({ message: 'Template message sent successfully', messageId });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send WhatsApp template message';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Send a bulk message to all guests for an event
  router.post('/events/:eventId/send-bulk', isAuthenticated, checkWhatsAppReady, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const { message, filter } = req.body;
      
      if (!message) {
        return res.status(400).json({ message: 'Message is required' });
      }
      
      let eventGuests;
      
      // Get all guests for the event with phone numbers
      const baseQuery = db.select().from(guests).where(eq(guests.eventId, eventId));
      
      // Get all guests for this event
      eventGuests = await baseQuery;
      
      // Apply filters if provided
      if (filter?.rsvpStatus) {
        // Filter in memory
        eventGuests = eventGuests.filter((guest: any) => guest.rsvpStatus === filter.rsvpStatus);
      }
      
      if (!eventGuests || eventGuests.length === 0) {
        return res.status(404).json({ message: 'No guests found for this event' });
      }
      
      // Filter guests with phone numbers
      const guestsWithPhones = eventGuests.filter((guest: any) => guest.phone);
      
      if (guestsWithPhones.length === 0) {
        return res.status(404).json({ message: 'No guests with phone numbers found' });
      }
      
      // Process all guests with phone numbers in batches
      const results = [];
      const batchSize = 5; // Process in batches of 5 to avoid rate limiting
      
      for (let i = 0; i < guestsWithPhones.length; i += batchSize) {
        const batch = guestsWithPhones.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (guest: any) => {
          try {
            // Create personalized message by replacing placeholders
            let personalizedMessage = message;
            personalizedMessage = personalizedMessage.replace(/{name}/g, guest.firstName || '');
            personalizedMessage = personalizedMessage.replace(/{fullName}/g, `${guest.firstName || ''} ${guest.lastName || ''}`.trim());
            
            const messageId = await whatsappManager.sendTextMessage(eventId, guest.phone as string, personalizedMessage);
            
            return {
              guestId: guest.id,
              name: `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
              phone: guest.phone,
              status: 'sent',
              messageId
            };
          } catch (err) {
            const error = err as Error;
            
            
            return {
              guestId: guest.id,
              name: `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
              phone: guest.phone,
              status: 'failed',
              error: error.message
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);
        
        // Add a small delay between batches to prevent rate limiting
        if (i + batchSize < guestsWithPhones.length) {
          await new Promise((resolve, reject) => {
            const timeoutId = setTimeout(resolve, 1000);
            // Add cleanup for request cancellation
            req.on('close', () => {
              clearTimeout(timeoutId);
              reject(new Error('Request cancelled'));
            });
          });
        }
      }
      
      // Compile results
      const successCount = results.filter(r => r.status === 'sent').length;
      const failureCount = results.filter(r => r.status === 'failed').length;
      
      res.json({
        message: `Sent ${successCount} messages, ${failureCount} failed`,
        totalGuests: guestsWithPhones.length,
        successCount,
        failureCount,
        results
      });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send bulk WhatsApp messages';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Check WhatsApp connection status
  router.get('/events/:eventId/status', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      try {
        const service = await whatsappManager.getService(eventId);
        const isReady = service.isClientReady();
        
        if (isReady) {
          res.json({ status: 'connected', provider: whatsappManager.getPreferredProvider() });
        } else if (whatsappManager.getPreferredProvider() === WhatsAppProvider.WebJS) {
          const qrCode = service.getQRCode?.() || null;
          if (qrCode) {
            res.json({ status: 'qr_needed', qrCode, provider: WhatsAppProvider.WebJS });
          } else {
            res.json({ status: 'initializing', provider: WhatsAppProvider.WebJS });
          }
        } else {
          res.json({ status: 'not_connected', provider: whatsappManager.getPreferredProvider() });
        }
      } catch (err) {
        const error = err as Error;
        res.json({ status: 'not_connected', error: error.message, provider: whatsappManager.getPreferredProvider() });
      }
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to check WhatsApp status';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Disconnect WhatsApp service
  router.post('/events/:eventId/disconnect', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      await whatsappManager.disconnectService(eventId);
      
      res.json({ message: 'WhatsApp service disconnected successfully' });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect WhatsApp service';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Update event WhatsApp configuration
  router.post('/events/:eventId/config', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }
      
      const {
        whatsappConfigured,
        whatsappAccessToken,
        whatsappBusinessPhoneId,
        whatsappBusinessNumber,
        whatsappBusinessAccountId,
        whatsappProvider
      } = req.body;
      
      // Validate event exists
      const eventExists = await db.select({ id: events.id })
        .from(events)
        .where(eq(events.id, eventId))
        .then(results => results.length > 0);
        
      if (!eventExists) {
        return res.status(404).json({ message: 'Event not found' });
      }
      
      // Build update object
      const updateData: any = {};
      if (whatsappConfigured !== undefined) updateData.whatsappConfigured = whatsappConfigured;
      if (whatsappAccessToken) updateData.whatsappAccessToken = whatsappAccessToken;
      if (whatsappBusinessPhoneId) updateData.whatsappBusinessPhoneId = whatsappBusinessPhoneId;
      if (whatsappBusinessNumber) updateData.whatsappBusinessNumber = whatsappBusinessNumber;
      if (whatsappBusinessAccountId) updateData.whatsappBusinessAccountId = whatsappBusinessAccountId;
      
      // Update event
      await db.update(events)
        .set(updateData)
        .where(eq(events.id, eventId));
      
      // If provider is specified, update the manager
      if (whatsappProvider && Object.values(WhatsAppProvider).includes(whatsappProvider as WhatsAppProvider)) {
        // Disconnect existing services
        await whatsappManager.disconnectService(eventId);
        
        // Set the provider
        whatsappManager.setPreferredProvider(whatsappProvider as WhatsAppProvider);
        
        // If Business API, set the credentials
        if (whatsappProvider === WhatsAppProvider.BusinessAPI && whatsappAccessToken && whatsappBusinessPhoneId) {
          whatsappManager.setBusinessAPICredentials(whatsappAccessToken, whatsappBusinessPhoneId);
        }
      }
      
      res.json({ 
        message: 'WhatsApp configuration updated successfully',
        provider: whatsappManager.getPreferredProvider()
      });
    } catch (error) {
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to update WhatsApp configuration';
      res.status(500).json({ message: errorMessage });
    }
  });
  
  // Mount the router
  app.use('/api/whatsapp', router);
}