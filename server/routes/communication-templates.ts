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
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';

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

const upload = multer({ storage: storage });

/**
 * Get all communication templates for an event
 */
router.get('/api/events/:eventId/communication-templates', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const templates = await db
      .select()
      .from(communicationTemplates)
      .where(eq(communicationTemplates.eventId, eventId));
    
    res.json(templates);
  } catch (error) {
    console.error('Error fetching communication templates:', error);
    res.status(500).json({ error: 'Failed to fetch templates' });
  }
});

/**
 * Create a new communication template
 */
router.post('/api/events/:eventId/communication-templates', isAuthenticated, async (req: Request, res: Response) => {
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
    console.error('Error creating communication template:', error);
    res.status(500).json({ error: 'Failed to create template' });
  }
});

/**
 * Update a communication template
 */
router.put('/api/events/:eventId/communication-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
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
    console.error('Error updating communication template:', error);
    res.status(500).json({ error: 'Failed to update template' });
  }
});

/**
 * Delete a communication template
 */
router.delete('/api/events/:eventId/communication-templates/:templateId', isAuthenticated, async (req: Request, res: Response) => {
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
    console.error('Error deleting communication template:', error);
    res.status(500).json({ error: 'Failed to delete template' });
  }
});

/**
 * Get brand assets for an event
 */
router.get('/api/events/:eventId/brand-assets', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const assets = await db
      .select()
      .from(brandAssets)
      .where(eq(brandAssets.eventId, eventId));
    
    res.json(assets);
  } catch (error) {
    console.error('Error fetching brand assets:', error);
    res.status(500).json({ error: 'Failed to fetch brand assets' });
  }
});

/**
 * Upload brand asset
 */
router.post('/api/events/:eventId/brand-assets', isAuthenticated, upload.single('asset'), async (req: Request, res: Response) => {
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
    console.error('Error uploading brand asset:', error);
    res.status(500).json({ error: 'Failed to upload asset' });
  }
});

/**
 * Get brand settings for an event
 */
router.get('/api/events/:eventId/brand-settings', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    const settings = await db
      .select()
      .from(brandSettings)
      .where(eq(brandSettings.eventId, eventId));
    
    res.json(settings[0] || {});
  } catch (error) {
    console.error('Error fetching brand settings:', error);
    res.status(500).json({ error: 'Failed to fetch brand settings' });
  }
});

/**
 * Update brand settings for an event
 */
router.put('/api/events/:eventId/brand-settings', isAuthenticated, async (req: Request, res: Response) => {
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
    console.error('Error updating brand settings:', error);
    res.status(500).json({ error: 'Failed to update brand settings' });
  }
});

export default router;