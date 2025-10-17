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
├── activities/            # ⭐ Activities tracking (PRODUCTION READY)
│   ├── page.tsx           # Activities dashboard with daily summary
│   └── log/               # Manual activity logging (placeholder)
├── dashboard/             # Protected routes
│   ├── consultation/      # Premium consultation (HIDDEN - not ready)
│   └── [future pages]     # Meals, workouts, progress, coach
├── onboarding/            # One-page onboarding form
├── components/            # Shared components
│   └── activities/        # ⭐ Activity-specific components
│       ├── ActivityCard.tsx         # Individual activity display
│       ├── ActivityStatsGrid.tsx    # Dynamic metrics grid
│       ├── ActivityTypeIcon.tsx     # Category icons
│       ├── DailySummaryCard.tsx     # Daily progress summary
│       ├── EmptyState.tsx           # First-time user experience
│       └── ExerciseDetailsList.tsx  # Strength training breakdown
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
│   ├── activities.ts     # ⭐ Activities endpoints (CRUD + summary)
│   └── onboarding.ts     # Onboarding submission
├── types/                # TypeScript type definitions
│   └── activities.ts     # ⭐ Activity types & category metadata
├── design-system/
│   └── tokens.ts         # ⭐ SINGLE SOURCE OF TRUTH for colors, spacing, typography
├── hooks/                # Custom React hooks
│   └── [future: useTranslation.ts for i18n]
├── utils/                # Utility functions
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
| `lib/api/activities.ts` | Activities API calls | `getActivities()`, `createActivity()`, `getDailySummary()` |
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

## Activity Tracking System (Production Feature)

### **Overview**
Complete activity tracking system that displays user activities, calculates calories burned, and provides daily summaries. Supports diverse activity types from cardio to strength training with category-specific metrics.

### **Key Features**
- ✅ Daily activity feed with time-based grouping (Today, Yesterday, etc.)
- ✅ Category-specific metrics display (distance for cardio, exercises for strength)
- ✅ Real-time calorie calculations
- ✅ Daily summary with progress bar
- ✅ Edit/delete functionality with optimistic updates
- ✅ Responsive mobile-first design
- ✅ Empty state for first-time users

### **Architecture**

**Pages:**
- `app/activities/page.tsx` - Main activities dashboard
- `app/activities/log/page.tsx` - Manual logging (placeholder)

**Components (app/components/activities/):**
- `ActivityCard.tsx` - Individual activity display with expandable details
- `ActivityStatsGrid.tsx` - Dynamic metrics grid (adapts to category)
- `ActivityTypeIcon.tsx` - Emoji icons for each category
- `DailySummaryCard.tsx` - Daily progress summary with goal tracking
- `EmptyState.tsx` - First-time user experience
- `ExerciseDetailsList.tsx` - Strength training exercise breakdown

**API Client:**
- `lib/api/activities.ts` - Type-safe API functions
- `lib/types/activities.ts` - TypeScript interfaces & category metadata

### **Activity Categories & Metrics**

```typescript
// lib/types/activities.ts
export const ACTIVITY_CATEGORIES = {
  cardio_steady_state: { icon: '🏃', label: 'Cardio', color: 'text-iron-orange' },
  cardio_interval: { icon: '⚡', label: 'HIIT', color: 'text-iron-orange' },
  strength_training: { icon: '💪', label: 'Strength', color: 'text-iron-white' },
  sports: { icon: '⚽', label: 'Sports', color: 'text-iron-white' },
  flexibility: { icon: '🧘', label: 'Flexibility', color: 'text-iron-white' },
  other: { icon: '🎯', label: 'Other', color: 'text-iron-white' }
}
```

**Category-Specific Metrics (JSONB):**
- **Cardio:** `distance_km`, `avg_heart_rate`, `max_heart_rate`, `elevation_gain`
- **Strength:** `exercises` array (name, sets, reps, weight, rpe)
- **Sports:** `sport_type`, `score`, `opponent`
- **Flexibility:** `flexibility_type`, `stretches_completed`

### **Component Breakdown**

#### **ActivityCard.tsx**
```typescript
// Individual activity with expand/collapse
<ActivityCard
  activity={activity}
  onDelete={() => handleDelete(activity.id)}
  onEdit={() => router.push(`/activities/edit/${activity.id}`)}
/>
```
Features:
- Expandable details section
- Category icon & name
- Time & duration display
- Calories burned (large, prominent)
- Dynamic stats grid
- Exercise list (strength training)
- Notes display
- Edit/Delete buttons

#### **ActivityStatsGrid.tsx**
```typescript
// Adapts to activity category
<ActivityStatsGrid category={category} metrics={metrics} />
```
Displays:
- Cardio: Distance, Avg HR, Max HR, Elevation
- Strength: Total exercises, sets, volume (weight × reps)
- Sports: Sport type, score, duration
- Responsive: 2x2 mobile → 3x2 tablet → 4x2 desktop

