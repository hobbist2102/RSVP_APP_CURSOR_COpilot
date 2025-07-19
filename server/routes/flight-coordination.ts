import express, { Request, Response } from 'express';
import { db } from '../db.js';
import { guests, travelInfo, weddingEvents, transportGroups, transportAllocations } from '@shared/schema';
import { eq, and } from 'drizzle-orm';
import { isAuthenticated } from '../middleware.js';
import { createObjectCsvStringifier } from 'csv-writer';
import * as XLSX from 'sheetjs-style';

const router = express.Router();

/**
 * Get flight coordination status for an event
 */
router.get('/events/:eventId/flight-coordination-status', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Get event configuration
    const event = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get flight assistance guests count
    const guestsWithFlightAssistance = await db
      .select()
      .from(guests)
      .where(and(
        eq(guests.eventId, eventId),
        eq(guests.needsFlightAssistance, true)
      ));

    // Get guests with flight information
    const guestsWithFlightInfo = await db
      .select({
        guestId: guests.id,
        flightInfo: travelInfo
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(and(
        eq(guests.eventId, eventId),
        eq(guests.needsFlightAssistance, true)
      ));

    // Calculate workflow status
    const totalNeedingAssistance = guestsWithFlightAssistance.length;
    const withFlightInfo = guestsWithFlightInfo.filter(g => g.flightInfo).length;
    const confirmed = guestsWithFlightInfo.filter(g => 
      g.flightInfo && g.flightInfo.status === 'confirmed'
    ).length;

    const status = {
      totalGuestsNeedingAssistance: totalNeedingAssistance,
      guestsWithFlightInfo: withFlightInfo,
      confirmedFlights: confirmed,
      exported: event[0].flightListExported || false,
      notificationsSent: event[0].flightNotificationsSent || 0,
      lastExportDate: event[0].flightListExportDate,
      workflowCompletion: totalNeedingAssistance > 0 ? 
        Math.round(((withFlightInfo + confirmed) / (totalNeedingAssistance * 2)) * 100) : 100
    };

    res.json(status);
  } catch (error) {
    
    res.status(500).json({ error: 'Failed to fetch coordination status' });
  }
});

/**
 * Export flight list for travel agent coordination
 */
router.post('/events/:eventId/export-flight-list', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { format = 'csv', includeDetails = true } = req.body;

    // Get guests needing flight assistance with their details
    const flightGuests = await db
      .select({
        guestId: guests.id,
        guestName: guests.name,
        email: guests.email,
        phone: guests.phone,
        needsFlightAssistance: guests.needsFlightAssistance,
        accommodationPreference: guests.accommodationPreference,
        dietaryRestrictions: guests.dietaryRestrictions,
        specialRequests: guests.specialRequests,
        travelMode: guests.travelMode,
        arrivalDate: guests.arrivalDate,
        departureDate: guests.departureDate,
        flightInfo: travelInfo
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(and(
        eq(guests.eventId, eventId),
        eq(guests.needsFlightAssistance, true)
      ));

    // Prepare export data
    const exportData = flightGuests.map(guest => ({
      'Guest Name': guest.guestName,
      'Email': guest.email,
      'Phone': guest.phone || '',
      'Travel Mode': guest.travelMode || 'Air',
      'Preferred Arrival Date': guest.arrivalDate ? guest.arrivalDate.toISOString().split('T')[0] : '',
      'Preferred Departure Date': guest.departureDate ? guest.departureDate.toISOString().split('T')[0] : '',
      'Accommodation Preference': guest.accommodationPreference || '',
      'Dietary Restrictions': guest.dietaryRestrictions || '',
      'Special Requests': guest.specialRequests || '',
      'Current Flight Number': guest.flightInfo?.flightNumber || '',
      'Current Arrival Time': guest.flightInfo?.arrivalTime || '',
      'Current Departure Time': guest.flightInfo?.departureTime || '',
      'Origin Airport': guest.flightInfo?.originAirport || '',
      'Destination Airport': guest.flightInfo?.destinationAirport || ''
    }));

    let content: string;
    let contentType: string;
    let fileExtension: string;

    if (format === 'csv') {
      const csvStringifier = createObjectCsvStringifier({
        header: Object.keys(exportData[0] || {}).map(key => ({ id: key, title: key }))
      });
      
      content = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(exportData);
      contentType = 'text/csv';
      fileExtension = 'csv';
    } else {
      // Excel format
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Flight List');
      
      content = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      fileExtension = 'xlsx';
    }

    // Update export tracking
    await db
      .update(weddingEvents)
      .set({
        flightListExported: true,
        flightListExportDate: new Date()
      })
      .where(eq(weddingEvents.id, eventId));

    res.json({
      success: true,
      content,
      format: fileExtension,
      filename: `flight-list-event-${eventId}.${fileExtension}`,
      exportedCount: exportData.length
    });

  } catch (error) {
    
    res.status(500).json({ error: 'Failed to export flight list' });
  }
});

