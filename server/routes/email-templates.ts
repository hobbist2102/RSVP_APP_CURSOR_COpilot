import express from 'express';
import { Request, Response } from 'express';
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
} from '../../shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';

const router = express.Router();

// Configure multer storage for email assets
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(process.cwd(), 'uploads', 'email-assets');
    // Create the directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a unique filename with original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'email-asset-' + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

/**
 * Get default system templates to bootstrap email template management
 */
async function getDefaultTemplates() {
  return [
    {
      name: "RSVP Confirmation",
      description: "Sent to guests after they RSVP",
      subject: "Thank you for your RSVP - [Event Name]",
      bodyHtml: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Confirmation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f8f8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px 0;">
      <h1 style="color: #333;">Thank You for Your RSVP</h1>
    </div>
    
    <div style="padding: 20px; background-color: #fff; border-radius: 5px;">
      <p>Dear [Guest Name],</p>
      <p>Thank you for responding to our invitation! We have received your RSVP and are [excited to have you join us/sorry you won't be able to make it].</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #333;">Your RSVP Details:</h3>
        <p><strong>Attendance:</strong> [Attending/Not Attending]</p>
        <p><strong>Number of Guests:</strong> [Guest Count]</p>
        <p><strong>Meal Selection:</strong> [Meal Choice]</p>
      </div>
      
      <p>If you need to make any changes to your RSVP, please contact us as soon as possible.</p>
      
      <p>We look forward to celebrating with you!</p>
      <p>Best regards,</p>
      <p>[Couple Names]</p>
    </div>
    
    <div style="text-align: center; padding: 20px 0; color: #666; font-size: 12px;">
      <p>This is an automated email from our wedding management system.</p>
    </div>
  </div>
</body>
</html>`,
      bodyText: "Dear [Guest Name],\n\nThank you for responding to our invitation! We have received your RSVP and are [excited to have you join us/sorry you won't be able to make it].\n\nYour RSVP Details:\nAttendance: [Attending/Not Attending]\nNumber of Guests: [Guest Count]\nMeal Selection: [Meal Choice]\n\nIf you need to make any changes to your RSVP, please contact us as soon as possible.\n\nWe look forward to celebrating with you!\n\nBest regards,\n[Couple Names]",
      category: "confirmation",
      isDefault: true,
      isSystem: true
    },
    {
      name: "Wedding Invitation",
      description: "Initial invitation sent to guests",
      subject: "You're Invited to Our Wedding - [Event Name]",
      bodyHtml: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Wedding Invitation</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f8f8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px 0;">
      <h1 style="color: #333;">You're Invited!</h1>
    </div>
    
    <div style="padding: 20px; background-color: #fff; border-radius: 5px;">
      <p>Dear [Guest Name],</p>
      <p>We are delighted to invite you to celebrate our wedding!</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #333;">[Bride Name] & [Groom Name]</h3>
        <p><strong>Date:</strong> [Wedding Date]</p>
        <p><strong>Time:</strong> [Wedding Time]</p>
        <p><strong>Venue:</strong> [Venue Name and Address]</p>
      </div>
      
      <p>We would be honored to have you join us on our special day. Please RSVP by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="[RSVP Link]" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">RSVP NOW</a>
      </div>
      
      <p>We look forward to sharing this joyous occasion with you!</p>
      <p>With love,</p>
      <p>[Bride Name] & [Groom Name]</p>
    </div>
    
    <div style="text-align: center; padding: 20px 0; color: #666; font-size: 12px;">
      <p>If you have any questions, please don't hesitate to contact us.</p>
    </div>
  </div>
</body>
</html>`,
      bodyText: "Dear [Guest Name],\n\nWe are delighted to invite you to celebrate our wedding!\n\n[Bride Name] & [Groom Name]\nDate: [Wedding Date]\nTime: [Wedding Time]\nVenue: [Venue Name and Address]\n\nWe would be honored to have you join us on our special day. Please RSVP by following this link: [RSVP Link]\n\nWe look forward to sharing this joyous occasion with you!\n\nWith love,\n[Bride Name] & [Groom Name]",
      category: "invitation",
      isDefault: true,
      isSystem: true
    },
    {
      name: "RSVP Reminder",
      description: "Reminder for guests who haven't responded",
      subject: "Reminder: Please RSVP to Our Wedding",
      bodyHtml: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RSVP Reminder</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f8f8f8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="text-align: center; padding: 20px 0;">
      <h1 style="color: #333;">RSVP Reminder</h1>
    </div>
    
    <div style="padding: 20px; background-color: #fff; border-radius: 5px;">
      <p>Dear [Guest Name],</p>
      <p>We noticed that we haven't received your RSVP for our wedding yet. We're finalizing our arrangements and would love to know if you'll be able to join us for our special day.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
        <h3 style="margin-top: 0; color: #333;">[Bride Name] & [Groom Name]</h3>
        <p><strong>Date:</strong> [Wedding Date]</p>
        <p><strong>RSVP Deadline:</strong> [RSVP Deadline]</p>
      </div>
      
      <p>Please let us know if you can attend by clicking the button below:</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="[RSVP Link]" style="background-color: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold;">RSVP NOW</a>
      </div>
      
      <p>If you have any questions or need assistance with the RSVP process, please don't hesitate to contact us.</p>
      <p>We hope you can join us!</p>
      <p>Best wishes,</p>
      <p>[Bride Name] & [Groom Name]</p>
    </div>
    
    <div style="text-align: center; padding: 20px 0; color: #666; font-size: 12px;">
      <p>This is a reminder email from our wedding management system.</p>
    </div>
  </div>
</body>
</html>`,
      bodyText: "Dear [Guest Name],\n\nWe noticed that we haven't received your RSVP for our wedding yet. We're finalizing our arrangements and would love to know if you'll be able to join us for our special day.\n\n[Bride Name] & [Groom Name]\nDate: [Wedding Date]\nRSVP Deadline: [RSVP Deadline]\n\nPlease let us know if you can attend by following this link: [RSVP Link]\n\nIf you have any questions or need assistance with the RSVP process, please don't hesitate to contact us.\n\nWe hope you can join us!\n\nBest wishes,\n[Bride Name] & [Groom Name]",
      category: "reminder",
      isDefault: true,
      isSystem: true
    }
  ];
}

/**
 * Get default email template styles to bootstrap the system
 */
async function getDefaultStyles() {
  return [
    {
      name: "Classic Wedding",
      description: "A clean, elegant style for traditional weddings",
      headerLogo: "",
      headerBackground: "#ffffff",
      bodyBackground: "#f8f8f8",
      textColor: "#333333",
      linkColor: "#4a90e2",
      buttonColor: "#4CAF50",
      buttonTextColor: "#ffffff",
      fontFamily: "Arial, sans-serif",
      fontSize: "16px",
      borderColor: "#dddddd",
      footerText: "Wedding RSVP System",
      footerBackground: "#f1f1f1",
      css: "",
      isDefault: true
    },
    {
      name: "Modern Minimalist",
      description: "Clean and minimalist design with modern aesthetics",
      headerLogo: "",
      headerBackground: "#ffffff",
      bodyBackground: "#ffffff",
      textColor: "#222222",
      linkColor: "#000000",
      buttonColor: "#000000",
      buttonTextColor: "#ffffff",
      fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontSize: "15px",
      borderColor: "#eeeeee",
      footerText: "",
      footerBackground: "#f9f9f9",
      css: "",
      isDefault: false
    }
  ];
}

/**
 * Get default email signatures
 */
async function getDefaultSignatures() {
  return [
    {
      name: "Simple Signature",
      content: `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 450px; font-family: Arial, sans-serif; color: #333333;">
  <tr>
    <td style="padding: 10px 0; border-top: 1px solid #dddddd;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top;">
            <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">[Your Name]</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">[Event Name]</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">Phone: [Your Phone]</p>
            <p style="margin: 0; font-size: 14px;">Email: [Your Email]</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
      plainText: "[Your Name]\n[Event Name]\nPhone: [Your Phone]\nEmail: [Your Email]",
      includesSocialLinks: false,
      isDefault: true
    },
    {
      name: "Couple Signature",
      content: `<table cellpadding="0" cellspacing="0" border="0" style="width: 100%; max-width: 450px; font-family: Arial, sans-serif; color: #333333;">
  <tr>
    <td style="padding: 10px 0; border-top: 1px solid #dddddd;">
      <table cellpadding="0" cellspacing="0" border="0" style="width: 100%;">
        <tr>
          <td style="vertical-align: top; padding-right: 15px;">
            <img src="https://via.placeholder.com/100x100" alt="Couple Photo" style="width: 80px; height: 80px; border-radius: 50%;">
          </td>
          <td style="vertical-align: top;">
            <p style="margin: 0 0 5px 0; font-weight: bold; font-size: 16px;">[Bride Name] & [Groom Name]</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">Getting married on [Wedding Date]</p>
            <p style="margin: 0 0 5px 0; font-size: 14px;">Phone: [Contact Phone]</p>
            <p style="margin: 0; font-size: 14px;">Email: [Contact Email]</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`,
      plainText: "[Bride Name] & [Groom Name]\nGetting married on [Wedding Date]\nPhone: [Contact Phone]\nEmail: [Contact Email]",
      includesSocialLinks: false,
      isDefault: false
    }
  ];
}

/**
 * Create system templates and styles for a new event
 */
async function createSystemTemplates(eventId: number) {
  try {
    // Check if templates already exist for this event
    const result = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.eventId, eventId));
    
    const existingTemplatesCount = result.length;
    
    if (existingTemplatesCount > 0) {
      console.log(`Email templates already exist for event ${eventId}, skipping creation`);
      return;
    }
    
    // Create default templates
    const templates = await getDefaultTemplates();
    for (const template of templates) {
      await db.insert(emailTemplates).values({
        ...template,
        eventId
      });
    }
    
    // Create default styles
    const styles = await getDefaultStyles();
    for (const style of styles) {
      await db.insert(emailTemplateStyles).values({
        ...style,
        eventId
      });
    }
    
    // Create default signatures
    const signatures = await getDefaultSignatures();
    for (const signature of signatures) {
      await db.insert(emailSignatures).values({
        ...signature,
        eventId
      });
    }
    
    console.log(`Created system templates for event ${eventId}`);
  } catch (error) {
    console.error('Error creating system templates:', error);
  }
}

