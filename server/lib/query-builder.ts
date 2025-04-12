import { eq, and, SQL, isNotNull, inArray, asc, desc, AnyColumn, is, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';
import { Request } from 'express';

/**
 * Multi-Tenant Query Builder Utilities
 * 
 * These functions ensure proper data isolation between different wedding events
 * by consistently applying tenant filtering across all database operations.
 */

/**
 * Type guard to ensure a column exists on a table
 */
function hasColumn<T>(table: PgTable<any>, column: string): column is keyof typeof table {
  return column in table;
}

/**
 * Safely access a table column by string name
 */
function getColumn(table: PgTable<any>, columnName: string): AnyColumn {
  if (!hasColumn(table, columnName)) {
    throw new Error(`Column '${columnName}' does not exist on table '${table}'`);
  }
  
  return table[columnName] as AnyColumn;
}

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
  ...additionalConditions: SQL<unknown>[]
): SQL<unknown> {
  // Validate inputs
  if (!eventId || isNaN(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}`);
  }

  // Convert field key to string and ensure it's a column in the table
  const eventIdFieldName = String(eventIdField);
  const column = getColumn(table, eventIdFieldName);
  
  // Filter out any undefined conditions
  const validConditions = additionalConditions.filter(
    (condition): condition is SQL<unknown> => condition !== undefined
  );
  
  if (validConditions.length === 0) {
    // Just tenant filtering
    return eq(column, eventId);
  }
  
  // Tenant filtering and additional conditions
  return sql`${eq(column, eventId)} AND ${and(...validConditions)}`;
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
): SQL<unknown> {
  // Validate inputs
  if (!id || isNaN(id)) {
    throw new Error(`Invalid entity id: ${id}`);
  }
  
  if (!eventId || isNaN(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}`);
  }

  // Convert field keys to strings and get columns
  const idFieldName = String(idField);
  const eventIdFieldName = String(eventIdField);
  const idColumn = getColumn(table, idFieldName);
  const eventIdColumn = getColumn(table, eventIdFieldName);
  
  // Create a combined filter condition
  return sql`${eq(idColumn, id)} AND ${eq(eventIdColumn, eventId)}`;
}

/**
 * Creates a tenant-filtered where condition for multiple entities
 * @param table The database table
 * @param idField The ID field in the table
 * @param ids Array of entity IDs
 * @param eventIdField The event ID field in the table
 * @param eventId The event ID to filter by
 * @returns A SQL condition that filters by entity IDs and tenant
 */
export function withEntitiesAndTenant<T extends object>(
  table: PgTable<any>,
  idField: keyof T,
  ids: number[],
  eventIdField: keyof T,
  eventId: number
): SQL<unknown> {
  // Validate inputs
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new Error(`Invalid entity ids array: ${ids}`);
  }
  
  if (!eventId || isNaN(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}`);
  }

  // Convert field keys to strings and get columns
  const idFieldName = String(idField);
  const eventIdFieldName = String(eventIdField);
  const idColumn = getColumn(table, idFieldName);
  const eventIdColumn = getColumn(table, eventIdFieldName);
  
  // Create a combined filter condition that won't return undefined
  const inArrayCondition = inArray(idColumn, ids);
  const eqCondition = eq(eventIdColumn, eventId);
  
  return sql`${inArrayCondition} AND ${eqCondition}`;
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
  // Validate inputs
  if (!eventId || isNaN(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}`);
  }

  return {
    ...data as object,
    eventId
  } as T;
}

/**
 * Prepares multiple objects for insertion with the same tenant ID
 * @param dataArray Array of data objects to insert
 * @param eventId The event ID to associate with the data
 * @returns Array of data objects with tenant ID included
 */
export function withBulkTenantId<T extends object>(
  dataArray: Array<Omit<T, 'eventId'>>,
  eventId: number
): T[] {
  // Validate inputs
  if (!eventId || isNaN(eventId)) {
    throw new Error(`Invalid eventId: ${eventId}`);
  }
  
  if (!dataArray || !Array.isArray(dataArray)) {
    throw new Error('Invalid data array');
  }

  return dataArray.map(data => ({
    ...data as object,
    eventId
  } as T));
}

/**
 * Creates a standardized ordering condition based on common fields
 * @param table The database table
 * @param orderBy Field to order by
 * @param direction Sort direction ('asc' or 'desc')
 * @returns SQL ordering condition
 */
export function getOrderBy<T extends object>(
  table: PgTable<any>,
  orderBy: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): SQL<unknown> {
  const fieldName = String(orderBy);
  const column = getColumn(table, fieldName);
  
  if (direction === 'desc') {
    return desc(column);
  }
  
  return asc(column);
}

/**
 * Helper function to validate tenant context exists
 * @param eventId The event ID to validate
 * @throws Error if eventId is invalid
 */
export function validateTenantContext(eventId: number | null | undefined): void {
  if (!eventId || isNaN(eventId)) {
    throw new Error('Missing or invalid event context');
  }
}

/**
 * Type definition for request with event context
 * This defines the structure of the Express request with tenant context
 */
export interface RequestWithEventContext extends Request {
  eventContext?: {
    eventId: number;
    eventTitle?: string | undefined;
    hasPermission?: boolean | undefined;
    createdBy?: number | undefined;
  };
}

/**
 * Helper function to extract eventId from request context
 * @param req Express request object with eventContext
 * @returns Validated event ID
 * @throws Error if event context is missing or invalid
 */
export function getEventIdFromContext(req: RequestWithEventContext): number {
  if (!req || !req.eventContext || !req.eventContext.eventId) {
    throw new Error('Missing event context');
  }
  
  const eventId = req.eventContext.eventId;
  if (isNaN(eventId)) {
    throw new Error('Invalid event ID in context');
  }
  
  return eventId;
}