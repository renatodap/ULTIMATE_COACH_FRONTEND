# Custom React Hooks

This directory contains all custom React hooks for the SHARPENED frontend. Hooks are organized by feature domain and follow consistent patterns.

## 📚 Table of Contents

- [Hook Organization](#hook-organization)
- [Data Fetching Hooks](#data-fetching-hooks)
- [Form & Input Hooks](#form--input-hooks)
- [UI State Hooks](#ui-state-hooks)
- [Nutrition Hooks](#nutrition-hooks)
- [Profile Hooks](#profile-hooks)
- [Best Practices](#best-practices)

---

## Hook Organization

### Naming Convention
```
use<Feature><Action>.ts
```

**Examples:**
- `useActivitiesData.ts` - Fetch activities data
- `useProfileFieldEditor.ts` - Edit profile fields
- `useNutritionSearch.ts` - Search for foods

### File Structure
```
lib/hooks/
├── README.md                      # This file
├── useActivitiesData.ts           # Activities data fetching
├── useDashboardData.ts            # Dashboard data aggregation
├── useNutritionData.ts            # Nutrition data fetching
├── useNutritionSearch.ts          # Food search with debouncing
├── useMealBuilder.ts              # Meal building state
├── useProfileFieldEditor.ts       # Profile editing logic
├── useOnboardingCheck.ts          # Onboarding status check
├── useScrollDirection.ts          # Scroll direction detection
└── useUserLanguage.ts             # i18n language management
```

---

## Data Fetching Hooks

### `useActivitiesData`
Fetches and manages activities data with daily summary.

```typescript
import { useActivitiesData } from '@/lib/hooks/useActivitiesData'

const {
  activities,
  dailySummary,
  loading,
  error,
  refreshActivities
} = useActivitiesData()
```

**Features:**
- Auto-fetches activities on mount
- Parallel fetches (activities + daily summary)
- Error handling with Sentry integration
- Manual refresh capability

**Use Cases:**
- Activities dashboard page
- Daily activity summary widgets

---

### `useNutritionData`
Fetches and manages nutrition data (meals + daily stats).

```typescript
import { useNutritionData } from '@/lib/hooks/useNutritionData'

const {
  meals,
  stats,
  loading,
  error,
  refreshData
} = useNutritionData({ date: '2025-11-04' })
```

**Features:**
- Fetches meals + nutrition stats for specific date
- Caches data by date
- Auto-refetch on date change
- Error handling

**Use Cases:**
- Nutrition dashboard page
- Daily nutrition summary

---

### `useDashboardData`
Aggregates data from multiple endpoints for dashboard.

```typescript
import { useDashboardData } from '@/lib/hooks/useDashboardData'

const {
  activities,
  nutrition,
  weight,
  loading,
  error,
  refresh
} = useDashboardData()
```

**Features:**
- Parallel fetches from multiple endpoints
- Loading states for individual sections
- Partial error handling (show available data)
- Global refresh

**Use Cases:**
- Main dashboard page
- Summary widgets

---

## Form & Input Hooks

### `useProfileFieldEditor`
Reusable logic for profile edit modals. **Reduces 2,400 LOC across 12 modals to ~300 LOC.**

```typescript
import { useProfileFieldEditor } from '@/lib/hooks/useProfileFieldEditor'

const { isSubmitting, handleSubmit, error, clearError } = useProfileFieldEditor({
  onSuccess: (profile) => setProfile(profile),
  onError: (msg) => toast.error(msg),
  onClose: () => setIsOpen(false),
  validate: (updates) => {
    // Optional custom validation
    if (!updates.primary_goal) {
      return 'Primary goal is required'
    }
    return null
  }
})

const onSubmit = (e: React.FormEvent) => {
  handleSubmit(e, {
    primary_goal: primaryGoal,
    activity_level: activityLevel,
  })
}
```

**Features:**
- Form submission with change detection
- Loading/error state management
- API integration
- Custom validation support
- Success/error callbacks

**Use Cases:**
- All 12 profile edit modals
- Settings forms
- Any profile update form

**Related Utilities:**
- `buildUpdatesWithChangeDetection()` - Only send changed fields
- `validateRequiredFields()` - Validate required fields
- `validateNumericRange()` - Validate numeric ranges

---

## Nutrition Hooks

### `useNutritionSearch`
Food search with debouncing and progressive disclosure. **Reduces nutrition/log page from 1,018 LOC to ~600 LOC.**

```typescript
import { useNutritionSearch } from '@/lib/hooks/useNutritionSearch'

const {
  searchQuery,
  setSearchQuery,
  searchResults,
  isSearching,
  showQuickMeals,
  showRecentFoods,
  clearSearch,
  searchError,
} = useNutritionSearch({
  quickMealsCount: quickMeals.length,
  recentFoodsCount: recentFoods.length,
  minQueryLength: 2,
  debounceMs: 300,
  maxResults: 20,
})
```

**Features:**
- Debounced search (default: 300ms)
- Progressive disclosure (hides quick meals/recent when searching)
- Loading state
- Error handling
- Configurable min query length

**Use Cases:**
- Nutrition log page
- Food selection modals
- Meal planning interfaces

**Alternative:** `useSimpleFoodSearch()` - Simpler version without progressive disclosure

---

### `useMealBuilder`
Meal building state management with inline editing.

```typescript
import { useMealBuilder } from '@/lib/hooks/useMealBuilder'

const {
  mealItems,
  addItem,
  removeItem,
  updateItemQuantity,
  totals,
  clearMeal,
  hasItems,
  isValid,
  editingIndex,
  startEditing,
  stopEditing,
} = useMealBuilder()
```

**Features:**
- Add/remove/edit meal items
- Running totals (calories, protein, carbs, fat)
- Inline quantity editing
- Meal validation

**Use Cases:**
- Nutrition log page
- Edit meal page
- Meal planning interfaces

**Related Utilities:**
- `transformMealItemsForAPI()` - Transform items for API request
- `meetsMinimumCalories()` - Validate minimum calorie threshold
- `checkMacroBalance()` - Check if meal is balanced

---

## UI State Hooks

### `useScrollDirection`
Detects scroll direction for auto-hiding UI elements.

```typescript
import { useScrollDirection } from '@/lib/hooks/useScrollDirection'

const scrollDirection = useScrollDirection() // 'up' | 'down'

// Use in bottom nav
<BottomNav className={scrollDirection === 'down' ? 'translate-y-full' : 'translate-y-0'} />
```

**Features:**
- Throttled scroll listener (requestAnimationFrame)
- 80px scroll threshold
- 'up' | 'down' return value

**Use Cases:**
- Auto-hiding bottom navigation
- Sticky headers
- Floating action buttons

---

### `useOnboardingCheck`
Checks if user has completed onboarding.

```typescript
import { useOnboardingCheck } from '@/lib/hooks/useOnboardingCheck'

const { onboardingComplete, loading } = useOnboardingCheck()

if (!onboardingComplete && !loading) {
  router.push('/onboarding')
}
```

**Features:**
- Auto-redirect to onboarding if incomplete
- Loading state
- Caches result

**Use Cases:**
- Protected route guards
- Conditional rendering based on onboarding status

---

## Profile Hooks

### `useUserLanguage`
Manages user language preference (i18n).

```typescript
import { useUserLanguage } from '@/lib/hooks/useUserLanguage'

const { language, setLanguage, loading } = useUserLanguage()
```

**Features:**
- Fetches user language preference
- Updates language in profile
- Integrates with i18n system (when implemented)

**Use Cases:**
- Language selector
- i18n initialization

**Status:** Partial implementation (i18n not yet live)

---

## Best Practices

### 1. Hook Naming
✅ **DO:**
```typescript
useActivitiesData()    // Clear: fetches activities
useNutritionSearch()   // Clear: searches nutrition
useProfileFieldEditor() // Clear: edits profile fields
```

❌ **DON'T:**
```typescript
useData()              // Too generic
useForm()              // Too vague
useStuff()             // Meaningless
```

---

### 2. Return Type Consistency
Always define explicit return types:

```typescript
export interface UseFeatureReturn {
  data: Data[]
  loading: boolean
  error: Error | null
  refresh: () => void
}

export function useFeature(): UseFeatureReturn {
  // ...
}
```

---

### 3. Options Pattern
For configurable hooks, use options object:

```typescript
export interface UseFeatureOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: Data) => void
}

export function useFeature(options?: UseFeatureOptions) {
  // ...
}
```

---

### 4. Error Handling
Always handle errors gracefully:

```typescript
try {
  const data = await fetchData()
  setData(data)
} catch (err) {
  const error = err instanceof Error ? err : new Error('Unknown error')
  setError(error)
  console.error('Failed to fetch data:', error)

  // Optional: Send to Sentry
  captureException(error, { context: 'useFeature' })
}
```

---

### 5. Cleanup
Always cleanup effects:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    // Do something
  }, 300)

  return () => clearTimeout(timer) // Cleanup!
}, [dependency])
```

---

### 6. Memoization
Memoize expensive calculations:

```typescript
const totals = useMemo(() => {
  return items.reduce((acc, item) => ({
    calories: acc.calories + item.calories,
    protein: acc.protein + item.protein,
  }), { calories: 0, protein: 0 })
}, [items])
```

---

### 7. Callback Stability
Memoize callbacks to prevent unnecessary re-renders:

```typescript
const handleSubmit = useCallback(async () => {
  // Submit logic
}, [dependency1, dependency2])
```

---

### 8. Testing
All hooks should be testable in isolation:

```typescript
// __tests__/useFeature.test.ts
import { renderHook, act } from '@testing-library/react'
import { useFeature } from '../useFeature'

describe('useFeature', () => {
  it('fetches data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFeature())

    expect(result.current.loading).toBe(true)
    await waitForNextUpdate()
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toHaveLength(5)
  })
})
```

---

## Migration Guide

### Moving from Page Logic to Hook

**Before (1018 LOC page):**
```typescript
export default function LogMealPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)

  useEffect(() => {
    if (searchQuery.length < 2) return

    const timer = setTimeout(async () => {
      setSearching(true)
      const results = await searchFoods(searchQuery, 20)
      setSearchResults(results)
      setSearching(false)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // ... 1000 more lines
}
```

**After (600 LOC page with hook):**
```typescript
export default function LogMealPage() {
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useNutritionSearch({
    quickMealsCount: quickMeals.length,
    recentFoodsCount: recentFoods.length,
  })

  // ... 600 more lines (clean and focused)
}
```

---

## Contributing

### Adding a New Hook

1. **Create file:** `lib/hooks/useFeatureName.ts`
2. **Add JSDoc:** Comprehensive documentation with usage examples
3. **Export types:** Define clear interfaces for options and return values
4. **Add tests:** Create `__tests__/useFeatureName.test.ts`
5. **Update README:** Add hook to this document
6. **Update exports:** Add to `lib/hooks/index.ts` (if exists)

### Hook Template

```typescript
/**
 * useFeatureName Hook
 *
 * Brief description of what the hook does.
 *
 * Features:
 * - Feature 1
 * - Feature 2
 *
 * Benefits:
 * - Benefit 1
 * - Benefit 2
 *
 * Usage:
 * ```typescript
 * const { data, loading } = useFeatureName({ option: value })
 * ```
 */

import { useState, useEffect } from 'react'

export interface UseFeatureNameOptions {
  // Options
}

export interface UseFeatureNameReturn {
  // Return type
}

export function useFeatureName(
  options: UseFeatureNameOptions
): UseFeatureNameReturn {
  // Implementation
}
```

---

## Performance Tips

1. **Avoid unnecessary re-renders:** Use `useMemo`, `useCallback`
2. **Debounce expensive operations:** Search, API calls
3. **Cleanup timers:** Always return cleanup function from `useEffect`
4. **Throttle scroll listeners:** Use `requestAnimationFrame`
5. **Lazy load data:** Don't fetch everything on mount
6. **Cache results:** Use React Query or custom caching

---

## Questions?

For questions about hooks:
- Check inline JSDoc in hook files
- Review usage examples in pages
- Consult CLAUDE.md for architecture patterns
- Ask in team chat

---

**Last Updated:** 2025-11-04
**Maintainer:** Frontend Team