// Get all email templates for an event
router.get('/api/events/:eventId/email-templates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Create system templates if needed
    await createSystemTemplates(eventId);
    
    const templates = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.eventId, eventId));
    
    res.json({ templates });
  } catch (error) {
    console.error('Error fetching email templates:', error);
    res.status(500).json({ error: 'Failed to fetch email templates' });
  }
});

// Get a specific email template
router.get('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.eventId, eventId),
          eq(emailTemplates.id, templateId)
        )
      );
    
    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ template });
  } catch (error) {
    console.error('Error fetching email template:', error);
    res.status(500).json({ error: 'Failed to fetch email template' });
  }
});

// Create a new email template
router.post('/api/events/:eventId/email-templates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const validatedData = insertEmailTemplateSchema.parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults in this category
    if (validatedData.isDefault) {
      await db
        .update(emailTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(emailTemplates.eventId, eventId),
            eq(emailTemplates.category, validatedData.category)
          )
        );
    }
    
    const [template] = await db
      .insert(emailTemplates)
      .values(validatedData)
      .returning();
    
    res.status(201).json({ template });
  } catch (error) {
    console.error('Error creating email template:', error);
    res.status(500).json({ error: 'Failed to create email template' });
  }
});

// Update an email template
router.put('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    // Check if template exists and belongs to this event
    const [existingTemplate] = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.eventId, eventId),
          eq(emailTemplates.id, templateId)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Don't allow modification of system templates except for setting as default
    if (existingTemplate.isSystem && req.body.isDefault === undefined) {
      return res.status(403).json({ error: 'System templates cannot be modified' });
    }
    
    const validatedData = insertEmailTemplateSchema.partial().parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults in this category
    if (validatedData.isDefault) {
      await db
        .update(emailTemplates)
        .set({ isDefault: false })
        .where(
          and(
            eq(emailTemplates.eventId, eventId),
            eq(emailTemplates.category, existingTemplate.category), // Use existing category in case it's not being updated
            req.body.category ? eq(emailTemplates.category, req.body.category) : undefined // If category is updated, also handle that
          )
        );
    }
    
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({
        ...validatedData,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(emailTemplates.eventId, eventId),
          eq(emailTemplates.id, templateId)
        )
      )
      .returning();
    
    res.json({ template: updatedTemplate });
  } catch (error) {
    console.error('Error updating email template:', error);
    res.status(500).json({ error: 'Failed to update email template' });
  }
});