#### **DailySummaryCard.tsx**
```typescript
// Daily progress overview
<DailySummaryCard summary={dailySummary} />
```
Shows:
- Total calories burned
- Progress bar (% of daily goal)
- Goal percentage text
- Total duration
- Average intensity (METs)
- Activity count
- Responsive grid layout

### **API Functions**

```typescript
// lib/api/activities.ts

// Get activities with optional filters
await getActivities({
  start_date: '2025-10-12',
  end_date: '2025-10-12',
  limit: 20,
  offset: 0
})

// Get daily summary
await getDailySummary({
  target_date: '2025-10-12'
})

// Create activity
await createActivity({
  category: 'cardio_steady_state',
  activity_name: 'Morning Run',
  start_time: '2025-10-12T06:00:00Z',
  duration_minutes: 30,
  intensity_mets: 8.0,
  metrics: {
    distance_km: 5.0,
    avg_heart_rate: 145
  }
})

// Update activity
await updateActivity(activityId, {
  duration_minutes: 35,
  calories_burned: 320
})

// Delete activity (soft delete)
await deleteActivity(activityId)
```

### **Data Flow**

```
User Views Activities Page
  ↓
Parallel API Fetches (getActivities + getDailySummary)
  ↓
Group activities by date (Today, Yesterday, specific date)
  ↓
Render DailySummaryCard + ActivityCard list
  ↓
User deletes activity
  ↓
Optimistic UI update (remove from list)
  ↓
API call to delete
  ↓
Refresh data on success
```

### **Responsive Design**

**Mobile (< 640px):**
- Single column layout
- Stats grid: 2x2
- Full-width cards
- Sticky date headers

**Tablet (640px - 768px):**
- Stats grid: 3x2
- Larger touch targets

**Desktop (≥ 768px):**
- Stats grid: 4x2
- More padding & spacing
- Hover states on buttons

### **Design Consistency**

All components use:
- `iron-*` color tokens only
- Same card styling as nutrition page (`bg-iron-dark-gray`, `border-iron-gray`)
- Consistent button styles (Edit: `text-iron-orange`, Delete: `text-red-400`)
- Same spacing scale (p-4, p-6, gap-4, gap-6)
- Identical responsive breakpoints

### **Type Safety**

```typescript
// Strict TypeScript interfaces
interface Activity {
  id: string
  user_id: string
  category: ActivityCategory
  activity_name: string
  start_time: string
  end_time: string | null
  duration_minutes: number
  calories_burned: number
  intensity_mets: number
  metrics: ActivityMetrics
  notes: string | null
  created_at: string
  updated_at: string
}

// Category-specific metrics (discriminated union)
type ActivityMetrics =
  | CardioMetrics
  | StrengthMetrics
  | SportsMetrics
  | FlexibilityMetrics
```

### **Usage Example**

```typescript
// app/activities/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { getActivities, getDailySummary } from '@/lib/api/activities'
import { ActivityCard, DailySummaryCard } from '@/components/activities'

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [summary, setSummary] = useState<DailySummary | null>(null)

  useEffect(() => {
    async function fetchData() {
      const [activitiesData, summaryData] = await Promise.all([
        getActivities({ limit: 20 }),
        getDailySummary()
      ])
      setActivities(activitiesData.data)
      setSummary(summaryData)
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen bg-iron-black text-iron-white">
      {summary && <DailySummaryCard summary={summary} />}
      {activities.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}
```

### **Status**
- ✅ Backend API complete (6 endpoints)
- ✅ Frontend dashboard complete
- ✅ All components production-ready
- ✅ Type safety enforced throughout
- ✅ Mobile-responsive design
- ⏳ Manual logging page (placeholder at /activities/log)
- ⏳ Edit page (future)

---

## 📚 Activity Tracking Documentation (CRITICAL - READ BEFORE MODIFYING)

### **Comprehensive Documentation Available**

The activity tracking system has **comprehensive documentation** designed to achieve **ZERO BUGS**. Before working on any activity tracking feature, you MUST consult these documents.

### **Documentation Files**

**Location:** Project root directory (`../../`)

1. **`ACTIVITY_TRACKING_SYSTEM.md`** (15,000+ words)
   - Complete system architecture
   - Database schema & all constraints
   - API contracts for all 6 endpoints
   - Type system (TypeScript + Pydantic sync requirements)
   - Data flow diagrams
   - State management (useActivitiesData hook)
   - Validation rules (3 layers)
   - Calculation formulas (duration, METs, calories)
   - Timezone handling (UTC ↔ local)
   - Critical code paths

2. **`ACTIVITY_TRACKING_BUG_PREVENTION.md`** (18,000+ words)
   - **50+ specific bug scenarios** with prevention strategies
   - 12 bug categories covering all common mistakes
   - Code examples: ✅ Correct vs ❌ Wrong
   - Mitigation checklists
   - Cross-references to system docs

3. **`ACTIVITY_TRACKING_DOCUMENTATION_SUMMARY.md`**
   - Executive summary
   - Documentation statistics
   - Quick reference guide