/**
 * Import flight details from travel agent
 */
router.post('/events/:eventId/import-flight-details', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { flightData } = req.body;

    if (!Array.isArray(flightData)) {
      return res.status(400).json({ error: 'Flight data must be an array' });
    }

    let updatedCount = 0;
    let createdCount = 0;

    for (const flight of flightData) {
      // Find guest by name or email
      const guest = await db
        .select()
        .from(guests)
        .where(and(
          eq(guests.eventId, eventId),
          // Match by name or email
          // Note: In a real implementation, you'd want more sophisticated matching
        ))
        .limit(1);

      if (guest.length === 0) {
        
        continue;
      }

      const guestId = guest[0].id;

      // Check if travel info already exists
      const existingTravelInfo = await db
        .select()
        .from(travelInfo)
        .where(eq(travelInfo.guestId, guestId))
        .limit(1);

      const flightInfoData = {
        guestId,
        travelMode: 'air',
        flightNumber: flight.flightNumber,
        arrivalTime: flight.arrivalTime,
        departureTime: flight.departureTime,
        originAirport: flight.originAirport,
        destinationAirport: flight.destinationAirport,
        airline: flight.airline,
        status: 'confirmed',
        updatedAt: new Date()
      };

      if (existingTravelInfo.length > 0) {
        // Update existing record
        await db
          .update(travelInfo)
          .set(flightInfoData)
          .where(eq(travelInfo.id, existingTravelInfo[0].id));
        updatedCount++;
      } else {
        // Create new record
        await db
          .insert(travelInfo)
          .values(flightInfoData);
        createdCount++;
      }

      // Update guest flight status
      await db
        .update(guests)
        .set({ flightStatus: 'confirmed' })
        .where(eq(guests.id, guestId));
    }

    res.json({
      success: true,
      updatedCount,
      createdCount,
      totalProcessed: updatedCount + createdCount
    });

  } catch (error) {
    
    res.status(500).json({ error: 'Failed to import flight details' });
  }
});

/**
 * Send flight notifications to guests
 */
router.post('/events/:eventId/send-flight-notifications', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const { type, guestIds } = req.body;

    if (!['confirmation', 'reminder', 'update'].includes(type)) {
      return res.status(400).json({ error: 'Invalid notification type' });
    }

    // Get event details for email templates
    const event = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get guests with their travel information
    const guestsToNotify = await db
      .select({
        guest: guests,
        travel: travelInfo
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(and(
        eq(guests.eventId, eventId),
        guestIds && guestIds.length > 0 ? 
          // Filter by specific guest IDs if provided
          eq(guests.id, guestIds[0]) : // Simplified for demo
          eq(guests.needsFlightAssistance, true)
      ));

    let sentCount = 0;

    for (const { guest, travel } of guestsToNotify) {
      try {
        // Here you would integrate with your email service
        // For now, we'll just simulate the notification
        
        
        // In a real implementation, you'd call your email service here
        // await emailService.sendFlightNotification({
        //   to: guest.email,
        //   type,
        //   guestName: guest.name,
        //   eventDetails: event[0],
        //   flightDetails: travel
        // });

        sentCount++;
      } catch (error) {
        
      }
    }

    // Update notification tracking
    const currentCount = event[0].flightNotificationsSent || 0;
    await db
      .update(weddingEvents)
      .set({
        flightNotificationsSent: currentCount + sentCount,
        lastFlightNotificationDate: new Date()
      })
      .where(eq(weddingEvents.id, eventId));

    res.json({
      success: true,
      sentCount,
      notificationType: type
    });

  } catch (error) {
    
    res.status(500).json({ error: 'Failed to send notifications' });
  }
});

