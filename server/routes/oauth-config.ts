/**
 * OAuth Configuration Routes
 * Provides endpoints for saving OAuth credentials directly
 */
import { Router, Request, Response } from 'express';
import { storage } from '../storage';
import { z } from 'zod';
import { isAuthenticated, isAdmin } from '../middleware';

const router = Router();

// Schema for validating OAuth credentials
const oauthCredentialsSchema = z.object({
  clientId: z.string().min(1, "Client ID is required"),
  clientSecret: z.string().min(1, "Client Secret is required"),
  provider: z.enum(["gmail", "outlook"])
});

/**
 * Save OAuth credentials for a specific provider and event
 * This provides a direct way to save OAuth credentials even if the Settings page is not available
 */
router.post("/:provider/save", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const eventId = parseInt(req.query.eventId as string);
    
    // Validate provider
    if (provider !== 'gmail' && provider !== 'outlook') {
      return res.status(400).json({
        success: false,
        message: "Invalid provider",
        code: "INVALID_PROVIDER",
        details: "Provider must be either 'gmail' or 'outlook'"
      });
    }
    
    // Validate event ID
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
        code: "INVALID_EVENT_ID",
        details: "The event ID provided must be a valid number"
      });
    }
    
    // Get event to check if it exists
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        code: "EVENT_NOT_FOUND",
        details: `No event exists with ID ${eventId}`
      });
    }
    
    // Validate request body
    const validationResult = oauthCredentialsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid OAuth credentials",
        code: "INVALID_CREDENTIALS",
        details: validationResult.error.format()
      });
    }
    
    const { clientId, clientSecret } = validationResult.data;
    
    // Generate standard redirect URI
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    const redirectUri = `${baseUrl}/api/oauth/${provider}/callback`;
    
    // Update event with OAuth credentials
    const updateData: any = {};
    
    if (provider === 'gmail') {
      updateData.gmailClientId = clientId;
      updateData.gmailClientSecret = clientSecret;
      updateData.gmailRedirectUri = redirectUri;
    } else {
      updateData.outlookClientId = clientId;
      updateData.outlookClientSecret = clientSecret;
      updateData.outlookRedirectUri = redirectUri;
    }
    
    // Update the event with the new credentials
    const updatedEvent = await storage.updateEvent(eventId, updateData);
    
    if (!updatedEvent) {
      return res.status(500).json({
        success: false,
        message: "Failed to save OAuth credentials",
        code: "UPDATE_FAILED",
        details: "Event update returned no data"
      });
    }
    
    // Return success
    res.json({
      success: true,
      message: `${provider === 'gmail' ? 'Gmail' : 'Outlook'} OAuth credentials saved successfully`,
      redirectUri
    });
    
  } catch (error) {
    console.error(`Error saving OAuth credentials:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving OAuth credentials",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Get OAuth configuration status for a specific provider and event
 */
router.get("/:provider/status", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const eventId = parseInt(req.query.eventId as string);
    
    // Validate provider
    if (provider !== 'gmail' && provider !== 'outlook') {
      return res.status(400).json({
        success: false,
        message: "Invalid provider",
        code: "INVALID_PROVIDER",
        details: "Provider must be either 'gmail' or 'outlook'"
      });
    }
    
    // Validate event ID
    if (isNaN(eventId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid event ID",
        code: "INVALID_EVENT_ID",
        details: "The event ID provided must be a valid number"
      });
    }
    
    // Get event to check status
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
        code: "EVENT_NOT_FOUND",
        details: `No event exists with ID ${eventId}`
      });
    }
    
    // Check if OAuth is configured for this provider and event
    let isConfigured = false;
    let clientId = null;
    let hasClientSecret = false;
    let redirectUri = null;
    
    if (provider === 'gmail') {
      isConfigured = !!event.gmailClientId && !!event.gmailClientSecret;
      clientId = event.gmailClientId;
      hasClientSecret = !!event.gmailClientSecret;
      redirectUri = event.gmailRedirectUri;
    } else {
      isConfigured = !!event.outlookClientId && !!event.outlookClientSecret;
      clientId = event.outlookClientId;
      hasClientSecret = !!event.outlookClientSecret;
      redirectUri = event.outlookRedirectUri;
    }
    
    // Return configuration status
    res.json({
      success: true,
      isConfigured,
      clientId,
      hasClientSecret,
      redirectUri
    });
    
  } catch (error) {
    console.error(`Error checking OAuth configuration status:`, error);
    res.status(500).json({
      success: false,
      message: "An error occurred while checking OAuth configuration status",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;