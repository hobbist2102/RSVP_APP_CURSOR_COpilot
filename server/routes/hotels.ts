import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { 
  hotels, 
  insertHotelSchema, 
  accommodations, 
  insertAccommodationSchema,
  globalRoomTypes,
  insertGlobalRoomTypeSchema,
  roomAllocations,
  guests
} from '../../shared/schema';
import { z } from 'zod';
import { storage } from '../storage';

/**
 * Register hotel-related routes to the Express application
 */
export function registerHotelRoutes(
  app: any,
  isAuthenticated: (req: Request, res: Response, next: any) => void,
  isAdmin: (req: Request, res: Response, next: any) => void
) {
  // Get all hotels for an event
  app.get('/api/hotels/by-event/:eventId', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const hotelsList = await storage.getHotelsByEvent(eventId);
      

      return res.status(200).json(hotelsList);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to fetch hotels',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Get a specific hotel
  app.get('/api/hotels/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      const hotel = await storage.getHotel(hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      return res.status(200).json(hotel);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to fetch hotel',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create a new hotel
  app.post('/api/hotels', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate the request body against the schema
      const validationResult = insertHotelSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid hotel data',
          errors: validationResult.error.format()
        });
      }

      const hotelData = validationResult.data;
      
      // Verify the event exists
      const eventExists = await storage.eventExists(hotelData.eventId);
      if (!eventExists) {
        return res.status(404).json({ message: 'Event not found' });
      }

      // Create the hotel
      const hotel = await storage.createHotel(hotelData);
      

      return res.status(201).json(hotel);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to create hotel',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Update an existing hotel
  app.put('/api/hotels/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      // Fetch the existing hotel to check permissions
      const existingHotel = await storage.getHotel(hotelId);
      if (!existingHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      // Validate the request body (allowing partial updates)
      const validationResult = insertHotelSchema.partial().safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid hotel data',
          errors: validationResult.error.format()
        });
      }

      const hotelData = validationResult.data;
      
      // Prevent changing the event ID
      if (hotelData.eventId && hotelData.eventId !== existingHotel.eventId) {
        return res.status(400).json({ 
          message: 'Cannot change the event association of a hotel'
        });
      }

      // Update the hotel
      const updatedHotel = await storage.updateHotel(hotelId, hotelData);
      if (!updatedHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      
      return res.status(200).json(updatedHotel);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to update hotel',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Delete a hotel
  app.delete('/api/hotels/:id', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      // Fetch the existing hotel to check permissions
      const existingHotel = await storage.getHotel(hotelId);
      if (!existingHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      // Check if this hotel has accommodations
      const accommodationsList = await db.select().from(accommodations).where(eq(accommodations.hotelId, hotelId));
      if (accommodationsList.length > 0) {
        // If it's marked as default, we shouldn't delete it
        if (existingHotel.isDefault) {
          return res.status(400).json({
            message: 'Cannot delete the default hotel. Remove its default status first or create another default hotel.'
          });
        }
        
        // Otherwise, we should ask for a replacement hotel
        const otherHotels = await db.select().from(hotels)
          .where(and(
            eq(hotels.eventId, existingHotel.eventId),
            eq(hotels.id, hotelId) as any // Need to handle TypeScript expecting different type
          ));
        
        if (otherHotels.length === 0) {
          return res.status(400).json({
            message: 'Cannot delete the only hotel with accommodations. Create another hotel first.'
          });
        }
      }

      // Delete the hotel
      const success = await storage.deleteHotel(hotelId);
      if (!success) {
        return res.status(500).json({ message: 'Failed to delete hotel' });
      }

      
      return res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to delete hotel',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Filter accommodations by hotel
  app.get('/api/events/:eventId/accommodations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const hotelId = req.query.hotelId ? parseInt(req.query.hotelId as string) : undefined;

      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      if (hotelId && isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      // Get accommodations, potentially filtered by hotel
      let accommodationsList = await storage.getAccommodationsByEvent(eventId);

      // Apply hotel filter if provided
      if (hotelId) {
        accommodationsList = accommodationsList.filter(acc => acc.hotelId === hotelId);
      }

      
      return res.status(200).json(accommodationsList);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to fetch accommodations',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Create a new accommodation/room type
  app.post('/api/events/:eventId/accommodations', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      // Validate accommodation data
      const validationResult = insertAccommodationSchema.safeParse({
        ...req.body,
        eventId
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid accommodation data',
          errors: validationResult.error.format()
        });
      }

      const accommodationData = validationResult.data;
      
      // Verify the hotel exists for this event
      const hotel = await storage.getHotel(accommodationData.hotelId);
      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }
      
      if (hotel.eventId !== eventId) {
        return res.status(400).json({ message: 'Hotel does not belong to this event' });
      }

      // If a global room type ID is provided, link it to this accommodation
      let globalRoomTypeId = accommodationData.globalRoomTypeId;
      
      // If createGlobalType flag is set, create a new global room type 
      // to share across events
      if (req.body.createGlobalType && !globalRoomTypeId) {
        try {
          const globalRoomTypeData = {
            hotelName: hotel.name,
            name: accommodationData.name,
            category: accommodationData.roomType,
            capacity: accommodationData.maxOccupancy, // Using maxOccupancy instead of capacity
            specialFeatures: accommodationData.specialFeatures
          };
          
          const newGlobalRoomType = await storage.createGlobalRoomType(globalRoomTypeData);
          globalRoomTypeId = newGlobalRoomType.id;
          accommodationData.globalRoomTypeId = globalRoomTypeId;
          
          
        } catch (error) {
          
          // Continue with accommodation creation even if global room type creation fails
        }
      }

      // Create the accommodation
      const accommodation = await storage.createAccommodation(accommodationData);
      

      return res.status(201).json(accommodation);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to create accommodation',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Global Room Types API
  
  // Get all global room types
  app.get('/api/global-room-types', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const roomTypes = await storage.getAllGlobalRoomTypes();
      return res.status(200).json(roomTypes);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to fetch global room types',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get global room types for a specific hotel name
  app.get('/api/global-room-types/by-hotel/:hotelName', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const hotelName = req.params.hotelName;
      const roomTypes = await storage.getGlobalRoomTypesByHotelName(hotelName);
      return res.status(200).json(roomTypes);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to fetch global room types',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Create a new global room type
  app.post('/api/global-room-types', isAuthenticated, async (req: Request, res: Response) => {
    try {
      // Validate room type data
      const validationResult = insertGlobalRoomTypeSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({ 
          message: 'Invalid global room type data',
          errors: validationResult.error.format()
        });
      }
      
      const roomTypeData = validationResult.data;
      const roomType = await storage.createGlobalRoomType(roomTypeData);
      
      
      return res.status(201).json(roomType);
    } catch (error) {
      
      return res.status(500).json({ 
        message: 'Failed to create global room type',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Fetch all hotel assignments for an event (for Excel export)
  app.get('/api/events/:eventId/hotel-assignments', isAuthenticated, async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      // Get all hotels for the event
      const eventHotels = await storage.getHotelsByEvent(eventId);
      
      if (!eventHotels.length) {
        return res.json([]);
      }

      const hotelIds = eventHotels.map(hotel => hotel.id);
      
      // Get all accommodations for these hotels
      let allAccommodations: any[] = [];
      for (const hotelId of hotelIds) {
        const accommodationsForHotel = await storage.getAccommodationsByHotel(hotelId);
        allAccommodations = [...allAccommodations, ...accommodationsForHotel];
      }
      
      if (!allAccommodations.length) {
        return res.json([]);
      }

      // Get all room allocations for these accommodations
      let allAllocations: any[] = [];
      for (const accommodation of allAccommodations) {
        const allocationsForAccommodation = await storage.getRoomAllocationsByAccommodation(accommodation.id);
        
        // Enrich allocations with accommodation and hotel data
        const enrichedAllocations = allocationsForAccommodation.map(allocation => {
          const hotel = eventHotels.find(h => h.id === accommodation.hotelId);
          return {
            ...allocation,
            accommodation,
            hotel
          };
        });
        
        allAllocations = [...allAllocations, ...enrichedAllocations];
      }
      
      // If no allocations, return empty array
      if (!allAllocations.length) {
        return res.json([]);
      }
      
      // Get all guest data for these allocations
      const guestIds = allAllocations.map(allocation => allocation.guestId);
      const uniqueGuestIds = [...new Set(guestIds)];
      
      let allGuests: Record<number, any> = {};
      for (const guestId of uniqueGuestIds) {
        const guest = await storage.getGuest(guestId);
        if (guest) {
          allGuests[guestId] = guest;
        }
      }
      
      // Build the final assignments array with all related data
      const assignments = allAllocations.map(allocation => {
        return {
          ...allocation,
          guest: allGuests[allocation.guestId] || null
        };
      });
      
      return res.json(assignments);
    } catch (error) {
      
      return res.status(500).json({
        message: 'Failed to fetch hotel assignments',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}