### **When to Use Each Document**

**Before Starting Development:**
```
1. Read ACTIVITY_TRACKING_SYSTEM.md relevant sections
   - Section 4: Type System (if changing TypeScript types)
   - Section 5: Data Flow (if changing page logic)
   - Section 6: State Management (if changing hooks)
   - Section 8: Calculation Formulas (if changing calculations)
   - Section 9: Timezone Handling (if working with dates)
```

**While Coding:**
```
1. Refer to inline documentation in code files
   - lib/types/activities.ts (comprehensive docstrings)
   - app/activities/page.tsx (page implementation)
   - All inline docs cross-reference main documentation

2. Check ACTIVITY_TRACKING_BUG_PREVENTION.md for your task
   - Bug 1.x: Data Synchronization Bugs
   - Bug 2.x: Timezone & Date Handling Bugs
   - Bug 3.x: Calculation & Formula Bugs
   - Bug 4.x: Type Safety & Validation Bugs
   - Bug 5.x: State Management Bugs
   - Bug 9.x: Null/Undefined Handling Bugs
```

**Before Submitting PR:**
```
1. Run through relevant mitigation checklists
2. Verify type sync (TypeScript ↔ Pydantic)
3. Check timezone handling is correct
4. Verify optional chaining for nullable fields
5. Ensure calculations match documented formulas
```

### **Critical Requirements**

**TYPE SYNCHRONIZATION (CRITICAL):**
```typescript
// Frontend: lib/types/activities.ts
// Backend: app/models/activities.py
// MUST stay in sync - documented in both files
// Last Sync Date: Check file headers
// Breaking changes require API versioning
```

**TIMEZONE HANDLING (CRITICAL):**
```typescript
// Database: Always UTC (stored as ISO 8601 UTC strings)
// API: Always send/receive ISO 8601 UTC strings
// Frontend Display: Convert to user's local timezone
// Grouping: NEVER use UTC date - use user's timezone
// Use: date-fns-tz utcToZonedTime() and zonedTimeToUtc()
// See: ACTIVITY_TRACKING_SYSTEM.md Section 9
```

**NULL HANDLING (CRITICAL):**
```typescript
// ALWAYS use optional chaining for nullable fields
activity.end_time?.toString()        // ✅ Correct
activity.metrics?.distance_km        // ✅ Correct
activity.metrics.distance_km         // ❌ Wrong - may crash

// Check existence before accessing nested properties
if (activity.metrics?.exercises?.length > 0) { ... }
```

**VALIDATION (CRITICAL):**
```typescript
// Frontend validates for UX (instant feedback)
// Backend re-validates everything (never trusts frontend)
// Always show validation errors to user
// See: ACTIVITY_TRACKING_SYSTEM.md Section 7
```

### **Common Mistakes to Avoid**

❌ **DON'T:**
- Change TypeScript types without updating Pydantic models
- Use UTC date for grouping activities by day
- Access nullable fields without optional chaining (`?.`)
- Hardcode calculation formulas (use documented formulas)
- Forget to check `metrics` existence before accessing nested properties
- Display UTC timestamps directly to users
- Use `any` type (strict type safety required)

✅ **DO:**
- Check documentation before modifying
- Update TypeScript types when backend models change
- Use timezone-aware date comparisons (utcToZonedTime)
- Follow documented calculation formulas exactly
- Always use optional chaining for nullable fields
- Convert timestamps to user's timezone for display
- Add new bugs to bug prevention guide

### **Bug Prevention Strategy**

When implementing a feature:

1. **Read relevant documentation sections**
   - Understand the architecture
   - Review data flow diagrams
   - Check calculation formulas

2. **Check bug prevention guide**
   - Find similar scenarios
   - Review prevention strategies
   - Use provided code examples

3. **Follow mitigation checklists**
   - Optional chaining for all nullable fields
   - Timezone handling correct
   - Type sync maintained
   - Validation provides user feedback

4. **Test edge cases**
   - Null/undefined values
   - Timezone boundaries (midnight, DST)
   - Empty metrics objects
   - Missing optional fields

5. **Update documentation if needed**
   - Add new bug scenarios discovered
   - Update calculation formulas if changed
   - Update last sync dates

### **Quick Reference**

**File Locations:**
```
Frontend Types:     lib/types/activities.ts
Frontend API:       lib/api/activities.ts
Frontend Page:      app/activities/page.tsx
Frontend Components: app/components/activities/*.tsx
Backend Models:     ../../ULTIMATE_COACH_BACKEND/app/models/activities.py
Backend Service:    ../../ULTIMATE_COACH_BACKEND/app/services/activity_service.py
```

**Documentation:**
```
System Docs:     ../../ACTIVITY_TRACKING_SYSTEM.md
Bug Prevention:  ../../ACTIVITY_TRACKING_BUG_PREVENTION.md
Summary:         ../../ACTIVITY_TRACKING_DOCUMENTATION_SUMMARY.md
```

