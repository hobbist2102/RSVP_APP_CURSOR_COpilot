import express from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { weddingEvents, eventSetupProgress } from '@shared/schema';
import { isAuthenticated, isAdmin } from '../middleware';

const router = express.Router();

/**
 * Get all setup progress for an event
 */
router.get('/:eventId/progress', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists
    const event = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get progress data
    const [progressData] = await db.select().from(eventSetupProgress)
      .where(eq(eventSetupProgress.eventId, eventId));
    
    if (!progressData) {
      // Create default progress entry if none exists
      const newProgress = {
        eventId,
        currentStep: 'basic_info',
        basicInfoComplete: false,
        venuesComplete: false,
        rsvpComplete: false,
        accommodationComplete: false,
        transportComplete: false,
        communicationComplete: false,
        stylingComplete: false,
        updatedAt: new Date(),
      };
      
      await db.insert(eventSetupProgress).values(newProgress);
      
      return res.status(200).json({ 
        eventId,
        currentStep: 'basic_info',
        steps: {
          basic_info: { isCompleted: false },
          venues: { isCompleted: false },
          rsvp_config: { isCompleted: false },
          hotels: { isCompleted: false },
          transport: { isCompleted: false },
          communication: { isCompleted: false },
          ai_assistant: { isCompleted: false },
          design: { isCompleted: false }
        }
      });
    }
    
    // Transform into a structured response
    return res.status(200).json({ 
      eventId, 
      currentStep: progressData.currentStep || 'basic_info',
      steps: {
        basic_info: { isCompleted: !!progressData.basicInfoComplete },
        venues: { isCompleted: !!progressData.venuesComplete },
        rsvp_config: { isCompleted: !!progressData.rsvpComplete },
        hotels: { isCompleted: !!progressData.accommodationComplete },
        transport: { isCompleted: !!progressData.transportComplete },
        communication: { isCompleted: !!progressData.communicationComplete },
        ai_assistant: { isCompleted: false }, // Not in the original schema, defaulting to false
        design: { isCompleted: !!progressData.stylingComplete }
      }
    });
  } catch (error) {
    console.error('Error fetching setup progress:', error);
    return res.status(500).json({ error: 'Failed to fetch setup progress' });
  }
});

/**
 * Get specific step data for an event
 */
router.get('/:eventId/steps/:stepId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const stepId = req.params.stepId;
    
    // Check if event exists
    const event = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get progress data
    const [progressData] = await db.select().from(eventSetupProgress)
      .where(eq(eventSetupProgress.eventId, eventId));
    
    if (!progressData) {
      return res.status(404).json({ error: 'Progress data not found' });
    }
    
    let isCompleted = false;
    
    // Map stepId to the corresponding field in the database
    switch (stepId) {
      case 'basic_info':
        isCompleted = !!progressData.basicInfoComplete;
        break;
      case 'venues':
        isCompleted = !!progressData.venuesComplete;
        break;
      case 'rsvp_config':
        isCompleted = !!progressData.rsvpComplete;
        break;
      case 'hotels':
        isCompleted = !!progressData.accommodationComplete;
        break;
      case 'transport':
        isCompleted = !!progressData.transportComplete;
        break;
      case 'communication':
        isCompleted = !!progressData.communicationComplete;
        break;
      case 'ai_assistant':
        isCompleted = false; // Not in original schema
        break;
      case 'design':
        isCompleted = !!progressData.stylingComplete;
        break;
      default:
        return res.status(404).json({ error: 'Invalid step ID' });
    }
    
    // For now, we don't store step-specific data, just completion status
    return res.status(200).json({
      stepId,
      isCompleted,
      lastUpdated: progressData.updatedAt
    });
  } catch (error) {
    console.error('Error fetching step data:', error);
    return res.status(500).json({ error: 'Failed to fetch step data' });
  }
});

/**
 * Save step data for an event
 */
