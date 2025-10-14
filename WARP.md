# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

---

## Project Overview

**SHARPENED** - AI-powered fitness and nutrition coaching platform frontend built with Next.js 14 (App Router), TypeScript, Supabase, and Tailwind CSS.

---

## Quick Reference Commands

### Development
```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build (validates environment variables)
npm run build

# Start production server
npm start
```

### Testing & Quality
```bash
# Run all tests
npm test

# Run tests with UI
npm test:ui

# Run tests with coverage
npm test:coverage

# Type checking (no emit)
npm run type-check

# Linting
npm run lint

# Format code with Prettier
npm run format
```

### Building & Deployment
```bash
# Production build (validates env vars at build time)
npm run build

# Fails if missing: NEXT_PUBLIC_API_BASE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## Architecture Overview

### Tech Stack
- **Framework:** Next.js 14 with App Router
- **Language:** TypeScript (strict mode enabled)
- **Styling:** Tailwind CSS with custom design system
- **State:** React hooks (no external state management library)
- **Auth:** Supabase + httpOnly cookies from backend API
- **Error Tracking:** Sentry (optional, add DSN to enable)
- **Forms:** React Hook Form + Zod validation
- **Testing:** Vitest + Testing Library
- **Node Version:** >=18.0.0
- **Package Manager:** npm >=9.0.0

### Authentication Flow
1. User submits credentials via login page
2. `lib/api/auth.ts` calls backend API
3. Backend sets httpOnly `access_token` cookie
4. `middleware.ts` checks cookie for protected routes
5. Unauthenticated users → redirect to `/` (landing)
6. Authenticated users on auth pages → redirect to `/dashboard`

### Backend Integration
- **Backend Repository:** `ULTIMATE_COACH_BACKEND` (FastAPI + Supabase)
- **API Base URL:** Configured via `NEXT_PUBLIC_API_BASE_URL`
- **All API calls:** Use `lib/api/client.ts` (never raw `fetch()`)
- **Credentials:** Automatically included (`credentials: 'include'`)
- **Error handling:** Centralized in API client with Sentry integration

---

## Critical Rules (ALWAYS FOLLOW)

### 1. Design System - NEVER Hardcode Colors/Spacing
```typescript
// ❌ BAD
<div className="bg-blue-500 text-gray-900" style={{ padding: '20px' }}>

// ✅ GOOD
<div className="bg-iron-orange text-iron-black p-5">
```
**Why:** All design values are centralized in `lib/design-system/tokens.ts` for instant rebrand capability.

**Design Tokens:**
- Colors: `iron-black`, `iron-white`, `iron-orange`, `iron-gray`, `iron-dark-gray`
- Use Tailwind classes generated from design tokens
- For custom styles, import: `import { theme } from '@/lib/design-system/tokens'`

### 2. API Client - NEVER Use Raw fetch()
```typescript
// ❌ BAD
const response = await fetch('/api/users/me')

// ✅ GOOD
import { apiClient } from '@/lib/api/client'
const user = await apiClient.get<User>('/api/v1/users/me')
```
**Why:** Centralized error handling, auth credentials, logging, and Sentry integration.

**API Client Features:**
- Auto-includes httpOnly cookies
- TypeScript generics for type safety
- Custom error class: `ApiRequestError`
- Methods: `get()`, `post()`, `patch()`, `put()`, `delete()`, `upload()`

### 3. TypeScript - NEVER Use `any`
```typescript
// ❌ BAD
const data: any = await apiClient.get('/users')

// ✅ GOOD
interface User { id: string; email: string }
const user = await apiClient.get<User>('/users/me')
```
**Why:** Type safety catches bugs at compile time. `tsconfig.json` has `strict: true`.

### 4. Mobile-First Responsive Design
```typescript
// ❌ BAD - Desktop-first
<div className="text-6xl md:text-4xl">

