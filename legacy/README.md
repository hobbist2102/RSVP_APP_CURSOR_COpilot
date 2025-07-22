# Wedding RSVP Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.18-green)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-blue)](https://tailwindcss.com/)

A luxury wedding management platform featuring comprehensive RSVP tracking, multi-tenant architecture, and Apple iOS 18-inspired design system for Indian wedding professionals.

## 🎯 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access the application
open http://localhost:5000
```

## 📋 Core Features

- **Two-Stage RSVP System** - Basic attendance + detailed logistics collection
- **Multi-Tenant Architecture** - Complete event isolation and data security
- **Comprehensive Guest Management** - Family relationships, preferences, special requirements
- **Accommodation Management** - Hotel booking, room allocation, group management
- **Transport Coordination** - Flight tracking, airport pickup, group transportation
- **Multi-Channel Communication** - Email (Gmail/Outlook/SMTP), WhatsApp, SMS integration
- **Event Setup Wizard** - 7-step guided configuration for complete event planning
- **Luxury Design System** - Apple iOS 18-inspired glassmorphism with brand consistency

## 🏗️ Architecture

**Frontend**: React + TypeScript + TanStack Query + shadcn/ui + Tailwind CSS  
**Backend**: Node.js + Express + TypeScript + Drizzle ORM  
**Database**: PostgreSQL with multi-tenant isolation  
**Authentication**: Session-based with OAuth2 integration  
**Design**: Apple iOS 18 luxury minimal aesthetic with heavy glassmorphism

## 📚 Documentation

Our comprehensive documentation is organized for different audiences:

### 📖 **[Complete Documentation →](docs/README.md)**
Central hub with navigation to all documentation areas

### 🎨 **[Design System →](docs/design-system/README.md)**
- [Colors & Themes](docs/design-system/colors.md)
- [Typography](docs/design-system/typography.md)
- Component patterns and implementation guides

### 🏛️ **[System Architecture →](docs/architecture/README.md)**
- Multi-tenant design patterns
- Database architecture
- Security and performance considerations

### 🔧 **[Development Guide →](docs/development/README.md)**
- Quick start and setup
- Project structure
- Frontend and backend patterns
- Testing strategy

### 🚀 **[API Reference →](docs/api/README.md)**
- Complete endpoint documentation
- Authentication flows
- Request/response schemas

### 💡 **[Features →](docs/features/)**
- [Event Management](docs/features/event-management.md)
- [Guest Management](docs/features/guest-management.md)

### ⚙️ **[Implementation →](docs/implementation/)**
- [Multi-tenant Architecture](docs/implementation/multi-tenant.md)
- [Authentication & Security](docs/implementation/auth-security.md)
- [Database Schema](docs/implementation/database.md)

## 🚀 Tech Stack

**Core Technologies:**
- **Frontend**: React 18, TypeScript, TanStack Query, Vite
- **Backend**: Node.js, Express, TypeScript, Drizzle ORM
- **Database**: PostgreSQL 16 with connection pooling
- **Styling**: Tailwind CSS, shadcn/ui, Radix UI primitives

**Design System:**
- Apple iOS 18-inspired luxury aesthetics
- Heavy glassmorphism with backdrop blur effects
- Brand colors: Purple (#7A51E1) and Gold (#E3C76F)
- Typography: Inter (UI) + Cormorant Garamond (decorative)

**Integrations:**
- **Email**: Gmail OAuth2, Outlook OAuth2, SMTP, SendGrid
- **WhatsApp**: Business API and Web.js
- **Authentication**: Passport.js with session storage
- **Animations**: GSAP, Framer Motion

## 🔐 Security & Compliance

- **Multi-tenant data isolation** with event-scoped access control
- **HMAC-signed RSVP tokens** with expiration and validation
- **OAuth2 integration** with secure token management and refresh
- **Session-based authentication** with PostgreSQL session store
- **Input validation** using Zod schemas throughout
- **CSRF protection** and comprehensive security headers

## 📊 Project Status

✅ **Complete Implementation**: Design system, multi-tenant architecture, RSVP system  
✅ **Production Ready**: Authentication, database schema, API endpoints  
✅ **Luxury UI**: Apple iOS 18 glassmorphism design system  
✅ **Comprehensive Documentation**: Organized professional documentation structure  

## 🤝 Contributing

This project follows enterprise-grade development practices:

1. **Design System First** - All UI changes use design tokens from `/client/src/design-system/`
2. **Type Safety** - TypeScript throughout with Drizzle ORM schemas
3. **Multi-tenant Awareness** - All database operations include event context
4. **Documentation Updates** - Update relevant docs for architectural changes

## 📄 License

Copyright © 2025 Wedding RSVP Platform. All rights reserved.

---

**Documentation**: [docs/README.md](docs/README.md) | **Architecture**: [docs/architecture/README.md](docs/architecture/README.md) | **API**: [docs/api/README.md](docs/api/README.md)