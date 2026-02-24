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

### Integration Service (Standalone)
- **Location**: `integration-service/` — completely separate Node.js project
- **Purpose**: Central event-driven communication layer between company systems
- **Port**: 3001 (console output workflow)
- **Auth**: API key via `X-API-Key` header (env: `INTEGRATION_API_KEY`)
- **Database Tables**: `integration_events`, `integration_event_logs` (same PostgreSQL, own tables)
- **Key Rule**: Never directly modifies other systems' databases — all outbound actions via HTTP API calls (simulated via logs for now)
- **Supported Events**: PART_RECEIVED, PART_USED, ORDER_CREATED (active handlers); PURCHASE_CREATED, CONTAINER_ARRIVED (logged, no handler yet)
- **Connected to Main App**: Order creation sends ORDER_CREATED events, part usage recording sends PART_USED events — both via `server/integration-client.ts`
- **Admin Monitor**: `/admin/integration` page shows events, stats, and service health
- **Part Usage Tracking**: Factory monitors can record part usage per machine in `/factory/map` (Parts tab), stored in `part_usage_logs` table
- **Features**: Idempotency check, in-memory event queue with retry (max 3, exponential backoff), audit logging
- **Endpoints**:
  - `POST /events` — receive events from external systems
  - `GET /events` — list events with filters
  - `GET /events/:id` — event details with processing logs
  - `GET /stats` — event statistics
  - `GET /health` — health check

### Project Structure
```
├── client/               # React frontend
│   └── src/
│       ├── components/       # UI components including shadcn/ui
│       ├── hooks/            # Custom React hooks for data fetching
│       ├── pages/            # Route components (admin/, sales/)
│       └── lib/              # Utilities and query client
├── server/               # Express backend
│   ├── routes.ts             # API route handlers
│   ├── storage.ts            # Database operations
│   └── replit_integrations/  # Replit Auth setup
├── shared/               # Shared code between frontend/backend
│   ├── schema.ts             # Drizzle database schema
│   └── routes.ts             # API endpoint definitions with Zod
├── integration-service/  # Standalone Integration Service
│   ├── src/
│   │   ├── index.ts          # Express server entry point
│   │   ├── db.ts             # PostgreSQL connection
│   │   ├── schema.ts         # Integration-specific tables
│   │   ├── storage.ts        # Event CRUD operations
│   │   ├── middleware/       # API key auth, request logger
│   │   ├── routes/           # Event endpoints
│   │   ├── handlers/         # PART_RECEIVED, PART_USED, ORDER_CREATED handlers
│   │   └── queue/            # In-memory event queue with retry
│   ├── package.json
│   ├── tsconfig.json
│   ├── drizzle.config.ts
│   └── Dockerfile
└── migrations/           # Database migrations
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

### Workflows
- **Start application**: `npm run dev` — main admin app on port 5000
- **Integration Service**: `cd integration-service && npx tsx src/index.ts` — standalone integration service on port 3001