// ✅ GOOD - Mobile-first
<div className="text-4xl md:text-6xl">
```
**Why:** Most users are mobile. Start small, enhance for larger screens.

**Breakpoints:**
- Default: Mobile (< 640px)
- `sm:` ≥640px (tablets)
- `md:` ≥768px (laptops)
- `lg:` ≥1024px (desktops)
- `xl:` ≥1280px
- `2xl:` ≥1536px

### 5. i18n Readiness - Text Should Be Extractable
```typescript
// ⚠️ CURRENT (acceptable but needs refactor for i18n)
<h1>Welcome to the app</h1>

// 🎯 FUTURE (when i18n implemented)
const { t } = useTranslation()
<h1>{t('onboarding.welcome')}</h1>
```
**Why:** Multi-language support planned (not yet implemented). Keep text extractable.

---

## File Structure

```
app/                          # Next.js App Router
├── (auth)/                   # Auth route group (no /auth prefix)
│   ├── login/
│   ├── signup/
│   └── forgot-password/
├── (legal)/                  # Legal pages (privacy, terms)
├── activities/               # ✅ Activity tracking (PRODUCTION READY)
│   ├── page.tsx             # Activities dashboard
│   ├── log/                 # Manual logging (placeholder)
│   └── templates/           # Activity templates
├── coach/                    # AI coach chat interface
├── dashboard/                # Main dashboard
│   ├── page.tsx
│   └── consultation/        # ⚠️ HIDDEN (not production ready)
├── nutrition/                # ✅ Nutrition tracking (PRODUCTION READY)
│   ├── page.tsx             # Daily nutrition summary
│   └── log/                 # Full meal logging interface
├── onboarding/               # One-page onboarding flow
├── profile/                  # User profile management
├── weight/                   # Weight tracking
├── components/               # App-specific components (should move to top-level)
│   ├── activities/          # Activity components
│   ├── dashboard/           # Dashboard components
│   ├── nutrition/           # Nutrition components
│   └── shared/
├── layout.tsx               # Root layout (Sentry, ErrorBoundary)
├── page.tsx                 # Landing page
├── error.tsx                # Global error handler
├── middleware.ts            # Auth middleware
└── globals.css              # Design system + global styles

components/                   # Shared components
├── Coach/                   # AI coach components
├── ErrorBoundary.tsx
├── landing/
├── onboarding/
├── providers/
└── shared/

lib/                         # Core library code
├── api/                     # ⭐ API client and endpoint modules
│   ├── client.ts           # HTTP client (USE THIS for all API calls)
│   ├── auth.ts             # Auth endpoints
│   ├── users.ts            # User endpoints
│   ├── activities.ts       # Activity CRUD + summary
│   ├── nutrition.ts        # Meals, nutrition stats
│   ├── foods.ts            # Food search, recent foods
│   ├── quick-meals.ts      # Quick meal templates
│   ├── templates.ts        # Activity templates
│   ├── body-metrics.ts     # Weight/body measurements
│   ├── coach.ts            # AI coach chat
│   ├── dashboard.ts        # Dashboard data
│   ├── profile.ts          # User profile
│   └── onboarding.ts       # Onboarding submission
├── design-system/
│   └── tokens.ts           # ⭐ SINGLE SOURCE OF TRUTH for design
├── types/                  # TypeScript interfaces
│   ├── activities.ts
│   ├── food.ts
│   ├── nutrition.ts
│   └── (other types)
├── hooks/                  # Custom React hooks
│   ├── useOnboardingCheck.ts
│   └── useUserLanguage.ts
├── utils/                  # Utility functions
├── constants/              # App constants
├── env.ts                  # ⭐ Environment variable validation
├── supabase.ts            # Supabase client (client-side)
├── supabase-server.ts     # Supabase client (server-side)
└── sentry.ts              # Sentry error tracking config
```

---

## Key Architecture Patterns

### API Requests
```typescript
import { apiClient } from '@/lib/api/client'
import type { User } from '@/lib/types'

try {
  // Type-safe GET request
  const user = await apiClient.get<User>('/api/v1/users/me')
  
  // POST with body
  const newActivity = await apiClient.post('/api/v1/activities', {
    activity_name: 'Morning Run',
    duration_minutes: 30,
    calories_burned: 250
  })
  
} catch (error) {
  if (error instanceof ApiRequestError) {
    // Handle specific API errors
    if (error.status === 401) {
      router.push('/login')
    } else {
      console.error(error.detail)
    }
  }
}
```

### Component Structure
```typescript
'use client' // For client components