// Delete an email template
router.delete('/api/events/:eventId/email-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    // Check if template exists and belongs to this event
    const [existingTemplate] = await db
      .select()
      .from(emailTemplates)
      .where(
        and(
          eq(emailTemplates.eventId, eventId),
          eq(emailTemplates.id, templateId)
        )
      );
    
    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    // Don't allow deletion of system templates
    if (existingTemplate.isSystem) {
      return res.status(403).json({ error: 'System templates cannot be deleted' });
    }
    
    await db
      .delete(emailTemplates)
      .where(
        and(
          eq(emailTemplates.eventId, eventId),
          eq(emailTemplates.id, templateId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email template:', error);
    res.status(500).json({ error: 'Failed to delete email template' });
  }
});

// Get all email styles for an event
router.get('/api/events/:eventId/email-styles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const styles = await db
      .select()
      .from(emailTemplateStyles)
      .where(eq(emailTemplateStyles.eventId, eventId));
    
    res.json({ styles });
  } catch (error) {
    console.error('Error fetching email styles:', error);
    res.status(500).json({ error: 'Failed to fetch email styles' });
  }
});

// Create a new email style
router.post('/api/events/:eventId/email-styles', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const validatedData = insertEmailTemplateStyleSchema.parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults
    if (validatedData.isDefault) {
      await db
        .update(emailTemplateStyles)
        .set({ isDefault: false })
        .where(eq(emailTemplateStyles.eventId, eventId));
    }
    
    const [style] = await db
      .insert(emailTemplateStyles)
      .values(validatedData)
      .returning();
    
    res.status(201).json({ style });
  } catch (error) {
    console.error('Error creating email style:', error);
    res.status(500).json({ error: 'Failed to create email style' });
  }
});

