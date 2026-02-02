# TPL Supply Chain Management System

## Overview

This is a bilingual Arabic/English supply chain management application for TPL (شركة صناعة البراغي واللوالب والمسامير) - a screws, bolts, and nails manufacturing company. The system provides role-based dashboards for administrators and sales points to manage products, orders, and inventory.

The application follows a monorepo structure with a React frontend and Express backend, using PostgreSQL for data persistence and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter (lightweight router)
- **State Management**: TanStack React Query for server state
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom RTL (right-to-left) support for Arabic
- **Animations**: Framer Motion for page transitions
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Build Tool**: Vite for development, esbuild for production bundling
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe validation
- **Authentication**: Replit Auth (OpenID Connect) with Passport.js
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Migrations**: Drizzle Kit for schema migrations (`drizzle-kit push`)
- **Key Tables**: products, orders, orderItems, users, sessions, userRoles

### Role-Based Access Control
- Two user roles: `admin` and `sales_point`
- Admins manage products and view all orders
- Sales points create orders and view their own orders
- Role assignment happens during onboarding after first authentication

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components including shadcn/ui
│       ├── hooks/        # Custom React hooks for data fetching
│       ├── pages/        # Route components (admin/, sales/)
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database operations
│   └── replit_integrations/  # Replit Auth setup
├── shared/           # Shared code between frontend/backend
│   ├── schema.ts         # Drizzle database schema
│   └── routes.ts         # API endpoint definitions with Zod
└── migrations/       # Database migrations
```

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OpenID Connect authentication via Replit
- **Required Environment Variables**: `DATABASE_URL`, `SESSION_SECRET`, `REPL_ID`, `ISSUER_URL`

### Key NPM Packages
- `@tanstack/react-query`: Server state management
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `express-session` / `connect-pg-simple`: Session management
- `passport` / `openid-client`: Authentication
- `zod` / `drizzle-zod`: Schema validation
- `framer-motion`: Animations
- `recharts`: Dashboard charts