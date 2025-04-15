/**
 * OAuth Configuration Routes
 * 
 * These routes handle the management of OAuth credentials for Gmail and Outlook
 * on a per-event basis. This allows each wedding event to have its own OAuth
 * configuration for sending emails.
 */

import express from 'express';
import { z } from 'zod';
import { storage } from '../storage';
import { encrypt, decrypt } from '../lib/oauth-security';

const router = express.Router();

// Schema for validating OAuth configuration input
const oauthConfigSchema = z.object({
  provider: z.enum(['gmail', 'outlook']),
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
});

/**
 * Get Gmail OAuth configuration status
 * Returns whether credentials are configured, the client ID (if any),
 * and whether a client secret is stored (but not the secret itself)
 */
router.get('/gmail/status', async (req, res) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }
    
    // Verify the event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get OAuth configuration for Gmail
    const oauthConfig = await storage.getOAuthConfig(eventId, 'gmail');
    const isConfigured = !!oauthConfig && !!oauthConfig.clientId && !!oauthConfig.encryptedClientSecret;
    
    return res.json({
      success: true,
      isConfigured,
      clientId: oauthConfig?.clientId || null,
      hasClientSecret: !!oauthConfig?.encryptedClientSecret,
      redirectUri: `${req.protocol}://${req.get('host')}/api/oauth/gmail/callback`
    });
  } catch (error) {
    console.error('Error checking Gmail OAuth configuration status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to check OAuth configuration' 
    });
  }
});

/**
 * Get Outlook OAuth configuration status
 * Returns whether credentials are configured, the client ID (if any),
 * and whether a client secret is stored (but not the secret itself)
 */
router.get('/outlook/status', async (req, res) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }
    
    // Verify the event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Get OAuth configuration for Outlook
    const oauthConfig = await storage.getOAuthConfig(eventId, 'outlook');
    const isConfigured = !!oauthConfig && !!oauthConfig.clientId && !!oauthConfig.encryptedClientSecret;
    
    return res.json({
      success: true,
      isConfigured,
      clientId: oauthConfig?.clientId || null,
      hasClientSecret: !!oauthConfig?.encryptedClientSecret,
      redirectUri: `${req.protocol}://${req.get('host')}/api/oauth/outlook/callback`
    });
  } catch (error) {
    console.error('Error checking Outlook OAuth configuration status:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to check OAuth configuration' 
    });
  }
});

/**
 * Save Gmail OAuth configuration
 */
router.post('/gmail/save', async (req, res) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }
    
    // Verify the event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Validate request body
    const validationResult = oauthConfigSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OAuth configuration', 
        errors: validationResult.error.errors 
      });
    }
    
    const { clientId, clientSecret } = validationResult.data;
    
    // Encrypt the client secret for secure storage
    const encryptedClientSecret = encrypt(clientSecret);
    
    // Save the OAuth configuration
    await storage.saveOAuthConfig(eventId, 'gmail', {
      clientId,
      encryptedClientSecret,
    });
    
    return res.json({
      success: true,
      message: 'Gmail OAuth configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving Gmail OAuth configuration:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save OAuth configuration' 
    });
  }
});

/**
 * Save Outlook OAuth configuration
 */
router.post('/outlook/save', async (req, res) => {
  try {
    const eventId = parseInt(req.query.eventId as string);
    
    if (isNaN(eventId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid event ID' 
      });
    }
    
    // Verify the event exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: 'Event not found' 
      });
    }
    
    // Validate request body
    const validationResult = oauthConfigSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid OAuth configuration', 
        errors: validationResult.error.errors 
      });
    }
    
    const { clientId, clientSecret } = validationResult.data;
    
    // Encrypt the client secret for secure storage
    const encryptedClientSecret = encrypt(clientSecret);
    
    // Save the OAuth configuration
    await storage.saveOAuthConfig(eventId, 'outlook', {
      clientId,
      encryptedClientSecret,
    });
    
    return res.json({
      success: true,
      message: 'Outlook OAuth configuration saved successfully'
    });
  } catch (error) {
    console.error('Error saving Outlook OAuth configuration:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Failed to save OAuth configuration' 
    });
  }
});

export default router;