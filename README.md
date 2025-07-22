# Wedding RSVP Platform V4

A complete, production-ready wedding RSVP management platform built with Next.js 15, TypeScript, and modern web technologies.

## 🚀 Features

- **Complete Event Management**: 7-step event setup wizard
- **Guest Management**: Import/export, CRUD operations, bulk actions
- **Two-Stage RSVP System**: Comprehensive guest response handling
- **Multi-Provider Communication**: Email (Resend, Gmail OAuth2, SMTP) and WhatsApp
- **Accommodation Management**: Hotel booking and room assignment
- **Transportation System**: Route planning and guest assignment
- **Analytics Dashboard**: Comprehensive reporting with charts
- **Security Features**: Rate limiting, audit logging, GDPR compliance
- **Mobile-First Design**: Responsive, Apple iOS 18 inspired UI

## 🏗️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js with JWT
- **UI**: ShadCN UI components with Tailwind CSS
- **Type Safety**: TypeScript with Zod validation
- **Charts**: Recharts for analytics
- **Email**: Resend, Gmail OAuth2, Nodemailer
- **Styling**: Tailwind CSS with custom design system

## 📁 Project Structure

```
v4/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── dashboard/      # Admin dashboard
│   │   ├── api/            # API routes
│   │   └── rsvp/           # Guest RSVP pages
│   ├── components/         # React components
│   │   └── ui/            # ShadCN UI components
│   ├── lib/               # Core utilities
│   │   ├── db/            # Database schema and connection
│   │   ├── services/      # Business logic services
│   │   ├── security/      # Security utilities
│   │   └── validations/   # Zod schemas
│   └── hooks/             # Custom React hooks
├── package.json           # Dependencies and scripts
├── tailwind.config.ts     # Tailwind configuration
├── next.config.ts         # Next.js configuration
├── vercel.json           # Vercel deployment settings
└── DEPLOYMENT.md         # Deployment guide
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy `.env.local.example` to `.env.local` and configure:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_URL`: Your app URL
- `NEXTAUTH_SECRET`: Random secret for JWT

### 3. Database Setup

```bash
# Generate database migration
npm run db:generate

# Push schema to database
npm run db:push
```

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Build for Production

```bash
npm run build
npm start
```

## 📋 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run type-check` - Type checking
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## 🚢 Deployment

### Vercel (Recommended)

1. Ensure you're in the `v4` directory
2. Install Vercel CLI: `npm install -g vercel`
3. Deploy: `vercel --prod`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Other Platforms

The application can be deployed to any platform supporting Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔧 Configuration

### Database

Configure your PostgreSQL database connection in `.env.local`:

```
DATABASE_URL="postgresql://username:password@host:port/database"
```

### Authentication

NextAuth.js is configured for:
- Credentials (email/password)
- OAuth providers (Google, Microsoft)

### Email Providers

Supports multiple email providers with fallback:
- Resend (primary)
- Gmail OAuth2
- Generic SMTP

## 📊 Features Overview

### Event Management
- 7-step setup wizard
- Multiple ceremony support
- Venue and timing configuration
- Guest categorization

### Guest Management
- Excel/CSV import with validation
- Bulk operations
- Advanced filtering and search
- Export capabilities

### RSVP System
- Secure token-based access
- Two-stage response process
- Automatic follow-ups
- Real-time analytics

### Communication
- Multi-provider email system
- WhatsApp integration
- Template editor
- Delivery tracking

### Reporting
- Real-time analytics dashboard
- RSVP trend analysis
- Communication metrics
- Exportable reports

## 🔒 Security

- Rate limiting on all API endpoints
- Comprehensive audit logging
- Input sanitization and validation
- CSRF protection
- Secure session management

## 📱 Mobile Support

- Progressive Web App (PWA) ready
- Mobile-first responsive design
- Touch-optimized interface
- Offline capabilities (planned)

## 🤝 Contributing

This is a production-ready application. For modifications:

1. Follow the existing code structure
2. Maintain TypeScript typing
3. Add tests for new features
4. Update documentation

## 📄 License

Private - All rights reserved

## 📞 Support

For deployment or configuration issues:
1. Check the build logs
2. Verify environment variables
3. Ensure database connectivity
4. Review the deployment guide

---

**Note**: This is a complete, self-contained application in the `v4` directory. All dependencies and configurations are included.