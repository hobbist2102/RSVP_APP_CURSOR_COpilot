# Pending Fixes for Wedding RSVP Application

## Critical Bugs

### 1. Guest Data Inconsistency (Don ji not appearing)

**Issue:** 
- Database confirms "Don ji" exists with ID 9 and event_id 4 (Rocky Rani wedding) but doesn't appear in guest lists despite being in the database.
- The application has duplicate implementations of `getGuestsByEvent()` - one in MemStorage (in-memory) and one in DatabaseStorage (database-based), likely causing data inconsistency.

**Temporary Fix:**
- Forwarded all calls to the database implementation 
- Added direct SQL queries as fallback for troubleshooting

**Permanent Solution Required:**
- ✅ Consolidate the duplicate implementations
- ✅ Ensure all guest management operations use a single source of truth
- ⬜ Investigate why Don ji doesn't appear in standard queries

### 2. Database Schema/TypeScript Inconsistencies

**Issue:**
- Several TypeScript errors in `storage.ts` due to type mismatches between Drizzle schema and actual implementation

**Required Fix:**
- ⬜ Review and align all TypeScript types with the database schema
- ⬜ Fix all TypeScript errors related to date handling, optional properties, and returning promises

### 3. Routes Error Handling

**Issue:**
- Several routes call `getGuestsByEvent` but don't have proper error handling

**Required Fix:**
- ⬜ Update all routes calling the function to use `_dbGetGuestsByEvent`
- ⬜ Add consistent error handling across all API routes

### 4. Multi-Tenant Data Isolation

**Issue:**
- Potential data leakage between different wedding events due to non-context-aware data access methods

**Fix Status:**
- ✅ Added event context validation to critical RSVP routes
- ✅ Implemented `getGuestWithEventContext` method to enforce isolation
- ✅ Added warnings to non-context-aware methods like `getGuest`
- ✅ Created comprehensive documentation in `docs/MULTI_TENANT_ISOLATION.md`
- ✅ Updated WhatsApp routes to use context-aware methods
- ✅ Verified individual guest routes for proper event context validation
- ✅ Enhanced ceremony attendance endpoints with guest-ceremony-event validation
- ✅ Updated ceremony deletion endpoint with event context validation
- ✅ Added meal selection endpoints with cross-ceremony validation
- ✅ Implemented comprehensive logging for debugging and auditing
- ⬜ Update travel and accommodation endpoints for proper event validation
- ⬜ Apply context validation to relationship types and templates
- ⬜ Review statistics and reporting endpoints for proper isolation

## Feature Development

### 1. Email Service Integration

**Status:**
- ✅ Basic email service framework created with Resend integration
- ✅ Schema updated with email configuration fields
- ⬜ Email template system for RSVP notifications
- ⬜ Email configuration in event setup UI

### 2. RSVP Module

**Status:**
- ⬜ Backend API routes for RSVP submission and status
- ⬜ Secure token system for guest authentication
- ⬜ Public RSVP form with guest verification
- ⬜ Guest information confirmation/editing workflow
- ⬜ Plus-one and children information collection
- ⬜ Ceremony selection
- ⬜ Travel and accommodation requirements
- ⬜ Meal selection
- ⬜ Personal message to couple