import { 
  roomAllocations, 
  RoomAllocation, 
  InsertRoomAllocation, 
  accommodations, 
  guests
} from '@shared/schema';
import { eq, and, SQL, desc } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter } from '../lib/query-builder';

/**
 * RoomAllocationRepository provides data access for room allocation entities
 * Note: This isn't a direct tenant repository because it doesn't have an eventId,
 * but we achieve tenant isolation through related entities
 */
export class RoomAllocationRepository {
  /**
   * Get room allocations for a specific guest
   * @param guestId The guest ID
   * @param eventId The event ID (tenant)
   * @returns Room allocations for the guest
   */
  async getRoomAllocationsByGuest(guestId: number, eventId: number): Promise<RoomAllocation[]> {
    try {
      // First ensure the guest belongs to this event
      const guestResult = await db.select()
        .from(guests)
        .where(and(
          eq(guests.id, guestId),
          eq(guests.eventId, eventId)
        ));
        
      if (guestResult.length === 0) {
        return []; // Guest not found or doesn't belong to this event
      }
      
      // Get room allocations for this guest
      const allocations = await db.select({
        roomAllocation: roomAllocations
      })
      .from(roomAllocations)
      .where(eq(roomAllocations.guestId, guestId))
      .orderBy(desc(roomAllocations.checkInDate));
      
      return allocations.map(a => a.roomAllocation);
    } catch (error) {
      console.error(`Failed to get room allocations for guest ${guestId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get room allocations for a specific accommodation
   * @param accommodationId The accommodation ID
   * @param eventId The event ID (tenant)
   * @returns Room allocations for the accommodation
   */
  async getRoomAllocationsByAccommodation(accommodationId: number, eventId: number): Promise<RoomAllocation[]> {
    try {
      // First ensure the accommodation belongs to this event
      const accommodationResult = await db.select()
        .from(accommodations)
        .where(and(
          eq(accommodations.id, accommodationId),
          eq(accommodations.eventId, eventId)
        ));
        
      if (accommodationResult.length === 0) {
        return []; // Accommodation not found or doesn't belong to this event
      }
      
      // Get room allocations for this accommodation
      const allocations = await db.select({
        roomAllocation: roomAllocations
      })
      .from(roomAllocations)
      .where(eq(roomAllocations.accommodationId, accommodationId))
      .orderBy(desc(roomAllocations.checkInDate));
      
      return allocations.map(a => a.roomAllocation);
    } catch (error) {
      console.error(`Failed to get room allocations for accommodation ${accommodationId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new room allocation
   * @param data The room allocation data
   * @param eventId The event ID (tenant) for validation
   * @returns The created room allocation
   */
  async create(data: InsertRoomAllocation, eventId: number): Promise<RoomAllocation> {
    try {
      // Validate the accommodation belongs to this event
      const accommodationResult = await db.select()
        .from(accommodations)
        .where(and(
          eq(accommodations.id, data.accommodationId),
          eq(accommodations.eventId, eventId)
        ));
        
      if (accommodationResult.length === 0) {
        throw new Error(`Accommodation ${data.accommodationId} does not belong to event ${eventId}`);
      }
      
      // Validate the guest belongs to this event
      const guestResult = await db.select()
        .from(guests)
        .where(and(
          eq(guests.id, data.guestId),
          eq(guests.eventId, eventId)
        ));
        
      if (guestResult.length === 0) {
        throw new Error(`Guest ${data.guestId} does not belong to event ${eventId}`);
      }
      
      // Create the room allocation
      const result = await db.insert(roomAllocations)
        .values(data)
        .returning();
        
      // Update allocated rooms count on the accommodation
      await db.update(accommodations)
        .set({ 
          allocatedRooms: accommodationResult[0].allocatedRooms + 1 
        })
        .where(eq(accommodations.id, data.accommodationId));
        
      return result[0];
    } catch (error) {
      console.error('Failed to create room allocation:', error);
      throw error;
    }
  }
  
  /**
   * Update a room allocation
   * @param id The room allocation ID
   * @param data The update data
   * @param eventId The event ID (tenant) for validation
   * @returns The updated room allocation
   */
  async update(id: number, data: Partial<InsertRoomAllocation>, eventId: number): Promise<RoomAllocation | undefined> {
    try {
      // Get the existing allocation
      const existing = await db.select({
        roomAllocation: roomAllocations,
        accommodation: accommodations,
        guest: guests
      })
      .from(roomAllocations)
      .innerJoin(accommodations, eq(roomAllocations.accommodationId, accommodations.id))
      .innerJoin(guests, eq(roomAllocations.guestId, guests.id))
      .where(and(
        eq(roomAllocations.id, id),
        eq(accommodations.eventId, eventId),
        eq(guests.eventId, eventId)
      ));
      
      if (existing.length === 0) {
        return undefined; // Not found or doesn't belong to this event
      }
      
      // If accommodation is being changed, validate it belongs to this event
      if (data.accommodationId && data.accommodationId !== existing[0].roomAllocation.accommodationId) {
        const newAccommodationResult = await db.select()
          .from(accommodations)
          .where(and(
            eq(accommodations.id, data.accommodationId),
            eq(accommodations.eventId, eventId)
          ));
          
        if (newAccommodationResult.length === 0) {
          throw new Error(`Accommodation ${data.accommodationId} does not belong to event ${eventId}`);
        }
        
        // Update allocated rooms count on both accommodations
        await db.update(accommodations)
          .set({ 
            allocatedRooms: existing[0].accommodation.allocatedRooms - 1 
          })
          .where(eq(accommodations.id, existing[0].roomAllocation.accommodationId));
          
        await db.update(accommodations)
          .set({ 
            allocatedRooms: newAccommodationResult[0].allocatedRooms + 1 
          })
          .where(eq(accommodations.id, data.accommodationId));
      }
      
      // If guest is being changed, validate it belongs to this event
      if (data.guestId && data.guestId !== existing[0].roomAllocation.guestId) {
        const newGuestResult = await db.select()
          .from(guests)
          .where(and(
            eq(guests.id, data.guestId),
            eq(guests.eventId, eventId)
          ));
          
        if (newGuestResult.length === 0) {
          throw new Error(`Guest ${data.guestId} does not belong to event ${eventId}`);
        }
      }
      
      // Update the room allocation
      const result = await db.update(roomAllocations)
        .set(data)
        .where(eq(roomAllocations.id, id))
        .returning();
        
      return result[0];
    } catch (error) {
      console.error(`Failed to update room allocation ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a room allocation
   * @param id The room allocation ID
   * @param eventId The event ID (tenant) for validation
   * @returns true if deleted, false if not found
   */
  async delete(id: number, eventId: number): Promise<boolean> {
    try {
      // Get the existing allocation
      const existing = await db.select({
        roomAllocation: roomAllocations,
        accommodation: accommodations,
        guest: guests
      })
      .from(roomAllocations)
      .innerJoin(accommodations, eq(roomAllocations.accommodationId, accommodations.id))
      .innerJoin(guests, eq(roomAllocations.guestId, guests.id))
      .where(and(
        eq(roomAllocations.id, id),
        eq(accommodations.eventId, eventId),
        eq(guests.eventId, eventId)
      ));
      
      if (existing.length === 0) {
        return false; // Not found or doesn't belong to this event
      }
      
      // Delete the room allocation
      const result = await db.delete(roomAllocations)
        .where(eq(roomAllocations.id, id))
        .returning();
        
      // Update allocated rooms count on the accommodation
      if (result.length > 0) {
        await db.update(accommodations)
          .set({ 
            allocatedRooms: Math.max(0, existing[0].accommodation.allocatedRooms - 1)
          })
          .where(eq(accommodations.id, existing[0].roomAllocation.accommodationId));
      }
      
      return result.length > 0;
    } catch (error) {
      console.error(`Failed to delete room allocation ${id}:`, error);
      throw error;
    }
  }
}