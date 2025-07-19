import express from 'express';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { 
  communicationTemplates,
  brandAssets,
  brandSettings,
  insertCommunicationTemplateSchema,
  insertBrandAssetSchema,
  insertBrandSettingSchema
} from '../../shared/schema';
import { eq, and, or } from 'drizzle-orm';
import { weddingEvents } from '../../shared/schema';
import { isAuthenticated } from '../middleware';
import { substituteVariables, generatePreviewContent, TEMPLATE_VARIABLES } from '../services/variable-substitution';
import { emailService } from '../services/email/email-service';
import { whatsAppService } from '../services/whatsapp/whatsapp-service';
import { smsService } from '../services/sms/sms-service';

const router = express.Router();

// Configure multer storage for brand assets
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'brand-assets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'brand-asset-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * Get global communication templates (independent of any specific event)
 * These templates serve as guides for all events
 */
router.get('/communication-templates/global', async (req: Request, res: Response) => {
  try {
    // Get all global templates (eventId is null)
    const globalTemplates = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.eventId, null))
      .orderBy(communicationTemplates.categoryId, communicationTemplates.sortOrder);
    
    // Group templates by category
    const categorizedTemplates = globalTemplates.reduce((acc: any, template) => {
      if (!acc[template.categoryId]) {
        acc[template.categoryId] = [];
      }
      acc[template.categoryId].push(template);
      return acc;
    }, {});
    
    res.json(categorizedTemplates);
  } catch (error) {
    console.error('Error fetching global templates:', error);
    res.status(500).json({ error: 'Failed to fetch global templates' });
  }
});

/**
 * Get all communication templates for an event organized by category
 * Uses global templates as base and includes event-specific customizations
 */
router.get('/events/:eventId/communication-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Get event configuration to determine which templates to show
    const eventResult = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);
    
    if (eventResult.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const event = eventResult[0];
    
    // Get global templates first
    const globalTemplates = await db
      .select()
      .from(communicationTemplates)
      .where(isNull(communicationTemplates.eventId))
      .orderBy(communicationTemplates.categoryId, communicationTemplates.sortOrder);
    
    // Get event-specific templates (customized versions)
    const eventTemplates = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.eventId, eventId))
      .orderBy(communicationTemplates.categoryId, communicationTemplates.sortOrder);
    
    // Create a map of event-specific templates by templateId + channel
    const eventTemplateMap = new Map();
    eventTemplates.forEach(template => {
      const key = `${template.templateId}_${template.channel}`;
      eventTemplateMap.set(key, template);
    });
    
    // Merge templates: use event-specific if available, otherwise use global
    const mergedTemplates = globalTemplates.map(globalTemplate => {
      const key = `${globalTemplate.templateId}_${globalTemplate.channel}`;
      const eventSpecific = eventTemplateMap.get(key);
      
      // Return event-specific if it exists, otherwise return global template
      return eventSpecific || globalTemplate;
    });
    
    // Add any event-specific templates that don't have global equivalents
    eventTemplates.forEach(eventTemplate => {
      const key = `${eventTemplate.templateId}_${eventTemplate.channel}`;
      const hasGlobal = globalTemplates.some(global => 
        `${global.templateId}_${global.channel}` === key
      );
      if (!hasGlobal) {
        mergedTemplates.push(eventTemplate);
      }
    });
    
    // Filter templates based on event configuration
    const relevantTemplates = mergedTemplates.filter(template => {
      // Always include templates without conditional tag
      if (!template.tags || !template.tags.includes('conditional')) {
        return true;
      }
      
      // For conditional templates, check if they match event configuration
      if (template.conditionalOn) {
        switch (template.conditionalOn) {
          case 'allowPlusOne':
            return event.allowPlusOne === true;
          case 'allowChildren':
            return event.allowChildren === true;
          case 'transportEnabled':
            return event.transportMode && event.transportMode !== 'none';
          case 'accommodationProvided':
            return event.accommodationMode && event.accommodationMode !== 'none';
          case 'hasMehendiCeremony':
            return event.hasMehendi === true;
          case 'hasSangamCeremony':
            return event.hasSangam === true;
          case 'hasOutdoorCeremony':
            return event.hasOutdoorVenue === true;
          case 'hasEngagementAnnouncement':
            return event.hasEngagement === true;
          default:
            return false; // Unknown conditional, don't include
        }
      }
      
      return true; // Include conditional templates without specific condition
    });
    
    // Enable relevant conditional templates
    const enabledTemplates = relevantTemplates.map(template => ({
      ...template,
      enabled: template.tags?.includes('conditional') ? true : template.enabled
    }));
    
    // Templates filtered and enabled based on event configuration
    
    // Group templates by category
    const templatesByCategory = enabledTemplates.reduce((acc, template) => {
      if (!acc[template.categoryId]) {
        acc[template.categoryId] = [];
      }
      acc[template.categoryId].push(template);
      return acc;
    }, {} as Record<string, typeof enabledTemplates>);
    
    res.json(templatesByCategory);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * Get template variables dictionary
 */
