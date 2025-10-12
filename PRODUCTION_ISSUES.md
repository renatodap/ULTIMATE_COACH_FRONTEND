# Production Issues - SHARPENED

This document tracks known issues that need to be addressed before or shortly after production launch.

## Critical Issues

### 1. Consultation Page - Placeholder API Endpoints

**File:** `app/dashboard/consultation/page.tsx`
**Lines:** 61-62, 111-112

**Problem:**
- Two API endpoints are placeholders with TODO comments:
  - `/api/consultation/start` (line 62)
  - `/api/consultation/message` (line 112)
- These endpoints don't exist in the backend yet

**Impact:**
- Feature appears complete in UI but will fail when users try to use it
- Will result in 404 errors and broken consultation flow

**Fix Required:**
- Implement backend endpoints in `app/api/v1/`
- Or remove/hide this feature until backend is ready

**Status:** NOT PRODUCTION-READY

---

### 2. Consultation Page - Design System Violations

**File:** `app/dashboard/consultation/page.tsx`
**Lines:** Throughout file (159, 183-184, 192, 199-200, 228, 288-289, 342, 348, 366-371, 394-395, 424, 483, 488)

**Problem:**
- Entire consultation UI uses hardcoded Tailwind colors:
  - `slate-` (slate-950, slate-900, slate-800, slate-700, slate-500, slate-400, slate-300, slate-100)
  - `blue-` (blue-500, blue-600, blue-400, blue-300)
  - `purple-` (purple-500, purple-600, purple-400)
  - `amber-` (amber-500, amber-400, amber-200)
  - `red-` (red-500, red-400)

**Why It Matters:**
- Violates DEVELOPMENT_GUIDE.md Rule #1: "Never hardcode colors - use design tokens"
- Won't respect design system changes or rebrand updates
- Inconsistent with rest of app (landing, auth, legal pages all use `iron-` tokens)
- Creates maintenance debt

**Fix Required:**
- Refactor all hardcoded colors to use design tokens from `lib/design-system/tokens.ts`
- Use `iron-black`, `iron-white`, `iron-orange`, `iron-gray`, `iron-dark-gray`
- Or create new semantic tokens if specific colors are needed

**Status:** WORKS BUT VIOLATES STANDARDS

---

## Moderate Issues

### 3. Sentry Error Tracking (READY - Just Need DSN)

**Status:** ✅ CONFIGURED - Just add DSN to environment variables

**Files Configured:**
- `lib/sentry.ts` - Complete Sentry configuration
- `app/error.tsx` - Sends errors to Sentry
- `components/ErrorBoundary.tsx` - Sends errors to Sentry
- `app/layout.tsx` - Initializes Sentry
- `app/main.py` - Backend Sentry integration

**What You Need To Do:**
1. Create free Sentry account at https://sentry.io
2. Create two projects: "sharpened-frontend" and "sharpened-backend"
3. Copy DSN from each project
4. Add to environment variables:
   ```bash
   # Frontend
   NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id

   # Backend
   SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
   ```
5. See `SENTRY_SETUP.md` for detailed instructions

**Features Enabled:**
- Automatic error capture (frontend & backend)
- Session replay (see what user was doing when error occurred)
- Performance monitoring
- User context tracking
- Smart filtering (ignores browser extensions, etc.)

**Time Required:** 5 minutes setup

---

### 4. Consultation Session State Not Persisted

**File:** `app/dashboard/consultation/page.tsx`

**Problem:**
- Session ID and conversation messages live only in React component state
- No persistence to localStorage or database
- No recovery mechanism

**Impact:**
- User refreshes page → loses entire conversation
- No way to resume consultation sessions
- Poor UX for paid premium feature

**Fix Required:**
- Add localStorage persistence for session state
- Or save to backend/database after each message
- Add session recovery on page load

**Status:** SHOULD FIX BEFORE LAUNCH

---

### 5. Missing i18n Infrastructure

**Problem:**
- DEVELOPMENT_GUIDE.md Rule #2 says "Never hardcode text - use i18n"
- But no i18n implementation exists (`lib/hooks/useTranslation.ts` missing)
- All text is hardcoded English throughout the app

**Impact:**
- Can't add other languages without major refactor
- Will need to touch hundreds of files to add i18n later
- Technical debt accumulation

**Fix Required:**
- Implement i18n infrastructure (next-intl or similar)
- Create `lib/i18n/` folder structure
- Create translation files (`en.json`, etc.)
- Implement `useTranslation` hook
- Gradually refactor hardcoded strings

**Status:** CAN LAUNCH WITHOUT, BUT PAINFUL TO ADD LATER

**Estimated Effort:** 3-5 days

---

## Backend Issues

### 6. Backend Routers Incomplete

**File:** `app/main.py`
**Lines:** 148-152

**Problem:**
```python
# Future routers will be added here:
# from app.api.v1 import nutrition, activities, coach
# app.include_router(nutrition.router, prefix="/api/v1", tags=["Nutrition"])
# app.include_router(activities.router, prefix="/api/v1", tags=["Activities"])
# app.include_router(coach.router, prefix="/api/v1", tags=["AI Coach"])
```

**Impact:**
- Frontend may call endpoints that don't exist yet
- Unclear what features are actually implemented
- Risk of silent failures

**Fix Required:**
- Implement remaining routers or document what's not ready
- Update API documentation

**Status:** NEEDS CLARITY

---

### 7. CORS Too Permissive for Production

**File:** `app/main.py`
**Lines:** 90-96

**Problem:**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],  # ⚠️ Too permissive
    allow_headers=["*"],  # ⚠️ Too permissive
)
```

**Impact:**
- Security risk - allows all HTTP methods and headers
- Should restrict to only what's needed

**Fix Required:**
- Change `allow_methods` to `["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]`
- Change `allow_headers` to specific list:
  ```python
  allow_headers=["Content-Type", "Authorization", "X-Requested-With"]
  ```

**Status:** SHOULD TIGHTEN BEFORE PRODUCTION

---

## Documentation Gaps

### 8. Missing API Documentation

**Problem:**
- No OpenAPI/Swagger documentation examples
- No endpoint descriptions or request/response schemas documented
- Only `/docs` in dev mode

**Impact:**
- Hard to onboard new developers
- Frontend devs don't know what endpoints exist
- No API contract definition

**Fix Required:**
- Add docstrings to all FastAPI route functions
- Document request/response models
- Create API documentation page

**Status:** SHOULD HAVE FOR TEAM SCALING

---

## Security Reminders

### 9. Environment Variables in Production

**Status:** ✅ FIXED - Now validates in production builds

- Environment validation added back to `lib/env.ts`
- Will fail build if required vars missing
- Clear error messages point to setup guide

---

### 10. Support Email Standardization

**Status:** ✅ FIXED - All using `persimmonautomation@gmail.com`

- Fixed inconsistent support emails across 6 files
- All now use: `persimmonautomation@gmail.com`
- Consistent with SHARPENED branding

---

## Summary

**Must Fix Before Production:**
1. ✅ Environment validation (FIXED)
2. ✅ Support email standardization (FIXED)
3. ✅ Error tracking configured (READY - just add Sentry DSN)
4. ⚠️ Remove consultation TODOs or implement endpoints (ALREADY HIDDEN)

**Should Fix Soon After Launch:**
5. Fix consultation page design token violations
6. Add session persistence for consultation
7. Tighten CORS in production
8. Complete backend routers or document gaps

**Can Defer:**
9. Implement i18n infrastructure (painful to add later)
10. Add API documentation
11. Refactor consultation page architecture

---

**Last Updated:** 2025-10-12
**Next Review:** Before production deployment
