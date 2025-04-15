import { Request, Response } from 'express';
import { db } from '../db';
import { eq, and } from 'drizzle-orm';
import { hotels, insertHotelSchema, accommodations } from '../../shared/schema';
import { z } from 'zod';

export function registerHotelRoutes(
  app: any,
  isAuthenticated: (req: Request, res: Response, next: any) => void,
  isAdmin: (req: Request, res: Response, next: any) => void
) {
  // Get all hotels for an event
  app.get('/api/hotels/by-event/:eventId', async (req: Request, res: Response) => {
    try {
      const eventId = parseInt(req.params.eventId);
      if (isNaN(eventId)) {
        return res.status(400).json({ message: 'Invalid event ID' });
      }

      const hotelsList = await db
        .select()
        .from(hotels)
        .where(eq(hotels.eventId, eventId));

      return res.status(200).json(hotelsList);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return res.status(500).json({ message: 'Failed to fetch hotels' });
    }
  });

  // Get a specific hotel
  app.get('/api/hotels/:id', async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      const [hotel] = await db
        .select()
        .from(hotels)
        .where(eq(hotels.id, hotelId));

      if (!hotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      // Get room types (accommodations) for this hotel
      const roomTypes = await db
        .select()
        .from(accommodations)
        .where(eq(accommodations.hotelId, hotelId));

      return res.status(200).json({
        ...hotel,
        roomTypes
      });
    } catch (error) {
      console.error('Error fetching hotel:', error);
      return res.status(500).json({ message: 'Failed to fetch hotel' });
    }
  });

  // Create a new hotel (admin only)
  app.post('/api/hotels', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const validatedData = insertHotelSchema.parse(req.body);

      // If this is set as the default hotel, unset any other default for this event
      if (validatedData.isDefault) {
        await db
          .update(hotels)
          .set({ isDefault: false })
          .where(eq(hotels.eventId, validatedData.eventId));
      }

      const [newHotel] = await db
        .insert(hotels)
        .values(validatedData)
        .returning();

      return res.status(201).json(newHotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid hotel data', errors: error.errors });
      }
      console.error('Error creating hotel:', error);
      return res.status(500).json({ message: 'Failed to create hotel' });
    }
  });

  // Update a hotel (admin only)
  app.put('/api/hotels/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      // Validate the request body, but make all fields optional for partial updates
      const partialSchema = insertHotelSchema.partial();
      const validatedData = partialSchema.parse(req.body);

      // If this is set as the default hotel, unset any other default for this event
      if (validatedData.isDefault) {
        const [existingHotel] = await db
          .select()
          .from(hotels)
          .where(eq(hotels.id, hotelId));

        if (existingHotel) {
          await db
            .update(hotels)
            .set({ isDefault: false })
            .where(and(
              eq(hotels.eventId, existingHotel.eventId),
              eq(hotels.isDefault, true)
            ));
        }
      }

      const [updatedHotel] = await db
        .update(hotels)
        .set(validatedData)
        .where(eq(hotels.id, hotelId))
        .returning();

      if (!updatedHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      return res.status(200).json(updatedHotel);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid hotel data', errors: error.errors });
      }
      console.error('Error updating hotel:', error);
      return res.status(500).json({ message: 'Failed to update hotel' });
    }
  });

  // Delete a hotel (admin only)
  app.delete('/api/hotels/:id', isAuthenticated, isAdmin, async (req: Request, res: Response) => {
    try {
      const hotelId = parseInt(req.params.id);
      if (isNaN(hotelId)) {
        return res.status(400).json({ message: 'Invalid hotel ID' });
      }

      // Check if any accommodations are linked to this hotel
      const linkedAccommodations = await db
        .select()
        .from(accommodations)
        .where(eq(accommodations.hotelId, hotelId));

      if (linkedAccommodations.length > 0) {
        return res.status(400).json({
          message: 'Cannot delete hotel with linked accommodations. Remove accommodations first.'
        });
      }

      const [deletedHotel] = await db
        .delete(hotels)
        .where(eq(hotels.id, hotelId))
        .returning();

      if (!deletedHotel) {
        return res.status(404).json({ message: 'Hotel not found' });
      }

      return res.status(200).json({ message: 'Hotel deleted successfully' });
    } catch (error) {
      console.error('Error deleting hotel:', error);
      return res.status(500).json({ message: 'Failed to delete hotel' });
    }
  });
}