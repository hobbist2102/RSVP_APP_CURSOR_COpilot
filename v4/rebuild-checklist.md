# RSVP Platform v4 - Clean Rebuild Checklist
**Date**: January 2025  
**Architecture**: Supabase + Next.js 14 + Token-based API  
**Status**: Clean Build from Ground Up

---

## 🎯 Architecture Overview

**Technology Stack:**
- **Framework**: Next.js 14 App Router  
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email/OTP based)
- **Real-time**: Supabase Realtime subscriptions
- **Frontend**: React 18 + TypeScript + TanStack Query + Zustand
- **Styling**: Tailwind CSS + shadcn/ui (preserve Apple iOS 18 design)
- **Deployment**: Vercel (serverless functions)

---

## 📋 PHASE 1: FOUNDATION & AUTHENTICATION (Week 1-2)
**Priority: CRITICAL**

### 1.1 Supabase Project Setup
- [ ] **1.1.1** Create new Supabase project
- [ ] **1.1.2** Configure authentication settings (email/OTP)
- [ ] **1.1.3** Set up database connection
- [ ] **1.1.4** Configure Row Level Security (RLS) policies
- [ ] **1.1.5** Set up Supabase Edge Functions
- [ ] **1.1.6** Configure Supabase Storage for file uploads

### 1.2 Database Schema Migration
- [x] **1.2.1** Migrate core user tables with RLS policies ✅
- [x] **1.2.2** Migrate wedding events table with multi-tenant isolation ✅
- [x] **1.2.3** Migrate guest management tables ✅
- [x] **1.2.4** Migrate ceremony and RSVP tables ✅
- [x] **1.2.5** Migrate communication and template tables ✅
- [x] **1.2.6** Migrate accommodation and transport tables ✅

### 1.3 Next.js 14 Project Structure
- [x] **1.3.1** Initialize Next.js 14 with App Router ✅
- [x] **1.3.2** Install core dependencies (Supabase, TanStack Query, Zustand) ✅
- [x] **1.3.3** Create folder structure per architecture plan ✅
- [x] **1.3.4** Configure TypeScript with strict settings ✅
- [ ] **1.3.5** Set up ESLint and Prettier configurations
- [ ] **1.3.6** Configure Tailwind CSS with design system tokens

### 1.4 Supabase Integration
- [x] **1.4.1** Set up Supabase client configuration ✅
- [x] **1.4.2** Create server-side Supabase client ✅
- [x] **1.4.3** Configure Supabase SSR helper ✅
- [x] **1.4.4** Set up environment variables ✅
- [x] **1.4.5** Create database type definitions ✅
- [ ] **1.4.6** Test Supabase connection and auth

### 1.5 JWT Token Validation Middleware
- [x] **1.5.1** Create Next.js middleware for JWT validation ✅
- [x] **1.5.2** Implement token extraction and verification ✅
- [x] **1.5.3** Add role-based access control ✅
- [x] **1.5.4** Configure protected route patterns ✅
- [x] **1.5.5** Handle token refresh logic ✅
- [x] **1.5.6** Add error handling for invalid tokens ✅

### 1.6 User Management & RLS Policies
- [ ] **1.6.1** Create user registration system
- [ ] **1.6.2** Implement role assignment (admin, staff, couple)
- [ ] **1.6.3** Set up RLS policies for user data
- [ ] **1.6.4** Create user profile management
- [ ] **1.6.5** Implement admin vs user access patterns
- [ ] **1.6.6** Test multi-tenant data isolation

### 1.7 Core Authentication Flows
- [ ] **1.7.1** Build email/OTP login system
- [ ] **1.7.2** Create registration flow
- [ ] **1.7.3** Implement logout functionality
- [ ] **1.7.4** Add password reset via email
- [ ] **1.7.5** Create profile management UI
- [ ] **1.7.6** Test complete auth flow end-to-end

### 1.8 Admin Onboarding UI Screen
- [ ] **1.8.1** Configure email providers (SendGrid, Brevo, Gmail OAuth2, Outlook OAuth2)
- [ ] **1.8.2** Connect WhatsApp Business API via Facebook/Meta App
- [ ] **1.8.3** Add admin profile details and contact information
- [ ] **1.8.4** Upload logo and branding assets via Supabase Storage
- [ ] **1.8.5** Configure per-event settings (domain, email reply-to, RSVP preferences)
- [ ] **1.8.6** Test communication provider connections

---

## 📋 PHASE 2: CORE API FOUNDATION (Week 3-4)
**Priority: CRITICAL**

### 2.1 Authentication API Routes
- [ ] **2.1.1** `/api/auth/login` - Email/OTP login
- [ ] **2.1.2** `/api/auth/verify` - OTP verification
- [ ] **2.1.3** `/api/auth/logout` - Token invalidation
- [ ] **2.1.4** `/api/auth/profile` - Get/update user profile
- [ ] **2.1.5** `/api/auth/refresh` - Token refresh
- [ ] **2.1.6** Add comprehensive error handling

