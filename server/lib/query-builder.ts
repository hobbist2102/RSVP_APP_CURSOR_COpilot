import { eq, and, SQL } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

/**
 * Utility functions for building tenant-aware database queries
 * These functions help ensure data isolation between different wedding events
 */

/**
 * Creates a where condition that includes tenant filtering
 * @param table The database table
 * @param eventIdField The event ID field in the table
 * @param eventId The event ID to filter by
 * @param additionalConditions Additional conditions to include
 * @returns A SQL condition with tenant filtering
 */
export function withTenantFilter<T extends object>(
  table: PgTable<any>,
  eventIdField: keyof T,
  eventId: number,
  ...additionalConditions: SQL[]
): SQL {
  if (additionalConditions.length === 0) {
    // Just tenant filtering
    return eq(table[eventIdField as string], eventId);
  }
  
  // Tenant filtering and additional conditions
  return and(
    eq(table[eventIdField as string], eventId),
    ...additionalConditions
  );
}

/**
 * Creates a tenant-filtered where condition for a specific entity
 * @param table The database table
 * @param idField The ID field in the table
 * @param id The entity ID
 * @param eventIdField The event ID field in the table
 * @param eventId The event ID to filter by
 * @returns A SQL condition that filters by both entity ID and tenant
 */
export function withEntityAndTenant<T extends object>(
  table: PgTable<any>,
  idField: keyof T,
  id: number,
  eventIdField: keyof T,
  eventId: number
): SQL {
  return and(
    eq(table[idField as string], id),
    eq(table[eventIdField as string], eventId)
  );
}

/**
 * Prepares data for insertion with tenant ID
 * @param data The data to insert
 * @param eventId The event ID to associate with the data
 * @returns Data with tenant ID included
 */
export function withTenantId<T extends object>(
  data: Omit<T, 'eventId'>,
  eventId: number
): T {
  return {
    ...data as object,
    eventId
  } as T;
}