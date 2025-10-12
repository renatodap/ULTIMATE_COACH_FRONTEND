# CLAUDE.md - AI Assistant Guide for SHARPENED Frontend

> **Purpose:** Index the codebase and enforce development standards for AI coding assistants

---

## Project Overview

**SHARPENED** - AI-powered fitness and nutrition coaching platform
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + Custom Design System
- **Auth:** Supabase
- **State:** React hooks (no external state management)
- **Error Tracking:** Sentry
- **Deployment:** Vercel

---

## Critical Rules - ALWAYS FOLLOW

### 1. **Never Hardcode Colors**
❌ BAD: `className="bg-blue-500 text-gray-900"`
✅ GOOD: `className="bg-iron-orange text-iron-black"`

**Why:** Design system must be centralized for rebrand flexibility

**Design Tokens:** `lib/design-system/tokens.ts`
- Colors: `iron-black`, `iron-white`, `iron-orange`, `iron-gray`, `iron-dark-gray`
- Use CSS classes: defined in `app/globals.css`

### 2. **Never Hardcode Text**
❌ BAD: `<h1>Welcome to the app</h1>`
✅ GOOD: `<h1>{t('onboarding.welcome')}</h1>`

**Why:** Multi-language support (i18n ready)

**Current State:** i18n not yet implemented, but text should still be extractable
**TODO:** When implementing i18n, all text must use `useTranslation` hook

### 3. **Never Use Raw fetch()**
❌ BAD: `fetch('/api/users')`
✅ GOOD: `apiClient.get('/api/v1/users')`

**Why:** Centralized error handling, auth, and logging

**API Client:** `lib/api/client.ts`
- Methods: `get()`, `post()`, `put()`, `patch()`, `delete()`, `upload()`
- Auto-includes credentials (httpOnly cookies)
- Handles errors consistently

### 4. **TypeScript Strict Mode - No `any`**
❌ BAD: `const data: any = response.data`
✅ GOOD: `const data: User = response.data`

**Why:** Type safety catches bugs at compile time

**Define Types:** Create interfaces in same file or `lib/types/`

### 5. **Mobile-First Responsive Design**
❌ BAD: `className="text-6xl md:text-4xl"`
✅ GOOD: `className="text-4xl md:text-6xl"`

**Why:** Start with mobile, enhance for desktop

**Breakpoints:**
- Default: Mobile (< 640px)
- `sm:` Tablet (≥ 640px)
- `md:` Laptop (≥ 768px)
- `lg:` Desktop (≥ 1024px)

---

## File Structure & Code Index

### **App Structure (Next.js App Router)**

```
app/
├── (auth)/                 # Auth routes (grouped, no /auth prefix)
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── forgot-password/   # Password reset
├── (legal)/               # Legal pages
│   ├── privacy/           # Privacy policy
│   └── terms/             # Terms of service
├── dashboard/             # Protected routes
│   ├── consultation/      # Premium consultation (HIDDEN - not ready)
│   └── [future pages]     # Meals, workouts, progress, coach
├── onboarding/            # One-page onboarding form
├── api/                   # API routes (Next.js route handlers)
├── layout.tsx             # Root layout (Sentry init, ErrorBoundary)
├── page.tsx               # Landing page
├── error.tsx              # Global error page (Sentry integrated)
├── middleware.ts          # Auth middleware (redirects)
└── globals.css            # Global styles + design system classes
```

### **Library Structure**

```
lib/
├── api/                   # API client modules
│   ├── client.ts         # Core HTTP client ⭐ USE THIS FOR ALL API CALLS
│   ├── auth.ts           # Auth endpoints (login, signup, logout)
│   ├── users.ts          # User endpoints (profile, update)
│   └── onboarding.ts     # Onboarding submission
├── design-system/
│   └── tokens.ts         # ⭐ SINGLE SOURCE OF TRUTH for colors, spacing, typography
├── hooks/                # Custom React hooks
│   └── [future: useTranslation.ts for i18n]
├── utils/                # Utility functions
├── types/                # TypeScript type definitions
├── env.ts                # ⭐ Environment variable validation
├── supabase.ts           # Supabase client (client-side)
├── supabase-server.ts    # Supabase client (server-side)
└── sentry.ts             # ⭐ Sentry error tracking config
```

### **Component Structure**

```
components/
├── ErrorBoundary.tsx     # React error boundary (Sentry integrated)
└── [future: shared UI components]
```

---

## Key Files - What They Do

### **Core Configuration**

| File | Purpose | When to Edit |
|------|---------|--------------|
| `lib/env.ts` | Environment variable validation | Adding new env vars |
| `lib/design-system/tokens.ts` | All design values (colors, spacing, etc.) | Design changes, rebrand |
| `app/globals.css` | Global styles + design system classes | Adding new utility classes |
| `tailwind.config.ts` | Tailwind + design system integration | Rarely (imports from tokens.ts) |
| `next.config.js` | Next.js configuration | Adding domains, experiments |
| `middleware.ts` | Auth protection for routes | Changing protected routes |

### **API Integration**

| File | Purpose | Example Usage |
|------|---------|---------------|
| `lib/api/client.ts` | HTTP client (USE THIS!) | `apiClient.get('/api/v1/users/me')` |
| `lib/api/auth.ts` | Auth API calls | `login(email, password)` |
| `lib/api/users.ts` | User API calls | `getProfile()`, `updateProfile()` |
| `lib/supabase.ts` | Supabase client | `supabase.auth.getUser()` |

### **Error Tracking**

| File | Purpose | Example Usage |
|------|---------|---------------|
| `lib/sentry.ts` | Sentry configuration | `captureException(error, context)` |
| `app/error.tsx` | Global error page | Automatically catches errors |
| `components/ErrorBoundary.tsx` | React component errors | Wrap components that may fail |

