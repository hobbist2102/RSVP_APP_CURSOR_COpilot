import { TenantRepository } from '../lib/tenant-repository';
import { accommodations, Accommodation, InsertAccommodation, roomAllocations } from '@shared/schema';
import { eq, and, SQL, desc, count } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter } from '../lib/query-builder';

/**
 * AccommodationRepository provides data access for accommodation entities with tenant isolation
 */
export class AccommodationRepository extends TenantRepository<Accommodation, InsertAccommodation> {
  constructor() {
    super(accommodations);
  }
  
  /**
   * Get accommodation statistics for a specific event
   * @param eventId The event ID (tenant)
   * @returns Accommodation statistics with allocation info
   */
  async getAccommodationStats(eventId: number): Promise<{
    totalRooms: number;
    allocatedRooms: number;
    availableRooms: number;
    accommodationTypes: number;
  }> {
    try {
      const allAccommodations = await this.getAllByTenant(eventId);
      
      if (allAccommodations.length === 0) {
        return {
          totalRooms: 0,
          allocatedRooms: 0,
          availableRooms: 0,
          accommodationTypes: 0
        };
      }
      
      // Calculate totals
      const totalRooms = allAccommodations.reduce((sum, acc) => sum + acc.totalRooms, 0);
      const allocatedRooms = allAccommodations.reduce((sum, acc) => sum + acc.allocatedRooms, 0);
      const availableRooms = totalRooms - allocatedRooms;
      const accommodationTypes = allAccommodations.length;
      
      return {
        totalRooms,
        allocatedRooms,
        availableRooms,
        accommodationTypes
      };
    } catch (error) {
      console.error(`Failed to get accommodation stats for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get accommodations with their allocation status
   * @param eventId The event ID (tenant)
   * @returns Accommodations with allocation information
   */
  async getAccommodationsWithAllocation(eventId: number): Promise<Array<Accommodation & { 
    availableRooms: number;
    guestsAssigned: number;
  }>> {
    try {
      const accommodationList = await this.getAllByTenant(eventId);
      
      // Get allocations count for each accommodation
      const result = await Promise.all(accommodationList.map(async (accommodation) => {
        const allocations = await db.select({ count: count() })
          .from(roomAllocations)
          .where(eq(roomAllocations.accommodationId, accommodation.id));
          
        const guestsAssigned = allocations[0]?.count || 0;
        const availableRooms = accommodation.totalRooms - accommodation.allocatedRooms;
        
        return {
          ...accommodation,
          availableRooms,
          guestsAssigned
        };
      }));
      
      return result;
    } catch (error) {
      console.error(`Failed to get accommodations with allocation for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get available accommodations (those with available rooms)
   * @param eventId The event ID (tenant)
   * @returns Available accommodations
   */
  async getAvailableAccommodations(eventId: number): Promise<Accommodation[]> {
    try {
      const allAccommodations = await this.getAllByTenant(eventId);
      
      // Filter to find those with available rooms
      return allAccommodations.filter(acc => acc.totalRooms > acc.allocatedRooms);
    } catch (error) {
      console.error(`Failed to get available accommodations for event ${eventId}:`, error);
      throw error;
    }
  }
}