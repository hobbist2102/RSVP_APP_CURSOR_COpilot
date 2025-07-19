import { Router, Request, Response } from 'express';
import { db } from '../db';
import { 
  travelInfo, 
  guests,
  transportGroups,
  transportAllocations,
  weddingEvents,
  insertTravelInfoSchema,
  guestTravelInfo,
  locationRepresentatives
} from '@shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';
import { isAuthenticated } from '../middleware';
import { z } from 'zod';

const router = Router();

/**
 * Get flight coordination dashboard data for an event
 */
router.get('/events/:eventId/flights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Get all guests for the event
    const allGuests = await db
      .select()
      .from(guests)
      .where(eq(guests.eventId, eventId));

    // Get travel info for these guests (simply return empty for now since no travel data exists)
    const travelData = [];

    // Create a map for efficient lookup
    const travelMap = new Map();
    for (const travel of travelData) {
      travelMap.set(travel.guestId, travel);
    }

    // Combine guest and travel data
    const guestsWithTravel = allGuests.map(guest => {
      const travel = travelMap.get(guest.id);
      return {
        id: guest.id,
        guestId: guest.id,
        guestName: `${guest.firstName} ${guest.lastName}`,
        name: `${guest.firstName} ${guest.lastName}`,
        email: guest.email,
        phone: guest.phone,
        travelId: travel?.id || null,
        travelMode: travel?.travelMode || null,
        arrivalDate: travel?.arrivalDate || null,
        arrivalTime: travel?.arrivalTime || null,
        arrivalLocation: travel?.arrivalLocation || null,
        departureDate: travel?.departureDate || null,
        departureTime: travel?.departureTime || null,
        departureLocation: travel?.departureLocation || null,
        flightNumber: travel?.flightNumber || null,
        airline: travel?.airline || null,
        terminal: travel?.terminal || null,
        gate: travel?.gate || null,
        flightStatus: travel?.flight_status || 'scheduled',
        needsTransportation: travel?.needsTransportation || false,
        specialRequirements: travel?.special_requirements || null
      };
    });

    // Transform data for flight coordination dashboard
    const flightData = guestsWithTravel
      .filter(guest => guest.travelMode === 'air' && guest.arrivalDate)
      .map(guest => ({
        id: guest.travelId,
        guestId: guest.id,
        guestName: guest.name,
        contactNumber: guest.phone,
        flightNumber: guest.flightNumber || '',
        airline: guest.airline || '',
        arrivalDate: guest.arrivalDate,
        arrivalTime: guest.arrivalTime || '',
        arrivalLocation: guest.arrivalLocation || '',
        departureDate: guest.departureDate,
        departureTime: guest.departureTime,
        departureLocation: guest.departureLocation,
        terminal: guest.terminal,
        gate: guest.gate,
        status: guest.flightStatus || 'scheduled',
        needsTransportation: guest.needsTransportation || false,
        specialRequirements: guest.specialRequirements
      }));

    res.json(flightData);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch flight data' });
  }
});

/**
 * Export guest list for travel agent (Phase 1 workflow)
 */