// Update an email style
router.put('/api/events/:eventId/email-styles/:styleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const styleId = parseInt(req.params.styleId);
    
    // Check if style exists and belongs to this event
    const [existingStyle] = await db
      .select()
      .from(emailTemplateStyles)
      .where(
        and(
          eq(emailTemplateStyles.eventId, eventId),
          eq(emailTemplateStyles.id, styleId)
        )
      );
    
    if (!existingStyle) {
      return res.status(404).json({ error: 'Style not found' });
    }
    
    const validatedData = insertEmailTemplateStyleSchema.partial().parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults
    if (validatedData.isDefault) {
      await db
        .update(emailTemplateStyles)
        .set({ isDefault: false })
        .where(eq(emailTemplateStyles.eventId, eventId));
    }
    
    const [updatedStyle] = await db
      .update(emailTemplateStyles)
      .set({
        ...validatedData,
        lastUpdated: new Date()
      })
      .where(
        and(
          eq(emailTemplateStyles.eventId, eventId),
          eq(emailTemplateStyles.id, styleId)
        )
      )
      .returning();
    
    res.json({ style: updatedStyle });
  } catch (error) {
    console.error('Error updating email style:', error);
    res.status(500).json({ error: 'Failed to update email style' });
  }
});

// Delete an email style
router.delete('/api/events/:eventId/email-styles/:styleId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const styleId = parseInt(req.params.styleId);
    
    await db
      .delete(emailTemplateStyles)
      .where(
        and(
          eq(emailTemplateStyles.eventId, eventId),
          eq(emailTemplateStyles.id, styleId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email style:', error);
    res.status(500).json({ error: 'Failed to delete email style' });
  }
});

// Upload email asset
router.post('/api/events/:eventId/email-assets', isAuthenticated, upload.single('file'), async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get optional metadata
    const { name, type, altText, tags } = req.body;
    
    // Generate public URL for asset
    const fileName = path.basename(file.path);
    const assetUrl = `/uploads/email-assets/${fileName}`;
    
    // Upload asset record in database
    const [asset] = await db.insert(emailAssets)
      .values({
        eventId,
        name: name || file.originalname,
        type: type || 'image',
        url: assetUrl,
        altText: altText || name || file.originalname || '',
        tags: tags || '',
      })
      .returning();
    
    res.status(201).json({ asset });
  } catch (error) {
    console.error('Error uploading email asset:', error);
    res.status(500).json({ error: 'Failed to upload email asset' });
  }
});