**Key Sections to Bookmark:**
- Section 4.1: TypeScript Types & Interfaces
- Section 5: Data Flow (Create, List, Update)
- Section 6: State Management (useActivitiesData hook)
- Section 8: Calculation Formulas
- Section 9: Timezone Handling
- Bug 2.1: Activities Grouped Under Wrong Date
- Bug 4.1: TypeScript Types Out of Sync
- Bug 9.1: Null/Undefined Access Crashes

### **Frontend-Specific Reminders**

**Timezone Conversion:**
```typescript
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

// Display: UTC → Local
const localTime = utcToZonedTime(activity.start_time, userTimezone)
const displayDate = format(localTime, 'MMM d, yyyy')

// Submit: Local → UTC
const utcTime = zonedTimeToUtc(localTime, userTimezone)
const isoString = utcTime.toISOString()
```

**Optional Chaining Examples:**
```typescript
// Basic nullable fields
const endTime = activity.end_time?.toString()
const notes = activity.notes ?? 'No notes'

// Nested metrics
const distance = activity.metrics?.distance_km
const exercises = activity.metrics?.exercises?.length ?? 0
const firstExercise = activity.metrics?.exercises?.[0]?.name
```

**Category Metadata:**
```typescript
import { ACTIVITY_CATEGORIES } from '@/lib/types/activities'

const meta = ACTIVITY_CATEGORIES[activity.category]
const icon = meta.icon        // Emoji icon
const label = meta.label      // Display label
const color = meta.color      // Tailwind color class
```

### **For AI Assistants Working on Activities**

**MANDATORY STEPS:**

1. **Read ACTIVITY_TRACKING_SYSTEM.md Section relevant to your task**
2. **Check ACTIVITY_TRACKING_BUG_PREVENTION.md for similar scenarios**
3. **Review inline documentation in lib/types/activities.ts**
4. **Verify type sync requirements**
5. **Test with timezone edge cases**
6. **Use optional chaining for all nullable fields**
7. **Run mitigation checklists**

**If you discover a new bug:**
1. Document root cause
2. Add to ACTIVITY_TRACKING_BUG_PREVENTION.md
3. Add prevention strategy with code example
4. Create test to prevent regression

**Remember:** This system is designed for ZERO BUGS. The documentation is comprehensive. Use it.

---

## Nutrition Logging System (Production Feature)

### **Overview**
Complete nutrition tracking system with meal logging, quick meals, food search, and daily summaries. Supports three food types (simple, composed, branded) with precise nutrition calculations and flexible serving sizes.

### **Key Features**
- ✅ Quick meals for instant logging
- ✅ Recent foods display for quick access
- ✅ Live food search with 300ms debounce
- ✅ Inline editing of meal item quantities
- ✅ Save current meal as quick meal template
- ✅ Three food types: simple, composed, branded
- ✅ Precise nutrition calculations (frontend mirrors backend)
- ✅ Daily nutrition summary with macro goals
- ✅ Full CRUD on meals
- ✅ Mobile-optimized touch targets (44px minimum)

### **Architecture**

**Pages:**
- `app/nutrition/page.tsx` - Daily nutrition summary and meal history
- `app/nutrition/log/page.tsx` - Full-featured meal logging interface

**Components (app/components/nutrition/):**
- `DailySummaryCard.tsx` - Daily calorie/macro progress with goals
- `MealTypeCard.tsx` - Collapsible meal cards grouped by type
- `FoodItemCard.tsx` - Individual food item display
- `MacroProgressCircle.tsx` - Circular progress indicators

**API Clients:**
- `lib/api/nutrition.ts` - Meals, nutrition stats, meal creation
- `lib/api/foods.ts` - Food search, recent foods, single food retrieval
- `lib/api/quick-meals.ts` - Quick meals CRUD and logging

**Types:**
- `lib/types/food.ts` - Food, FoodServing, QuickMeal, MealItemPreview
- `lib/types/nutrition.ts` - DailyNutrition, Meal, FoodItem

**Utils:**
- `lib/utils/nutrition-calculator.ts` - Frontend nutrition math (mirrors backend)

### **Food Types**

The system supports three distinct food types:

```typescript
export type CompositionType = 'simple' | 'composed' | 'branded'

// Simple: Single ingredients (chicken breast, rice, apple)
// - Logged by grams OR servings
// - Nutrition calculated from per_100g values

// Composed: Meal templates made from ingredients (chicken stir-fry, protein shake)
// - Logged by servings only (not by grams)
// - Nutrition calculated from recipe_items recursively
// - Database stores recipe_items JSONB: [{food_id, grams}]

// Branded: Packaged/restaurant products (Quest Bar, Big Mac)
// - Logged by servings (container, bar, sandwich)
// - Nutrition calculated from per_100g values
```

**Key Architecture Decision:** All nutrition stored as `per_100g` (single source of truth). Servings reference food_id with grams_per_serving conversion factor.