router.post('/:eventId/steps/:stepId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const stepId = req.params.stepId;
    const stepData = req.body;
    
    // Check if event exists
    const event = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get current progress data
    const progressData = await db.select().from(eventSetupProgress)
      .where(eq(eventSetupProgress.eventId, eventId));
    
    const updateValues: any = {
      updatedAt: new Date(),
      currentStep: stepId
    };
    
    // Set the appropriate completion field based on the step ID
    switch (stepId) {
      case 'basic_info':
        updateValues.basicInfoComplete = true;
        
        // Update the actual event data in the database
        if (stepData && typeof stepData === 'object') {
          await db.update(weddingEvents)
            .set({
              title: stepData.title,
              coupleNames: stepData.coupleNames,
              brideName: stepData.brideName,
              groomName: stepData.groomName,
              startDate: new Date(stepData.startDate),
              endDate: new Date(stepData.endDate),
              location: stepData.location,
              description: stepData.description || null,
              updatedAt: new Date()
            })
            .where(eq(weddingEvents.id, eventId));
        }
        break;
      case 'venues':
        updateValues.venuesComplete = true;
        break;
      case 'rsvp_config':
        updateValues.rsvpComplete = true;
        break;
      case 'hotels':
        updateValues.accommodationComplete = true;
        break;
      case 'transport':
        updateValues.transportComplete = true;
        break;
      case 'communication':
        updateValues.communicationComplete = true;
        break;
      case 'ai_assistant':
        // Not in original schema, we'll just update currentStep
        break;
      case 'design':
        updateValues.stylingComplete = true;
        break;
      default:
        return res.status(400).json({ error: 'Invalid step ID' });
    }
    
    if (progressData && progressData.length > 0) {
      // Update existing progress data
      await db.update(eventSetupProgress)
        .set(updateValues)
        .where(eq(eventSetupProgress.eventId, eventId));
    } else {
      // Insert new progress data with all fields defaulting to false except the current step
      const initialValues = {
        eventId,
        currentStep: stepId,
        basicInfoComplete: stepId === 'basic_info',
        venuesComplete: stepId === 'venues',
        rsvpComplete: stepId === 'rsvp_config',
        accommodationComplete: stepId === 'hotels',
        transportComplete: stepId === 'transport',
        communicationComplete: stepId === 'communication',
        stylingComplete: stepId === 'design',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await db.insert(eventSetupProgress).values(initialValues);
    }
    
    // Check if all required steps are completed, and if so, mark the setup as complete
    if (progressData && progressData.length > 0) {
      const current = progressData[0];
      if (
        current.basicInfoComplete && 
        current.venuesComplete && 
        current.rsvpComplete && 
        current.accommodationComplete &&
        current.transportComplete && 
        current.communicationComplete && 
        current.stylingComplete
      ) {
        await db.update(eventSetupProgress)
          .set({ completedAt: new Date() })
          .where(eq(eventSetupProgress.eventId, eventId));
      }
    }
    
    return res.status(200).json({
      success: true,
      message: 'Step data saved successfully',
    });
  } catch (error) {
    console.error('Error saving step data:', error);
    return res.status(500).json({ error: 'Failed to save step data' });
  }
});

/**
 * Reset step data for an event
 */
router.delete('/:eventId/steps/:stepId', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const stepId = req.params.stepId;
    
    // Check if event exists
    const event = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    const updateValues: any = {
      updatedAt: new Date()
    };
    
    // Set the appropriate completion field to false based on the step ID
    switch (stepId) {
      case 'basic_info':
        updateValues.basicInfoComplete = false;
        break;
      case 'venues':
        updateValues.venuesComplete = false;
        break;
      case 'rsvp_config':
        updateValues.rsvpComplete = false;
        break;
      case 'hotels':
        updateValues.accommodationComplete = false;
        break;
      case 'transport':
        updateValues.transportComplete = false;
        break;
      case 'communication':
        updateValues.communicationComplete = false;
        break;
      case 'ai_assistant':
        // Not in original schema, we'll just update updatedAt
        break;
      case 'design':
        updateValues.stylingComplete = false;
        break;
      default:
        return res.status(400).json({ error: 'Invalid step ID' });
    }
    
    // Reset the completedAt date since at least one step is now incomplete
    updateValues.completedAt = null;
    
    // Update progress data
    await db.update(eventSetupProgress)
      .set(updateValues)
      .where(eq(eventSetupProgress.eventId, eventId));
    
    return res.status(200).json({
      success: true,
      message: 'Step data reset successfully',
    });
  } catch (error) {
    console.error('Error resetting step data:', error);
    return res.status(500).json({ error: 'Failed to reset step data' });
  }
});

export default router;