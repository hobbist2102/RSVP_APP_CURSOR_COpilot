import { TenantRepository } from '../lib/tenant-repository';
import { guests, Guest, InsertGuest } from '@shared/schema';
import { eq, and, SQL, like, or, desc } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter, withEntityAndTenant } from '../lib/query-builder';

/**
 * GuestRepository provides data access for guest entities with tenant isolation
 */
export class GuestRepository extends TenantRepository<Guest, InsertGuest> {
  constructor() {
    super(guests);
  }
  
  /**
   * Find a guest by email within a specific event
   * @param email The email to search for
   * @param eventId The event ID (tenant)
   * @returns The guest if found, undefined otherwise
   */
  async findByEmail(email: string, eventId: number): Promise<Guest | undefined> {
    try {
      const condition = and(
        eq(guests.eventId, eventId),
        eq(guests.email, email)
      );
      
      const result = await db.select().from(guests).where(condition);
      return result[0];
    } catch (error) {
      console.error(`Failed to find guest by email ${email} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Search for guests by name or email within a specific event
   * @param searchTerm The search term
   * @param eventId The event ID (tenant)
   * @returns Matching guests
   */
  async searchGuests(searchTerm: string, eventId: number): Promise<Guest[]> {
    try {
      const term = `%${searchTerm}%`;
      
      const searchCondition = or(
        like(guests.firstName, term),
        like(guests.lastName, term),
        like(guests.email, term)
      );
      
      const condition = withTenantFilter(
        guests,
        'eventId' as keyof Guest,
        eventId,
        searchCondition
      );
      
      const result = await db.select()
        .from(guests)
        .where(condition)
        .orderBy(desc(guests.createdAt))
        .limit(20);
        
      return result;
    } catch (error) {
      console.error(`Failed to search guests with term "${searchTerm}" for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get guests by RSVP status within a specific event
   * @param status The RSVP status to filter by
   * @param eventId The event ID (tenant)
   * @returns Matching guests
   */
  async getGuestsByRsvpStatus(status: string, eventId: number): Promise<Guest[]> {
    try {
      const condition = withTenantFilter(
        guests,
        'eventId' as keyof Guest,
        eventId,
        eq(guests.rsvpStatus, status)
      );
      
      const result = await db.select()
        .from(guests)
        .where(condition)
        .orderBy(desc(guests.createdAt));
        
      return result;
    } catch (error) {
      console.error(`Failed to get guests with RSVP status "${status}" for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get guests who need accommodation within a specific event
   * @param eventId The event ID (tenant)
   * @returns Matching guests
   */
  async getGuestsNeedingAccommodation(eventId: number): Promise<Guest[]> {
    try {
      const condition = withTenantFilter(
        guests,
        'eventId' as keyof Guest,
        eventId,
        eq(guests.needsAccommodation, true)
      );
      
      const result = await db.select()
        .from(guests)
        .where(condition)
        .orderBy(desc(guests.createdAt));
        
      return result;
    } catch (error) {
      console.error(`Failed to get guests needing accommodation for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get statistics about guests within a specific event
   * @param eventId The event ID (tenant)
   * @returns Guest statistics
   */
  async getGuestStatistics(eventId: number): Promise<{
    total: number;
    confirmed: number;
    declined: number;
    pending: number;
    withPlusOnes: number;
    withChildren: number;
    needingAccommodation: number;
  }> {
    try {
      const allGuests = await this.getAllByTenant(eventId);
      
      const confirmed = allGuests.filter(g => g.rsvpStatus === 'confirmed').length;
      const declined = allGuests.filter(g => g.rsvpStatus === 'declined').length;
      const pending = allGuests.filter(g => g.rsvpStatus === 'pending').length;
      const withPlusOnes = allGuests.filter(g => g.plusOneAllowed && g.plusOneName).length;
      
      // Count guests with children based on childrenDetails array
      const withChildren = allGuests.filter(g => {
        let childrenDetails = [];
        try {
          childrenDetails = g.childrenDetails ? JSON.parse(g.childrenDetails as string) : [];
        } catch (e) {
          // If parsing fails, assume it's already an array
          childrenDetails = g.childrenDetails || [];
        }
        return Array.isArray(childrenDetails) && childrenDetails.length > 0;
      }).length;
      
      const needingAccommodation = allGuests.filter(g => g.needsAccommodation).length;
      
      return {
        total: allGuests.length,
        confirmed,
        declined,
        pending,
        withPlusOnes,
        withChildren,
        needingAccommodation
      };
    } catch (error) {
      console.error(`Failed to get guest statistics for event ${eventId}:`, error);
      throw error;
    }
  }
}