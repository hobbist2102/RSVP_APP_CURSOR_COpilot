# Indian Wedding Management Platform

![Platform Banner](https://img.shields.io/badge/Wedding%20Management-Platform-purple)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Express](https://img.shields.io/badge/Express-4.18-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

A comprehensive wedding management platform tailored for Indian weddings, providing robust event-specific management with isolated data storage and granular control over event details.

## 🎯 Project Purpose

The Indian Wedding Management Platform is designed to help wedding agencies and planners manage complex Indian wedding events efficiently. Indian weddings often involve multiple ceremonies, large guest lists, and intricate logistics spanning several days. This platform provides a centralized system for managing:

- Guest lists with RSVP tracking
- Multiple ceremony scheduling
- Accommodation and travel logistics
- WhatsApp communication
- Reporting and analytics

The platform supports both client-facing (couple) and backend (agency staff) interfaces, ensuring all stakeholders can access the information they need.

## 🏗️ System Architecture

### Multi-Tenant Foundation
- **Tenant-Based Isolation**: Every piece of data is associated with a specific event (tenant)
- **Single Database Design**: Using event_id as the tenant identifier across all tables
- **Session-Based Context**: Current event context stored in user session
- **Access Control**: Server-side validation of tenant access permissions

### Backend
- **TypeScript/Node.js**: Strong typing with Express framework
- **PostgreSQL Database**: Relational database with tenant-based isolation
- **Drizzle ORM**: Type-safe database queries and schema management
- **RESTful API**: Clean API architecture with tenant context validation

### Frontend
- **React**: Component-based UI library
- **TanStack Query (React Query)**: Data fetching with tenant-aware cache management
- **shadcn/ui & Tailwind CSS**: Component library and utility-first CSS
- **TypeScript**: Type-safe client-side code

### Security & Authentication
- **Session-based Authentication**: Secure session management
- **Event-level Data Isolation**: Multi-tenant architecture with strict data boundaries
- **Tenant Context Validation**: Every API request validates the tenant context

## 🚀 Key Features

### Multi-Event Management
- Support for multiple concurrent wedding projects
- Complete data isolation between different wedding events
- Event-specific branding and customization

### Comprehensive Guest Management
- Excel import/export functionality
- WhatsApp messaging capabilities
- RSVP tracking and reporting
- Relationship management (plus-ones, children)
- Guest categorization ("Bride's Side" or "Groom's Side")
- Enhanced child tracking with detailed information

### Ceremony & Logistics Planning
- Multi-day event scheduling
- Travel and accommodation management
- Ceremony-specific guest invitations
- Meal selection and dietary requirements tracking

### Communication System
- WhatsApp Business API integration
- Template management for communications
- Personalized guest messaging

## 🛠️ Project Setup

### Prerequisites
- Node.js (v16+)
- PostgreSQL database
- npm or yarn package manager

### Installation
1. Clone the repository
```bash
git clone https://github.com/yourusername/indian-wedding-management.git
cd indian-wedding-management
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```
DATABASE_URL=postgresql://username:password@localhost:5432/wedding_management
SESSION_SECRET=your_session_secret
```

4. Run database migrations
```bash
npm run db:push
```

5. Start development server
```bash
npm run dev
```

## 💾 Data Model

The platform uses a multi-tenant data architecture with the following key models:

- **Users**: Agency staff and system administrators
- **Events**: Wedding events with metadata
- **Guests**: Comprehensive guest information with event association
- **Ceremonies**: Individual ceremonies within a wedding event
- **Accommodations**: Lodging options for guests
- **Travel**: Transportation details for guests
- **WhatsApp Templates**: Message templates for guest communication

### Data Isolation Strategy

The platform implements a robust multi-tenant architecture using a tenant identifier pattern:

- **Event ID as Tenant Identifier**: Every data model includes an `eventId` field that serves as the tenant identifier
- **Database-Level Isolation**: All queries include tenant filtering to ensure complete data separation
- **Application-Level Enforcement**: Business logic and APIs enforce tenant boundaries
- **Session-Based Context**: Current tenant context is maintained in the user session
- **Context Switching**: Clean system for switching between events with proper cache invalidation

This approach ensures complete data separation between different wedding projects while maintaining a single database architecture, which is more cost-effective than separate databases per tenant.

## 🛣️ Development Roadmap

### Phase 1: Core Functionality ✅
- Authentication and user management
- Event creation and basic configuration
- Guest list management and import/export
- Basic dashboard and reporting

### Phase 2: Enhanced Features 🔄
- Ceremony management
- Travel and accommodation planning
- WhatsApp integration
- Advanced reporting

### Phase 3: Client-Facing Portal 📅
- Couple access portal
- Guest self-service RSVP system
- Mobile optimization
- Real-time updates

## 🔧 Technical Implementation

### Multi-Tenant Architecture
The platform employs a comprehensive multi-tenant architecture with these key components:

#### 1. Tenant Context Management
- **Session-Based Storage**: Current event ID stored in user session
- **Context Provider Component**: React context provider for event information
- **useCurrentEvent Hook**: Custom hook for accessing current event context
- **Event Selection UI**: Intuitive interface for switching between events
- **Permission Validation**: Server-side verification of event access rights

#### 2. Database Isolation Layer
- **Tenant-Filtered Queries**: All database access includes `eventId` filtering
- **Typed ORM Integration**: Drizzle ORM with proper tenant-aware schemas
- **Middleware Protection**: Express middleware to validate tenant context on all API routes
- **Defensive Query Building**: Helper functions that automatically inject tenant filtering
- **Audit Logging**: Operations logged with tenant context for troubleshooting

#### 3. Query Caching Strategy
- **Tenant-Aware Cache Keys**: Event ID included in all query keys
- **Cache Isolation**: Complete cache invalidation when switching events
- **Reduced Stale Time**: Ensuring fresh data when changing contexts
- **Custom QueryClient**: Configured for proper multi-tenant handling
- **Optimistic Updates**: Properly scoped to current tenant context

#### 4. API Route Protection
- **Mandatory Tenant Context**: All API routes require valid event context
- **Early Validation**: Tenant validation occurs before business logic processing
- **Custom Middleware**: Express middleware to attach tenant context to request object
- **Error Boundaries**: Proper error handling for tenant validation failures
- **CORS & Security**: Additional security headers for tenant isolation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2025 Indian Wedding Management Platform. All rights reserved.