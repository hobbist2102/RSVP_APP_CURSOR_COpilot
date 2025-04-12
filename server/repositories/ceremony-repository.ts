import { TenantRepository } from '../lib/tenant-repository';
import { ceremonies, Ceremony, InsertCeremony } from '@shared/schema';
import { eq, and, SQL, gte, desc, asc } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter } from '../lib/query-builder';

/**
 * CeremonyRepository provides data access for ceremony entities with tenant isolation
 */
export class CeremonyRepository extends TenantRepository<Ceremony, InsertCeremony> {
  constructor() {
    super(ceremonies);
  }
  
  /**
   * Get upcoming ceremonies for a specific event
   * @param eventId The event ID (tenant)
   * @param fromDate Optional date to filter from (defaults to current date)
   * @returns Upcoming ceremonies
   */
  async getUpcomingCeremonies(eventId: number, fromDate?: Date): Promise<Ceremony[]> {
    try {
      const filterDate = fromDate || new Date();
      
      const condition = withTenantFilter(
        ceremonies,
        'eventId' as keyof Ceremony,
        eventId,
        gte(ceremonies.date, filterDate)
      );
      
      const result = await db.select()
        .from(ceremonies)
        .where(condition)
        .orderBy(asc(ceremonies.date), asc(ceremonies.startTime));
        
      return result;
    } catch (error) {
      console.error(`Failed to get upcoming ceremonies for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get ceremonies for a specific date within an event
   * @param eventId The event ID (tenant)
   * @param date The date to filter by
   * @returns Ceremonies on the specified date
   */
  async getCeremoniesByDate(eventId: number, date: Date): Promise<Ceremony[]> {
    try {
      const condition = withTenantFilter(
        ceremonies,
        'eventId' as keyof Ceremony,
        eventId,
        eq(ceremonies.date, date)
      );
      
      const result = await db.select()
        .from(ceremonies)
        .where(condition)
        .orderBy(asc(ceremonies.startTime));
        
      return result;
    } catch (error) {
      console.error(`Failed to get ceremonies for date ${date} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get a summary of all ceremony dates within an event
   * Returns unique dates that have ceremonies
   * @param eventId The event ID (tenant)
   * @returns Array of dates with ceremonies
   */
  async getCeremonyDateSummary(eventId: number): Promise<Date[]> {
    try {
      const allCeremonies = await this.getAllByTenant(eventId);
      
      // Extract unique dates
      const uniqueDates = new Map<string, Date>();
      
      allCeremonies.forEach(ceremony => {
        const dateStr = ceremony.date.toISOString().split('T')[0];
        if (!uniqueDates.has(dateStr)) {
          uniqueDates.set(dateStr, ceremony.date);
        }
      });
      
      // Convert to array and sort
      return Array.from(uniqueDates.values()).sort((a, b) => a.getTime() - b.getTime());
    } catch (error) {
      console.error(`Failed to get ceremony date summary for event ${eventId}:`, error);
      throw error;
    }
  }
}