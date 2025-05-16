import { Request, Response, Router } from "express";
import { isAuthenticated, isAdmin } from "../middleware";
import { db } from "../db";
import { sql } from "drizzle-orm";
import { eventSetupProgress } from "@shared/schema";
import { eq } from "drizzle-orm";

const wizardRouter = Router();

// Get event setup progress
wizardRouter.get("/events/:eventId/setup-progress", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists and user has access
    const event = await db.query.events.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Get setup progress
    const progress = await db.query.eventSetupProgress.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!progress) {
      // Create new progress record if it doesn't exist
      const newProgress = {
        eventId,
        basicInfoComplete: false,
        venuesComplete: false,
        rsvpComplete: false,
        accommodationComplete: false,
        transportComplete: false,
        communicationComplete: false,
        stylingComplete: false,
        aiAssistantComplete: false,
        currentStep: "basic_info",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [created] = await db.insert(eventSetupProgress).values(newProgress).returning();
      return res.status(200).json(created);
    }
    
    return res.status(200).json(progress);
  } catch (error) {
    console.error("Error getting setup progress:", error);
    return res.status(500).json({ message: "Failed to retrieve setup progress" });
  }
});

// Save event setup progress
wizardRouter.post("/events/:eventId/setup-progress", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { currentStep } = req.body;
    
    // Check if event exists and user has access
    const event = await db.query.events.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Get existing progress
    const progress = await db.query.eventSetupProgress.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!progress) {
      // Create new progress record if it doesn't exist
      const newProgress = {
        eventId,
        basicInfoComplete: false,
        venuesComplete: false,
        rsvpComplete: false,
        accommodationComplete: false,
        transportComplete: false,
        communicationComplete: false,
        stylingComplete: false,
        aiAssistantComplete: false,
        currentStep: currentStep || "basic_info",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [created] = await db.insert(eventSetupProgress).values(newProgress).returning();
      return res.status(200).json(created);
    }
    
    // Update existing progress
    const [updated] = await db.update(eventSetupProgress)
      .set({ 
        currentStep: currentStep || progress.currentStep,
        updatedAt: new Date()
      })
      .where(eq(eventSetupProgress.eventId, eventId))
      .returning();
    
    return res.status(200).json(updated);
  } catch (error) {
    console.error("Error saving setup progress:", error);
    return res.status(500).json({ message: "Failed to save setup progress" });
  }
});

// Complete a step in the wizard
wizardRouter.post("/events/:eventId/complete-step", isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { step, data } = req.body;
    
    // Check if event exists and user has access
    const event = await db.query.events.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    
    // Get existing progress
    let progress = await db.query.eventSetupProgress.findFirst({
      where: eq(eventSetupProgress.eventId, eventId)
    });
    
    if (!progress) {
      // Create new progress record if it doesn't exist
      const newProgress = {
        eventId,
        basicInfoComplete: step === "basic_info",
        venuesComplete: step === "venues",
        rsvpComplete: step === "rsvp",
        accommodationComplete: step === "accommodation",
        transportComplete: step === "transport",
        communicationComplete: step === "communication",
        aiAssistantComplete: step === "ai_assistant",
        stylingComplete: step === "styling",
        currentStep: step,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const [created] = await db.insert(eventSetupProgress).values(newProgress).returning();
      progress = created;
    } else {
      // Update field based on step
      const updateData: any = { updatedAt: new Date() };
      
      switch (step) {
        case "basic_info":
          updateData.basicInfoComplete = true;
          
          // Also update the event basic info
          if (data) {
            await db.update(event)
              .set({
                title: data.title,
                coupleNames: data.coupleNames,
                brideName: data.brideName,
                groomName: data.groomName,
                startDate: data.startDate,
                endDate: data.endDate,
                location: data.location,
                description: data.description,
                updatedAt: new Date()
              })
              .where(eq(event.id, eventId));
          }
          break;
        case "venues":
          updateData.venuesComplete = true;
          
          // Here you could handle saving venues data
          break;
        case "rsvp":
          updateData.rsvpComplete = true;
          
          // Handle RSVP settings
          if (data) {
            await db.update(event)
              .set({
                rsvpDeadline: data.rsvpDeadline,
                allowPlusOnes: data.allowPlusOnes,
                allowChildrenDetails: data.collectChildrenDetails,
                updatedAt: new Date()
              })
              .where(eq(event.id, eventId));
          }
          break;
        case "accommodation":
          updateData.accommodationComplete = true;
          
          // Handle accommodation settings
          if (data?.accommodationSettings) {
            await db.update(event)
              .set({
                accommodationMode: data.accommodationSettings.accommodationMode,
                accommodationInstructions: data.accommodationSettings.accommodationInstructions,
                accommodationSpecialDeals: data.accommodationSettings.accommodationSpecialDeals,
                updatedAt: new Date()
              })
              .where(eq(event.id, eventId));
          }
          break;
        case "transport":
          updateData.transportComplete = true;
          break;
        case "communication":
          updateData.communicationComplete = true;
          break;
        case "ai_assistant":
          updateData.aiAssistantComplete = true;
          break;
        case "styling":
          updateData.stylingComplete = true;
          break;
        default:
          break;
      }
      
      // Determine if all steps are complete
      const allComplete = 
        (step === "basic_info" || progress.basicInfoComplete) &&
        (step === "venues" || progress.venuesComplete) &&
        (step === "rsvp" || progress.rsvpComplete) &&
        (step === "accommodation" || progress.accommodationComplete) &&
        (step === "transport" || progress.transportComplete) &&
        (step === "communication" || progress.communicationComplete) &&
        (step === "ai_assistant" || progress.aiAssistantComplete) &&
        (step === "styling" || progress.stylingComplete);
      
      if (allComplete) {
        updateData.completedAt = new Date();
      }
      
      // Update progress
      const [updated] = await db.update(eventSetupProgress)
        .set(updateData)
        .where(eq(eventSetupProgress.eventId, eventId))
        .returning();
      
      progress = updated;
    }
    
    return res.status(200).json(progress);
  } catch (error) {
    console.error("Error completing step:", error);
    return res.status(500).json({ message: "Failed to complete step" });
  }
});

// Placeholder endpoints for wizard data (to be implemented as needed)

// Get design settings
wizardRouter.get("/events/:eventId/design-settings", isAuthenticated, (req: Request, res: Response) => {
  // Placeholder - would fetch real data from database
  res.status(200).json({});
});

// Get AI settings
wizardRouter.get("/events/:eventId/ai-settings", isAuthenticated, (req: Request, res: Response) => {
  // Placeholder - would fetch real data from database
  res.status(200).json({});
});

// Get communication settings
wizardRouter.get("/events/:eventId/communication-settings", isAuthenticated, (req: Request, res: Response) => {
  // Placeholder - would fetch real data from database
  res.status(200).json({});
});

export default wizardRouter;