router.post('/events/:eventId/travel/export-for-agent', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Get event details
    const event = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get all guests for the event
    const guestList = await db
      .select({
        firstName: guests.firstName,
        lastName: guests.lastName,
        email: guests.email,
        phone: guests.phone,
        plusOneAllowed: guests.plusOneAllowed,
        plusOneConfirmed: guests.plusOneConfirmed,
        plusOneName: guests.plusOneName,
        notes: guests.notes,
        arrivalDate: travelInfo.arrivalDate,
        arrivalLocation: travelInfo.arrivalLocation,
        departureDate: travelInfo.departureDate,
        departureLocation: travelInfo.departureLocation,
        needsTransportation: travelInfo.needsTransportation
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(eq(guests.eventId, eventId));

    // Generate CSV content
    const csvHeaders = [
      'Guest Name',
      'Email',
      'Phone',
      'Plus One Name',
      'Preferred Arrival Date',
      'Preferred Arrival Airport',
      'Preferred Departure Date', 
      'Preferred Departure Airport',
      'Needs Transportation',
      'Special Requirements',
      'Flight Number',
      'Airline',
      'Actual Arrival Date',
      'Actual Arrival Time',
      'Terminal',
      'Gate'
    ];

    const csvRows = guestList.map(guest => [
      guest.name,
      guest.email || '',
      guest.phone || '',
      guest.plusOneConfirmed ? guest.plusOneName || '' : '',
      guest.arrivalDate || '',
      guest.arrivalLocation || '',
      guest.departureDate || '',
      guest.departureLocation || '',
      guest.needsTransportation ? 'Yes' : 'No',
      guest.specialRequirements || '',
      '', // Flight Number - to be filled by travel agent
      '', // Airline - to be filled by travel agent
      '', // Actual Arrival Date - to be filled by travel agent
      '', // Actual Arrival Time - to be filled by travel agent
      '', // Terminal - to be filled by travel agent
      ''  // Gate - to be filled by travel agent
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    

    res.json({
      success: true,
      csvData: csvContent,
      guestCount: guestList.length,
      eventName: event[0].title
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to export guest list' });
  }
});

/**
 * Import flight details from travel agent (Phase 1 workflow)
 */
router.post('/events/:eventId/travel/import-flights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { csvData } = req.body;

    if (!csvData) {
      return res.status(400).json({ error: 'CSV data is required' });
    }

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, ''));
    
    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map((v: string) => v.replace(/"/g, ''));
        
        const guestName = values[0];
        const flightNumber = values[10];
        const airline = values[11];
        const arrivalDate = values[12];
        const arrivalTime = values[13];
        const terminal = values[14];
        const gate = values[15];

        if (!guestName || !flightNumber) {
          continue; // Skip incomplete rows
        }

        // Find guest by name
        const guest = await db
          .select()
          .from(guests)
          .where(and(
            eq(guests.eventId, eventId), 
            eq(guests.firstName, guestName.split(' ')[0]),
            eq(guests.lastName, guestName.split(' ').slice(1).join(' ') || guestName.split(' ')[0])
          ))
          .limit(1);

        if (guest.length === 0) {
          errors.push(`Guest not found: ${guestName}`);
          errorCount++;
          continue;
        }

        // Update or create travel info
        const existingTravel = await db
          .select()
          .from(travelInfo)
          .where(eq(travelInfo.guestId, guest[0].id))
          .limit(1);

        const travelData = {
          guestId: guest[0].id,
          travelMode: 'air' as const,
          flightNumber,
          airline,
          arrivalDate,
          arrivalTime,
          terminal,
          gate,
          flightStatus: 'confirmed' as const,
          needsTransportation: true
        };

        if (existingTravel.length > 0) {
          await db
            .update(travelInfo)
            .set({
              ...travelData,
              updatedAt: new Date()
            })
            .where(eq(travelInfo.id, existingTravel[0].id));
        } else {
          await db.insert(travelInfo).values(travelData);
        }

        successCount++;
      } catch (rowError) {
        
        errorCount++;
        errors.push(`Row ${i}: ${rowError}`);
      }
    }

    

    res.json({
      success: true,
      imported: successCount,
      errors: errorCount,
      errorDetails: errors.slice(0, 10) // Limit error details
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to import flight details' });
  }
});

/**
 * Update flight status
 */
router.put('/flights/:flightId/status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const flightId = parseInt(req.params.flightId);
    const { status } = req.body;

    const validStatuses = ['scheduled', 'confirmed', 'delayed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid flight status' });
    }

    await db
      .update(travelInfo)
      .set({ 
        flightStatus: status,
        updatedAt: new Date()
      })
      .where(eq(travelInfo.id, flightId));

    

    res.json({ success: true, status });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to update flight status' });
  }
});

/**
 * Create or update flight information for a guest (direct planner input)
 */
router.post('/guests/:guestId/flight', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const guestId = parseInt(req.params.guestId);
    const flightData = req.body;

    // Validate guest exists
    const guest = await db
      .select()
      .from(guests)
      .where(eq(guests.id, guestId))
      .limit(1);

    if (guest.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }

    // Check if travel info already exists
    const existingTravel = await db
      .select()
      .from(travelInfo)
      .where(eq(travelInfo.guestId, guestId))
      .limit(1);

    const travelPayload = {
      guestId,
      travelMode: 'air',
      flightNumber: flightData.flightNumber,
      airline: flightData.airline,
      arrivalDate: flightData.arrivalDate,
      arrivalTime: flightData.arrivalTime,
      arrivalLocation: flightData.arrivalLocation,
      departureDate: flightData.departureDate,
      departureTime: flightData.departureTime,
      departureLocation: flightData.departureLocation,
      terminal: flightData.terminal,
      gate: flightData.gate,
      flightStatus: flightData.flightStatus || 'scheduled',
      needsTransportation: flightData.needsTransportation || false,
      specialRequirements: flightData.specialRequirements,
      updatedAt: new Date()
    };

    let result;
    if (existingTravel.length > 0) {
      // Update existing
      result = await db
        .update(travelInfo)
        .set(travelPayload)
        .where(eq(travelInfo.id, existingTravel[0].id))
        .returning();
    } else {
      // Create new
      result = await db
        .insert(travelInfo)
        .values(travelPayload)
        .returning();
    }

    

    res.json({
      success: true,
      travelInfo: result[0],
      action: existingTravel.length > 0 ? 'updated' : 'created'
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to save flight information' });
  }
});

