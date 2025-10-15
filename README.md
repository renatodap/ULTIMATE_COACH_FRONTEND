# SHARPENED Frontend

> AI-powered fitness and nutrition coaching platform - Next.js frontend

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# 3. Run dev server
npm run dev

# Visit: http://localhost:3000
```

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Custom Design System
- **Auth:** Supabase
- **Error Tracking:** Sentry
- **Deployment:** Vercel

---

## Documentation

**READ FIRST:**
- **[CLAUDE.md](./CLAUDE.md)** - Complete codebase index + development rules (AI assistants must read this)
- **[DEVELOPMENT_GUIDE.md](./DEVELOPMENT_GUIDE.md)** - Coding standards and patterns

**Setup & Production:**
- **[PRODUCTION_ISSUES.md](./PRODUCTION_ISSUES.md)** - Known issues and TODOs before launch
- **[SENTRY_SETUP.md](./SENTRY_SETUP.md)** - Error tracking setup (5 min)
- **[vercel-env-setup.txt](./vercel-env-setup.txt)** - Environment variables for Vercel

---

## Project Structure

```
app/
├── (auth)/                # Auth pages (login, signup)
├── (legal)/               # Privacy & terms pages
├── dashboard/             # Protected routes
├── onboarding/            # One-page onboarding
├── layout.tsx             # Root layout (Sentry, ErrorBoundary)
├── page.tsx               # Landing page
├── error.tsx              # Global error handler
└── globals.css            # Design system + global styles

lib/
├── api/                   # API client (USE THIS for all API calls)
├── design-system/         # Design tokens (colors, spacing, typography)
├── sentry.ts              # Error tracking
├── env.ts                 # Environment validation
└── supabase.ts            # Supabase client

components/
└── ErrorBoundary.tsx      # React error handler
```

---

## Development

```bash
# Dev server with hot reload
npm run dev

# Build for production (validates env vars)
npm run build

# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test
```

---

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build (validates env) |
| `npm run lint` | ESLint check |
| `npm test` | Run tests |

---

## Environment Variables

**Required:**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional:**
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking (recommended for production)

See `vercel-env-setup.txt` for complete list and Vercel setup.

---

## Design System

**Colors:** `iron-black`, `iron-white`, `iron-orange`, `iron-gray`, `iron-dark-gray`
**Typography:** Mobile-first responsive (text-4xl sm:text-6xl md:text-8xl)
**Spacing:** Tailwind spacing scale (4px base unit)

**⚠️ NEVER hardcode colors** - Always use design tokens from `lib/design-system/tokens.ts`

---

## Support

- **Email:** persimmonautomation@gmail.com
- **Privacy:** persimmonautomation@gmail.com
- **Issues:** See PRODUCTION_ISSUES.md

---

## For AI Assistants

1. **READ [CLAUDE.md](./CLAUDE.md) FIRST** - Contains complete codebase index and development rules
2. Follow the 5 Critical Rules (no hardcoded colors, no raw fetch, etc.)
3. Check PRODUCTION_ISSUES.md before adding features
4. Use existing patterns - don't invent new ones

---

**Last Updated:** 2025-10-12
