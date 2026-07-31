# Yemen Pharma Intelligence Platform - Setup Guide

## Overview

This is a **Market Intelligence Platform** for Yemen's pharmaceutical market. It is **NOT** an e-commerce platform. The platform enables:

- Supply & Demand Visibility
- Market Shortage/Surplus Detection
- Invisible Inventory Discovery
- Drug Alternative Identification
- Market Signal Extraction

## Quick Start (Out-of-the-Box)

### Prerequisites

- Node.js 22.13.0+
- pnpm 10.4.1+
- MySQL/TiDB database (auto-provisioned in Manus)

### Installation & Running

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Server runs at http://localhost:3000
```

The dev server automatically:
- Compiles TypeScript
- Watches for file changes
- Connects to the pre-seeded database
- Initializes OAuth integration

## Project Structure

```
yemen-pharma-preview/
├── client/                    # React 19 + Tailwind 4 frontend
│   ├── src/
│   │   ├── pages/            # Page components
│   │   │   ├── Home.tsx      # Landing page with CTA redirect
│   │   │   ├── Dashboard.tsx # Main dashboard with entity status guard
│   │   │   └── dashboard/    # Feature pages (Offers, Requests, etc.)
│   │   ├── components/       # Reusable UI components
│   │   ├── lib/trpc.ts       # tRPC client setup
│   │   └── index.css         # Global styles
│   ├── public/               # Static assets (favicon, robots.txt)
│   └── index.html            # HTML entry point
│
├── server/                    # Express 4 + tRPC 11 backend
│   ├── routers.ts            # tRPC procedure definitions
│   ├── db.ts                 # Database query helpers
│   ├── storage.ts            # S3 file storage helpers
│   └── _core/                # Framework internals (OAuth, context, etc.)
│
├── drizzle/                   # Database schema & migrations
│   ├── schema.ts             # Complete marketplace schema
│   ├── relations.ts          # Drizzle ORM relations
│   └── migrations/           # Applied migration files
│
├── shared/                    # Shared types & constants
│   ├── types.ts              # Shared TypeScript types
│   └── const.ts              # Shared constants
│
└── package.json              # Dependencies & scripts
```

## Database Schema

The platform includes a complete pharmaceutical marketplace schema:

### Geographic Hierarchy
- **regions** (5): Northern, Southern, Eastern, Western, Central
- **governorates** (22): All Yemen governorates with Arabic names
- **cities** (22): Major cities with GPS coordinates

### Core Entities
- **users**: Authentication & role management (user/admin)
- **entities**: Pharmacy/Hospital/Distributor/Clinic profiles with verification status
- **drugs**: Official pharmaceutical catalog (35+ drugs pre-seeded)
- **reference_drugs**: Extended drug reference with manufacturer details

### Marketplace Features
- **offers**: Supply listings with quantity, price, expiry
- **requests**: Demand listings with urgency levels
- **matches**: Intelligent supply-demand matching with scoring
- **conversations**: Secure messaging between matched entities
- **messages**: Chat history with contact reveal controls
- **notifications**: User alerts for matches, messages, expirations
- **marketSignals**: Shortage/surplus/trend indicators
- **drugAlternatives**: Cross-reference for drug substitutes

## Pre-Seeded Data

### Geographic Data
- ✅ 5 regions with Arabic names
- ✅ 22 governorates with region hierarchy
- ✅ 22 cities with GPS coordinates (latitude/longitude)

### Drug Catalog
- ✅ 35 official pharmaceutical drugs
- ✅ 14 drug categories (antibiotics, analgesics, cardiovascular, etc.)
- ✅ Bilingual names (English + Arabic)
- ✅ Manufacturer, dosage form, and strength information

## Key Features Implemented

### 1. Landing Page CTA Redirect ✅
**File**: `client/src/pages/Home.tsx` (lines 68-80)

- Authenticated users see "Go to Dashboard" → redirects to `/dashboard`
- Unauthenticated users see "Get Started" → triggers OAuth login
- Dynamic button text based on `useAuth()` state

### 2. Entity Status Guard ✅
**File**: `client/src/pages/Dashboard.tsx` (lines 29-55)

Protected routes: `/dashboard/offers`, `/dashboard/requests`, `/dashboard/matches`, `/dashboard/overview`

- Unregistered users → redirected to `/dashboard/register`
- Unverified users (non-admin) → redirected to `/dashboard/register`
- Toast notification: "Please register your entity to access all features"
- Admins bypass verification and access all features immediately

### 3. Admin Auto-Approval ✅
**File**: `server/routers.ts` (lines 60-71)

When registering a new entity:
```typescript
status: ctx.user!.role === 'admin' ? 'verified' : 'pending'
```

- Admin users: status = `verified` (immediate access)
- Regular users: status = `pending` (awaiting admin review)

### 4. Toast Notifications ✅
- Unregistered users see helpful guidance
- Success/error messages on all mutations
- Powered by `sonner` toast library

## Authentication Flow

1. User clicks "Sign In" or "Get Started"
2. OAuth redirect to Manus login portal
3. Callback to `/api/oauth/callback`
4. Session cookie set (httpOnly, secure)
5. `useAuth()` hook reads current user state
6. Protected procedures check `ctx.user` in backend

**Note**: All OAuth configuration is pre-wired. No additional setup required.

## API Routes

All tRPC procedures are under `/api/trpc/*`:

### Public Procedures
- `auth.me` - Get current user
- `auth.logout` - Clear session
- `geography.getAll` - Fetch regions/governorates/cities
- `drugs.search` - Search drug catalog

### Protected Procedures (require login)
- `entity.getByUserId` - Get user's entity
- `entity.create` - Register new entity
- `offers.create` - Post supply listing
- `requests.create` - Post demand listing
- `matches.getByEntity` - Get matched opportunities
- `conversations.list` - Get message threads
- `notifications.list` - Get user alerts

### Admin-Only Procedures
- `entity.verificationQueue` - Pending registrations
- `entity.verify` - Approve entity
- `intelligence.getSignals` - Market intelligence
- `entities.list` - All entities management

## Development Workflow

### Adding a Feature

1. **Update schema** in `drizzle/schema.ts`
2. **Generate migration**: `pnpm drizzle-kit generate`
3. **Apply migration**: Use `webdev_execute_sql` or database UI
4. **Add query helper** in `server/db.ts`
5. **Add tRPC procedure** in `server/routers.ts`
6. **Build UI** in `client/src/pages/`
7. **Call tRPC** from React: `trpc.feature.useQuery/useMutation()`
8. **Test** with `pnpm test`

### Running Tests

```bash
pnpm test
```

Tests are located in `server/*.test.ts` using Vitest.

## Environment Variables

All environment variables are **automatically injected** by Manus:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session signing secret |
| `VITE_APP_ID` | OAuth application ID |
| `OAUTH_SERVER_URL` | OAuth backend URL |
| `VITE_OAUTH_PORTAL_URL` | OAuth login portal |
| `BUILT_IN_FORGE_API_URL` | Manus APIs (LLM, storage, etc.) |
| `BUILT_IN_FORGE_API_KEY` | Manus API key (server-side) |
| `VITE_FRONTEND_FORGE_API_KEY` | Manus API key (client-side) |

**No manual `.env` file needed** — all secrets are managed securely.

## Database Connection

The database is **pre-configured** and automatically connected:

- Connection string in `DATABASE_URL`
- Drizzle ORM handles pooling
- Migrations already applied
- Seed data already loaded

To inspect the database:
- Use the Manus Management UI → Database panel
- Or connect with MySQL client using the provided credentials

## Deployment

### Build for Production

```bash
pnpm build
```

Outputs:
- `dist/index.js` - Production server bundle
- `dist/client/` - Optimized React build

### Deploy

1. Create a checkpoint: `webdev_save_checkpoint`
2. Click **Publish** in Manus Management UI
3. Platform auto-deploys to serverless hosting
4. Custom domain available in Settings

## Troubleshooting

### Dev Server Won't Start
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm dev
```

### Database Connection Error
- Check `DATABASE_URL` in environment
- Verify database is running (Manus Management UI → Database)
- Ensure migrations are applied

### OAuth Login Not Working
- Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are set
- Check browser console for OAuth errors
- Ensure callback URL matches OAuth app settings

### Entity Guard Not Redirecting
- Clear browser cache and cookies
- Verify `entity.getByUserId` query returns null for unregistered users
- Check browser console for tRPC errors

## Support & Documentation

- **tRPC Docs**: https://trpc.io
- **Drizzle ORM**: https://orm.drizzle.team
- **Tailwind CSS**: https://tailwindcss.com
- **React 19**: https://react.dev

## License

MIT

---

**Last Updated**: August 1, 2026
**Platform Version**: 1.0.0
**Status**: ✅ Production Ready