### **Component Breakdown**

#### **Log Page (app/nutrition/log/page.tsx)**
Full-featured meal logging with six integrated features:

```typescript
export default function LogMealPage() {
  // Features:
  // 1. Quick Meals - Display user's saved templates at top
  // 2. Recent Foods - Show recently logged foods
  // 3. Search - Live food search with 300ms debounce
  // 4. Meal Building - Add items, inline editing, running totals
  // 5. Save as Quick Meal - Button when 2+ items added
  // 6. Log Meal - Complete API integration to backend

  const handleLogMeal = async () => {
    // Transforms MealItemPreview[] → CreateMealItemRequest[]
    // Rounds: calories (int), macros (1 decimal)
    // Converts units for display_unit field
    await createMeal(request)
    router.push('/nutrition')
  }
}
```

#### **Daily Summary Card**
```typescript
<DailySummaryCard
  totalCalories={2150}
  totalProtein={180}
  totalCarbs={200}
  totalFat={70}
  calorieGoal={2500}
  proteinGoal={200}
  carbsGoal={250}
  fatGoal={80}
/>
```
Features:
- Large calorie display with progress bar
- Remaining/over goal calculation
- Color-coded progress (red when over goal)
- Three macro progress circles (protein, carbs, fats)
- Responsive grid layout

#### **Meal Type Card**
```typescript
<MealTypeCard
  meal={meal}
  onEdit={() => handleEditMeal(meal.id)}
  onDelete={() => handleDeleteMeal(meal.id)}
  onEditFoodItem={(item) => handleEditFoodItem(meal.id, item.id)}
/>
```
Features:
- Collapsible meal display
- Meal type icon (🌅 breakfast, 🍽️ lunch, 🌙 dinner, 🍪 snack)
- Time logged display
- Expandable food items list
- Meal totals summary
- Edit/Delete actions
- AI source badge (if from AI)

### **Nutrition Calculation**

Frontend math mirrors backend for live preview:

```typescript
// lib/utils/nutrition-calculator.ts

// Simple/branded foods
export function calculateSimpleFoodNutrition(food: Food, grams: number): NutritionData {
  const factor = grams / 100
  return {
    calories: round(food.calories_per_100g * factor),
    protein_g: round(food.protein_g_per_100g * factor),
    carbs_g: round(food.carbs_g_per_100g * factor),
    fat_g: round(food.fat_g_per_100g * factor),
  }
}

// Composed foods (recursive)
export function calculateComposedFoodNutrition(
  food: Food,
  servings: number,
  getFoodById: (id: string) => Food | undefined
): NutritionData {
  // Sums nutrition from all recipe_items
  // Scales by servings multiplier
  // Requires all ingredient foods available
}

// Main entry point
export function calculateFoodNutrition(
  food: Food,
  quantity: number,
  unit: 'grams' | 'serving',
  serving?: FoodServing
): NutritionData & { grams: number }
```

**Important:** Frontend calculations are for preview only. Backend always calculates final values at meal log time ("calculate once, store forever" pattern).

### **API Functions**

```typescript
// lib/api/nutrition.ts

// Get daily nutrition summary
await getDailyNutrition('2025-10-13')
// Returns: { stats: NutritionStats, meals: Meal[] }

// Create meal
await createMeal({
  meal_type: 'breakfast',
  items: [
    {
      food_id: 'uuid',
      quantity: 2,
      serving_id: 'uuid',
      grams: 200,
      calories: 400,
      protein_g: 40,
      carbs_g: 30,
      fat_g: 10,
      display_unit: 'scoop',
      display_label: 'large'
    }
  ],
  source: 'manual'
})

// Delete meal
await deleteMeal(mealId)

// lib/api/foods.ts

// Search foods
await searchFoods('chicken', 20)
// Returns: { foods: Food[], total: number }

// Get recent foods
await getRecentFoods(10)
// Returns: Food[] (deduped, ordered by recency)

// Get single food with servings
await getFood(foodId)

// lib/api/quick-meals.ts

// List user's quick meals
await listQuickMeals()

// Create quick meal
await createQuickMeal({
  name: 'Morning Protein Shake',
  description: 'Pre-workout fuel',
  foods: [
    { food_id: 'uuid', quantity: 2, serving_id: 'uuid', display_order: 0 }
  ]
})

// Log quick meal (creates full meal from template)
await logQuickMeal(quickMealId)
```

### **Data Flow**

```
User Opens Log Page
  ↓
Parallel Fetches: Quick Meals + Recent Foods
  ↓
User Searches Food
  ↓
Debounced Search (300ms) → API → Results Display
  ↓
User Selects Food → Modal (quantity, serving, preview)
  ↓
Add to Meal → Calculate Nutrition (frontend preview)
  ↓
User Edits Quantity → Recalculate Live
  ↓
User Logs Meal → Transform to CreateMealRequest
  ↓
Backend Calculates Final Values → Store in meal_items
  ↓
Navigate to /nutrition → Display logged meal
```