---

## Common Tasks - Code Examples

### **Making API Calls**

```typescript
// ✅ CORRECT
import { apiClient } from '@/lib/api/client'

try {
  const user = await apiClient.get<User>('/api/v1/users/me')
  console.log(user.email)
} catch (error) {
  if (error instanceof ApiRequestError) {
    // Handle specific API errors
    console.error(error.status, error.detail)
  }
}
```

### **Using Design Tokens**

```typescript
// ✅ In components - use Tailwind classes
<div className="bg-iron-black text-iron-white border-iron-orange">

// ✅ In custom styles - import tokens
import { theme } from '@/lib/design-system/tokens'
const customColor = theme.colors.primary.DEFAULT // #FF6B35
```

### **Error Handling**

```typescript
// ✅ Capture errors manually
import { captureException, setUser } from '@/lib/sentry'

try {
  await riskyOperation()
} catch (error) {
  captureException(error as Error, {
    context: 'user-profile-update',
    userId: user.id,
  })
  throw error // Re-throw if needed
}

// ✅ Set user context (after login)
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
})
```

### **Responsive Design**

```typescript
// ✅ Mobile-first approach
<h1 className="
  text-4xl sm:text-5xl md:text-6xl lg:text-7xl  // Scale up
  px-4 sm:px-6 md:px-8                         // More padding on larger screens
  space-y-4 sm:space-y-6 md:space-y-8          // More spacing
">

// ✅ Stack on mobile, row on desktop
<div className="flex flex-col sm:flex-row gap-4">
  <button className="w-full sm:w-auto">Button 1</button>
  <button className="w-full sm:w-auto">Button 2</button>
</div>
```

---

## Architecture Patterns

### **Authentication Flow**
1. User enters credentials on `/login`
2. `lib/api/auth.ts` → `login()` → Backend sets httpOnly cookie
3. `middleware.ts` checks Supabase auth on protected routes
4. Redirect to `/dashboard` or `/login` accordingly

### **Data Flow**
```
User Action
  ↓
Component/Page (app/)
  ↓
API Client (lib/api/*.ts)
  ↓
HTTP Request (lib/api/client.ts)
  ↓
Backend API (FastAPI)
  ↓
Database (Supabase)
```

### **Error Flow**
```
Error Occurs
  ↓
Try/Catch → captureException() → Sentry
  ↓
User sees: ErrorBoundary or error.tsx
  ↓
Dev sees: Sentry dashboard with context
```

---

## Environment Variables

### **Required**
- `NEXT_PUBLIC_API_BASE_URL` - Backend API URL (http://localhost:8000 dev)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### **Optional**
- `NEXT_PUBLIC_SENTRY_DSN` - Sentry error tracking (highly recommended for prod)
- `NEXT_PUBLIC_OPENAI_API_KEY` - For meal photo analysis
- `NEXT_PUBLIC_APP_URL` - App URL for OAuth redirects

**Setup:** See `vercel-env-setup.txt` for Vercel configuration

---

## Current State & Known Issues

### **✅ Production Ready**
- Landing page, auth pages, legal pages
- Design system fully implemented
- Error tracking configured (just add Sentry DSN)
- Environment validation (fails at build time if vars missing)
- Mobile-responsive layout
- TypeScript strict mode

### **⚠️ Not Production Ready**
- Consultation page (uses placeholder API endpoints - currently hidden)
- i18n infrastructure (planned but not implemented)
- Dashboard pages (meals, workouts, coach chat - not built yet)

### **Known Violations**
- `app/dashboard/consultation/page.tsx` uses hardcoded colors (slate-, blue-, purple-)
  - **Status:** Hidden from users, low priority
  - **Fix:** Refactor to use design tokens when ready to launch

**See:** `PRODUCTION_ISSUES.md` for complete list

---

## Testing Checklist

Before submitting code, verify:

- [ ] No hardcoded colors (only `iron-*` classes)
- [ ] No raw `fetch()` calls (use `apiClient`)
- [ ] No `any` types (strict TypeScript)
- [ ] Mobile-first responsive (test on mobile viewport)
- [ ] Errors logged to Sentry (in production)
- [ ] No console.log in production code
- [ ] Follows file structure conventions
- [ ] Types defined for all data structures

---

## Development Commands

```bash
# Install dependencies
npm install

# Run dev server (http://localhost:3000)
npm run dev

# Build for production (validates env vars)
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint
```

---

## Getting Help

**Documentation:**
- `README.md` - Project setup and overview
- `PRODUCTION_ISSUES.md` - Known issues and fixes needed
- `SENTRY_SETUP.md` - Error tracking setup guide
- `vercel-env-setup.txt` - Environment variable guide

**Key Contacts:**
- Support: persimmonautomation@gmail.com
- Privacy: persimmonautomation@gmail.com

---

## For AI Assistants (Claude, GPT, etc.)

When working on this codebase:

1. **ALWAYS** read this file first
2. **NEVER** violate the 5 Critical Rules
3. **ALWAYS** check `PRODUCTION_ISSUES.md` before adding features
4. **ALWAYS** use existing patterns (don't invent new ones)
5. **ASK** if unsure about design decisions (don't guess)

**Common Mistakes to Avoid:**
- ❌ Adding Tailwind colors directly (use design tokens)
- ❌ Using `fetch()` instead of `apiClient`
- ❌ Adding `any` types instead of proper interfaces
- ❌ Desktop-first responsive design
- ❌ Creating new state management (use React hooks)
- ❌ Ignoring TypeScript errors

---

**Last Updated:** 2025-10-12
**Version:** 1.0.0
