import { weddingEvents, WeddingEvent, InsertWeddingEvent } from '@shared/schema';
import { eq, and, SQL, desc } from 'drizzle-orm';
import { db } from '../db';

/**
 * EventRepository provides data access for wedding event entities
 * Note: This is not a tenant repository as events are the tenants themselves
 */
export class EventRepository {
  /**
   * Get an event by ID
   * @param id The event ID
   * @returns The event if found, undefined otherwise
   */
  async getById(id: number): Promise<WeddingEvent | undefined> {
    try {
      if (!id || isNaN(id)) {
        throw new Error(`Invalid event ID: ${id}`);
      }
      
      const result = await db.select()
        .from(weddingEvents)
        .where(eq(weddingEvents.id, id));
        
      return result[0];
    } catch (error) {
      console.error(`Failed to get event with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all events
   * @returns All events
   */
  async getAll(): Promise<WeddingEvent[]> {
    try {
      const result = await db.select()
        .from(weddingEvents)
        .orderBy(desc(weddingEvents.startDate));
        
      return result;
    } catch (error) {
      console.error('Failed to get all events:', error);
      throw error;
    }
  }
  
  /**
   * Get events created by a specific user
   * @param userId The user ID
   * @returns Events created by the user
   */
  async getEventsByUser(userId: number): Promise<WeddingEvent[]> {
    try {
      if (!userId || isNaN(userId)) {
        throw new Error(`Invalid user ID: ${userId}`);
      }
      
      const result = await db.select()
        .from(weddingEvents)
        .where(eq(weddingEvents.createdBy, userId))
        .orderBy(desc(weddingEvents.startDate));
        
      return result;
    } catch (error) {
      console.error(`Failed to get events for user ${userId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a new event
   * @param data The event data
   * @returns The created event
   */
  async create(data: InsertWeddingEvent): Promise<WeddingEvent> {
    try {
      // Validate created by
      if (!data.createdBy || isNaN(data.createdBy)) {
        throw new Error('createdBy is required for event creation');
      }
      
      const result = await db.insert(weddingEvents)
        .values(data)
        .returning();
        
      return result[0];
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }
  
  /**
   * Update an event
   * @param id The event ID
   * @param data The update data
   * @returns The updated event if found, undefined otherwise
   */
  async update(id: number, data: Partial<InsertWeddingEvent>): Promise<WeddingEvent | undefined> {
    try {
      if (!id || isNaN(id)) {
        throw new Error(`Invalid event ID: ${id}`);
      }
      
      // First verify the event exists
      const event = await this.getById(id);
      if (!event) {
        return undefined;
      }
      
      const result = await db.update(weddingEvents)
        .set(data)
        .where(eq(weddingEvents.id, id))
        .returning();
        
      return result[0];
    } catch (error) {
      console.error(`Failed to update event with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete an event
   * @param id The event ID
   * @returns true if deleted, false if not found
   */
  async delete(id: number): Promise<boolean> {
    try {
      if (!id || isNaN(id)) {
        throw new Error(`Invalid event ID: ${id}`);
      }
      
      // First verify the event exists
      const event = await this.getById(id);
      if (!event) {
        return false;
      }
      
      const result = await db.delete(weddingEvents)
        .where(eq(weddingEvents.id, id))
        .returning();
        
      return result.length > 0;
    } catch (error) {
      console.error(`Failed to delete event with ID ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Check if a user has access to an event
   * @param eventId The event ID
   * @param userId The user ID
   * @param isAdmin Whether the user is an admin
   * @returns true if the user has access, false otherwise
   */
  async hasAccessToEvent(eventId: number, userId: number, isAdmin: boolean): Promise<boolean> {
    try {
      if (isAdmin) {
        return true; // Admins have access to all events
      }
      
      if (!eventId || isNaN(eventId) || !userId || isNaN(userId)) {
        return false;
      }
      
      const event = await this.getById(eventId);
      if (!event) {
        return false;
      }
      
      return event.createdBy === userId;
    } catch (error) {
      console.error(`Failed to check event access for user ${userId} on event ${eventId}:`, error);
      return false;
    }
  }
}