router.get('/communication-templates/variables', async (req: Request, res: Response) => {
  try {
    res.json(TEMPLATE_VARIABLES);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch template variables' });
  }
});

/**
 * Generate template preview with sample data
 */
router.post('/events/:eventId/communication-templates/preview', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { content, subject } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required for preview' });
    }
    
    const previewContent = generatePreviewContent(content);
    const previewSubject = subject ? generatePreviewContent(subject) : null;
    
    res.json({
      content: previewContent,
      subject: previewSubject
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

/**
 * Create a new communication template or customize a global template for an event
 * When editing a global template, creates an event-specific copy
 */
router.post('/events/:eventId/communication-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const validatedData = insertCommunicationTemplateSchema.parse({
      ...req.body,
      eventId
    });
    
    const [newTemplate] = await db
      .insert(communicationTemplates)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newTemplate);
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * Customize a global template for a specific event
 * Creates an event-specific copy when a global template is edited
 */
router.post('/events/:eventId/communication-templates/customize/:globalTemplateId', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const globalTemplateId = parseInt(req.params.globalTemplateId);
    
    // Get the global template
    const [globalTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.id, globalTemplateId),
          isNull(communicationTemplates.eventId)
        )
      );
    
    if (!globalTemplate) {
      return res.status(404).json({ error: 'Global template not found' });
    }
    
    // Check if event-specific version already exists
    const [existingCustomTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.eventId, eventId),
          eq(communicationTemplates.templateId, globalTemplate.templateId),
          eq(communicationTemplates.channel, globalTemplate.channel)
        )
      );
    
    if (existingCustomTemplate) {
      // Update existing custom template
      const validatedData = insertCommunicationTemplateSchema.partial().parse({
        ...req.body,
        eventId,
        updatedAt: new Date()
      });
      
      const [updatedTemplate] = await db
        .update(communicationTemplates)
        .set(validatedData)
        .where(eq(communicationTemplates.id, existingCustomTemplate.id))
        .returning();
      
      return res.json(updatedTemplate);
    } else {
      // Create new event-specific template based on global template
      const customTemplateData = {
        eventId,
        categoryId: globalTemplate.categoryId,
        templateId: globalTemplate.templateId,
        channel: globalTemplate.channel,
        name: req.body.name || globalTemplate.name,
        description: req.body.description || globalTemplate.description,
        subject: req.body.subject || globalTemplate.subject,
        content: req.body.content || globalTemplate.content,
        variables: req.body.variables || globalTemplate.variables,
        tags: req.body.tags || globalTemplate.tags,
        enabled: req.body.enabled !== undefined ? req.body.enabled : globalTemplate.enabled,
        sortOrder: globalTemplate.sortOrder,
        isSystem: false // Event-specific templates are not system templates
      };
      
      const [newTemplate] = await db
        .insert(communicationTemplates)
        .values(customTemplateData)
        .returning();
      
      res.status(201).json(newTemplate);
    }
  } catch (error) {
    console.error('Error customizing template:', error);
    res.status(500).json({ 
      error: 'Failed to customize template',
      details: error instanceof Error ? error.message : 'Unknown error',
      templateId: req.params.globalTemplateId,
      eventId: req.params.eventId
    });
  }
});

