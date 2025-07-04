# Indian Wedding RSVP Platform

A sophisticated wedding management system designed specifically for Indian weddings, featuring multi-ceremony support, complex guest logistics, and integrated communication tools.

## System Architecture

### Tech Stack
- **Frontend**: React 18 with TypeScript, TanStack Query, shadcn/ui + Tailwind CSS
- **Backend**: Node.js/Express with TypeScript, session-based authentication
- **Database**: PostgreSQL with Drizzle ORM, multi-tenant isolation
- **Design System**: Custom token-based system with flat design enforcement
- **Communication**: Email (Gmail, Outlook, SMTP, SendGrid) + WhatsApp integration

### Project Structure

```
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── auth/          # Authentication components
│   │   │   ├── dashboard/     # Dashboard widgets
│   │   │   ├── email/         # Email template components
│   │   │   ├── event/         # Event management components
│   │   │   ├── guest/         # Guest management components
│   │   │   ├── layout/        # Layout components (sidebar, header)
│   │   │   ├── rsvp/          # RSVP form components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   └── wizard/        # Event setup wizard components
│   │   ├── design-system/     # Centralized design system
│   │   │   ├── tokens.ts      # Design tokens and color system
│   │   │   ├── components.ts  # Component style utilities
│   │   │   ├── comprehensive-audit-system.ts  # UI validation
│   │   │   └── index.ts       # Unified exports
│   │   ├── hooks/             # Custom React hooks
│   │   ├── lib/               # Utilities and configurations
│   │   ├── pages/             # Page components
│   │   └── styles/            # Global styles and CSS
│   └── public/                # Static assets
├── server/                     # Backend Express application
│   ├── routes/                # API route handlers
│   ├── middleware/            # Authentication and validation
│   ├── db.ts                  # Database connection
│   └── index.ts               # Server entry point
├── shared/                     # Shared types and schemas
│   └── schema.ts              # Drizzle database schema
├── docs/                      # Essential documentation
├── scripts/                   # Database migration scripts
└── attached_assets/           # User-provided assets
```

## Core Features

### Multi-Event Management
- Complete data isolation between wedding events
- Event context switching with proper cache invalidation
- Multi-step event creation wizard
- Role-based access control (admin, staff, couple)

### Two-Stage RSVP System
- **Stage 1**: Basic attendance confirmation with ceremony selection
- **Stage 2**: Detailed logistics (accommodation, travel, meal preferences)
- Secure HMAC-signed RSVP tokens with expiration
- Automated follow-up communications

### Guest Management
- Comprehensive guest profiles with relationship tracking
- Plus-one support with detailed information capture
- Dietary restrictions and special requirements
- Family grouping and connection tracking

### Accommodation System
- Hotel management with room type allocation
- Automated room assignment based on preferences
- Block booking vs. direct booking support
- Special arrangement handling

### Transport Coordination
- Automated transport group generation
- Time-slot based passenger allocation
- Family-aware grouping algorithms
- Multi-modal transport support

### Communication Hub
- **Email**: Gmail OAuth2, Outlook OAuth2, SMTP, SendGrid
- **WhatsApp**: Business API and Web.js implementations
- Template-based messaging system
- Automated follow-up workflows

## Design System

### Architecture
The platform uses a comprehensive design system enforcing luxury iOS 18 flat design:

- **Design Tokens** (`tokens.ts`): Centralized color, typography, and spacing definitions
- **Component Utilities** (`components.ts`): Reusable style generation functions
- **Global CSS Enforcement** (`index.css`): Zero-tolerance violation fixes via !important rules
- **Audit System** (`comprehensive-audit-system.ts`): Real-time UI compliance validation

### Key Principles
- **Flat Design**: Zero border-radius, no shadows, clean minimal aesthetic
- **Typography**: Inter for UI, Cormorant Garamond for decorative elements
- **Colors**: OKLCH color space with purple (#7A51E1) and gold (#E3C76F) accents
- **Spacing**: 4px grid system throughout
- **Zero Browser Defaults**: Complete CSS coverage eliminating fallbacks

## Development

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Database operations
npm run db:push    # Push schema changes
npm run db:studio  # Open Drizzle Studio
```

### Environment Variables
```
DATABASE_URL=postgresql://...
SESSION_SECRET=your_session_secret
# Email provider credentials (optional)
# WhatsApp integration keys (optional)
```

### Database Management
- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM
- **Migrations**: Use `npm run db:push` for schema changes
- **Multi-tenant**: Complete isolation via eventId foreign keys
- **Session Storage**: PostgreSQL-based session management

## Deployment

### Replit Configuration
- **Environment**: Node.js 20 with PostgreSQL 16
- **Build Process**: Vite for frontend, esbuild for backend
- **Production**: Static asset serving with Express fallback

### Security Features
- HMAC-signed RSVP tokens with expiration
- Session-based authentication with role controls
- Input validation with Zod schemas
- CORS configuration for cross-origin requests

## API Architecture

### Authentication Flow
1. Session-based authentication with PostgreSQL session store
2. Role-based access control (admin, staff, couple)
3. Event context management in session
4. Secure route protection with middleware

### Multi-tenant Isolation
- Complete data separation by eventId
- Context switching with cache invalidation
- Secure event access validation
- Admin override capabilities

### Communication Workflow
1. Template selection based on communication type
2. Guest filtering and targeting
3. Multi-channel delivery (email + WhatsApp)
4. Delivery tracking and status monitoring

## Integration Points

### External Services
- **Google APIs**: OAuth2 and Gmail integration
- **Microsoft Graph**: Outlook integration
- **Anthropic Claude**: AI-powered assistance features
- **WhatsApp Business API**: Official template messaging
- **SendGrid**: Reliable email delivery

### UI Libraries
- **Radix UI**: Unstyled, accessible component primitives
- **Tailwind CSS**: Utility-first styling with design system integration
- **GSAP**: Animation library for enhanced UX
- **TanStack Query**: Sophisticated data fetching and caching

## Contributing

1. Follow the design system guidelines in `/client/src/design-system/`
2. Use TypeScript throughout with proper type definitions
3. Maintain multi-tenant isolation in all database operations
4. Test thoroughly across different wedding event contexts
5. Update documentation when making architectural changes

## License

Proprietary - Internal wedding management platform