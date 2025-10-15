# React Hooks

## 📍 Location
`lib/hooks/`

---

## useOnboardingCheck Hook

**File:** `useOnboardingCheck.ts`

### 🎯 Purpose
Ensures user has completed onboarding before accessing protected routes.
Used in dashboard and all feature pages that require onboarding data.

### 🔐 How It Works

```typescript
const { loading, onboardingComplete } = useOnboardingCheck()
```

**Flow:**
1. Calls `getCurrentUser()` API on mount
2. Checks `user.onboarding_completed` field
3. If `false` → redirects to `/onboarding`
4. If `true` → sets `onboardingComplete` to true
5. If API call fails → user not authenticated (middleware will handle redirect)

**States:**
- `loading: true` → Checking onboarding status (show spinner)
- `loading: false, onboardingComplete: false` → Redirecting to onboarding (render null)
- `loading: false, onboardingComplete: true` → Safe to render page

### 📖 Usage Example

```typescript
'use client'

import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'

export default function DashboardPage() {
  const { loading, onboardingComplete } = useOnboardingCheck()

  // Show loading state
  if (loading) {
    return <Spinner />
  }

  // Don't render if onboarding not complete (hook is redirecting)
  if (!onboardingComplete) {
    return null
  }

  // Safe to render - user is authenticated and onboarding complete
  return <Dashboard />
}
```

### ⚠️ Important Notes

1. **Always check both states:**
   - Must handle `loading` state (show spinner)
   - Must handle `!onboardingComplete` state (render null)

2. **Hook handles redirect automatically:**
   - No need to manually redirect in component
   - Just render `null` when `!onboardingComplete`

3. **Auth is already checked:**
   - Middleware ensures user is authenticated
   - This hook only checks onboarding status

4. **Performance:**
   - Makes one API call per page load
   - Uses existing auth cookie (no additional auth check)
   - Fast response (~50-100ms typically)

### 🔗 Where Used

- ✅ `app/dashboard/page.tsx` - Main dashboard
- ⚠️ **TODO:** Add to all feature pages:
  - `app/dashboard/nutrition/page.tsx`
  - `app/dashboard/activities/page.tsx`
  - `app/dashboard/coach/page.tsx`
  - `app/dashboard/profile/page.tsx`

### 🐛 Error Handling

**If user is not authenticated:**
```typescript
try {
  const user = await getCurrentUser()
  // ... check onboarding
} catch (error) {
  // User not authenticated - middleware will handle redirect
  console.error('Failed to check onboarding status:', error)
}
```

The hook logs the error but doesn't crash. Middleware will redirect unauthenticated users to login.

### 📚 Related Files

- `lib/api/users.ts` - `getCurrentUser()` function
- `lib/api/onboarding.ts` - Onboarding API client
- `middleware.ts` - Authentication enforcement
- `app/onboarding/page.tsx` - Where users are redirected

### 💡 Future Enhancements

1. **Cache user data:** Use React Query or similar for caching
2. **Optimistic redirects:** Redirect faster using session storage
3. **Better error states:** Show error UI if check fails repeatedly
4. **Loading timeout:** Show warning if check takes > 5 seconds