/**
 * Generate transport groups based on flight arrivals (Phase 1 integration)
 */
router.post('/events/:eventId/generate-transport-from-flights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Get event configuration for buffer times
    const event = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const bufferMinutes = event[0].arrivalBufferTime ? 
      parseInt(event[0].arrivalBufferTime.split(':')[0]) * 60 + 
      parseInt(event[0].arrivalBufferTime.split(':')[1]) : 30;

    // Get all guests with confirmed flights needing transportation
    const flightGuests = await db
      .select({
        guestId: guests.id,
        guestName: guests.firstName,
        arrivalDate: travelInfo.arrivalDate,
        arrivalTime: travelInfo.arrivalTime,
        arrivalLocation: travelInfo.arrivalLocation,
        flightNumber: travelInfo.flightNumber,
        needsTransportation: travelInfo.needsTransportation
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(and(
        eq(guests.eventId, eventId),
        eq(travelInfo.travelMode, 'air'),
        eq(travelInfo.needsTransportation, true),
        eq(travelInfo.flightStatus, 'confirmed')
      ));

    // Group guests by arrival time slots (considering buffer time)
    const timeSlots: { [key: string]: any[] } = {};
    
    flightGuests.forEach(guest => {
      if (!guest.arrivalDate || !guest.arrivalTime) return;

      const arrivalDateTime = new Date(`${guest.arrivalDate}T${guest.arrivalTime}`);
      const pickupDateTime = new Date(arrivalDateTime.getTime() + bufferMinutes * 60000);
      
      // Create 30-minute pickup time slots
      const slotHour = Math.floor(pickupDateTime.getHours());
      const slotMinute = pickupDateTime.getMinutes() < 30 ? 0 : 30;
      const timeSlotKey = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
      const locationSlotKey = `${guest.arrivalLocation}_${guest.arrivalDate}_${timeSlotKey}`;

      if (!timeSlots[locationSlotKey]) {
        timeSlots[locationSlotKey] = [];
      }
      timeSlots[locationSlotKey].push(guest);
    });

    let groupCount = 0;
    
    // Create transport groups for each time slot
    for (const [slotKey, guests] of Object.entries(timeSlots)) {
      const [location, date, time] = slotKey.split('_');
      
      // Determine vehicle type based on group size
      const groupSize = guests.length;
      let vehicleType = 'sedan';
      let vehicleCount = 1;
      
      if (groupSize <= 4) {
        vehicleType = 'sedan';
        vehicleCount = 1;
      } else if (groupSize <= 8) {
        vehicleType = 'suv';
        vehicleCount = Math.ceil(groupSize / 6);
      } else {
        vehicleType = 'bus';
        vehicleCount = Math.ceil(groupSize / 15);
      }

      // Create transport group
      const [transportGroup] = await db
        .insert(transportGroups)
        .values({
          eventId,
          name: `Flight Pickup - ${location} ${time}`,
          pickupLocation: location,
          pickupDate: date,
          pickupTimeSlot: time,
          dropoffLocation: event[0].accommodationHotelName || event[0].location || 'Hotel',
          vehicleType,
          vehicleCount,
          vehicleCapacity: vehicleType === 'bus' ? 15 : vehicleType === 'suv' ? 6 : 4,
          status: 'draft',
          transportMode: 'shuttle'
        })
        .returning();

      // Create allocations for each guest
      for (const guest of guests) {
        await db
          .insert(transportAllocations)
          .values({
            transportGroupId: transportGroup.id,
            guestId: guest.guestId,
            status: 'pending',
            includesPlusOne: false, // Will be updated based on guest data
            includesChildren: false,
            childrenCount: 0
          });
      }

      groupCount++;
    }

    

    res.json({
      success: true,
      groupsCreated: groupCount,
      guestsProcessed: flightGuests.length,
      bufferMinutes
    });
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to generate transport groups' });
  }
});

export default router;