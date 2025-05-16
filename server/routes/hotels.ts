import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { hotels, insertHotelSchema, accommodations } from '../../shared/schema';
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
      console.log(`Retrieved ${hotelsList.length} hotels for event ${eventId}`);

      return res.status(200).json(hotelsList);
    } catch (error) {
      console.error(`Error fetching hotels for event ${req.params.eventId}:`, error);
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
      console.error(`Error fetching hotel ${req.params.id}:`, error);
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
      console.log(`Created new hotel: ${hotel.name} (ID: ${hotel.id}) for event ${hotelData.eventId}`);

      return res.status(201).json(hotel);
    } catch (error) {
      console.error('Error creating hotel:', error);
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

      console.log(`Updated hotel: ${updatedHotel.name} (ID: ${updatedHotel.id})`);
      return res.status(200).json(updatedHotel);
    } catch (error) {
      console.error(`Error updating hotel ${req.params.id}:`, error);
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

      console.log(`Deleted hotel ID: ${hotelId}`);
      return res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error(`Error deleting hotel ${req.params.id}:`, error);
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

      console.log(`Retrieved ${accommodationsList.length} accommodations${hotelId ? ` for hotel ${hotelId}` : ''} in event ${eventId}`);
      return res.status(200).json(accommodationsList);
    } catch (error) {
      console.error(`Error fetching accommodations for event ${req.params.eventId}:`, error);
      return res.status(500).json({ 
        message: 'Failed to fetch accommodations',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}