// Get all email assets for an event
router.get('/api/events/:eventId/email-assets', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const assets = await db
      .select()
      .from(emailAssets)
      .where(eq(emailAssets.eventId, eventId));
    
    res.json({ assets });
  } catch (error) {
    console.error('Error fetching email assets:', error);
    res.status(500).json({ error: 'Failed to fetch email assets' });
  }
});

// Delete an email asset
router.delete('/api/events/:eventId/email-assets/:assetId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const assetId = parseInt(req.params.assetId);
    
    // Get asset details to delete the file
    const [asset] = await db
      .select()
      .from(emailAssets)
      .where(
        and(
          eq(emailAssets.eventId, eventId),
          eq(emailAssets.id, assetId)
        )
      );
    
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    
    // Delete file from disk if it exists
    const filePath = path.join(process.cwd(), asset.url);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (fileError) {
        console.error('Error deleting asset file:', fileError);
        // Continue deletion from database even if file deletion fails
      }
    }
    
    await db
      .delete(emailAssets)
      .where(
        and(
          eq(emailAssets.eventId, eventId),
          eq(emailAssets.id, assetId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email asset:', error);
    res.status(500).json({ error: 'Failed to delete email asset' });
  }
});

// Get all email signatures for an event
router.get('/api/events/:eventId/email-signatures', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const signatures = await db
      .select()
      .from(emailSignatures)
      .where(eq(emailSignatures.eventId, eventId));
    
    res.json({ signatures });
  } catch (error) {
    console.error('Error fetching email signatures:', error);
    res.status(500).json({ error: 'Failed to fetch email signatures' });
  }
});

// Create a new email signature
router.post('/api/events/:eventId/email-signatures', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const validatedData = insertEmailSignatureSchema.parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults
    if (validatedData.isDefault) {
      await db
        .update(emailSignatures)
        .set({ isDefault: false })
        .where(eq(emailSignatures.eventId, eventId));
    }
    
    const [signature] = await db
      .insert(emailSignatures)
      .values(validatedData)
      .returning();
    
    res.status(201).json({ signature });
  } catch (error) {
    console.error('Error creating email signature:', error);
    res.status(500).json({ error: 'Failed to create email signature' });
  }
});

// Update an email signature
router.put('/api/events/:eventId/email-signatures/:signatureId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const signatureId = parseInt(req.params.signatureId);
    
    // Check if signature exists and belongs to this event
    const [existingSignature] = await db
      .select()
      .from(emailSignatures)
      .where(
        and(
          eq(emailSignatures.eventId, eventId),
          eq(emailSignatures.id, signatureId)
        )
      );
    
    if (!existingSignature) {
      return res.status(404).json({ error: 'Signature not found' });
    }
    
    const validatedData = insertEmailSignatureSchema.partial().parse({
      ...req.body,
      eventId
    });
    
    // If this is set as default, unset any other defaults
    if (validatedData.isDefault) {
      await db
        .update(emailSignatures)
        .set({ isDefault: false })
        .where(eq(emailSignatures.eventId, eventId));
    }
    
    const [updatedSignature] = await db
      .update(emailSignatures)
      .set(validatedData)
      .where(
        and(
          eq(emailSignatures.eventId, eventId),
          eq(emailSignatures.id, signatureId)
        )
      )
      .returning();
    
    res.json({ signature: updatedSignature });
  } catch (error) {
    console.error('Error updating email signature:', error);
    res.status(500).json({ error: 'Failed to update email signature' });
  }
});

// Delete an email signature
router.delete('/api/events/:eventId/email-signatures/:signatureId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const signatureId = parseInt(req.params.signatureId);
    
    await db
      .delete(emailSignatures)
      .where(
        and(
          eq(emailSignatures.eventId, eventId),
          eq(emailSignatures.id, signatureId)
        )
      );
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting email signature:', error);
    res.status(500).json({ error: 'Failed to delete email signature' });
  }
});

export default router;