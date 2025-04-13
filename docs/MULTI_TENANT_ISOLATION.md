# Multi-Tenant Data Isolation in the Wedding Management Platform

## Overview

This document explains the approach used to ensure proper data isolation between different wedding events in the platform. The system is designed to handle multiple concurrent wedding projects while ensuring that data from one event cannot be accessed by users of another event.

## Key Principles

1. **Event Context Validation**: All guest data access is validated against the event context
2. **Tenant-Aware Database Schema**: All relevant tables contain `eventId` as a foreign key to the associated event
3. **Defense in Depth**: Multiple layers of protection ensure isolation even if one layer fails

## Implementation Details

### 1. Database Schema Design

All primary tables include an `eventId` column that associates each record with a specific wedding event:

- `guests` table includes `eventId` for each guest
- `ceremonies` table includes `eventId` for each ceremony
- `accommodations` table includes `eventId` for each accommodation
- etc.

This ensures that at the data storage level, there is a clear association between records and their respective events.

### 2. Context-Aware Storage Access Methods

The standard storage methods that do not include event context (like `getGuest(id)`) have been augmented with context-aware versions (`getGuestWithEventContext(id, eventId)`). The context-aware methods include:

- Explicit validation that the accessed resource belongs to the specified event
- Query-level restrictions that limit database queries to specific event IDs
- Clear logging with warnings when non-context methods are used

Example implementation:

```typescript
async getGuestWithEventContext(id: number, eventId: number): Promise<Guest | undefined> {
  if (!id || !eventId) {
    console.error('Invalid parameters for getGuestWithEventContext', { id, eventId });
    return undefined;
  }
  
  console.log(`Fetching guest with ID: ${id} in event context: ${eventId}`);
  try {
    // First verify the event exists
    const eventExists = await this.eventExists(eventId);
    if (!eventExists) {
      console.warn(`Event ID ${eventId} does not exist in getGuestWithEventContext`);
      return undefined;
    }
    
    // Then fetch the guest with event context constraint
    const result = await db.select().from(guests).where(
      and(
        eq(guests.id, id),
        eq(guests.eventId, eventId)
      )
    );
    
    // Return guest only if it belongs to the specified event
    return result[0];
  } catch (error) {
    console.error(`Error in getGuestWithEventContext for guest ${id}, event ${eventId}:`, error);
    throw new Error(`Failed to retrieve guest with ID ${id} in event context ${eventId}`);
  }
}
```

### 3. API Route Protection

All API routes that access guest data (especially RSVP-related routes) have been updated to use context-aware methods:

- `/api/rsvp/verify`: Uses `getGuestWithEventContext` to validate RSVP tokens
- `/api/rsvp/submit`: Uses `getGuestWithEventContext` via `RSVPService.processRSVPResponse`
- `/api/admin/rsvp/send-invites`: Uses `getGuestWithEventContext` to validate guest access

### 4. Error Handling & Logging

Enhanced error handling ensures that any attempt to access data across event boundaries:

- Fails gracefully with appropriate error messages
- Generates warning logs for security monitoring
- Returns clear user-facing messages that don't leak information

## Potential Weaknesses and Mitigations

1. **Direct Method Access**: Some internal methods might still use `getGuest()` directly
   - Mitigation: Added warning logs for all non-context-aware method usage
   - Mitigation: Planning to deprecate non-context methods in future versions

2. **Missing JOIN Constraints**: Some complex queries might miss event context constraints
   - Mitigation: Added comprehensive logging to identify such scenarios
   - Mitigation: Code reviews specifically looking for missing event context

## Future Enhancements

1. **Audit Logging**: Implement comprehensive audit logging for all cross-event access attempts
2. **Authentication Integration**: Enhance the system to use event-specific authentication tokens
3. **Row-Level Security**: Consider implementing database-level row security policies

## Conclusion

The platform uses a multi-layered approach to ensure event data isolation. The combination of database schema design, context-aware methods, and API route protection provides robust protection against cross-event data leakage while maintaining a clean and maintainable codebase.