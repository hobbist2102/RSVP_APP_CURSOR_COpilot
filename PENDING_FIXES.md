# Pending Fixes for Wedding Management Platform

## Core Architectural Improvements

### 1. Multi-Tenant Foundation Implementation

**Issue:**
- Current implementation has inconsistent tenant isolation, leading to data leakage between events
- Lack of proper tenant context validation in API routes
- Inconsistent approach to tenant filtering in database queries
- Missing middleware for tenant context validation

**Required Implementation:**
- ✅ Create tenant context middleware for API routes
- ✅ Implement session-based tenant context storage
- ✅ Develop standard query builders with automatic tenant filtering
- ⬜ Add tenant validation to all existing API routes
- ⬜ Create proper event switching with cache invalidation

**Benefits:**
- Will resolve guest data inconsistency issues
- Prevents cross-event data leakage
- Provides centralized tenant validation

### 2. Event Context Management

**Issue:**
- Frontend lacks consistent access to current event context
- Missing validation when switching between events
- No permission checking for event access

**Required Implementation:**
- ⬜ Create robust `useCurrentEvent` hook
- ⬜ Implement event selection component with proper validation
- ✅ Add event-level permissions system
- ⬜ Ensure proper cache invalidation on event switching

### 3. Database Schema/TypeScript Alignment

**Issue:**
- TypeScript errors in `storage.ts` due to mismatches between schema and implementation
- Inconsistent handling of optional properties
- Non-standardized approach to tenant filtering

**Required Fix:**
- ⬜ Review and align all TypeScript types with database schema
- ⬜ Fix TypeScript errors related to date handling and optional properties
- ✅ Standardize tenant filtering in all database queries

## Development Plan

### Phase 1: Multi-Tenant Foundation (Priority 1)

**1. Server-Side Tenant Context (Week 1)**
- ✅ Create tenant middleware in `server/middleware/tenant-context.ts`
- ✅ Implement session-based tenant storage with validation
- ✅ Add tenant context middleware to Express application
- ✅ Create tenant-aware query builder utility
- ✅ Update storage interface for tenant awareness

**2. Client-Side Event Context (Week 1)**
- ⬜ Develop robust `useCurrentEvent` hook
- ⬜ Create event context provider component
- ⬜ Build event selection component with proper validation
- ⬜ Implement cache invalidation on event switching

**3. API Route Protection (Week 2)**
- ⬜ Add tenant validation to all existing API routes
- ✅ Standardize error handling for tenant validation
- ✅ Add tenant context to API response logging
- ⬜ Create tenant-aware route registration pattern

**4. Database Schema Alignment (Week 2)**
- ⬜ Review and fix all TypeScript errors in `storage.ts`
- ✅ Standardize tenant filtering in database queries
- ⬜ Update all Drizzle models to ensure tenant consistency
- ⬜ Create migration for any required schema changes

**5. Entity Repository Implementation (Week 2)**
- ✅ Create base TenantRepository class with standard CRUD operations
- ✅ Implement tenant-aware repository for Guests
- ✅ Implement tenant-aware repository for Ceremonies
- ✅ Implement tenant-aware repository for Accommodations
- ✅ Implement tenant-aware repository for Meals
- ✅ Implement tenant-aware repository for WhatsApp Templates
- ✅ Implement special repository for RoomAllocations
- ⬜ Update API routes to use tenant-aware repositories

### Phase 2: Feature Development (After Multi-Tenant Foundation)

**1. Email Service Integration**
- ✅ Basic email service framework created with Resend integration
- ✅ Schema updated with email configuration fields
- ⬜ Email template system for RSVP notifications
- ⬜ Email configuration in event setup UI

**2. RSVP Module**
- ⬜ Backend API routes for RSVP submission and status
- ⬜ Secure token system for guest authentication
- ⬜ Public RSVP form with guest verification
- ⬜ Guest information confirmation/editing workflow
- ⬜ Plus-one and children information collection
- ⬜ Ceremony selection
- ⬜ Travel and accommodation requirements
- ⬜ Meal selection
- ⬜ Personal message to couple