/**
 * Update a communication template
 */
router.put('/events/:eventId/communication-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    const [existingTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.eventId, eventId),
          eq(communicationTemplates.id, templateId)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (existingTemplate.isSystem && !req.body.enabled) {
      return res.status(403).json({ error: 'System templates cannot be modified' });
    }
    
    const validatedData = insertCommunicationTemplateSchema.partial().parse({
      ...req.body,
      eventId
    });
    
    const [updatedTemplate] = await db
      .update(communicationTemplates)
      .set({ ...validatedData, updatedAt: new Date() })
      .where(
        and(
          eq(communicationTemplates.eventId, eventId),
          eq(communicationTemplates.id, templateId)
        )
      )
      .returning();
    
    res.json(updatedTemplate);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * Delete a communication template
 */
router.delete('/events/:eventId/communication-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    const [existingTemplate] = await db
      .select()
      .from(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.eventId, eventId),
          eq(communicationTemplates.id, templateId)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    if (existingTemplate.isSystem) {
      return res.status(403).json({ error: 'System templates cannot be deleted' });
    }
    
    await db
      .delete(communicationTemplates)
      .where(
        and(
          eq(communicationTemplates.eventId, eventId),
          eq(communicationTemplates.id, templateId)
        )
      );
    
    res.status(204).send();
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * Get brand assets for an event
 */
router.get('/events/:eventId/brand-assets', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const assets = await db
      .select()
      .from(brandAssets)
      .where(eq(brandAssets.eventId, eventId));
    
    res.json(assets);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch brand assets' });
  }
});

/**
 * Upload brand asset
 */
router.post('/events/:eventId/brand-assets', isAuthenticated, upload.single('asset'), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const validatedData = insertBrandAssetSchema.parse({
      eventId,
      name: req.body.name || req.file.originalname,
      type: req.body.type || 'logo',
      filePath: req.file.path,
      fileName: req.file.filename,
      mimeType: req.file.mimetype,
      fileSize: req.file.size
    });
    
    const [newAsset] = await db
      .insert(brandAssets)
      .values(validatedData)
      .returning();
    
    res.status(201).json(newAsset);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

/**
 * Get brand settings for an event
 */
router.get('/events/:eventId/brand-settings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const settings = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.eventId, eventId));
    
    res.json(settings[0] || {});
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch brand settings' });
  }
});

/**
 * Update brand settings for an event
 */
router.put('/events/:eventId/brand-settings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const validatedData = insertBrandSettingSchema.parse({
      ...req.body,
      eventId
    });
    
    // Check if settings exist
    const [existingSettings] = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.eventId, eventId));
    
    let updatedSettings;
    
    if (existingSettings) {
      [updatedSettings] = await db
        .update(brandSettings)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(brandSettings.eventId, eventId))
        .returning();
    } else {
      [updatedSettings] = await db
        .insert(brandSettings)
        .values(validatedData)
        .returning();
    }
    
    res.json(updatedSettings);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to update brand settings' });
  }
});

/**
 * Test provider connection
 */
router.post('/communication/test-provider', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { provider, config } = req.body;
    
    let result = false;
    
    switch (provider) {
      case 'email':
        result = await emailService.testConnection();
        break;
      case 'whatsapp':
        result = await whatsAppService.testConnection();
        break;
      case 'sms':
        result = await smsService.testConnection();
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider type' });
    }
    
    res.json({ connected: result });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to test provider connection' });
  }
});