### **Type Safety**

```typescript
// Three food types with composition_type discriminator
export interface Food {
  id: string
  name: string
  composition_type: 'simple' | 'composed' | 'branded'
  calories_per_100g: number
  protein_g_per_100g: number
  carbs_g_per_100g: number
  fat_g_per_100g: number
  recipe_items?: Array<{ food_id: string; grams: number }> // For composed
  servings_count?: number // For composed
  composed_total_grams?: number // For composed
  servings: FoodServing[]
}

// Meal item preview (frontend only - before saving)
export interface MealItemPreview {
  food_id: string
  quantity: number
  unit: 'grams' | 'serving'
  serving_id?: string
  food: Food // Full food object for display
  serving?: FoodServing // Full serving object
  calculated_grams: number
  calculated_calories: number
  calculated_protein_g: number
  calculated_carbs_g: number
  calculated_fat_g: number
}

// Create meal request (sent to backend)
export interface CreateMealItemRequest {
  food_id: string
  quantity: number
  serving_id: string | null
  grams: number
  calories: number // Rounded to int
  protein_g: number // Rounded to 1 decimal
  carbs_g: number
  fat_g: number
  display_unit: string // 'g', 'scoop', 'serving', etc.
  display_label: string | null // 'large', 'small', etc.
}
```

### **Backend Services**

Located in `ULTIMATE_COACH_BACKEND/app/services/`:

```python
# nutrition_calculator.py - Core math engine
def calculate_simple_food_nutrition(food_data, grams)
def calculate_composed_food_nutrition(recipe_items, servings, get_food_by_id)
def calculate_food_nutrition(food_data, quantity, unit, serving_data, get_food_by_id)

# food_search.py - Unified search
async def search_foods(supabase, user_id, query, limit, include_recent)
# Returns: {quick_meals: [], recent_foods: [], foods: []}

# nutrition_service.py - Business logic
class NutritionService:
    async def search_foods(query, limit, user_id)
    async def get_food(food_id, user_id)
    async def get_recent_foods(user_id, limit) # NEW - Added for log page
    async def create_meal(user_id, meal_type, items, ...)
    async def get_nutrition_stats(user_id, date)
```

### **Responsive Design**

**Mobile (< 640px):**
- Full-width cards
- Touch targets ≥44px (Apple HIG standard)
- Single column layout
- Stack quick meals and recent foods vertically

**Tablet (640px - 768px):**
- Wider cards with more padding
- Side-by-side modals

**Desktop (≥ 768px):**
- Max-width containers
- Hover states on buttons
- More spacing

### **Design Consistency**

**Current State (⚠️ Needs Standardization):**
- Header: Uses `border-iron-gray/20` (vs activities: `border-iron-gray`)
- Cards: Uses `bg-iron-black/50 backdrop-blur-sm` (vs activities: `bg-iron-dark-gray`)
- Buttons: Uses `text-iron-black` on orange (vs activities: `text-iron-white`)

**Action Required:** Standardize card and button styles to match activities page for visual consistency.

### **Usage Example**

```typescript
// app/nutrition/log/page.tsx (simplified)
'use client'

import { useState, useEffect } from 'react'
import { searchFoods, getRecentFoods } from '@/lib/api/foods'
import { listQuickMeals, createQuickMeal, logQuickMeal } from '@/lib/api/quick-meals'
import { createMeal } from '@/lib/api/nutrition'
import { calculateFoodNutrition } from '@/lib/utils/nutrition-calculator'

export default function LogMealPage() {
  const [quickMeals, setQuickMeals] = useState([])
  const [recentFoods, setRecentFoods] = useState([])
  const [mealItems, setMealItems] = useState([])

  useEffect(() => {
    async function fetchData() {
      const [meals, recent] = await Promise.all([
        listQuickMeals(),
        getRecentFoods(10)
      ])
      setQuickMeals(meals)
      setRecentFoods(recent)
    }
    fetchData()
  }, [])

  const handleLogMeal = async () => {
    const items = mealItems.map(item => ({
      food_id: item.food_id,
      quantity: item.quantity,
      serving_id: item.serving_id || null,
      grams: item.calculated_grams,
      calories: Math.round(item.calculated_calories),
      protein_g: Math.round(item.calculated_protein_g * 10) / 10,
      carbs_g: Math.round(item.calculated_carbs_g * 10) / 10,
      fat_g: Math.round(item.calculated_fat_g * 10) / 10,
      display_unit: item.unit === 'grams' ? 'g' : item.serving?.serving_unit,
      display_label: item.serving?.serving_label || null,
    }))

    await createMeal({ meal_type: 'breakfast', items, source: 'manual' })
    router.push('/nutrition')
  }

  return (
    <div>
      {/* Quick Meals */}
      {quickMeals.map(qm => (
        <button onClick={() => logQuickMeal(qm.id)}>{qm.name}</button>
      ))}

      {/* Recent Foods */}
      {recentFoods.map(food => (
        <button onClick={() => handleSelectFood(food)}>{food.name}</button>
      ))}

      {/* Search, Meal Building, Log Button... */}
    </div>
  )
}
```

