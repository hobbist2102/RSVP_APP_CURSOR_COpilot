import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { insertRsvpFollowupTemplateSchema } from '@shared/schema';

const router = Router();

/**
 * Get all RSVP follow-up templates for an event
 */
router.get('/events/:eventId/rsvp-followup-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templates = await storage.getRsvpFollowupTemplatesByEvent(eventId);
    res.json(templates);
  } catch (error) {
    console.error('Error fetching RSVP follow-up templates:', error);
    res.status(500).json({ message: 'Failed to fetch RSVP follow-up templates' });
  }
});

/**
 * Get a specific RSVP follow-up template
 */
router.get('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const templateId = parseInt(req.params.templateId);
    const template = await storage.getRsvpFollowupTemplate(templateId);
    
    if (!template) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check that the template belongs to the specified event
    if (template.eventId !== parseInt(req.params.eventId)) {
      return res.status(403).json({ message: 'Template does not belong to the specified event' });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching RSVP follow-up template:', error);
    res.status(500).json({ message: 'Failed to fetch RSVP follow-up template' });
  }
});

/**
 * Create a new RSVP follow-up template
 */
router.post('/events/:eventId/rsvp-followup-templates', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Validate the request body
    const schema = insertRsvpFollowupTemplateSchema.extend({
      eventId: z.number()
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid template data', 
        errors: validationResult.error.errors 
      });
    }
    
    // Make sure the eventId in the body matches the URL parameter
    if (req.body.eventId !== eventId) {
      return res.status(400).json({ message: 'Event ID in body does not match URL parameter' });
    }
    
    // Check if a template of the same type already exists for this event
    const existingTemplates = await storage.getRsvpFollowupTemplatesByEvent(eventId);
    const existingTemplate = existingTemplates.find(t => t.type === req.body.type);
    
    if (existingTemplate) {
      return res.status(409).json({ 
        message: 'A template with this type already exists for this event',
        existingTemplateId: existingTemplate.id
      });
    }
    
    // Create the template
    const template = await storage.createRsvpFollowupTemplate(req.body);
    res.status(201).json(template);
  } catch (error) {
    console.error('Error creating RSVP follow-up template:', error);
    res.status(500).json({ message: 'Failed to create RSVP follow-up template' });
  }
});

/**
 * Update an existing RSVP follow-up template
 */
router.put('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    // Get the existing template
    const existingTemplate = await storage.getRsvpFollowupTemplate(templateId);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check that the template belongs to the specified event
    if (existingTemplate.eventId !== eventId) {
      return res.status(403).json({ message: 'Template does not belong to the specified event' });
    }
    
    // Validate the request body
    const schema = insertRsvpFollowupTemplateSchema.partial().extend({
      type: z.string().optional(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid template data', 
        errors: validationResult.error.errors 
      });
    }
    
    // Update the template
    const updatedTemplate = await storage.updateRsvpFollowupTemplate(templateId, req.body);
    res.json(updatedTemplate);
  } catch (error) {
    console.error('Error updating RSVP follow-up template:', error);
    res.status(500).json({ message: 'Failed to update RSVP follow-up template' });
  }
});

/**
 * Delete an RSVP follow-up template
 */
router.delete('/events/:eventId/rsvp-followup-templates/:templateId', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const templateId = parseInt(req.params.templateId);
    
    // Get the existing template
    const existingTemplate = await storage.getRsvpFollowupTemplate(templateId);
    
    if (!existingTemplate) {
      return res.status(404).json({ message: 'Template not found' });
    }
    
    // Check that the template belongs to the specified event
    if (existingTemplate.eventId !== eventId) {
      return res.status(403).json({ message: 'Template does not belong to the specified event' });
    }
    
    // Delete the template
    const success = await storage.deleteRsvpFollowupTemplate(templateId);
    
    if (success) {
      res.json({ message: 'Template deleted successfully' });
    } else {
      res.status(500).json({ message: 'Failed to delete template' });
    }
  } catch (error) {
    console.error('Error deleting RSVP follow-up template:', error);
    res.status(500).json({ message: 'Failed to delete RSVP follow-up template' });
  }
});

/**
 * Update event communication settings
 */
router.put('/events/:eventId/communication-settings', async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Validate the request body
    const schema = z.object({
      emailFrom: z.string().email().optional(),
      emailReplyTo: z.string().email().optional(),
      whatsappNumber: z.string().optional(),
      useGmail: z.boolean().optional(),
      useOutlook: z.boolean().optional(),
      useSendGrid: z.boolean().optional(),
      gmailAccount: z.string().email().optional(),
      outlookAccount: z.string().email().optional(),
      sendGridApiKey: z.string().optional(),
    });
    
    const validationResult = schema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: 'Invalid communication settings', 
        errors: validationResult.error.errors 
      });
    }
    
    // Update the event with communication settings
    const updatedEvent = await storage.updateEvent(eventId, req.body);
    
    if (!updatedEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }
    
    res.json(updatedEvent);
  } catch (error) {
    console.error('Error updating communication settings:', error);
    res.status(500).json({ message: 'Failed to update communication settings' });
  }
});

export default router;