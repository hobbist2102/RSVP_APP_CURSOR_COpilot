# replit.md

## Overview

The Indian Wedding RSVP Platform is a comprehensive wedding management system designed specifically for Indian weddings, which often involve multiple ceremonies, large guest lists, and complex logistics. The platform provides event-specific management with isolated data storage, dynamic RSVP tracking, and integrated communication tools for both wedding agencies/planners and couples.

## System Architecture

### Backend Architecture
- **Node.js/TypeScript**: Express.js framework with strong typing for robust server-side logic
- **PostgreSQL Database**: Relational database with tenant-based isolation using Drizzle ORM
- **Session-based Authentication**: Secure session management with role-based access control
- **RESTful API**: Clean API architecture for frontend communication
- **Multi-tenant Design**: Complete data isolation between different wedding events

### Frontend Architecture
- **React 18**: Component-based UI library with modern hooks
- **TanStack Query (React Query)**: Sophisticated data fetching, caching, and synchronization
- **shadcn/ui + Tailwind CSS**: Modern component library with utility-first styling
- **TypeScript**: Type-safe client-side development
- **Multi-step Wizard Forms**: Intuitive user experience for complex data entry

### Database Design
- **Drizzle ORM**: Type-safe database queries and schema management
- **Event-level Isolation**: Multi-tenant architecture ensuring strict data boundaries
- **Comprehensive Schema**: Support for guests, ceremonies, accommodations, travel, meals, and communication

## Key Components

### 1. Multi-Event Management
- Support for multiple concurrent wedding projects
- Complete data isolation between events
- Event context switching with proper cache invalidation
- Multi-step event creation wizard

### 2. Two-Stage RSVP System
- **Stage 1**: Basic attendance confirmation with ceremony selection
- **Stage 2**: Detailed logistics (accommodation, travel, meal preferences)
- Secure token-based RSVP links with HMAC verification
- Automated follow-up communications

### 3. Guest Management
- Comprehensive guest profiles with relationship tracking
- Plus-one support with detailed information capture
- Dietary restrictions and special requirements handling
- Family grouping and connection tracking

### 4. Accommodation System
- Hotel management with room type allocation
- Automated room assignment based on guest preferences
- Support for provided vs. self-managed accommodation
- Special arrangement handling with manual review flags

### 5. Communication Hub
- **Email Integration**: Gmail OAuth2, Outlook OAuth2, SMTP, SendGrid support
- **WhatsApp Integration**: Business API and Web.js implementations
- Template-based messaging system
- Automated follow-up workflows

### 6. Transport Management
- Automated transport group generation
- Time-slot based passenger allocation
- Family and connection-aware grouping
- Multi-modal transport support (air, train, bus, car)

## Data Flow

### RSVP Process
1. Event admin generates secure RSVP tokens for guests
2. Guests access RSVP form via unique links
3. Stage 1: Basic attendance and ceremony selection
4. Stage 2: Detailed logistics for confirmed guests
5. Automated room assignment for provided accommodation
6. Follow-up communications based on RSVP status

### Authentication Flow
1. Session-based authentication with PostgreSQL session store
2. Role-based access control (admin, staff, couple)
3. Event context management in session
4. Secure route protection with middleware

### Communication Workflow
1. Template selection based on communication type
2. Guest filtering and targeting
3. Multi-channel delivery (email + WhatsApp)
4. Delivery tracking and status monitoring

## External Dependencies

### Email Providers
- **Gmail**: OAuth2 integration with SMTP fallback
- **Outlook**: OAuth2 integration via Microsoft Graph API
- **SendGrid**: API-based email delivery
- **SMTP**: Generic SMTP server support

### WhatsApp Integration
- **WhatsApp Business API**: Official API for template messages
- **WhatsApp Web.js**: Unofficial library for direct messaging

### Third-party Services
- **Google APIs**: OAuth2 and Gmail integration
- **Microsoft Graph**: Outlook integration
- **Anthropic Claude**: AI-powered assistance features

### UI Libraries
- **Radix UI**: Unstyled, accessible components
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library
- **GSAP**: Animation library

## Deployment Strategy

### Replit Configuration
- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite for frontend, esbuild for backend
- **Development**: Hot reload with Vite middleware integration
- **Production**: Static asset serving with Express fallback

### Database Management
- **Drizzle Kit**: Schema migrations and database pushing
- **Connection Pooling**: Optimized PostgreSQL connections
- **Session Storage**: PostgreSQL-based session management

### Security Considerations
- HMAC-signed RSVP tokens with expiration
- Environment variable management for sensitive data
- CORS configuration for cross-origin requests
- Input validation with Zod schemas

## Changelog

Changelog:
- June 24, 2025. Initial setup
- July 2, 2025. Complete rewrite of Hotel & Accommodation step (Step 4) with full functionality:
  - Added working "Add Hotel" and "Add Room Type" buttons
  - Implemented comprehensive hotel management with CRUD operations
  - Added form validation, edit/delete capabilities, and toast notifications
  - Integrated proper accommodation modes (Block Booking, Direct Booking)
  - Added auto-allocation and guest preference settings
  - Connected to accommodation management across the application

## User Preferences

Preferred communication style: Simple, everyday language.