# AI Testing Maturity Assessment

## Overview

This is a web-based AI Testing Maturity Assessment tool that helps organizations evaluate their AI testing capabilities across multiple dimensions. Users complete a 24-question assessment, provide contact information, and receive a personalized maturity report with scores and recommendations. The application is a professional B2B SaaS-style tool with lead capture and admin functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state, React hooks for local state
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (Inter + Space Grotesk fonts)
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful endpoints under `/api/*` prefix
- **Build Process**: Custom esbuild script for server bundling, Vite for client

### Data Storage
- **Database**: PostgreSQL using Drizzle ORM
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Key Tables**: 
  - `leads` - stores user contact information (first name, last name, email, company, role)
  - `assessments` - stores responses, calculated scores, and report tokens

### Data Model (JSON-driven)
- **Model File**: `data/model.json` contains the maturity model definition
- **Structure**: 5 maturity levels, 5 areas, 12 dimensions, 24 questions
- **Design**: Questions and level descriptions are loaded dynamically from JSON, not hardcoded

### Key Design Patterns
- **Shared Types**: TypeScript types shared between client and server via `@shared/*` alias
- **Session Storage**: Assessment responses stored in browser sessionStorage during flow
- **Token-based Reports**: Unique tokens generated for shareable report URLs
- **Path Aliases**: `@/` for client source, `@shared/` for shared code

## External Dependencies

### Database
- **PostgreSQL**: Primary database accessed via `DATABASE_URL` environment variable
- **Drizzle ORM**: Schema management and query building
- **connect-pg-simple**: Session storage for Express (if sessions are used)

### Email (Optional)
- **Resend API**: Email delivery when `RESEND_API_KEY` is configured
- **Fallback**: Console logging of email content in dev mode when API key is absent

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **shadcn/ui**: Pre-built component implementations using Radix
- **Lucide React**: Icon library

### Build & Development
- **Vite**: Frontend dev server and bundler with HMR
- **esbuild**: Server-side bundling for production
- **Replit Plugins**: Development banner, cartographer, and error overlay for Replit environment