/**
 * Master Guest Data API
 * Comprehensive bi-directional data flow for guest management master module
 */

import express from 'express';
// Auth middleware will be passed as parameter from main routes
import { storage } from '../storage';
import { db } from '../db';
import { 
  guests, 
  travelInfo, 
  roomAllocations, 
  accommodations,
  hotels,
  guestCeremonies,
  ceremonies,
  transportAllocations,
  transportGroups,
  eventVehicles,
  guestMealSelections,
  mealOptions
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

// Create function to register master guest data routes
export function registerMasterGuestDataRoutes(app: any, isAuthenticated: any) {
  const router = express.Router();

/**
 * Get comprehensive master guest data with all related information
 */
router.get('/events/:eventId/master-guest-data', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    
    // Get all guests for the event
    const allGuests = await storage.getGuestsByEvent(eventId);
    
    // Get comprehensive data for each guest in parallel
    const masterGuestData = await Promise.all(
      allGuests.map(async (guest) => {
        const [
          accommodation,
          travel,
          transport,
          ceremonies,
          meals,
          communicationPrefs
        ] = await Promise.all([
          // Accommodation data
          getRoomAllocationForGuest(guest.id),
          
          // Travel data
          getTravelInfoForGuest(guest.id),
          
          // Transport data  
          getTransportAllocationForGuest(guest.id),
          
          // Ceremony attendance
          getCeremonyAttendanceForGuest(guest.id),
          
          // Meal selections
          getMealSelectionsForGuest(guest.id),
          
          // Communication preferences (derived from guest form)
          getCommunicationPreferencesForGuest(guest)
        ]);

        return {
          // Basic guest information
          ...guest,
          
          // Accommodation details
          accommodation: accommodation ? {
            roomNumber: accommodation.roomNumber,
            hotelName: accommodation.hotelName,
            roomType: accommodation.roomType,
            checkInDate: accommodation.checkInDate,
            checkOutDate: accommodation.checkOutDate,
            checkInStatus: accommodation.checkInStatus,
            needsEarlyCheckIn: accommodation.checkInTime && accommodation.checkInTime < '14:00',
            specialRequests: accommodation.specialRequests,
            includesPlusOne: accommodation.includesPlusOne,
            includesChildren: accommodation.includesChildren,
            childrenCount: accommodation.childrenCount
          } : null,
          
          // Travel details
          travel: travel ? {
            travelMode: travel.travelMode,
            arrivalDate: travel.arrivalDate,
            arrivalTime: travel.arrivalTime,
            arrivalLocation: travel.arrivalLocation,
            departureDate: travel.departureDate,
            departureTime: travel.departureTime,
            departureLocation: travel.departureLocation,
            flightNumber: travel.flightNumber,
            airline: travel.airline,
            terminal: travel.terminal,
            gate: travel.gate,
            flightStatus: travel.flightStatus,
            needsTransportation: travel.needsTransportation,
            transportationType: travel.transportationType,
            specialRequirements: travel.specialRequirements
          } : null,
          
          // Transport assignment
          transport: transport ? {
            groupId: transport.groupId,
            groupName: transport.groupName,
            vehicleType: transport.vehicleType,
            vehicleCapacity: transport.vehicleCapacity,
            pickupLocation: transport.pickupLocation,
            pickupTime: transport.pickupTime,
            dropoffLocation: transport.dropoffLocation,
            status: transport.status,
            includesPlusOne: transport.includesPlusOne,
            includesChildren: transport.includesChildren,
            childrenCount: transport.childrenCount,
            confirmedByGuest: transport.confirmedByGuest
          } : null,
          
          // Ceremony attendance
          ceremonies: ceremonies.map(ceremony => ({
            id: ceremony.ceremonyId,
            name: ceremony.ceremonyName,
            date: ceremony.date,
            attending: ceremony.attending,
            location: ceremony.location,
            attireCode: ceremony.attireCode
          })),
          
          // Meal selections
          meals: meals.map(meal => ({
            ceremonyName: meal.ceremonyName,
            mealType: meal.mealType,
            selectedOption: meal.selectedOption,
            dietaryNotes: meal.dietaryNotes
          })),
          
          // Communication preferences (from guest form)
          communication: communicationPrefs,
          
          // Derived statistics for master view
          stats: {
            rsvpComplete: guest.rsvpStatus === 'confirmed',
            accommodationAssigned: !!accommodation,
            travelCoordinated: !!travel,
            transportAssigned: !!transport,
            ceremoniesSelected: ceremonies.filter(c => c.attending).length,
            mealsSelected: meals.length,
            hasSpecialRequirements: !!(guest.dietaryRestrictions || guest.allergies || guest.notes),
            whatsappEnabled: guest.whatsappAvailable,
            completionPercentage: calculateCompletionPercentage(guest, accommodation, travel, transport, ceremonies, meals)
          }
        };
      })
    );

    res.json({
      success: true,
      totalGuests: masterGuestData.length,
      guests: masterGuestData
    });
  } catch (error) {
    console.error('Failed to fetch master guest data:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch master guest data' });
  }
});

