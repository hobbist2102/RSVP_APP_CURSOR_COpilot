import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { db } from '../db';
import { 
  emailTemplates, 
  emailTemplateStyles, 
  emailAssets,
  emailSignatures,
  insertEmailTemplateSchema,
  insertEmailTemplateStyleSchema,
  insertEmailAssetSchema,
  insertEmailSignatureSchema
} from '@shared/schema';
import { weddingEvents } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';
import { z } from 'zod';

const router = express.Router();

// Configure file upload with multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'email-assets');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and SVG files are allowed.') as any);
    }
  }
});

/**
 * Get default system templates to bootstrap email template management
 */
async function getDefaultTemplates() {
  return [
    {
      name: 'RSVP Invitation',
      description: 'Default template for sending RSVP invitations',
      subject: '{{eventName}} - You\'re Invited!',
      category: 'invitation',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
            <img src="{{headerLogo}}" alt="{{eventName}}" style="max-width: 200px; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0;">You're Invited!</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
            <p>Dear {{guestName}},</p>
            
            <p>{{coupleName}} would be honored to have you join them in celebrating their wedding!</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
              <h2 style="margin-top: 0; color: #333;">Event Details</h2>
              <p><strong>Date:</strong> {{eventDate}}</p>
              <p><strong>Location:</strong> {{eventLocation}}</p>
            </div>
            
            <p>Please let us know if you'll be able to attend by clicking the button below:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{rsvpLink}}" style="display: inline-block; background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">RSVP Now</a>
            </div>
            
            <p>We kindly request your response by {{rsvpDeadline}}.</p>
            
            <p>If you have any questions, please don't hesitate to contact us.</p>
            
            <p>We hope to see you there!</p>
            
            <p>Warm regards,<br>{{coupleName}}</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>{{footerText}}</p>
          </div>
        </div>
      `,
      bodyText: `
You're Invited!

Dear {{guestName}},

{{coupleName}} would be honored to have you join them in celebrating their wedding!

Event Details:
Date: {{eventDate}}
Location: {{eventLocation}}

Please let us know if you'll be able to attend by visiting:
{{rsvpLink}}

We kindly request your response by {{rsvpDeadline}}.

If you have any questions, please don't hesitate to contact us.

We hope to see you there!

Warm regards,
{{coupleName}}
      `,
      isDefault: true,
      isSystem: true,
    },
    {
      name: 'RSVP Confirmation',
      description: 'Confirmation sent after a guest RSVPs',
      subject: 'Thank You for Your RSVP - {{eventName}}',
      category: 'confirmation',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
            <img src="{{headerLogo}}" alt="{{eventName}}" style="max-width: 200px; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0;">RSVP Confirmation</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
            <p>Dear {{guestName}},</p>
            
            <p>Thank you for your RSVP to {{coupleName}}'s wedding celebration.</p>
            
            <div style="background-color: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
              <h2 style="margin-top: 0; color: #333;">Your Response</h2>
              <p><strong>Status:</strong> {{rsvpStatus}}</p>
              <p><strong>Ceremonies:</strong> {{ceremoniesList}}</p>
              {{#if hasPlusOne}}
              <p><strong>Plus One:</strong> {{plusOneName}}</p>
              {{/if}}
            </div>
            
            <p>We have recorded your preferences and will be in touch with more details as the event approaches.</p>
            
            <p>If you need to update your RSVP, please use the following link:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{updateRsvpLink}}" style="display: inline-block; background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Update RSVP</a>
            </div>
            
            <p>We're looking forward to celebrating with you!</p>
            
            <p>Warm regards,<br>{{coupleName}}</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>{{footerText}}</p>
          </div>
        </div>
      `,
      bodyText: `
RSVP Confirmation

Dear {{guestName}},

Thank you for your RSVP to {{coupleName}}'s wedding celebration.

Your Response:
Status: {{rsvpStatus}}
Ceremonies: {{ceremoniesList}}
{{#if hasPlusOne}}
Plus One: {{plusOneName}}
{{/if}}

We have recorded your preferences and will be in touch with more details as the event approaches.

If you need to update your RSVP, please visit:
{{updateRsvpLink}}

We're looking forward to celebrating with you!

Warm regards,
{{coupleName}}
      `,
      isDefault: true,
      isSystem: true,
    },
    {
      name: 'Travel Details Request',
      description: 'Template for requesting travel details from guests',
      subject: 'Please Share Your Travel Details - {{eventName}}',
      category: 'travel',
      bodyHtml: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f8f8; padding: 20px; text-align: center;">
            <img src="{{headerLogo}}" alt="{{eventName}}" style="max-width: 200px; margin-bottom: 20px;">
            <h1 style="color: #D4AF37; margin: 0;">Travel Information</h1>
          </div>
          
          <div style="padding: 20px; border: 1px solid #ddd; background-color: #fff;">
            <p>Dear {{guestName}},</p>
            
            <p>Thank you for confirming your attendance to {{coupleName}}'s wedding celebration!</p>
            
            <p>To help us arrange your stay and transportation, we'd like to request some additional information about your travel plans.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="{{travelDetailsLink}}" style="display: inline-block; background-color: #D4AF37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold;">Provide Travel Details</a>
            </div>
            
            <p>This information will help us with:</p>
            <ul>
              <li>Arranging transportation from the airport/station to the venue</li>
              <li>Coordinating accommodation check-in</li>
              <li>Ensuring a smooth experience for you throughout the event</li>
            </ul>
            
            <p>Please complete this information by {{travelInfoDeadline}}.</p>
            
            <p>If you have any questions or special requirements, please don't hesitate to contact us.</p>
            
            <p>Thank you!</p>
            
            <p>Warm regards,<br>{{coupleName}}</p>
          </div>
          
          <div style="background-color: #f8f8f8; padding: 15px; text-align: center; font-size: 12px; color: #666;">
            <p>{{footerText}}</p>
          </div>
        </div>
      `,
      bodyText: `
Travel Information

Dear {{guestName}},

Thank you for confirming your attendance to {{coupleName}}'s wedding celebration!

To help us arrange your stay and transportation, we'd like to request some additional information about your travel plans.

Please provide your travel details here:
{{travelDetailsLink}}

This information will help us with:
- Arranging transportation from the airport/station to the venue
- Coordinating accommodation check-in
- Ensuring a smooth experience for you throughout the event

Please complete this information by {{travelInfoDeadline}}.

If you have any questions or special requirements, please don't hesitate to contact us.

Thank you!

Warm regards,
{{coupleName}}
      `,
      isDefault: true,
      isSystem: true,
    }
  ];
}

/**
 * Get default email template styles to bootstrap the system
 */
async function getDefaultStyles() {
  return [
    {
      name: 'Classic Gold',
      description: 'A classic wedding theme with gold accents',
      headerBackground: '#FFFFFF',
      bodyBackground: '#FFFFFF',
      textColor: '#333333',
      linkColor: '#D4AF37',
      buttonColor: '#D4AF37',
      buttonTextColor: '#FFFFFF',
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      borderColor: '#DDDDDD',
      footerBackground: '#F8F8F8',
      footerText: '© {{eventYear}} {{eventName}}. All rights reserved.',
      isDefault: true,
    },
    {
      name: 'Burgundy Elegance',
      description: 'An elegant theme with burgundy accents',
      headerBackground: '#FFFFFF',
      bodyBackground: '#FFFFFF',
      textColor: '#333333',
      linkColor: '#800020',
      buttonColor: '#800020',
      buttonTextColor: '#FFFFFF',
      fontFamily: 'Georgia, serif',
      fontSize: '16px',
      borderColor: '#DDDDDD',
      footerBackground: '#F8F8F8',
      footerText: '© {{eventYear}} {{eventName}}. All rights reserved.',
      isDefault: true,
    }
  ];
}

/**
 * Get default email signatures
 */
async function getDefaultSignatures() {
  return [
    {
      name: 'Simple Couple',
      content: `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 0;">Warm regards,</p>
          <p style="margin: 5px 0; font-weight: bold;">{{brideName}} & {{groomName}}</p>
        </div>
      `,
      plainText: `
Warm regards,
{{brideName}} & {{groomName}}
      `,
      includesSocialLinks: false,
      isDefault: true,
    },
    {
      name: 'With Social Media',
      content: `
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="margin: 0;">Warm regards,</p>
          <p style="margin: 5px 0; font-weight: bold;">{{brideName}} & {{groomName}}</p>
          <div style="margin-top: 10px;">
            {{#if instagramUrl}}<a href="{{instagramUrl}}" style="display: inline-block; margin-right: 10px;"><img src="{{instagramIcon}}" alt="Instagram" style="width: 24px; height: 24px;"></a>{{/if}}
            {{#if facebookUrl}}<a href="{{facebookUrl}}" style="display: inline-block; margin-right: 10px;"><img src="{{facebookIcon}}" alt="Facebook" style="width: 24px; height: 24px;"></a>{{/if}}
            {{#if websiteUrl}}<a href="{{websiteUrl}}" style="display: inline-block;"><img src="{{websiteIcon}}" alt="Website" style="width: 24px; height: 24px;"></a>{{/if}}
          </div>
        </div>
      `,
      plainText: `
Warm regards,
{{brideName}} & {{groomName}}

Follow our wedding journey:
{{#if instagramUrl}}Instagram: {{instagramUrl}}{{/if}}
{{#if facebookUrl}}Facebook: {{facebookUrl}}{{/if}}
{{#if websiteUrl}}Website: {{websiteUrl}}{{/if}}
      `,
      includesSocialLinks: true,
      socialLinks: {
        instagram: true,
        facebook: true,
        website: true
      },
      isDefault: true,
    }
  ];
}

/**
 * Create system templates and styles for a new event
 */
async function createSystemTemplates(eventId: number) {
  try {
    // Check if templates already exist for this event
    const existingTemplates = await db.select({ count: db.sql`count(*)` })
      .from(emailTemplates)
      .where(eq(emailTemplates.eventId, eventId));
    
    if (existingTemplates[0].count > 0) {
      console.log(`Email templates already exist for event ${eventId}, skipping creation`);
      return;
    }
    
    // Create default templates
    const defaultTemplates = await getDefaultTemplates();
    for (const template of defaultTemplates) {
      await db.insert(emailTemplates).values({
        eventId,
        name: template.name,
        description: template.description,
        subject: template.subject,
        bodyHtml: template.bodyHtml,
        bodyText: template.bodyText,
        category: template.category,
        isDefault: template.isDefault,
        isSystem: template.isSystem
      });
    }
    
    // Create default styles
    const defaultStyles = await getDefaultStyles();
    for (const style of defaultStyles) {
      await db.insert(emailTemplateStyles).values({
        eventId,
        name: style.name,
        description: style.description,
        headerBackground: style.headerBackground,
        bodyBackground: style.bodyBackground,
        textColor: style.textColor,
        linkColor: style.linkColor,
        buttonColor: style.buttonColor,
        buttonTextColor: style.buttonTextColor,
        fontFamily: style.fontFamily,
        fontSize: style.fontSize,
        borderColor: style.borderColor,
        footerBackground: style.footerBackground,
        footerText: style.footerText,
        isDefault: style.isDefault
      });
    }
    
    // Create default signatures
    const defaultSignatures = await getDefaultSignatures();
    for (const signature of defaultSignatures) {
      await db.insert(emailSignatures).values({
        eventId,
        name: signature.name,
        content: signature.content,
        plainText: signature.plainText,
        includesSocialLinks: signature.includesSocialLinks,
        socialLinks: signature.socialLinks ? JSON.stringify(signature.socialLinks) : null,
        isDefault: signature.isDefault
      });
    }
    
    console.log(`Created system email templates for event ${eventId}`);
  } catch (error) {
    console.error(`Error creating system email templates for event ${eventId}:`, error);
  }
}

// Middleware to create templates for new events
router.use('/api/events/:eventId/email-templates', async (req, res, next) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (!isNaN(eventId)) {
      await createSystemTemplates(eventId);
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Get all email templates for an event
router.get('/api/events/:eventId/email-templates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const templates = await db.select().from(emailTemplates).where(eq(emailTemplates.eventId, eventId));
    res.json({ success: true, templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get a specific email template
router.get('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    if (isNaN(eventId) || isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    const [template] = await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.eventId, eventId)
      ));
    
    if (!template) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }
    
    res.json({ success: true, template });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new email template
router.post('/api/events/:eventId/email-templates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Validate the request body
    const validationResult = insertEmailTemplateSchema.safeParse({
      ...req.body,
      eventId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationResult.error.format() 
      });
    }

    const newTemplate = await db.insert(emailTemplates)
      .values(validationResult.data)
      .returning();
    
    res.status(201).json({ success: true, template: newTemplate[0] });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update an email template
router.put('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    if (isNaN(eventId) || isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if template exists and belongs to the event
    const [existingTemplate] = await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.eventId, eventId)
      ));
    
    if (!existingTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Don't allow modification of system templates beyond certain fields
    if (existingTemplate.isSystem) {
      const allowedFields = ['name', 'description', 'subject', 'bodyHtml', 'bodyText'];
      const updatedData: any = { lastUpdated: new Date() };
      
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updatedData[field] = req.body[field];
        }
      }
      
      const [updatedTemplate] = await db.update(emailTemplates)
        .set(updatedData)
        .where(and(
          eq(emailTemplates.id, templateId),
          eq(emailTemplates.eventId, eventId)
        ))
        .returning();
      
      return res.json({ success: true, template: updatedTemplate });
    }

    // For non-system templates, allow full updates
    const validationResult = insertEmailTemplateSchema.safeParse({
      ...req.body,
      eventId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationResult.error.format() 
      });
    }

    const [updatedTemplate] = await db.update(emailTemplates)
      .set({
        ...validationResult.data,
        lastUpdated: new Date()
      })
      .where(and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.eventId, eventId)
      ))
      .returning();
    
    res.json({ success: true, template: updatedTemplate });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete an email template
router.delete('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    if (isNaN(eventId) || isNaN(templateId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if template exists and belongs to the event
    const [existingTemplate] = await db.select().from(emailTemplates)
      .where(and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.eventId, eventId)
      ));
    
    if (!existingTemplate) {
      return res.status(404).json({ success: false, message: 'Template not found' });
    }

    // Don't allow deletion of system templates
    if (existingTemplate.isSystem) {
      return res.status(403).json({ 
        success: false, 
        message: 'System templates cannot be deleted' 
      });
    }

    await db.delete(emailTemplates)
      .where(and(
        eq(emailTemplates.id, templateId),
        eq(emailTemplates.eventId, eventId)
      ));
    
    res.json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all email template styles for an event
router.get('/api/events/:eventId/email-styles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const styles = await db.select().from(emailTemplateStyles).where(eq(emailTemplateStyles.eventId, eventId));
    res.json({ success: true, styles });
  } catch (error) {
    console.error('Error fetching email styles:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new email template style
router.post('/api/events/:eventId/email-styles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Validate the request body
    const validationResult = insertEmailTemplateStyleSchema.safeParse({
      ...req.body,
      eventId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationResult.error.format() 
      });
    }

    const newStyle = await db.insert(emailTemplateStyles)
      .values(validationResult.data)
      .returning();
    
    res.status(201).json({ success: true, style: newStyle[0] });
  } catch (error) {
    console.error('Error creating email style:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update an email template style
router.put('/api/events/:eventId/email-styles/:styleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const styleId = parseInt(req.params.styleId);
    
    if (isNaN(eventId) || isNaN(styleId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if style exists and belongs to the event
    const [existingStyle] = await db.select().from(emailTemplateStyles)
      .where(and(
        eq(emailTemplateStyles.id, styleId),
        eq(emailTemplateStyles.eventId, eventId)
      ));
    
    if (!existingStyle) {
      return res.status(404).json({ success: false, message: 'Style not found' });
    }

    // Validate the request body
    const validationResult = insertEmailTemplateStyleSchema.safeParse({
      ...req.body,
      eventId
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation error', 
        errors: validationResult.error.format() 
      });
    }

    const [updatedStyle] = await db.update(emailTemplateStyles)
      .set({
        ...validationResult.data,
        lastUpdated: new Date()
      })
      .where(and(
        eq(emailTemplateStyles.id, styleId),
        eq(emailTemplateStyles.eventId, eventId)
      ))
      .returning();
    
    res.json({ success: true, style: updatedStyle });
  } catch (error) {
    console.error('Error updating email style:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete an email template style
router.delete('/api/events/:eventId/email-styles/:styleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const styleId = parseInt(req.params.styleId);
    
    if (isNaN(eventId) || isNaN(styleId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if style exists and belongs to the event
    const [existingStyle] = await db.select().from(emailTemplateStyles)
      .where(and(
        eq(emailTemplateStyles.id, styleId),
        eq(emailTemplateStyles.eventId, eventId)
      ));
    
    if (!existingStyle) {
      return res.status(404).json({ success: false, message: 'Style not found' });
    }

    await db.delete(emailTemplateStyles)
      .where(and(
        eq(emailTemplateStyles.id, styleId),
        eq(emailTemplateStyles.eventId, eventId)
      ));
    
    res.json({ success: true, message: 'Style deleted successfully' });
  } catch (error) {
    console.error('Error deleting email style:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Upload an email asset (image)
router.post('/api/events/:eventId/email-assets', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Get file details
    const { originalname, filename, path: filePath, size, mimetype } = req.file;
    
    // Get asset metadata
    const { name, type, altText, tags } = req.body;
    
    // Generate a public URL for the asset
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const assetUrl = `${baseUrl}/uploads/email-assets/${filename}`;
    
    // Create asset record in database
    const [asset] = await db.insert(emailAssets)
      .values({
        eventId,
        name: name || originalname,
        type: type || 'image',
        url: assetUrl,
        altText: altText || name || originalname,
        tags: tags || '',
      })
      .returning();
    
    res.status(201).json({ 
      success: true, 
      asset: {
        ...asset,
        url: assetUrl,
        size,
        mimetype
      }
    });
  } catch (error) {
    console.error('Error uploading email asset:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all email assets for an event
router.get('/api/events/:eventId/email-assets', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const assets = await db.select().from(emailAssets).where(eq(emailAssets.eventId, eventId));
    res.json({ success: true, assets });
  } catch (error) {
    console.error('Error fetching email assets:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete an email asset
router.delete('/api/events/:eventId/email-assets/:assetId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const assetId = parseInt(req.params.assetId);
    
    if (isNaN(eventId) || isNaN(assetId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Find the asset
    const [asset] = await db.select().from(emailAssets)
      .where(and(
        eq(emailAssets.id, assetId),
        eq(emailAssets.eventId, eventId)
      ));
    
    if (!asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    // Extract filename from URL
    const filename = asset.url.split('/').pop();
    const filePath = path.join(process.cwd(), 'uploads', 'email-assets', filename);
    
    // Delete the file if it exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from database
    await db.delete(emailAssets)
      .where(and(
        eq(emailAssets.id, assetId),
        eq(emailAssets.eventId, eventId)
      ));
    
    res.json({ success: true, message: 'Asset deleted successfully' });
  } catch (error) {
    console.error('Error deleting email asset:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Get all email signatures for an event
router.get('/api/events/:eventId/email-signatures', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const signatures = await db.select().from(emailSignatures).where(eq(emailSignatures.eventId, eventId));
    res.json({ success: true, signatures });
  } catch (error) {
    console.error('Error fetching email signatures:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Create a new email signature
router.post('/api/events/:eventId/email-signatures', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ success: false, message: 'Invalid event ID' });
    }

    const { name, content, plainText, includesSocialLinks, socialLinks, isDefault } = req.body;
    
    const [signature] = await db.insert(emailSignatures)
      .values({
        eventId,
        name,
        content,
        plainText,
        includesSocialLinks: includesSocialLinks === true,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
        isDefault: isDefault === true
      })
      .returning();
    
    res.status(201).json({ success: true, signature });
  } catch (error) {
    console.error('Error creating email signature:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update an email signature
router.put('/api/events/:eventId/email-signatures/:signatureId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const signatureId = parseInt(req.params.signatureId);
    
    if (isNaN(eventId) || isNaN(signatureId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if signature exists
    const [existingSignature] = await db.select().from(emailSignatures)
      .where(and(
        eq(emailSignatures.id, signatureId),
        eq(emailSignatures.eventId, eventId)
      ));
    
    if (!existingSignature) {
      return res.status(404).json({ success: false, message: 'Signature not found' });
    }

    const { name, content, plainText, includesSocialLinks, socialLinks, isDefault } = req.body;
    
    const [updatedSignature] = await db.update(emailSignatures)
      .set({
        name,
        content,
        plainText,
        includesSocialLinks: includesSocialLinks === true,
        socialLinks: socialLinks ? JSON.stringify(socialLinks) : null,
        isDefault: isDefault === true
      })
      .where(and(
        eq(emailSignatures.id, signatureId),
        eq(emailSignatures.eventId, eventId)
      ))
      .returning();
    
    res.json({ success: true, signature: updatedSignature });
  } catch (error) {
    console.error('Error updating email signature:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Delete an email signature
router.delete('/api/events/:eventId/email-signatures/:signatureId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const signatureId = parseInt(req.params.signatureId);
    
    if (isNaN(eventId) || isNaN(signatureId)) {
      return res.status(400).json({ success: false, message: 'Invalid ID parameters' });
    }

    // Check if signature exists
    const [existingSignature] = await db.select().from(emailSignatures)
      .where(and(
        eq(emailSignatures.id, signatureId),
        eq(emailSignatures.eventId, eventId)
      ));
    
    if (!existingSignature) {
      return res.status(404).json({ success: false, message: 'Signature not found' });
    }

    await db.delete(emailSignatures)
      .where(and(
        eq(emailSignatures.id, signatureId),
        eq(emailSignatures.eventId, eventId)
      ));
    
    res.json({ success: true, message: 'Signature deleted successfully' });
  } catch (error) {
    console.error('Error deleting email signature:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default router;