### **Status**
- ✅ Backend API complete (foods, meals, quick-meals, recent foods)
- ✅ Backend services complete (nutrition_calculator, food_search, nutrition_service)
- ✅ Frontend log page complete with all 6 features
- ✅ Frontend nutrition page complete with daily summary
- ✅ Type safety enforced throughout
- ✅ Mobile-optimized (44px touch targets)
- ⚠️ Card/button styling needs standardization with activities page
- ⚠️ Text hardcoded (i18n not implemented - will require refactor)
- ⏳ Meal editing (TODO in /nutrition page.tsx:68-70)
- ⏳ Components in app/components/nutrition/ (not moved to top-level components/)

---

## ⚠️ CRITICAL: Nutrition Logging Documentation (READ BEFORE MODIFYING)

### **Overview**
The nutrition logging system has comprehensive documentation to prevent bugs like the "100 banana" incident (where users could accidentally log 100 servings instead of 1). **ALWAYS read this documentation before modifying nutrition logging code.**

### **Documentation Files**

**📘 Complete Reference:**
- **Location:** `../../NUTRITION_LOGGING_ARCHITECTURE.md` (project root)
- **Length:** 800+ lines
- **Contents:**
  - System overview and design philosophy
  - Critical concepts (quantity semantic overload)
  - State management rules with 3 critical reset points
  - Complete data flow diagram
  - Frontend/backend contract specifications
  - Multi-layer validation requirements
  - Common bugs and prevention strategies
  - Testing checklist

**🚀 Quick Reference:**
- **Location:** `../../NUTRITION_LOGGING_QUICK_REFERENCE.md` (project root)
- **Length:** 200+ lines
- **Contents:**
  - TL;DR of critical concepts
  - Three reset rules with code examples
  - Validation checklist
  - Testing scenarios
  - Code locations table

### **When to Read This Documentation**
- ✅ Before modifying `app/nutrition/log/page.tsx`
- ✅ Before changing `lib/utils/nutrition-calculator.ts`
- ✅ Before updating nutrition API calls
- ✅ When debugging nutrition calculation issues
- ✅ When adding new food types or serving logic
- ✅ When a bug report mentions incorrect quantities or nutrition values

### **The One Concept You Must Understand**

**⚠️ CRITICAL: Quantity Semantic Overload**

The `quantity` field means **two different things** depending on context:

```typescript
// GRAMS MODE (serving_id = null)
quantity: 150  // = 150 grams of chicken breast

// SERVING MODE (serving_id = UUID)
quantity: 2    // = 2 servings of protein powder
```

**Why this causes bugs:**
- Modal opens with `quantity = 100` (default for grams)
- User switches to serving mode
- If `quantity` is NOT reset → user logs 100 servings instead of 1

### **The Three Critical Reset Rules**

These reset points are **MANDATORY** to prevent bugs:

#### **1. Reset When Opening Modal**
```typescript
// app/nutrition/log/page.tsx:145-160
const handleSelectFood = (food: Food) => {
  setSelectedFood(food)
  setModalQuantity(100)  // ← Default for grams
  setModalUnit('grams')
  setModalServing(food.servings?.[0] || null)
}
```

#### **2. Reset When Switching Modes**
```typescript
// app/nutrition/log/page.tsx:638-675
const handleSwitchToServing = () => {
  setModalUnit('serving')
  setModalQuantity(1)  // ← MUST RESET
}

const handleSwitchToGrams = () => {
  setModalUnit('grams')
  setModalQuantity(100)  // ← MUST RESET
}
```

#### **3. Reset When Selecting Serving (MOST CRITICAL)**
```typescript
// app/nutrition/log/page.tsx:721-750
const handleServingChange = (serving: FoodServing) => {
  setModalServing(serving)
  setModalQuantity(1)  // ← PREVENTS "100 BANANA" BUG
}
```

### **Multi-Layer Validation**

The system uses **four layers** of protection:

1. **HTML Input** (line 700): `max={modalUnit === 'serving' ? 20 : undefined}`
2. **Visual Warning** (lines 703-708): Yellow warning for `quantity > 10` servings
3. **Backend Warning** (nutrition_service.py:735): Logs warning for `quantity > 10`
4. **Backend Rejection** (nutrition_service.py:722): HTTP 400 for `quantity > 50`

### **Frontend/Backend Contract**

**Critical Principle:** "Calculate once, store forever"

- **Frontend:** Live preview for UX (user sees instant feedback)
- **Backend:** Authoritative calculations (recalculates everything at submission)
- **Database:** Immutable values (nutrition stored at creation time)

**Never trust frontend calculations.** Backend ALWAYS recalculates all nutrition values when creating meals (see nutrition_service.py:764-768).

### **Code References**

