# Business Onboarding Flow Application

## Overview

A modern, multi-step business onboarding web application inspired by Zoho Bookings. The application guides users through a 4-step process to set up their business profile, collect industry preferences, configure availability schedules, and customize system labels. Built as a full-stack TypeScript application with a clean B2B SaaS aesthetic.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server, configured for fast HMR and optimized production builds
- Wouter for lightweight client-side routing (multi-page navigation between onboarding steps and success page)

**UI Component System**
- shadcn/ui component library (New York style variant) providing pre-built, accessible Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens defined in CSS variables
- Design follows Zoho Bookings-inspired aesthetic with clean forms, progressive disclosure, and guided workflows
- Responsive layout: Two-column desktop (form area + sidebar preview), single-column mobile stack

**State Management**
- React Context API (`OnboardingContext`) manages multi-step form state across all 4 onboarding steps
- TanStack Query (React Query) handles server state, API requests, and caching with configurable retry/refetch behavior
- Form state persists as users navigate between steps (back/next navigation)

**Form Components**
- 4 distinct step components: Business Details, Industry/Needs Selection, Availability Configuration, Custom Labels
- ChipSelector for multi-select UI patterns (industries, business needs)
- ProgressStepper shows current step with visual indicators (completed checkmarks, active highlighting)
- SidebarPreview provides contextual preview based on current step

### Backend Architecture

**Server Framework**
- Express.js server with TypeScript for RESTful API endpoints
- Custom middleware for request logging, JSON body parsing, and error handling
- Vite middleware integration in development for seamless full-stack development experience

**API Design**
- RESTful endpoints for onboarding data:
  - `POST /api/onboarding` - Create new onboarding record with validation
  - `GET /api/onboarding/:id` - Retrieve specific onboarding
  - `GET /api/onboardings` - List all onboardings
- Request validation using Zod schemas with detailed error messages via zod-validation-error
- Consistent JSON response format with appropriate HTTP status codes

**Data Layer**
- In-memory storage implementation (`MemStorage`) for development/testing
- Interface-based design (`IStorage`) allows swapping to database-backed storage without API changes
- UUID generation for record identifiers

### Data Storage

**Schema Definition**
- Drizzle ORM for type-safe database schema definitions
- PostgreSQL dialect configuration (ready for Neon or other Postgres providers)
- Schema includes:
  - `users` table: Basic authentication structure (username/password)
  - `onboarding` table: Complete business profile (name, website, currency, industries, needs, availability, custom labels)
- Array fields for multi-select data (industries, business needs, available days)
- Zod schema integration for runtime validation matching database schema

**Migration Strategy**
- Drizzle Kit for schema migrations with configured output directory
- Push-based workflow for rapid development (`db:push` script)
- Migration files tracked separately from application code

### External Dependencies

**UI Component Libraries**
- @radix-ui/* primitives (20+ components): Accessible, unstyled foundation for buttons, dialogs, selects, menus, etc.
- Tailwind CSS with PostCSS for styling pipeline
- class-variance-authority (CVA) for component variant management
- Lucide React for consistent iconography

**Form & Validation**
- react-hook-form with @hookform/resolvers for form state and validation
- Zod for schema validation (shared between frontend and backend)
- drizzle-zod for automatic Zod schema generation from database schema

**Data Fetching**
- @tanstack/react-query for server state management
- Configured with conservative defaults (no automatic refetching, infinite staleTime)

**Database & ORM**
- Drizzle ORM for type-safe database queries
- @neondatabase/serverless for PostgreSQL connection (supports Neon Database)
- connect-pg-simple for potential session storage

**Development Tools**
- Replit-specific plugins for enhanced DX (@replit/vite-plugin-runtime-error-modal, cartographer, dev-banner)
- tsx for running TypeScript directly in development
- esbuild for production server bundling

**Utilities**
- date-fns for date manipulation
- clsx + tailwind-merge (via cn utility) for conditional class composition
- nanoid for unique ID generation
- cmdk for command palette functionality