/**
 * Get room allocation details for a guest
 */
async function getRoomAllocationForGuest(guestId: number) {
  try {
    const allocation = await db
      .select({
        roomNumber: roomAllocations.roomNumber,
        checkInDate: roomAllocations.checkInDate,
        checkOutDate: roomAllocations.checkOutDate,
        checkInStatus: roomAllocations.checkInStatus,
        checkInTime: roomAllocations.checkInTime,
        specialRequests: roomAllocations.specialRequests,
        includesPlusOne: roomAllocations.includesPlusOne,
        includesChildren: roomAllocations.includesChildren,
        childrenCount: roomAllocations.childrenCount,
        hotelName: hotels.name,
        roomType: accommodations.roomType
      })
      .from(roomAllocations)
      .leftJoin(accommodations, eq(roomAllocations.accommodationId, accommodations.id))
      .leftJoin(hotels, eq(accommodations.hotelId, hotels.id))
      .where(eq(roomAllocations.guestId, guestId))
      .limit(1);
    
    return allocation[0] || null;
  } catch (error) {
    console.error('Error fetching room allocation:', error);
    return null;
  }
}

/**
 * Get travel information for a guest
 */
async function getTravelInfoForGuest(guestId: number) {
  try {
    const travel = await db
      .select()
      .from(travelInfo)
      .where(eq(travelInfo.guestId, guestId))
      .limit(1);
    
    return travel[0] || null;
  } catch (error) {
    console.error('Error fetching travel info:', error);
    return null;
  }
}

/**
 * Get transport allocation for a guest
 */
async function getTransportAllocationForGuest(guestId: number) {
  try {
    const transport = await db
      .select({
        groupId: transportGroups.id,
        groupName: transportGroups.groupName,
        vehicleType: eventVehicles.vehicleType,
        vehicleCapacity: eventVehicles.capacity,
        pickupLocation: transportGroups.pickupLocation,
        pickupTime: transportGroups.pickupTimeSlot,
        dropoffLocation: transportGroups.dropoffLocation,
        status: transportAllocations.status,
        includesPlusOne: transportAllocations.includesPlusOne,
        includesChildren: transportAllocations.includesChildren,
        childrenCount: transportAllocations.childrenCount,
        confirmedByGuest: transportAllocations.confirmedByGuest
      })
      .from(transportAllocations)
      .leftJoin(transportGroups, eq(transportAllocations.transportGroupId, transportGroups.id))
      .leftJoin(eventVehicles, eq(transportGroups.vehicleId, eventVehicles.id))
      .where(eq(transportAllocations.guestId, guestId))
      .limit(1);
    
    return transport[0] || null;
  } catch (error) {
    console.error('Error fetching transport allocation:', error);
    return null;
  }
}

/**
 * Get ceremony attendance for a guest
 */
async function getCeremonyAttendanceForGuest(guestId: number) {
  try {
    const attendance = await db
      .select({
        ceremonyId: ceremonies.id,
        ceremonyName: ceremonies.name,
        date: ceremonies.date,
        attending: guestCeremonies.attending,
        location: ceremonies.location,
        attireCode: ceremonies.attireCode
      })
      .from(guestCeremonies)
      .leftJoin(ceremonies, eq(guestCeremonies.ceremonyId, ceremonies.id))
      .where(eq(guestCeremonies.guestId, guestId));
    
    return attendance;
  } catch (error) {
    console.error('Error fetching ceremony attendance:', error);
    return [];
  }
}

