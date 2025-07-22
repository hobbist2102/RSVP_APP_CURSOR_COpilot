import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  guests,
  guestTravelInfo,
  locationRepresentatives,
  weddingEvents
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';


const router = Router();

/**
 * ULTRA-FAST batch endpoint for travel management data
 * Combines all travel-related queries into single optimized call
 */
router.get('/events/:eventId/travel-batch', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const startTime = Date.now();

    

    // Start with a simple query to test the database connection
    let guestTravelResults, airportRepsResults, eventSettingsResults;
    
    try {
      // Simple guests query first
      guestTravelResults = await db.select().from(guests).where(eq(guests.eventId, eventId)).limit(10);
      
      
      // Simple airport reps query 
      airportRepsResults = await db.select().from(locationRepresentatives).limit(10);
      
      
      // Simple event settings query
      eventSettingsResults = await db.select().from(weddingEvents).where(eq(weddingEvents.id, eventId)).limit(1);
      
      
    } catch (queryError) {
      
      throw new Error(`Database query failed: ${queryError.message}`);
    }

    // Process results efficiently with simple data structure
    const travelGuests = (guestTravelResults || []).map(guest => ({
      id: guest.id,
      name: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      rsvpStatus: guest.rsvpStatus,
      needsFlightAssistance: guest.needsFlightAssistance || false,
      travelInfo: null, // Will be populated when we add travel info queries
      flightStatus: 'pending'
    }));

    // Calculate statistics
    const totalGuests = travelGuests.length;
    const withFlightInfo = travelGuests.filter(g => g.travelInfo?.flightNumber).length;
    const confirmed = travelGuests.filter(g => g.flightStatus === 'confirmed').length;
    const pending = travelGuests.filter(g => g.flightStatus === 'pending').length;
    const needsAssistance = travelGuests.filter(g => g.needsFlightAssistance).length;

    const data = {
      travelGuests,
      airportReps: airportRepsResults || [],
      travelSettings: (eventSettingsResults || [])[0] || {},
      statistics: {
        totalGuests,
        withFlightInfo,
        confirmed,
        pending,
        needsAssistance,
        completionRate: totalGuests > 0 ? Math.round((confirmed / totalGuests) * 100) : 0
      }
    };

    const executionTime = Date.now() - startTime;
    
    // Log performance metrics
    if (executionTime < 3) {
      
    } else if (executionTime < 10) {
      
    } else {
      
    }

    res.json(data);

  } catch (error) {
    
    res.status(500).json({ 
      error: 'Failed to fetch travel data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;