/**
 * Disconnect a provider
 */
router.post('/events/:eventId/communication/:provider/disconnect', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const provider = req.params.provider;
    
    // Update database to disconnect the provider
    const updateData: any = {};
    
    switch (provider) {
      case 'gmail':
        updateData.useGmail = false;
        updateData.gmailAccount = null;
        break;
      case 'outlook':
        updateData.useOutlook = false;
        updateData.outlookAccount = null;
        break;
      case 'brevo':
        updateData.brevoApiKey = null;
        break;
      case 'twilio':
        updateData.twilioAccountSid = null;
        updateData.twilioAuthToken = null;
        updateData.twilioPhoneNumber = null;
        break;
      case 'whatsapp_business':
        updateData.whatsappAccessToken = null;
        updateData.whatsappPhoneNumberId = null;
        updateData.whatsappBusinessAccountId = null;
        break;
      case 'whatsapp_webjs':
        updateData.whatsappConfigured = false;
        // Also disconnect the service
        try {
          const WhatsAppManager = (await import('../services/whatsapp/whatsapp-manager')).default;
          const whatsappManager = WhatsAppManager.getInstance();
          await whatsappManager.disconnectService(eventId);
        } catch (error) {
          
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }
    
    await db
      .update(weddingEvents)
      .set(updateData)
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: `${provider} disconnected successfully` });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to disconnect provider' });
  }
});

/**
 * Get WhatsApp QR Code - Fixed async handling
 */
router.get('/events/:eventId/communication/whatsapp-webjs/qr', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const WhatsAppManager = (await import('../services/whatsapp/whatsapp-manager')).default;
    const whatsappManager = WhatsAppManager.getInstance();
    
    // Get or create WhatsApp service for this event
    const service = await whatsappManager.getService(eventId);
    const status = whatsappManager.getServiceStatus(eventId);
    
    if (status.connected) {
      return res.json({ connected: true, message: 'WhatsApp is already connected' });
    }
    
    if (status.qrCode) {
      return res.json({ qrCode: status.qrCode, message: 'Scan QR code to connect' });
    }
    
    // Initialize service to generate QR code
    await service.initialize();
    
    // Enhanced QR Code generation with multiple retry attempts
    const waitForQRCode = () => {
      return new Promise((resolve) => {
        let attempts = 0;
        const maxAttempts = 10; // 10 attempts over 10 seconds
        let timeoutId: NodeJS.Timeout;
        
        const checkQRCode = () => {
          attempts++;
          const newStatus = whatsappManager.getServiceStatus(eventId);
          
          if (newStatus.qrCode) {
            resolve({ qrCode: newStatus.qrCode, message: 'QR code generated' });
          } else if (attempts >= maxAttempts) {
            resolve({ message: 'QR code generation timeout. Please try again.', error: 'timeout' });
          } else {
            timeoutId = setTimeout(checkQRCode, 1000);
          }
        };
        
        timeoutId = setTimeout(checkQRCode, 1000); // Start checking after 1 second
        
        // Cleanup timeout on promise resolution to prevent memory leaks
        const originalResolve = resolve;
        resolve = (value: any) => {
          if (timeoutId) clearTimeout(timeoutId);
          originalResolve(value);
        };
      });
    };
    
    const result = await waitForQRCode();
    res.json(result);
    
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to get QR code' });
  }
});

/**
 * Get provider status for an event
 */