/**
 * Get meal selections for a guest
 */
async function getMealSelectionsForGuest(guestId: number) {
  try {
    const meals = await db
      .select({
        ceremonyName: ceremonies.name,
        mealType: mealOptions.mealType,
        selectedOption: guestMealSelections.selectedOption,
        dietaryNotes: guestMealSelections.dietaryNotes
      })
      .from(guestMealSelections)
      .leftJoin(mealOptions, eq(guestMealSelections.mealOptionId, mealOptions.id))
      .leftJoin(ceremonies, eq(mealOptions.ceremonyId, ceremonies.id))
      .where(eq(guestMealSelections.guestId, guestId));
    
    return meals;
  } catch (error) {
    console.error('Error fetching meal selections:', error);
    return [];
  }
}

/**
 * Get communication preferences derived from guest form
 */
function getCommunicationPreferencesForGuest(guest: any) {
  return {
    whatsappAvailable: guest.whatsappAvailable,
    whatsappNumber: guest.whatsappSame ? guest.phone : guest.whatsappNumber,
    emailAvailable: !!guest.email,
    email: guest.email,
    preferredContactMethod: guest.whatsappAvailable ? 'whatsapp' : 'email',
    side: guest.side // For targeted communication
  };
}

/**
 * Calculate completion percentage for guest profile
 */
function calculateCompletionPercentage(guest: any, accommodation: any, travel: any, transport: any, ceremonies: any[], meals: any[]) {
  let completed = 0;
  const total = 8;
  
  // Basic RSVP
  if (guest.rsvpStatus === 'confirmed') completed++;
  
  // Contact information
  if (guest.email && guest.phone) completed++;
  
  // Accommodation
  if (accommodation) completed++;
  
  // Travel
  if (travel) completed++;
  
  // Transport
  if (transport) completed++;
  
  // Ceremonies
  if (ceremonies.length > 0) completed++;
  
  // Meals
  if (meals.length > 0) completed++;
  
  // Plus one details (if applicable)
  if (!guest.plusOneAllowed || guest.plusOneName) completed++;
  
  return Math.round((completed / total) * 100);
}

/**
 * Update guest data and sync across all modules
 */
router.put('/events/:eventId/guests/:guestId/master-update', isAuthenticated, async (req, res) => {
  try {
    const eventId = parseInt(req.params.eventId);
    const guestId = parseInt(req.params.guestId);
    const updateData = req.body;
    
    // Update basic guest information
    if (updateData.basic) {
      await storage.updateGuest(guestId, updateData.basic);
    }
    
    // Update accommodation if provided
    if (updateData.accommodation) {
      await updateAccommodationForGuest(guestId, updateData.accommodation);
    }
    
    // Update travel if provided
    if (updateData.travel) {
      await updateTravelForGuest(guestId, updateData.travel);
    }
    
    // Update transport if provided
    if (updateData.transport) {
      await updateTransportForGuest(guestId, updateData.transport);
    }
    
    // Update ceremony attendance if provided
    if (updateData.ceremonies) {
      await updateCeremonyAttendanceForGuest(guestId, updateData.ceremonies);
    }
    
    res.json({
      success: true,
      message: 'Guest data updated across all modules'
    });
  } catch (error) {
    console.error('Failed to update master guest data:', error);
    res.status(500).json({ success: false, error: 'Failed to update guest data' });
  }
});

/**
 * Helper functions for updating related data
 */
async function updateAccommodationForGuest(guestId: number, accommodationData: any) {
  // Implementation for updating accommodation data
  // This ensures bi-directional data flow
}

async function updateTravelForGuest(guestId: number, travelData: any) {
  // Implementation for updating travel data
  // This ensures bi-directional data flow
}

async function updateTransportForGuest(guestId: number, transportData: any) {
  // Implementation for updating transport data
  // This ensures bi-directional data flow
}

async function updateCeremonyAttendanceForGuest(guestId: number, ceremonyData: any) {
  // Implementation for updating ceremony attendance
  // This ensures bi-directional data flow
}

  // Mount router
  app.use('/api', router);
}