import { useState, useEffect } from 'react'
import { apiClient } from '@/lib/api/client'
import type { Activity } from '@/lib/types/activities'

export default function ActivitiesPage() {
  // 1. Hooks at the top
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  
  // 2. Effects
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await apiClient.get<Activity[]>('/api/v1/activities')
        setActivities(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])
  
  // 3. Event handlers
  const handleDelete = async (id: string) => {
    await apiClient.delete(`/api/v1/activities/${id}`)
    setActivities(prev => prev.filter(a => a.id !== id))
  }
  
  // 4. Render
  if (loading) return <div>Loading...</div>
  
  return (
    <div className="min-h-screen bg-iron-black text-iron-white p-4">
      {activities.map(activity => (
        <div key={activity.id} className="bg-iron-dark-gray p-6 rounded-lg">
          <h2 className="text-xl font-semibold">{activity.activity_name}</h2>
          <button 
            onClick={() => handleDelete(activity.id)}
            className="text-iron-orange hover:underline"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Custom Hooks
```typescript
// lib/hooks/useActivities.ts
import { useState, useEffect } from 'react'
import { getActivities } from '@/lib/api/activities'
import type { Activity } from '@/lib/types/activities'

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getActivities({ limit: 20 })
        setActivities(data.activities)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { activities, loading, error }
}

// Usage in component
const { activities, loading, error } = useActivities()
```

### Error Handling
```typescript
import { captureException } from '@/lib/sentry'

try {
  await riskyOperation()
} catch (error) {
  // Log to Sentry with context
  captureException(error as Error, {
    context: 'user-profile-update',
    userId: user.id,
  })
  
  // Show user-friendly message
  toast.error('Failed to update profile')
}
```

---

## Environment Variables

### Required
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (e.g., `http://localhost:8000`)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Optional
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking (recommended for production)
- `NEXT_PUBLIC_APP_URL` - App URL for OAuth redirects
- `NEXT_PUBLIC_OPENAI_API_KEY` - For AI features

**Setup Guide:** See `vercel-env-setup.txt` for Vercel configuration.

**Validation:** `lib/env.ts` validates required vars at build time. Build fails if any are missing.

---

## Production Features Status

### ✅ Production Ready
- **Activities Tracking:** Full CRUD, daily summaries, category-specific metrics
- **Nutrition Logging:** Meal logging, food search, quick meals, daily stats
- **Landing Page:** Marketing site with feature showcase
- **Authentication:** Login, signup, password reset
- **Onboarding:** One-page form with profile setup
- **Profile Management:** User settings, dietary preferences, goals
- **Weight Tracking:** Body metrics logging and history
- **AI Coach Chat:** Conversational interface with workout/nutrition previews
- **Design System:** Fully implemented and documented
- **Error Tracking:** Sentry configured (just add DSN)

### ⚠️ Functional But Needs Work
- **Nutrition Log Page:** Styling inconsistent with activities page
- **i18n:** Text hardcoded (will need refactor when implementing multi-language)

### ❌ Not Production Ready
- **Dashboard Consultation:** Uses placeholder endpoints (currently hidden)
- **Activity Edit Page:** Not built yet
- **Meal Edit Page:** Not built yet

---

## Common Development Patterns

### Loading States
```typescript
if (loading) return <LoadingScreen />
if (error) return <ErrorMessage error={error} />
if (!data) return null

return <Content data={data} />
```

### Conditional Rendering
```typescript
// ✅ GOOD - Early returns
if (!user) return <LoginPrompt />
return <Dashboard user={user} />

// ❌ BAD - Nested ternaries
return user ? <Dashboard user={user} /> : <LoginPrompt />
```

### List Rendering
```typescript
// ✅ GOOD - Use unique ID as key
{activities.map(activity => (
  <ActivityCard key={activity.id} activity={activity} />
))}

// ❌ BAD - Index as key
{activities.map((activity, index) => (
  <ActivityCard key={index} activity={activity} />
))}
```

### Styling with clsx
```typescript
import clsx from 'clsx'

<button
  className={clsx(
    // Base styles
    'px-6 py-3 rounded-lg',
    'bg-iron-orange text-iron-white',
    'transition-all duration-200',
    // Conditional
    { 
      'opacity-50 cursor-not-allowed': disabled,
      'hover:bg-iron-orange/90': !disabled
    }
  )}
>
```

---

## Testing Guidelines

### Unit Tests (Vitest)
```typescript
// components/ActivityCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityCard } from './ActivityCard'

describe('ActivityCard', () => {
  const mockActivity = {
    id: '1',
    activity_name: 'Morning Run',
    calories_burned: 250,
    duration_minutes: 30,
    // ... other required fields
  }

  it('renders activity name', () => {
    render(<ActivityCard activity={mockActivity} />)
    expect(screen.getByText('Morning Run')).toBeInTheDocument()
  })

  it('calls onDelete when delete button clicked', () => {
    const handleDelete = jest.fn()
    render(<ActivityCard activity={mockActivity} onDelete={handleDelete} />)
    
    fireEvent.click(screen.getByText('Delete'))
    expect(handleDelete).toHaveBeenCalledTimes(1)
  })
})
```

### Type Checking
```bash
# Run type check without emitting files
npm run type-check

# Should have zero errors in strict mode
```

---

## Important Documentation

**Read These First:**
1. **CLAUDE.md** - Complete codebase index and development rules (1100+ lines)
2. **DEVELOPMENT_GUIDE.md** - Detailed coding standards and patterns
3. **README.md** - Quick start and project overview

**Setup & Production:**
- **PRODUCTION_ISSUES.md** - Known issues and TODOs before launch
- **SENTRY_SETUP.md** - Error tracking setup (5 min guide)
- **vercel-env-setup.txt** - Environment variables for Vercel

**Feature Documentation:**
- **CLAUDE.md (lines 301-560)** - Activity tracking system architecture
- **CLAUDE.md (lines 562-989)** - Nutrition logging system architecture

---

## Backend Repository

**Repository:** `ULTIMATE_COACH_BACKEND` (FastAPI + Supabase)
**Location:** `C:\Users\pradord\Documents\Projects\ULTIMATE_COACH_BACKEND`

**Key Backend Services:**
- `app/services/nutrition_calculator.py` - Nutrition calculation engine
- `app/services/food_search.py` - Unified food search
- `app/services/nutrition_service.py` - Business logic
- `app/routers/` - API endpoints

---

## Known Issues & Caveats

### Hardcoded Colors (Low Priority)
- `app/dashboard/consultation/page.tsx` uses `slate-`, `blue-`, `purple-` classes
- **Status:** Page is hidden from users
- **Fix:** Refactor to design tokens when launching feature

### Hardcoded Text (i18n Not Implemented)
- All user-facing text is hardcoded (no translation keys)
- **Status:** i18n planned but not implemented
- **Fix:** Extract strings when implementing multi-language support

### Component Organization
- Some components in `app/components/` should be in top-level `components/`
- **Status:** Functional, but inconsistent with file structure conventions

See **PRODUCTION_ISSUES.md** for complete list.

---

## Quick Checklist Before Committing

- [ ] No hardcoded colors (only `iron-*` Tailwind classes)
- [ ] No raw `fetch()` calls (use `apiClient`)
- [ ] No `any` types (strict TypeScript)
- [ ] Mobile-first responsive (test on mobile viewport)
- [ ] No `console.log` in production code
- [ ] Proper error handling with try/catch
- [ ] Component < 200 lines (extract if larger)
- [ ] Imports organized correctly
- [ ] Types defined for all data structures
- [ ] `npm run type-check` passes

---

## Support

- **Email:** persimmonautomation@gmail.com
- **Privacy:** persimmonautomation@gmail.com
- **Issues:** See PRODUCTION_ISSUES.md

---

**Last Updated:** 2025-10-14  
**Version:** 1.0.0 - Initial WARP.md for WARP AI assistance