/**
 * Regenerate transport groups based on flight arrivals
 */
router.post('/events/:eventId/regenerate-transport-from-flights', isAuthenticated, async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.eventId);

    // Get event buffer time configuration
    const event = await db
      .select()
      .from(weddingEvents)
      .where(eq(weddingEvents.id, eventId))
      .limit(1);

    if (event.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get guests with confirmed flight information
    const guestsWithFlights = await db
      .select({
        guest: guests,
        travel: travelInfo
      })
      .from(guests)
      .leftJoin(travelInfo, eq(guests.id, travelInfo.guestId))
      .where(and(
        eq(guests.eventId, eventId),
        eq(guests.needsFlightAssistance, true)
      ));

    // Clear existing transport allocations for flight-based groups
    await db
      .delete(transportAllocations)
      .where(
        // This would need a more sophisticated query to identify flight-based groups
        eq(transportAllocations.guestId, 0) // Placeholder
      );

    // Group guests by arrival time windows (considering buffer time)
    const bufferMinutes = event[0].arrivalBufferTime ? 
      parseInt(event[0].arrivalBufferTime.split(':')[0]) * 60 + 
      parseInt(event[0].arrivalBufferTime.split(':')[1]) : 60;

    const arrivalGroups = new Map<string, any[]>();

    for (const { guest, travel } of guestsWithFlights) {
      if (travel && travel.arrivalTime) {
        const arrivalTime = new Date(travel.arrivalTime);
        // Round to nearest hour for grouping
        const groupKey = new Date(arrivalTime.getTime() + bufferMinutes * 60000)
          .toISOString().slice(0, 13) + ':00:00.000Z';
        
        if (!arrivalGroups.has(groupKey)) {
          arrivalGroups.set(groupKey, []);
        }
        arrivalGroups.get(groupKey)!.push({ guest, travel });
      }
    }

    let groupsCreated = 0;

    // Create transport groups for each arrival time window
    for (const [arrivalWindow, groupGuests] of arrivalGroups) {
      if (groupGuests.length === 0) continue;

      const groupName = `Flight Arrival - ${new Date(arrivalWindow).toLocaleTimeString()}`;
      
      // Create transport group
      const newGroup = await db
        .insert(transportGroups)
        .values({
          eventId,
          name: groupName,
          guestCount: groupGuests.length,
          vehicleType: groupGuests.length > 8 ? 'bus' : groupGuests.length > 4 ? 'van' : 'car',
          vehicleCapacity: Math.max(8, Math.ceil(groupGuests.length * 1.2)), // 20% buffer
          pickupTime: arrivalWindow,
          pickupLocation: 'Airport',
          dropoffLocation: 'Hotel/Venue',
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();

      // Create allocations for guests in this group
      for (const { guest } of groupGuests) {
        await db
          .insert(transportAllocations)
          .values({
            transportGroupId: newGroup[0].id,
            guestId: guest.id,
            assignedAt: new Date()
          });
      }

      groupsCreated++;
    }

    res.json({
      success: true,
      groupsCreated,
      totalGuestsProcessed: guestsWithFlights.length
    });

  } catch (error) {
    
    res.status(500).json({ error: 'Failed to regenerate transport groups' });
  }
});

export default router;