### 2.2 Event Management API Routes
- [ ] **2.2.1** `/api/events` - GET/POST for event CRUD
- [ ] **2.2.2** `/api/events/[id]` - GET/PUT/DELETE individual events
- [ ] **2.2.3** `/api/events/[id]/guests` - Event-specific guest management
- [ ] **2.2.4** `/api/events/[id]/settings` - Event configuration
- [ ] **2.2.5** `/api/events/[id]/stats` - Event statistics
- [ ] **2.2.6** Implement RLS enforcement for all routes

### 2.3 Guest Management API Routes
- [ ] **2.3.1** `/api/guests` - Full CRUD operations
- [ ] **2.3.2** `/api/guests/import` - CSV/Excel import
- [ ] **2.3.3** `/api/guests/export` - CSV/Excel export
- [ ] **2.3.4** `/api/guests/[id]/family` - Family relationships
- [ ] **2.3.5** `/api/guests/search` - Advanced search and filtering
- [ ] **2.3.6** Add input validation with Zod schemas

### 2.4 RSVP Management API Routes
- [ ] **2.4.1** `/api/rsvp/[token]` - Token-based RSVP access
- [ ] **2.4.2** `/api/rsvp/status` - RSVP status tracking
- [ ] **2.4.3** `/api/rsvp/reminders` - Send reminder notifications
- [ ] **2.4.4** `/api/rsvp/analytics` - RSVP analytics and metrics
- [ ] **2.4.5** Implement real-time RSVP updates
- [ ] **2.4.6** Add RSVP token generation and validation

### 2.5 JWT Token Validation for All Routes
- [ ] **2.5.1** Apply middleware to all protected API routes
- [ ] **2.5.2** Implement consistent error responses
- [ ] **2.5.3** Add rate limiting per user
- [ ] **2.5.4** Create API response type definitions
- [ ] **2.5.5** Test token validation across all endpoints
- [ ] **2.5.6** Document API security patterns

### 2.6 Error Handling & Validation
- [ ] **2.6.1** Create standardized error response format
- [ ] **2.6.2** Implement comprehensive Zod validation schemas
- [ ] **2.6.3** Add request/response logging
- [ ] **2.6.4** Create error boundary components
- [ ] **2.6.5** Handle Supabase-specific errors
- [ ] **2.6.6** Add API documentation with OpenAPI

---

## 📋 PHASE 3: RSVP SYSTEM MIGRATION (Week 5-6)
**Priority: HIGH**

### 3.1 RSVP Form Components
- [ ] **3.1.1** Migrate RSVP Stage 1 form (basic attendance)
- [ ] **3.1.2** Migrate RSVP Stage 2 form (detailed logistics)
- [ ] **3.1.3** Implement ceremony selection with "Select All"
- [ ] **3.1.4** Add plus-one management interface
- [ ] **3.1.5** Create dietary restrictions and preferences forms
- [ ] **3.1.6** Preserve Apple iOS 18 design aesthetic

### 3.2 Token-based RSVP Links
- [ ] **3.2.1** Implement secure RSVP token generation
- [ ] **3.2.2** Create public RSVP page `/rsvp/[token]`
- [ ] **3.2.3** Add token validation and expiration
- [ ] **3.2.4** Handle invalid/expired token scenarios
- [ ] **3.2.5** Create RSVP link generation for admins
- [ ] **3.2.6** Test RSVP access without authentication

### 3.3 Mobile-Optimized RSVP Flows
- [ ] **3.3.1** Ensure mobile-first responsive design
- [ ] **3.3.2** Optimize touch interactions and form controls
- [ ] **3.3.3** Add progress indicators and step navigation
- [ ] **3.3.4** Implement auto-save functionality
- [ ] **3.3.5** Add offline support for form completion
- [ ] **3.3.6** Test across multiple device sizes

### 3.4 Real-time RSVP Updates
- [ ] **3.4.1** Implement Supabase Realtime subscriptions
- [ ] **3.4.2** Create live RSVP status dashboard
- [ ] **3.4.3** Add real-time guest count updates
- [ ] **3.4.4** Implement live ceremony attendance tracking
- [ ] **3.4.5** Create notification system for new RSVPs
- [ ] **3.4.6** Test real-time performance with multiple users

### 3.5 Select All Ceremony Functionality
- [ ] **3.5.1** Migrate bulk ceremony selection logic
- [ ] **3.5.2** Add ceremony-specific attendance options
- [ ] **3.5.3** Implement partial attendance scenarios
- [ ] **3.5.4** Create ceremony details and timing display
- [ ] **3.5.5** Add ceremony-specific meal preferences
- [ ] **3.5.6** Test complex ceremony selection patterns

### 3.6 End-to-End RSVP Testing
- [ ] **3.6.1** Test complete RSVP flow from invitation to completion
- [ ] **3.6.2** Verify data persistence and real-time updates
- [ ] **3.6.3** Test plus-one RSVP scenarios
- [ ] **3.6.4** Validate ceremony selection edge cases
- [ ] **3.6.5** Performance test with concurrent RSVP submissions
- [ ] **3.6.6** Create automated test suite for RSVP flows