| Feature | File | Line(s) |
|---------|------|---------|
| Modal state init | app/nutrition/log/page.tsx | 54 |
| Food selection (Reset #1) | app/nutrition/log/page.tsx | 145-160 |
| Mode switch (Reset #2) | app/nutrition/log/page.tsx | 638-675 |
| Serving selection (Reset #3) | app/nutrition/log/page.tsx | 721-750 |
| Preview calculation | app/nutrition/log/page.tsx | 753-775 |
| HTML validation | app/nutrition/log/page.tsx | 700 |
| Visual warning | app/nutrition/log/page.tsx | 703-708 |
| Frontend calculator | lib/utils/nutrition-calculator.ts | 132-191 |
| API transformer | lib/utils/nutrition-transformer.ts | 13-76 |

### **Testing Checklist**

Before merging nutrition logging changes:

- [ ] All three quantity reset points present
- [ ] HTML max attribute on quantity input
- [ ] Visual warning for >10 servings
- [ ] Inline comments reference NUTRITION_LOGGING_ARCHITECTURE.md
- [ ] Test case: Select food → Switch to serving mode → quantity = 1 (NOT 100)
- [ ] Test case: Select food → Switch to serving → Select different serving → quantity = 1
- [ ] Test case: Try to enter 25 servings → Blocked by HTML max=20

### **Common Mistakes**

❌ **Mistake 1:** Forgetting reset on serving selection
```typescript
// WRONG - causes "100 banana" bug
const handleServingChange = (serving: FoodServing) => {
  setModalServing(serving)
  // Missing: setModalQuantity(1)
}
```

❌ **Mistake 2:** Trusting frontend calculations
```typescript
// WRONG - uses frontend values
const item = { calories: frontendCalculatedCalories }

// CORRECT - backend recalculates
// See nutrition_service.py:764-768
```

❌ **Mistake 3:** No validation
```typescript
// WRONG - no max attribute
<input type="number" value={quantity} />

// CORRECT - has max for servings
<input type="number" max={unit === 'serving' ? 20 : undefined} />
```

### **When in Doubt**

1. **Read the full documentation:** `NUTRITION_LOGGING_ARCHITECTURE.md`
2. **Check the inline comments:** Lines 14-26 in `app/nutrition/log/page.tsx`
3. **Ask:** Does `quantity` mean grams or servings here?
4. **Verify:** Are all three reset points present?
5. **Test:** Can I log 100 bananas by accident?

### **Key Principle**

> **"The quantity field is a semantic chameleon - it changes meaning based on context. Always reset it when the context changes."**

---

## Current State & Known Issues

### **✅ Production Ready**
- Landing page, auth pages, legal pages
- Activities tracking system (dashboard, components, API client)
- Nutrition logging system (log page, nutrition page, quick meals, recent foods) ⭐ NEW
- Design system fully implemented
- Error tracking configured (just add Sentry DSN)
- Environment validation (fails at build time if vars missing)
- Mobile-responsive layout
- TypeScript strict mode

### **⚠️ Functional But Needs Polish**
- Nutrition log page - works but styling inconsistent with activities page
- Nutrition log page - all text hardcoded (i18n will require refactor)
- Nutrition components in app/components/ instead of top-level components/

### **⚠️ Not Production Ready**
- Consultation page (uses placeholder API endpoints - currently hidden)
- i18n infrastructure (planned but not implemented)
- Activity logging page (placeholder at /activities/log)
- Activity edit page (not built yet)
- Meal edit page (not built yet)
- Dashboard pages (coach chat - not built yet)

### **Known Violations**
- `app/dashboard/consultation/page.tsx` uses hardcoded colors (slate-, blue-, purple-)
  - **Status:** Hidden from users, low priority
  - **Fix:** Refactor to use design tokens when ready to launch
- `app/nutrition/log/page.tsx` has hardcoded text (violates Rule #2)
  - **Status:** Functional, minor priority
  - **Fix:** Extract strings to i18n when implementing multi-language support

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
6. **CRITICAL:** Before modifying nutrition logging code, read:
   - `../../NUTRITION_LOGGING_ARCHITECTURE.md` (800+ lines)
   - `../../NUTRITION_LOGGING_QUICK_REFERENCE.md` (200+ lines)
   - See "⚠️ CRITICAL: Nutrition Logging Documentation" section above

**Common Mistakes to Avoid:**
- ❌ Adding Tailwind colors directly (use design tokens)
- ❌ Using `fetch()` instead of `apiClient`
- ❌ Adding `any` types instead of proper interfaces
- ❌ Desktop-first responsive design
- ❌ Creating new state management (use React hooks)
- ❌ Ignoring TypeScript errors
- ❌ Modifying nutrition logging without reading documentation
- ❌ Forgetting quantity reset points in nutrition modal
- ❌ Trusting frontend nutrition calculations (backend recalculates)

---

**Last Updated:** 2025-10-13
**Version:** 1.1.0 - Added Nutrition Logging System documentation
