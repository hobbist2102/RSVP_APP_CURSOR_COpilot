# Wedding RSVP App Developer Documentation

## Utility Functions

Our application uses a set of consolidated utility functions for consistent behavior across components. These utilities help reduce code duplication and ensure consistent behaviors throughout the application.

### API Utilities (`client/src/lib/api-utils.ts`)

The API utilities provide a standardized way to interact with our backend APIs.

#### Basic HTTP Methods

```typescript
// GET request
const response = await get('/api/endpoint');

// POST request
const response = await post('/api/endpoint', { data });

// PUT request
const response = await put('/api/endpoint', { data });

// PATCH request 
const response = await patch('/api/endpoint', { data });

// DELETE request
const response = await del('/api/endpoint');
```

#### Advanced Usage

```typescript
// With query parameters
const response = await get('/api/endpoint', { param1: 'value', param2: 123 });

// With custom headers
const response = await post('/api/endpoint', data, { 
  headers: { 'Custom-Header': 'value' } 
});

// Handling 401 responses specially
const response = await get('/api/endpoint', null, { unauthorized: 'returnNull' });
```

#### Resource Operations

For standard CRUD operations:

```typescript
// Create a resource
const newResource = await apiOperations.create('/api/resources', resourceData);

// Fetch all resources
const resources = await apiOperations.fetchAll('/api/resources');

// Fetch a specific resource
const resource = await apiOperations.fetchById('/api/resources', id);

// Update a resource
const updatedResource = await apiOperations.update('/api/resources', id, updates);

// Delete a resource
await apiOperations.delete('/api/resources', id);
```

### Date Utilities (`client/src/lib/date-utils.ts`)

Date utilities provide consistent date formatting throughout the application.

```typescript
// Format a date for display
formatDateForDisplay('2025-06-15'); // "June 15th, 2025"

// Format with time
formatDateForDisplay('2025-06-15T15:30:00', true); // "June 15th, 2025 3:30 PM" 

// Format for date input fields
formatForDateInput('2025-06-15'); // "2025-06-15"

// Get relative time
getRelativeTimeFromNow('2025-06-15'); // "in 2 months"

// Get remaining days
getDaysRemaining('2025-06-15'); // 60

// Get urgency class based on date
getDateUrgencyClass('2023-01-01'); // "text-muted-foreground" (past date)
getDateUrgencyClass('2025-06-01'); // "text-primary" (future date)
```

### Validation Utilities (`shared/validation-schemas.ts`)

The validation schemas provide centralized form validation rules.

```typescript
// Import shared schemas
import { userSchema, eventSchema } from '@shared/validation-schemas';

// Use in forms
const form = useForm({
  resolver: zodResolver(eventSchema),
  defaultValues: {...}
});
```

### Notification Utilities (`client/src/lib/notification-utils.ts`)

Utilities for consistent notifications and toasts:

```typescript
// Show success notification
showSuccess("Operation completed successfully");

// Show error notification
showError("An error occurred", "Details about the error");

// Show confirmation notification
showConfirmation("Are you sure?", () => handleConfirm(), () => handleCancel());
```

## Best Practices

1. **Always use consolidated utilities** rather than implementing duplicate functionality
2. **Update utilities when adding common functionality** that could be reused
3. **Follow the consistent naming conventions**:
   - `get/post/put/patch/del` for API calls
   - `formatDateForDisplay/formatForDateInput` for date formatting
   - `showSuccess/showError` for notifications
4. **Add proper TypeScript types** for all function parameters and return values
5. **Include JSDoc comments** for all utility functions to improve developer experience

## Components

### DataTable Component (`client/src/components/ui/data-table.tsx`)

A reusable table component with built-in pagination, sorting, and search functionality.

```typescript
<DataTable
  data={guests}
  columns={guestColumns}
  keyField="id"
  searchable={true}
  searchPlaceholder="Search guests..."
  onRowClick={handleRowClick}
/>
```

## Migration Guide

When migrating existing code to use the consolidated utilities:

1. Replace direct `fetch` calls with `get`, `post`, `put`, `patch`, or `del` from `api-utils.ts`
2. Replace date formatting with functions from `date-utils.ts`
3. Replace validation logic with schemas from `validation-schemas.ts`
4. Replace notification code with functions from `notification-utils.ts`