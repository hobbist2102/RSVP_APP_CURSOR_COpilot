# Multi-Tenant Architecture Implementation

## Overview

We've implemented a comprehensive multi-tenant architecture for the Wedding RSVP application to ensure proper data isolation between different wedding events. This document outlines the design decisions, implementation details, and guidelines for maintaining and extending the system.

## Core Components

### 1. Query Builder Utilities (`server/lib/query-builder.ts`)

A set of helper functions to ensure consistent tenant filtering across all database operations:

- `withTenantFilter`: Creates WHERE conditions that include tenant filtering
- `withEntityAndTenant`: Filters by both entity ID and tenant
- `withEntitiesAndTenant`: Filters multiple entities by ID and tenant
- `withTenantId`: Prepares data for insertion with tenant ID
- `withBulkTenantId`: Prepares multiple entities for insertion with tenant ID
- `getOrderBy`: Creates standardized ordering conditions
- `validateTenantContext`: Validates tenant context exists
- `getEventIdFromContext`: Extracts eventId from request context

### 2. Tenant Repository Base Class (`server/lib/tenant-repository.ts`)

A base class that implements common CRUD operations with tenant isolation:

- `getById`: Retrieves an entity by ID within a tenant
- `getAllByTenant`: Retrieves all entities for a tenant
- `create`: Creates a new entity within a tenant
- `bulkCreate`: Creates multiple entities within a tenant
- `update`: Updates an entity within a tenant
- `delete`: Deletes an entity within a tenant
- `deleteAllByTenant`: Deletes all entities for a tenant

### 3. Tenant-Aware Repositories

Entity-specific repositories that extend the base TenantRepository:

- `EventRepository`: Manages wedding events (the tenants themselves)
- `GuestRepository`: Manages guests with tenant isolation
- `CeremonyRepository`: Manages ceremonies with tenant isolation
- `AccommodationRepository`: Manages accommodations with tenant isolation
- `WhatsappTemplateRepository`: Manages WhatsApp templates with tenant isolation
- `MealRepository`: Manages meal options with tenant isolation

Special repositories for entities without direct tenant references:
- `RoomAllocationRepository`: Achieves tenant isolation through related entities

### 4. Tenant Context Middleware (`server/middleware/tenant-context.ts`)

Middleware that extracts and validates tenant context from various sources:

- Determines event ID from query parameters, request body, route parameters, or session
- Verifies the event exists and user has permission to access it
- Stores event context in the request object for downstream handlers
- Rejects requests that require tenant context when it's missing

### 5. Client-Side Event Context (`client/src/context/event-context.tsx`)

React context provider that manages the current event on the client side:

- `EventContextProvider`: Main provider component that maintains event state
- `useEventContext`: Hook for accessing event context throughout the application
- `CurrentEvent` interface: Represents a wedding event with all necessary properties
- Features synchronization with server-side tenant context
- Handles caching, query invalidation, and permission management

### 6. Event Selector Component (`client/src/components/event/event-selector.tsx`)

UI component for switching between events:

- Displays visual indicators for event context status
- Manages event switching with proper tenant context updates
- Handles edge cases like URL parameters and fallbacks
- Ensures data consistency during tenant switches

## Data Flow

### Server-Side Flow

1. **Request Arrives**: The tenant context middleware processes the request
2. **Context Extraction**: Event ID is determined from available sources
3. **Context Validation**: The event is verified to exist and be accessible
4. **Route Handler**: Uses repositories with the validated event ID
5. **Repository Operations**: All database operations include tenant filtering
6. **Response**: Data is returned, properly isolated by tenant

### Client-Side Flow

1. **App Initialization**: Event context provider initializes and fetches current event
2. **Context Access**: Components access event context via the `useEventContext` hook or simpler `useCurrentEvent` wrapper
3. **Event Switching**: When user selects a new event, the context provider updates local state, server session, and invalidates affected queries
4. **Data Requests**: API requests include tenant context automatically via session
5. **UI Updates**: Components re-render with data specific to the current event

## Implementation Guidelines

### Adding New Entities

1. Define the entity schema in `shared/schema.ts` with an `eventId` field
2. Create a repository that extends `TenantRepository` in the repositories directory
3. Add repository initialization and exports in `repositories/index.ts`
4. Use the repository in route handlers, ensuring tenant context is passed

### Relationships Between Entities

For entities that don't have a direct tenant reference:

1. Validate tenant context in operations by checking related entities
2. Join with tenant-aware entities to filter by tenant ID
3. See `RoomAllocationRepository` for an example

### API Route Guidelines

1. Use the `tenantContext` middleware for all routes
2. For routes that require tenant context, also use `requireTenantContext`
3. Extract event ID from request using `getEventIdFromRequest` or from event context
4. Pass the event ID to repository operations

### Client-Side Integration

1. Access the current event context using `useEventContext()` or `useCurrentEvent()`
2. Check `isValidEventContext` before attempting tenant-specific operations
3. Use `setCurrentEvent()` to switch the active tenant
4. For tenant-specific API endpoints, add event ID to the query key to ensure proper cache management
5. When creating new tenant-specific data, use `withTenantId` on the server side

## Example Usage

### Server-Side Example

```typescript
// In a route handler:
app.get('/api/guests', tenantContext, requireTenantContext, async (req, res) => {
  try {
    const eventId = req.eventContext.eventId;
    const guests = await guestRepository.getAllByTenant(eventId);
    res.json(guests);
  } catch (error) {
    console.error('Error fetching guests:', error);
    res.status(500).json({ message: 'Failed to fetch guests' });
  }
});
```

### Client-Side Example

```typescript
// In a React component:
import { useCurrentEvent } from '@/hooks/use-current-event';
import { useQuery } from '@tanstack/react-query';

function GuestList() {
  const { currentEvent, isValidEventContext } = useCurrentEvent();
  
  const { data: guests = [], isLoading } = useQuery({
    queryKey: ['/api/guests', currentEvent?.id],
    enabled: isValidEventContext && !!currentEvent?.id,
  });
  
  if (!isValidEventContext) {
    return <div>Please select an event first</div>;
  }
  
  if (isLoading) {
    return <div>Loading guests...</div>;
  }
  
  return (
    <div>
      <h2>Guests for {currentEvent.title}</h2>
      {/* Render guest list */}
    </div>
  );
}
```

## Security Considerations

- Event access is verified in the tenant context middleware
- Repository operations validate tenant context before executing
- Raw SQL queries should never be used directly
- Always use repository methods that enforce tenant isolation
- Client-side event context includes permission checks to prevent unauthorized access
- API responses are filtered by tenant before being returned

## Testing

The `server/test-tenant-repositories.ts` file provides examples of how to test the tenant-aware repositories and demonstrates proper tenant isolation.

## Debugging Tenant Context Issues

When troubleshooting tenant isolation problems:

1. Check the server logs for tenant context middleware messages (prefixed with 🔒)
2. Verify that the correct event ID is being passed to repository methods
3. Check if the client-side event context is valid by examining `isValidEventContext`
4. Ensure query keys include the event ID for proper cache segmentation
5. Look for places where tenant filtering might be missing in custom repository methods
6. Check for proper query invalidation after tenant-specific data mutations

## Future Enhancements

1. **Query Caching**: Implement Redis caching with tenant-aware cache keys
2. **Audit Logging**: Add tenant-aware audit logging for all operations
3. **Rate Limiting**: Implement tenant-based rate limiting
4. **Analytics**: Add tenant-specific analytics and usage tracking
5. **Tenant Configuration**: Add more tenant-specific configuration options
6. **Tenant Templates**: Create template system for new tenant initialization