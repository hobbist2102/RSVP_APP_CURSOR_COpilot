/**
 * RSVP Follow-up Routes
 * Handles the creation, retrieval, updating and deletion of RSVP follow-up templates
 * and configuration of email settings for RSVP follow-up communications.
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { insertRsvpFollowupTemplateSchema, insertRsvpFollowupLogSchema } from '@shared/schema';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { rsvpFollowupTemplates } from '@shared/schema';

const router = Router();

/**
 * Get all RSVP follow-up templates for an event
 */
router.get('/events/:eventId/rsvp-followup-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    const templates = await storage.getRsvpFollowupTemplatesByEvent(eventId);
    res.json(templates);
  } catch (error) {
    
    res.status(500).json({ message: 'Failed to fetch RSVP follow-up templates' });
  }
});

/**
 * Get a specific RSVP follow-up template
 */
router.get('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }
    
    const template = await storage.getRsvpFollowupTemplate(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    
    res.status(500).json({ message: 'Failed to fetch RSVP follow-up template' });
  }
});

/**
 * Create a new RSVP follow-up template
 */
router.post('/events/:eventId/rsvp-followup-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    // Add eventId to the request body
    const templateData = {
      ...req.body,
      eventId
    };
    
    // Validate the template data
    const validatedData = insertRsvpFollowupTemplateSchema.parse(templateData);
    
    // Create the template
    const template = await storage.createRsvpFollowupTemplate(validatedData);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    
    res.status(500).json({ message: 'Failed to create RSVP follow-up template' });
  }
});

/**
 * Update an existing RSVP follow-up template
 */
router.put('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }
    
    // Validate the template data with partial schema (all fields optional)
    const templateData = insertRsvpFollowupTemplateSchema.partial().parse(req.body);
    
    // Update lastUpdated timestamp
    templateData.lastUpdated = new Date();
    
    // Update the template
    const template = await storage.updateRsvpFollowupTemplate(templateId, templateData);
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    
    res.status(500).json({ message: 'Failed to update RSVP follow-up template' });
  }
});

/**
 * Delete an RSVP follow-up template
 */
router.delete('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    if (isNaN(templateId)) {
      return res.status(400).json({ message: 'Invalid template ID' });
    }
    
    const success = await storage.deleteRsvpFollowupTemplate(templateId);
    if (!success) {
      return res.status(404).json({ message: 'Template not found' });
    }
    res.json({ message: 'Template successfully deleted' });
  } catch (error) {
    
    res.status(500).json({ message: 'Failed to delete RSVP follow-up template' });
  }
});

/**
 * Update event communication settings
 */
router.put('/events/:eventId/communication-settings', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }
    
    // Validate the event data
    const eventSchema = z.object({
      emailFrom: z.string().email().optional(),
      emailReplyTo: z.string().email().optional(),
      useGmail: z.boolean().optional(),
      useOutlook: z.boolean().optional(),
      useSendGrid: z.boolean().optional(),
      gmailAccount: z.string().optional(),
      outlookAccount: z.string().optional(),
      sendGridApiKey: z.string().optional(),
      whatsappBusinessNumber: z.string().optional(),
      whatsappBusinessPhoneId: z.string().optional(),
      whatsappBusinessAccountId: z.string().optional(),
      whatsappAccessToken: z.string().optional(),
      whatsappConfigured: z.boolean().optional(),
      emailConfigured: z.boolean().optional()
    });
    
    const validatedData = eventSchema.parse(req.body);
    
    // Update the event
    const updatedEvent = await storage.updateEvent(eventId, validatedData);
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(updatedEvent);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: error.errors });
    }
    
    res.status(500).json({ message: 'Failed to update communication settings' });
  }
});

export default router;