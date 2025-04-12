import { eq, and, SQL } from 'drizzle-orm';
import { db } from '../db';
import { PgTable } from 'drizzle-orm/pg-core';
import { 
  withTenantFilter, 
  withEntityAndTenant, 
  withTenantId, 
  withBulkTenantId,
  validateTenantContext
} from './query-builder';

/**
 * TenantRepository provides a base class for implementing tenant-aware data access.
 * This ensures consistent tenant isolation across all entities in the system.
 * 
 * @template T The entity type
 * @template InsertT The insert type for the entity
 */
export class TenantRepository<T extends { id: number; eventId: number }, InsertT extends { eventId: number }> {
  protected table: PgTable;
  protected idField: string = 'id';
  protected eventIdField: string = 'eventId';
  
  /**
   * Creates a new TenantRepository
   * @param table The database table
   * @param idField The ID field in the table (defaults to 'id')
   * @param eventIdField The event ID field in the table (defaults to 'eventId')
   */
  constructor(table: PgTable, idField: string = 'id', eventIdField: string = 'eventId') {
    this.table = table;
    this.idField = idField;
    this.eventIdField = eventIdField;
  }
  
  /**
   * Retrieves a single entity by ID, ensuring it belongs to the specified tenant
   * @param id The entity ID
   * @param eventId The event ID (tenant)
   * @returns The entity if found and belongs to the tenant, undefined otherwise
   */
  async getById(id: number, eventId: number): Promise<T | undefined> {
    validateTenantContext(eventId);
    
    try {
      const condition = withEntityAndTenant(
        this.table,
        this.idField as keyof T,
        id,
        this.eventIdField as keyof T,
        eventId
      );
      
      const result = await db.select().from(this.table).where(condition);
      return result[0] as T | undefined;
    } catch (error) {
      console.error(`Failed to get ${this.table.name} with ID ${id} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Retrieves all entities for a specific tenant
   * @param eventId The event ID (tenant)
   * @param additionalConditions Optional additional filtering conditions
   * @returns Array of entities belonging to the tenant
   */
  async getAllByTenant(eventId: number, ...additionalConditions: SQL[]): Promise<T[]> {
    validateTenantContext(eventId);
    
    try {
      const condition = withTenantFilter(
        this.table,
        this.eventIdField as keyof T,
        eventId,
        ...additionalConditions
      );
      
      const result = await db.select().from(this.table).where(condition);
      return result as T[];
    } catch (error) {
      console.error(`Failed to get all ${this.table.name} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Creates a new entity within the specified tenant
   * @param data The entity data to insert
   * @param eventId The event ID (tenant)
   * @returns The created entity
   */
  async create(data: Omit<InsertT, 'eventId'>, eventId: number): Promise<T> {
    validateTenantContext(eventId);
    
    try {
      const insertData = withTenantId<InsertT>(data, eventId);
      const result = await db.insert(this.table).values(insertData).returning();
      return result[0] as T;
    } catch (error) {
      console.error(`Failed to create ${this.table.name} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Creates multiple entities within the specified tenant
   * @param dataArray Array of entity data to insert
   * @param eventId The event ID (tenant)
   * @returns Array of created entities
   */
  async bulkCreate(dataArray: Array<Omit<InsertT, 'eventId'>>, eventId: number): Promise<T[]> {
    validateTenantContext(eventId);
    
    try {
      if (!dataArray.length) {
        return [];
      }
      
      const insertData = withBulkTenantId<InsertT>(dataArray, eventId);
      const result = await db.insert(this.table).values(insertData).returning();
      return result as T[];
    } catch (error) {
      console.error(`Failed to bulk create ${this.table.name} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Updates an entity, ensuring it belongs to the specified tenant
   * @param id The entity ID
   * @param data The update data
   * @param eventId The event ID (tenant)
   * @returns The updated entity if found and belongs to the tenant, undefined otherwise
   */
  async update(id: number, data: Partial<Omit<InsertT, 'eventId'>>, eventId: number): Promise<T | undefined> {
    validateTenantContext(eventId);
    
    try {
      // First verify the entity exists and belongs to this tenant
      const entity = await this.getById(id, eventId);
      if (!entity) {
        return undefined;
      }
      
      const condition = withEntityAndTenant(
        this.table,
        this.idField as keyof T,
        id,
        this.eventIdField as keyof T,
        eventId
      );
      
      const result = await db.update(this.table)
        .set(data)
        .where(condition)
        .returning();
        
      return result[0] as T;
    } catch (error) {
      console.error(`Failed to update ${this.table.name} with ID ${id} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Deletes an entity, ensuring it belongs to the specified tenant
   * @param id The entity ID
   * @param eventId The event ID (tenant)
   * @returns true if deleted, false if not found or doesn't belong to tenant
   */
  async delete(id: number, eventId: number): Promise<boolean> {
    validateTenantContext(eventId);
    
    try {
      // First verify the entity exists and belongs to this tenant
      const entity = await this.getById(id, eventId);
      if (!entity) {
        return false;
      }
      
      const condition = withEntityAndTenant(
        this.table,
        this.idField as keyof T,
        id,
        this.eventIdField as keyof T,
        eventId
      );
      
      const result = await db.delete(this.table)
        .where(condition)
        .returning();
        
      return result.length > 0;
    } catch (error) {
      console.error(`Failed to delete ${this.table.name} with ID ${id} for event ${eventId}:`, error);
      throw error;
    }
  }
  
  /**
   * Deletes all entities belonging to the specified tenant
   * @param eventId The event ID (tenant)
   * @returns The number of entities deleted
   */
  async deleteAllByTenant(eventId: number): Promise<number> {
    validateTenantContext(eventId);
    
    try {
      const condition = withTenantFilter(
        this.table,
        this.eventIdField as keyof T,
        eventId
      );
      
      const result = await db.delete(this.table)
        .where(condition)
        .returning();
        
      return result.length;
    } catch (error) {
      console.error(`Failed to delete all ${this.table.name} for event ${eventId}:`, error);
      throw error;
    }
  }
}