import { Router, Request, Response, NextFunction } from "express";
import { storage } from "../storage";
import { z } from "zod";

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: 'Please log in again' });
};

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated() && req.user && (req.user as any).role === 'admin') {
    return next();
  }
  res.status(403).json({ message: 'Forbidden' });
};

const router = Router();

// Schema for validating OAuth configuration updates
const oauthConfigSchema = z.object({
  // Gmail settings
  gmailClientId: z.string().optional(),
  gmailClientSecret: z.string().optional(), 
  gmailRedirectUri: z.string().optional(),
  useGmail: z.boolean().optional(),
  
  // Outlook settings
  outlookClientId: z.string().optional(),
  outlookClientSecret: z.string().optional(),
  outlookRedirectUri: z.string().optional(),
  useOutlook: z.boolean().optional(),
  
  // SendGrid settings
  sendGridApiKey: z.string().optional(),
  useSendGrid: z.boolean().optional(),
  
  // General email settings
  emailFrom: z.string().optional(),
  emailReplyTo: z.string().optional(),
});

// Schema for RSVP settings
const rsvpSettingsSchema = z.object({
  // Email communication settings
  emailFrom: z.string().email().optional(),
  emailReplyTo: z.string().email().optional(),
  useGmail: z.boolean().optional(),
  useOutlook: z.boolean().optional(),
  useSendGrid: z.boolean().optional(),
  gmailAccount: z.string().optional(),
  outlookAccount: z.string().optional(),
  sendGridApiKey: z.string().optional(),
  
  // WhatsApp communication settings
  whatsappBusinessNumber: z.string().optional(),
  whatsappBusinessPhoneId: z.string().optional(),
  whatsappBusinessAccountId: z.string().optional(),
  whatsappAccessToken: z.string().optional(),
  whatsappConfigured: z.boolean().optional(),
  
  // General RSVP settings
  rsvpDeadline: z.string().optional(),
  allowPlusOnes: z.boolean().optional(),
  allowChildrenDetails: z.boolean().optional(),
  customRsvpUrl: z.string().optional(),
  emailConfigured: z.boolean().optional(),
});

// Schema for Travel & Accommodation settings
const travelAccommodationSettingsSchema = z.object({
  // Travel settings
  offerTravelAssistance: z.boolean().optional(),
  defaultArrivalLocation: z.string().optional(),
  defaultDepartureLocation: z.string().optional(),
  recommendedAirlines: z.array(z.string()).optional(),
  transportationProvided: z.boolean().optional(),
  
  // Accommodation settings
  defaultHotelName: z.string().optional(),
  defaultHotelAddress: z.string().optional(),
  defaultHotelPhone: z.string().optional(),
  defaultHotelWebsite: z.string().optional(),
  specialHotelRates: z.boolean().optional(),
  bookingInstructions: z.string().optional(),
});

// Combined settings schema
const eventSettingsSchema = z.object({
  oauth: oauthConfigSchema.optional(),
  rsvp: rsvpSettingsSchema.optional(),
  travelAccommodation: travelAccommodationSettingsSchema.optional(),
});

