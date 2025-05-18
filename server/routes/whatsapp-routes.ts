import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { isAuthenticated, isAdmin } from '../middleware';
import WhatsAppManager from '../services/whatsapp/whatsapp-manager';
import { WhatsAppProvider } from '../services/whatsapp/whatsapp-factory';
import multer from 'multer';
import { db } from '../db';
import { guests } from '@shared/schema';
import { eq } from 'drizzle-orm';

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

// Function to register WhatsApp routes
export function registerWhatsAppRoutes(app: express.Express): void {
  const router = express.Router();
  const whatsappManager = WhatsAppManager.getInstance();
  
  // Middleware to check WhatsApp service readiness
  const checkWhatsAppReady = async (req: Request, res: Response, next: Function) => {
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
      console.error('Error checking WhatsApp service readiness:', error);
      res.status(500).json({ message: 'Failed to check WhatsApp service readiness' });
    }
  };
  
  // Get WhatsApp provider and connection status
  router.get('/provider', isAuthenticated, (req: Request, res: Response) => {
    try {
      const provider = whatsappManager.getPreferredProvider();
      res.json({ provider });
    } catch (error) {
      console.error('Error getting WhatsApp provider:', error);
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
      console.error('Error setting WhatsApp provider:', error);
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
      console.error('Error initializing WhatsApp service:', error);
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
      console.error('Error getting WhatsApp QR code:', error);
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
      console.error('Error sending WhatsApp message:', error);
      res.status(500).json({ message: 'Failed to send WhatsApp message' });
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
      console.error('Error sending WhatsApp media message:', error);
      res.status(500).json({ message: 'Failed to send WhatsApp media message' });
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
      console.error('Error sending WhatsApp template message:', error);
      res.status(500).json({ message: 'Failed to send WhatsApp template message' });
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
      
      // Get all guests for the event with phone numbers
      const guestQuery = db.select().from(guests).where(eq(guests.eventId, eventId));
      
      // Apply filters if provided
      if (filter?.rsvpStatus) {
        guestQuery.where(eq(guests.rsvpStatus, filter.rsvpStatus));
      }
      
      const eventGuests = await guestQuery;
      
      if (!eventGuests || eventGuests.length === 0) {
        return res.status(404).json({ message: 'No guests found for this event' });
      }
      
      // Filter guests with phone numbers
      const guestsWithPhones = eventGuests.filter(guest => guest.phone);
      
      if (guestsWithPhones.length === 0) {
        return res.status(404).json({ message: 'No guests with phone numbers found' });
      }
      
      // Send messages in parallel with rate limiting
      const results = [];
      const batchSize = 5; // Process in batches of 5
      
      for (let i = 0; i < guestsWithPhones.length; i += batchSize) {
        const batch = guestsWithPhones.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (guest) => {
          try {
            // Create personalized message by replacing placeholders
            let personalizedMessage = message;
            personalizedMessage = personalizedMessage.replace('{name}', guest.firstName || '');
            personalizedMessage = personalizedMessage.replace('{fullName}', `${guest.firstName || ''} ${guest.lastName || ''}`.trim());
            
            const messageId = await whatsappManager.sendTextMessage(eventId, guest.phone!, personalizedMessage);
            
            return {
              guestId: guest.id,
              name: `${guest.firstName || ''} ${guest.lastName || ''}`.trim(),
              phone: guest.phone,
              status: 'sent',
              messageId
            };
          } catch (error) {
            console.error(`Error sending to guest ${guest.id}:`, error);
            
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
          await new Promise(resolve => setTimeout(resolve, 1000));
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
      console.error('Error sending bulk WhatsApp messages:', error);
      res.status(500).json({ message: 'Failed to send bulk WhatsApp messages' });
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
      } catch (error) {
        res.json({ status: 'not_connected', error: error.message, provider: whatsappManager.getPreferredProvider() });
      }
    } catch (error) {
      console.error('Error checking WhatsApp status:', error);
      res.status(500).json({ message: 'Failed to check WhatsApp status' });
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
      console.error('Error disconnecting WhatsApp service:', error);
      res.status(500).json({ message: 'Failed to disconnect WhatsApp service' });
    }
  });
  
  // Mount the router
  app.use('/api/whatsapp', router);
}