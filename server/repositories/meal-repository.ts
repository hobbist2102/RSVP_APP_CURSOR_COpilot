import { TenantRepository } from '../lib/tenant-repository';
import { 
  mealOptions, 
  MealOption, 
  InsertMealOption, 
  guestMealSelections,
  guests,
  ceremonies
} from '@shared/schema';
import { eq, and, SQL, count } from 'drizzle-orm';
import { db } from '../db';
import { withTenantFilter } from '../lib/query-builder';

/**
 * MealRepository provides data access for meal-related entities with tenant isolation
 */
export class MealRepository extends TenantRepository<MealOption, InsertMealOption> {
  constructor() {
    super(mealOptions);
  }
  
  /**
   * Get meal options for a specific ceremony
   * @param ceremonyId The ceremony ID
   * @param eventId The event ID (tenant)
   * @returns Meal options for the ceremony
   */
  async getMealOptionsByCeremony(ceremonyId: number, eventId: number): Promise<MealOption[]> {
    try {
      // First ensure the ceremony belongs to this event
      const ceremonyResult = await db.select()
        .from(ceremonies)
        .where(and(
          eq(ceremonies.id, ceremonyId),
          eq(ceremonies.eventId, eventId)
        ));
        
      if (ceremonyResult.length === 0) {
        return []; // Ceremony not found or doesn't belong to this event
      }
      
      // Get meal options for this ceremony
      const condition = and(
        eq(mealOptions.eventId, eventId),
        eq(mealOptions.ceremonyId, ceremonyId)
      );
      
      const result = await db.select()
        .from(mealOptions)
        .where(condition);
        
      return result;
    } catch (error) {
      console.error(`Failed to get meal options for ceremony ${ceremonyId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get meal options with selection counts
   * @param ceremonyId The ceremony ID
   * @param eventId The event ID (tenant)
   * @returns Meal options with selection counts
   */
  async getMealOptionsWithCounts(ceremonyId: number, eventId: number): Promise<Array<MealOption & { 
    selectionCount: number;
  }>> {
    try {
      // Get all meal options for this ceremony
      const mealOptionsList = await this.getMealOptionsByCeremony(ceremonyId, eventId);
      
      // Get selection counts for each meal option
      const result = await Promise.all(mealOptionsList.map(async (option) => {
        const selections = await db.select({ count: count() })
          .from(guestMealSelections)
          .innerJoin(guests, eq(guestMealSelections.guestId, guests.id))
          .where(and(
            eq(guestMealSelections.mealOptionId, option.id),
            eq(guests.eventId, eventId)
          ));
          
        const selectionCount = selections[0]?.count || 0;
        
        return {
          ...option,
          selectionCount
        };
      }));
      
      return result;
    } catch (error) {
      console.error(`Failed to get meal options with counts for ceremony ${ceremonyId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get meal selections for a specific guest
   * @param guestId The guest ID
   * @param eventId The event ID (tenant)
   * @returns Meal selections with meal option details
   */
  async getGuestMealSelections(guestId: number, eventId: number): Promise<Array<{
    selectionId: number;
    guestId: number;
    mealOptionId: number;
    ceremonyId: number;
    notes: string | null;
    mealName: string;
    mealDescription: string | null;
    ceremonyName: string;
    ceremonyDate: Date;
  }>> {
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
      
      // Get meal selections with joined details
      const selections = await db.select({
        selectionId: guestMealSelections.id,
        guestId: guestMealSelections.guestId,
        mealOptionId: guestMealSelections.mealOptionId,
        ceremonyId: guestMealSelections.ceremonyId,
        notes: guestMealSelections.notes,
        mealName: mealOptions.name,
        mealDescription: mealOptions.description,
        ceremonyName: ceremonies.name,
        ceremonyDate: ceremonies.date
      })
      .from(guestMealSelections)
      .innerJoin(mealOptions, eq(guestMealSelections.mealOptionId, mealOptions.id))
      .innerJoin(ceremonies, eq(guestMealSelections.ceremonyId, ceremonies.id))
      .where(and(
        eq(guestMealSelections.guestId, guestId),
        eq(ceremonies.eventId, eventId),
        eq(mealOptions.eventId, eventId)
      ));
      
      return selections;
    } catch (error) {
      console.error(`Failed to get meal selections for guest ${guestId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Create a guest meal selection
   * @param guestId The guest ID
   * @param mealOptionId The meal option ID
   * @param ceremonyId The ceremony ID
   * @param notes Optional notes about the selection
   * @param eventId The event ID (tenant) for validation
   * @returns The created selection ID
   */
  async createMealSelection(
    guestId: number, 
    mealOptionId: number, 
    ceremonyId: number, 
    notes: string | null,
    eventId: number
  ): Promise<number> {
    try {
      // Validate the guest belongs to this event
      const guestResult = await db.select()
        .from(guests)
        .where(and(
          eq(guests.id, guestId),
          eq(guests.eventId, eventId)
        ));
        
      if (guestResult.length === 0) {
        throw new Error(`Guest ${guestId} does not belong to event ${eventId}`);
      }
      
      // Validate the meal option belongs to this event and ceremony
      const mealOptionResult = await db.select()
        .from(mealOptions)
        .where(and(
          eq(mealOptions.id, mealOptionId),
          eq(mealOptions.eventId, eventId),
          eq(mealOptions.ceremonyId, ceremonyId)
        ));
        
      if (mealOptionResult.length === 0) {
        throw new Error(`Meal option ${mealOptionId} does not belong to event ${eventId} and ceremony ${ceremonyId}`);
      }
      
      // Validate the ceremony belongs to this event
      const ceremonyResult = await db.select()
        .from(ceremonies)
        .where(and(
          eq(ceremonies.id, ceremonyId),
          eq(ceremonies.eventId, eventId)
        ));
        
      if (ceremonyResult.length === 0) {
        throw new Error(`Ceremony ${ceremonyId} does not belong to event ${eventId}`);
      }
      
      // Check if there's an existing selection for this guest and ceremony
      const existingSelection = await db.select()
        .from(guestMealSelections)
        .where(and(
          eq(guestMealSelections.guestId, guestId),
          eq(guestMealSelections.ceremonyId, ceremonyId)
        ));
        
      if (existingSelection.length > 0) {
        // Update the existing selection
        const result = await db.update(guestMealSelections)
          .set({ 
            mealOptionId,
            notes 
          })
          .where(eq(guestMealSelections.id, existingSelection[0].id))
          .returning();
          
        return result[0].id;
      } else {
        // Create a new selection
        const result = await db.insert(guestMealSelections)
          .values({
            guestId,
            mealOptionId,
            ceremonyId,
            notes
          })
          .returning();
          
        return result[0].id;
      }
    } catch (error) {
      console.error(`Failed to create meal selection for guest ${guestId} in event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Delete a guest meal selection
   * @param selectionId The selection ID
   * @param eventId The event ID (tenant) for validation
   * @returns true if deleted, false if not found
   */
  async deleteMealSelection(selectionId: number, eventId: number): Promise<boolean> {
    try {
      // Get the selection with joined tables for tenant validation
      const selection = await db.select()
        .from(guestMealSelections)
        .innerJoin(guests, eq(guestMealSelections.guestId, guests.id))
        .innerJoin(mealOptions, eq(guestMealSelections.mealOptionId, mealOptions.id))
        .innerJoin(ceremonies, eq(guestMealSelections.ceremonyId, ceremonies.id))
        .where(and(
          eq(guestMealSelections.id, selectionId),
          eq(guests.eventId, eventId),
          eq(mealOptions.eventId, eventId),
          eq(ceremonies.eventId, eventId)
        ));
        
      if (selection.length === 0) {
        return false; // Not found or doesn't belong to this event
      }
      
      // Delete the selection
      const result = await db.delete(guestMealSelections)
        .where(eq(guestMealSelections.id, selectionId))
        .returning();
        
      return result.length > 0;
    } catch (error) {
      console.error(`Failed to delete meal selection ${selectionId} in event ${eventId}:`, error);
      throw error;
    }
  }
}