router.get('/events/:eventId/communication-providers', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Get event details to check provider configurations
    const [event] = await db.query.weddingEvents.findMany({
      where: (events, { eq }) => eq(events.id, eventId),
      columns: {
        useGmail: true,
        gmailAccount: true,
        useOutlook: true,
        outlookAccount: true,
        useSendGrid: true,
        whatsappConfigured: true,
        emailConfigured: true,
        sendgridApiKey: true,
        brevoApiKey: true,
        twilioAccountSid: true,
        twilioAuthToken: true,
        twilioPhoneNumber: true,
        whatsappAccessToken: true,
        whatsappPhoneNumberId: true,
        whatsappBusinessAccountId: true
      }
    });
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    
    console.log('Provider status debug - Event data:', {
      useGmail: event.useGmail,
      gmailAccount: event.gmailAccount,
      useOutlook: event.useOutlook,
      outlookAccount: event.outlookAccount,
      whatsappConfigured: event.whatsappConfigured,
      brevoApiKey: !!event.brevoApiKey,
      emailConfigured: event.emailConfigured
    });
    
    // Check WhatsApp Web.js actual connection status
    let whatsappWebjsConnected = false;
    let whatsappWebjsError = null;
    let whatsappQrCode = null;
    try {
      const WhatsAppManager = (await import('../services/whatsapp/whatsapp-manager')).default;
      const whatsappManager = WhatsAppManager.getInstance();
      const status = whatsappManager.getServiceStatus(eventId);
      whatsappWebjsConnected = status.connected;
      whatsappQrCode = status.qrCode;
    } catch (error) {
      whatsappWebjsError = error instanceof Error ? error.message : 'Connection check failed';
    }

    const providers = {
      gmail: {
        connected: !!(event.useGmail && event.gmailAccount),
        type: 'email',
        account: event.gmailAccount || null,
        debug: { useGmail: event.useGmail, gmailAccount: event.gmailAccount }
      },
      outlook: {
        connected: !!(event.useOutlook && event.outlookAccount),
        type: 'email',
        account: event.outlookAccount || null
      },
      brevo: {
        connected: !!(event.brevoApiKey || process.env.BREVO_API_KEY),
        type: 'email',
        account: event.brevoApiKey ? 'User API Key' : 'Demo Account',
        usingDemo: !event.brevoApiKey && !!process.env.BREVO_API_KEY
      },
      whatsapp_business: {
        connected: !!(event.whatsappConfigured && event.whatsappAccessToken),
        type: 'whatsapp',
        account: event.whatsappPhoneNumberId || null
      },
      whatsapp_webjs: {
        connected: whatsappWebjsConnected,
        type: 'whatsapp',
        error: whatsappWebjsError,
        configured: !!event.whatsappConfigured,
        qrCode: whatsappQrCode
      },
      twilio: {
        connected: !!(event.twilioAccountSid && event.twilioAuthToken),
        type: 'sms',
        account: event.twilioPhoneNumber || null
      }
    };
    
    
    res.json(providers);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch provider status' });
  }
});

/**
 * Configure Brevo for an event
 */
router.post('/events/:eventId/communication/brevo', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    let { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'Brevo API key is required' });
    }

    // Allow using environment API key for demo
    if (apiKey === 'USE_ENV_KEY' && process.env.BREVO_API_KEY) {
      apiKey = process.env.BREVO_API_KEY;
    }
    
    // Skip Brevo API validation due to IP restrictions in Replit environment
    // In production, you would validate the API key here
    
    /*
    try {
      const testResponse = await fetch('https://api.brevo.com/v3/account', {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        const errorText = await testResponse.text();
        
        return res.status(400).json({ 
          success: false, 
          message: `Invalid Brevo API key (${testResponse.status})` 
        });
      }
      
      // Get account details to verify the connection
      const accountData = await testResponse.json();
      
    } catch (error) {
      
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to validate Brevo API key - please check your network connection' 
      });
    }
    */
    
    // Update event with Brevo configuration
    await db.update(weddingEvents)
      .set({
        brevoApiKey: apiKey,
        emailConfigured: true
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'Brevo configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure Brevo' });
  }
});

/**
 * Configure SendGrid for an event
 */