// Get event's OAuth configuration
router.get("/:eventId/oauth-config", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Return only the OAuth-related fields
    res.json({
      // Gmail settings
      gmailClientId: event.gmailClientId,
      gmailRedirectUri: event.gmailRedirectUri,
      gmailAccount: event.gmailAccount,
      useGmail: event.useGmail,
      
      // Outlook settings
      outlookClientId: event.outlookClientId,
      outlookRedirectUri: event.outlookRedirectUri,
      outlookAccount: event.outlookAccount,
      useOutlook: event.useOutlook,
      
      // SendGrid settings
      useSendGrid: event.useSendGrid,
      
      // General email settings
      emailFrom: event.emailFrom,
      emailReplyTo: event.emailReplyTo,
    });
  } catch (error) {
    console.error("Failed to get OAuth configuration:", error);
    res.status(500).json({ 
      message: "An error occurred while fetching OAuth configuration", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Update event's OAuth configuration
router.patch("/:eventId/oauth-config", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    
    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Validate the request body
    const validationResult = oauthConfigSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid OAuth configuration", 
        errors: validationResult.error.format() 
      });
    }
    
    // Update the OAuth configuration
    const updatedEvent = await storage.updateEvent(eventId, validationResult.data);
    
    if (!updatedEvent) {
      return res.status(500).json({
        message: "Failed to update OAuth configuration",
        details: "Event update returned no data"
      });
    }
    
    res.json({
      message: "OAuth configuration updated successfully",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title,
        // Include other non-sensitive fields as needed
      }
    });
  } catch (error) {
    console.error("Failed to update OAuth configuration:", error);
    res.status(500).json({ 
      message: "An error occurred while updating OAuth configuration", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Unified Settings Endpoints

/**
 * Get all settings for an event
 * This centralized endpoint returns a comprehensive object with all event settings
 */
router.get("/:eventId/settings", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Fetch WhatsApp status if WhatsApp details are present
    let whatsappConfigured = false;
    if (event.whatsappAccessToken && event.whatsappBusinessPhoneId) {
      whatsappConfigured = true;
    }

    // Prepare the settings response
    const settings = {
      // OAuth/Email settings
      oauth: {
        // Gmail settings
        gmailClientId: event.gmailClientId,
        gmailRedirectUri: event.gmailRedirectUri,
        gmailAccount: event.gmailAccount,
        useGmail: event.useGmail,
        
        // Outlook settings
        outlookClientId: event.outlookClientId,
        outlookRedirectUri: event.outlookRedirectUri, 
        outlookAccount: event.outlookAccount,
        useOutlook: event.useOutlook,
        
        // SendGrid settings
        useSendGrid: event.useSendGrid,
        
        // General email settings
        emailFrom: event.emailFrom,
        emailReplyTo: event.emailReplyTo,
      },
      
      // RSVP settings
      rsvp: {
        // Email & WhatsApp communication settings
        emailFrom: event.emailFrom,
        emailReplyTo: event.emailReplyTo,
        useGmail: event.useGmail,
        useOutlook: event.useOutlook,
        useSendGrid: event.useSendGrid,
        gmailAccount: event.gmailAccount,
        outlookAccount: event.outlookAccount,
        whatsappBusinessNumber: event.whatsappBusinessNumber,
        whatsappConfigured,
        
        // General RSVP settings
        rsvpDeadline: event.rsvpDeadline,
        allowPlusOnes: event.allowPlusOnes,
        allowChildrenDetails: event.allowChildrenDetails,
        customRsvpUrl: event.customRsvpUrl,
        emailConfigured: event.emailConfigured,
      },
      
      // Travel & Accommodation settings (may be empty in initial implementation)
      travelAccommodation: {
        // Travel settings
        offerTravelAssistance: event.offerTravelAssistance,
        defaultArrivalLocation: event.defaultArrivalLocation,
        defaultDepartureLocation: event.defaultDepartureLocation,
        recommendedAirlines: event.recommendedAirlines,
        transportationProvided: event.transportationProvided,
        
        // Accommodation settings
        defaultHotelName: event.defaultHotelName,
        defaultHotelAddress: event.defaultHotelAddress,
        defaultHotelPhone: event.defaultHotelPhone,
        defaultHotelWebsite: event.defaultHotelWebsite,
        specialHotelRates: event.specialHotelRates,
        bookingInstructions: event.bookingInstructions,
      },
    };

    res.json({
      success: true,
      eventId: event.id,
      settings
    });
  } catch (error) {
    console.error("Failed to get event settings:", error);
    res.status(500).json({ 
      success: false,
      message: "An error occurred while fetching event settings", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

/**
 * Update all or part of an event's settings
 * This endpoint accepts a modular payload that can update any combination of settings
 */
router.patch("/:eventId/settings", isAuthenticated, isAdmin, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    if (isNaN(eventId)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await storage.getEvent(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Validate the request body
    const validationResult = eventSettingsSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid settings data", 
        errors: validationResult.error.format() 
      });
    }

    // Extract the validated data
    const { oauth, rsvp, travelAccommodation } = validationResult.data;
    
    // Combine all settings into a single update object
    const updateData: any = {};
    
    // Add OAuth settings if provided
    if (oauth) {
      Object.assign(updateData, oauth);
    }
    
    // Add RSVP settings if provided
    if (rsvp) {
      Object.assign(updateData, rsvp);
    }
    
    // Add Travel & Accommodation settings if provided
    if (travelAccommodation) {
      Object.assign(updateData, travelAccommodation);
    }
    
    // Update the event with all provided settings
    const updatedEvent = await storage.updateEvent(eventId, updateData);
    
    if (!updatedEvent) {
      return res.status(500).json({
        message: "Failed to update event settings",
        details: "Event update returned no data"
      });
    }
    
    res.json({
      success: true,
      message: "Event settings updated successfully",
      event: {
        id: updatedEvent.id,
        title: updatedEvent.title
      }
    });
  } catch (error) {
    console.error("Failed to update event settings:", error);
    res.status(500).json({ 
      success: false,
      message: "An error occurred while updating event settings", 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;