---

## 📋 PHASE 4: GUEST MANAGEMENT SYSTEM (Week 7-8)
**Priority: HIGH**

### 4.1 Guest List UI Migration
- [ ] **4.1.1** Create modern guest list table with sorting/filtering
- [ ] **4.1.2** Implement advanced search capabilities
- [ ] **4.1.3** Add bulk selection and operations
- [ ] **4.1.4** Create guest profile detail views
- [ ] **4.1.5** Implement guest status indicators
- [ ] **4.1.6** Add guest communication history timeline

### 4.2 CSV/Excel Import/Export
- [ ] **4.2.1** Build file upload interface with drag-and-drop
- [ ] **4.2.2** Implement CSV parsing and validation
- [ ] **4.2.3** Add Excel file support (.xlsx)
- [ ] **4.2.4** Create import preview and error handling
- [ ] **4.2.5** Implement guest data export functionality
- [ ] **4.2.6** Add template download for guest imports

### 4.3 Advanced Search and Filtering
- [ ] **4.3.1** Create multi-field search interface
- [ ] **4.3.2** Add filters for RSVP status, side, relationship
- [ ] **4.3.3** Implement real-time search with debouncing
- [ ] **4.3.4** Add saved search/filter presets
- [ ] **4.3.5** Create guest analytics and insights
- [ ] **4.3.6** Add guest segmentation capabilities

### 4.4 Plus-one Management
- [ ] **4.4.1** Create plus-one invitation workflows
- [ ] **4.4.2** Implement plus-one profile management
- [ ] **4.4.3** Add plus-one RSVP tracking
- [ ] **4.4.4** Create plus-one approval processes
- [ ] **4.4.5** Handle plus-one dietary and accommodation needs
- [ ] **4.4.6** Add plus-one communication templates

### 4.5 Family Grouping and Relationships
- [ ] **4.5.1** Create family tree visualization
- [ ] **4.5.2** Implement relationship mapping interface
- [ ] **4.5.3** Add family group management
- [ ] **4.5.4** Create household-based invitations
- [ ] **4.5.5** Handle family RSVP coordination
- [ ] **4.5.6** Add family seating and accommodation grouping

### 4.6 Communication History Tracking
- [ ] **4.6.1** Create communication timeline for each guest
- [ ] **4.6.2** Track email opens and link clicks
- [ ] **4.6.3** Log WhatsApp message delivery status
- [ ] **4.6.4** Add communication preferences management
- [ ] **4.6.5** Create follow-up reminder systems
- [ ] **4.6.6** Generate communication analytics reports

---

## 📋 REMAINING PHASES (Week 9-16)

### Phase 5: Communication System (Week 9-10)
- [ ] Email template migration and Edge Functions
- [ ] Multi-provider email integration
- [ ] WhatsApp Business API integration
- [ ] Template editor with live preview
- [ ] Automated workflow triggers

### Phase 6: Event & Admin Management (Week 11-12)  
- [ ] Event setup wizard migration
- [ ] Admin dashboard with monitoring
- [ ] User management interfaces
- [ ] Activity tracking and audit logs

### Phase 7: Accommodation & Transport (Week 13-14)
- [ ] Hotel and room management
- [ ] Guest allocation algorithms
- [ ] Transport coordination interfaces
- [ ] Flight coordination system

### Phase 8: Advanced Features (Week 15-16)
- [ ] PWA capabilities and offline support
- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] API documentation with Swagger

---

## 🔧 Technology Requirements

**Latest Stable Versions:**
- React 18+ ✅
- Next.js 14+ ✅
- Supabase SDK v2+ ✅
- Drizzle ORM latest ✅
- TypeScript 5+ ✅
- Tailwind CSS 3+ ✅

**WhatsApp Integration Resources:**
- [Meta WhatsApp Cloud Setup Guide](https://developers.facebook.com/docs/whatsapp/cloud-api)
- [WhatsApp Business Onboarding](https://www.twilio.com/docs/whatsapp/tutorial/connect-whatsapp-business)
- [QR Code for WhatsApp Web](https://github.com/pedroslopez/whatsapp-web.js)
- [Node.js Business API SDK](https://www.npmjs.com/package/whatsapp-business-api)

---

## 📊 Progress Tracking

**Phase 1 Progress**: 13/48 tasks completed (27% complete)
**Overall Progress**: 13/64+ total tasks completed
**Current Focus**: Supabase setup and database migration
**Next Milestone**: Complete Phase 1 foundation

---

## ✅ Completion Standards

Each task must meet:
- ✅ **Functional parity** with existing v2 features
- ✅ **Security compliance** with RLS and JWT validation  
- ✅ **Performance standards** (<200ms API, <3s page load)
- ✅ **Mobile optimization** (100% responsive)
- ✅ **Test coverage** (unit + integration tests)
- ✅ **Documentation** (API docs + inline comments)

**Status**: Phase 1 in progress - Foundation setup and authentication