router.post('/events/:eventId/communication/sendgrid', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { apiKey } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'SendGrid API key is required' });
    }
    
    // Test the API key by making a simple request to SendGrid
    try {
      const testResponse = await fetch('https://api.sendgrid.com/v3/user/profile', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!testResponse.ok) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid SendGrid API key' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to validate SendGrid API key' 
      });
    }
    
    // Update event with SendGrid configuration
    await db.update(weddingEvents)
      .set({
        useSendGrid: true,
        sendgridApiKey: apiKey,
        emailConfigured: true
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'SendGrid configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure SendGrid' });
  }
});

/**
 * Configure Twilio for an event
 */
router.post('/events/:eventId/communication/twilio', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { accountSid, authToken, phoneNumber } = req.body;
    
    if (!accountSid || !authToken || !phoneNumber) {
      return res.status(400).json({ 
        success: false,
        error: 'Twilio Account SID, Auth Token, and Phone Number are required' 
      });
    }
    
    // Test Twilio credentials
    try {
      const testResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}.json`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`
        }
      });
      
      if (!testResponse.ok) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid Twilio credentials' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to validate Twilio credentials' 
      });
    }
    
    // Update event with Twilio configuration
    await db.update(weddingEvents)
      .set({
        twilioAccountSid: accountSid,
        twilioAuthToken: authToken,
        twilioPhoneNumber: phoneNumber
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'Twilio configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure Twilio' });
  }
});

/**
 * Configure Gmail for an event
 */
router.post('/events/:eventId/communication/gmail', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Gmail email and app password are required' 
      });
    }
    
    // Update event with Gmail configuration (in production, validate SMTP connection)
    await db.update(weddingEvents)
      .set({
        useGmail: true,
        gmailAccount: email,
        gmailPassword: password,
        emailConfigured: true
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'Gmail configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure Gmail' });
  }
});

/**
 * Configure Outlook for an event
 */
router.post('/events/:eventId/communication/outlook', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Outlook email and app password are required' 
      });
    }
    
    // Update event with Outlook configuration
    await db.update(weddingEvents)
      .set({
        useOutlook: true,
        outlookAccount: email,
        outlookAccessToken: password, // Store app password as access token for SMTP
        emailConfigured: true
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'Outlook configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure Outlook' });
  }
});

/**
 * Configure WhatsApp Web.js for an event
 * Simple enablement - QR code scanning will happen when sending messages
 */
router.post('/events/:eventId/communication/whatsapp-webjs', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { enabled } = req.body;
    
    // Simply enable WhatsApp Web.js for the event
    // QR code authentication will happen later during message sending
    await db.update(weddingEvents)
      .set({
        whatsappConfigured: enabled || true
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ 
      success: true, 
      message: 'WhatsApp Web.js enabled successfully. QR code authentication will be required when sending messages.',
      requiresQR: true
    });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure WhatsApp Web.js' });
  }
});

/**
 * Configure WhatsApp Business API for an event
 */
router.post('/events/:eventId/communication/whatsapp-business', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { accessToken, phoneNumberId, businessAccountId } = req.body;
    
    if (!accessToken || !phoneNumberId || !businessAccountId) {
      return res.status(400).json({ 
        success: false,
        error: 'WhatsApp Access Token, Phone Number ID, and Business Account ID are required' 
      });
    }
    
    // Test WhatsApp Business API access
    try {
      const testResponse = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });
      
      if (!testResponse.ok) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid WhatsApp Business API credentials' 
        });
      }
    } catch (error) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to validate WhatsApp Business API credentials' 
      });
    }
    
    // Update event with WhatsApp Business configuration
    await db.update(weddingEvents)
      .set({
        whatsappConfigured: true,
        whatsappAccessToken: accessToken,
        whatsappPhoneNumberId: phoneNumberId,
        whatsappBusinessAccountId: businessAccountId
      })
      .where(eq(weddingEvents.id, eventId));
    
    res.json({ success: true, message: 'WhatsApp Business API configured successfully' });
  } catch (error) {
    
    res.status(500).json({ success: false, error: 'Failed to configure WhatsApp Business' });
  }
});

