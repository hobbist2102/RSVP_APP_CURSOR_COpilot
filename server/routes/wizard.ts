import express from 'express';
import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { events, eventSetupProgress } from '@shared/schema';
import { isAuthenticated, isAdmin } from '../middleware';

const router = express.Router();

/**
 * Get all setup progress for an event
 */
router.get('/:eventId/progress', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Check if event exists
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get all step progress data
    const progressData = await db.select().from(eventSetupProgress)
      .where(eq(eventSetupProgress.eventId, eventId));
    
    // Transform into a structured response
    const steps = progressData.map(step => ({
      stepId: step.stepId,
      isCompleted: step.isCompleted,
      lastUpdated: step.updatedAt,
      stepData: step.stepData,
    }));
    
    return res.status(200).json({ 
      eventId, 
      steps 
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
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Get specific step progress data
    const [stepData] = await db.select().from(eventSetupProgress)
      .where(
        and(
          eq(eventSetupProgress.eventId, eventId),
          eq(eventSetupProgress.stepId, stepId)
        )
      );
    
    if (!stepData) {
      return res.status(404).json({ error: 'Step data not found' });
    }
    
    return res.status(200).json({
      stepId: stepData.stepId,
      isCompleted: stepData.isCompleted,
      lastUpdated: stepData.updatedAt,
      stepData: stepData.stepData,
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
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Check if step data already exists
    const existingStepData = await db.select().from(eventSetupProgress)
      .where(
        and(
          eq(eventSetupProgress.eventId, eventId),
          eq(eventSetupProgress.stepId, stepId)
        )
      );
    
    if (existingStepData && existingStepData.length > 0) {
      // Update existing step data
      await db.update(eventSetupProgress)
        .set({
          stepData,
          isCompleted: true,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(eventSetupProgress.eventId, eventId),
            eq(eventSetupProgress.stepId, stepId)
          )
        );
    } else {
      // Insert new step data
      await db.insert(eventSetupProgress)
        .values({
          eventId,
          stepId,
          stepData,
          isCompleted: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
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
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event || event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    // Delete step data
    await db.delete(eventSetupProgress)
      .where(
        and(
          eq(eventSetupProgress.eventId, eventId),
          eq(eventSetupProgress.stepId, stepId)
        )
      );
    
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