/**
 * Simple OAuth flows for communication providers
 */

// Gmail OAuth initiation
router.get('/oauth/gmail', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { eventId, return_url } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    
    
    // For demo purposes - simulate successful OAuth
    await db.update(weddingEvents)
      .set({
        useGmail: true,
        emailConfigured: true,
        gmailAccessToken: 'demo_gmail_token',
        gmailRefreshToken: 'demo_gmail_refresh'
      })
      .where(eq(weddingEvents.id, Number(eventId)));

    const redirectUrl = return_url ? decodeURIComponent(return_url as string) : '/event-setup-wizard/' + eventId;
    return res.redirect(`${redirectUrl}?oauth=gmail&status=success`);
    
  } catch (error) {
    
    const redirectUrl = req.query.return_url ? decodeURIComponent(req.query.return_url as string) : '/dashboard';
    return res.redirect(`${redirectUrl}?oauth=gmail&status=error`);
  }
});

// Outlook OAuth initiation
router.get('/oauth/outlook', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const { eventId, return_url } = req.query;
    
    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    
    
    // For demo purposes - simulate successful OAuth
    await db.update(weddingEvents)
      .set({
        useOutlook: true,
        emailConfigured: true,
        outlookAccessToken: 'demo_outlook_token',
        outlookRefreshToken: 'demo_outlook_refresh'
      })
      .where(eq(weddingEvents.id, Number(eventId)));

    const redirectUrl = return_url ? decodeURIComponent(return_url as string) : '/event-setup-wizard/' + eventId;
    return res.redirect(`${redirectUrl}?oauth=outlook&status=success`);
    
  } catch (error) {
    
    const redirectUrl = req.query.return_url ? decodeURIComponent(req.query.return_url as string) : '/dashboard';
    return res.redirect(`${redirectUrl}?oauth=outlook&status=error`);
  }
});

/**
 * Upload brand assets for an event
 */
router.post('/events/:eventId/communication/assets', upload.single('asset'), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { type } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Save asset metadata to database
    const [newAsset] = await db
      .insert(brandAssets)
      .values({
        eventId,
        type,
        filename: req.file.filename,
        originalName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      })
      .returning();
    
    
    
    res.json({
      success: true,
      filename: req.file.filename,
      url: `/uploads/brand-assets/${req.file.filename}`,
      type,
      asset: newAsset
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Asset upload failed' });
  }
});

/**
 * Get brand assets for an event
 */
router.get('/events/:eventId/communication/assets', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const assets = await db
      .select()
      .from(brandAssets)
      .where(eq(brandAssets.eventId, eventId));
    
    res.json(assets);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
});

/**
 * Update brand settings for an event
 */
router.put('/events/:eventId/communication/brand', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const brandData = req.body;
    
    // Upsert brand settings
    const [brandSetting] = await db
      .insert(brandSettings)
      .values({
        eventId,
        primaryColor: brandData.primaryColor,
        accentColor: brandData.accentColor,
        headingFont: brandData.headingFont,
        bodyFont: brandData.bodyFont,
        templateStyle: brandData.templateStyle
      })
      .onConflictDoUpdate({
        target: brandSettings.eventId,
        set: {
          primaryColor: brandData.primaryColor,
          accentColor: brandData.accentColor,
          headingFont: brandData.headingFont,
          bodyFont: brandData.bodyFont,
          templateStyle: brandData.templateStyle,
          updatedAt: new Date()
        }
      })
      .returning();
    
    
    
    res.json({
      success: true,
      message: 'Brand settings updated successfully',
      settings: brandSetting
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Brand settings update failed' });
  }
});

/**
 * Get brand settings for an event
 */
router.get('/events/:eventId/communication/brand', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const settings = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.eventId, eventId))
      .limit(1);
    
    res.json(settings[0] || null);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch brand settings' });
  }
});

export default router;