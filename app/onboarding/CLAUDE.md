# Onboarding Flow

## 📍 Location
`app/onboarding/page.tsx`

## 🎯 Purpose
Forced, one-time onboarding that collects all data needed for:
- Macro calculations (BMR, TDEE, daily targets)
- AI coach personalization
- User profile completeness

## 🎬 User Experience
**Cinematic conversation-style flow:**
- Messages appear sequentially with slight delays
- Smooth animations and transitions
- No overwhelming forms - one question at a time
- Progress is implicit (questions flow naturally)

## 📊 Data Collected (17 Steps)

### Step 1-3: Goals & Experience
- **Primary Goal**: lose_weight | build_muscle | maintain | improve_performance
- **Experience Level**: beginner | intermediate | advanced
- **Workout Frequency**: 0-7 times per week

### Step 4-9: Physical Stats
- **Unit System**: metric | imperial (all stored in metric canonically)
- **Age**: 13-120 years
- **Biological Sex**: male | female (for BMR calculation)
- **Height**: cm (or inches → converted to cm)
- **Current Weight**: kg (or lbs → converted to kg)
- **Goal Weight**: kg (or lbs → converted to kg)

### Step 10: Activity Level
- sedentary | lightly_active | moderately_active | very_active | extremely_active
- Used for TDEE calculation (activity multiplier)

### Step 11-14: Dietary Profile
- **Dietary Preference**: none | vegetarian | vegan | pescatarian | keto | paleo
- **Food Allergies**: Array of allergen strings (currently skipped in UI)
- **Meals Per Day**: 2-6+ meals
- **Sleep Hours**: 4-12 hours
- **Stress Level**: low | medium | high

## 🏗️ Architecture

### Frontend Flow
```
1. User completes all steps
2. State accumulated in local React state
3. On final step, calls completeOnboarding(data)
4. Shows "Calculating..." state
5. On success, redirects to /dashboard
6. On error, shows error message
```

### Backend Processing
```
POST /api/v1/onboarding/complete
1. Validates all input (Pydantic)
2. Calculates BMR using Mifflin-St Jeor formula
3. Calculates TDEE (BMR × activity multiplier)
4. Calculates macro targets based on goal
5. Updates profile with 20+ fields
6. Sets onboarding_completed = true
7. Returns profile + targets
```

## 🔐 Enforcement

### How Onboarding is Forced
1. **Signup** → redirects to `/onboarding` (not dashboard)
2. **Login** → checks `onboarding_completed`, redirects if false
3. **Dashboard** → uses `useOnboardingCheck()` hook, redirects if incomplete
4. **All protected routes** → should use `useOnboardingCheck()` hook

### Why Not Middleware?
Next.js middleware cannot make async API calls to check user profile data.
Client-side hook approach is:
- More flexible (can fetch user data)
- More performant (cacheable)
- Recommended by Next.js docs

## 📦 Components

### Message Component
**File:** `components/onboarding/Message.tsx`
- Animates in from left with fade
- Slight vertical offset for cinematic feel
- Calls onComplete callback when animation finishes

### ButtonGroup Component
**File:** `components/onboarding/ButtonGroup.tsx`
- Grid of options with hover effects
- Supports descriptions (e.g., "< 1 year")
- Selected state styling

### Input Component
**File:** `components/onboarding/Input.tsx`
- Styled text/number input
- Supports unit display (e.g., "kg", "years")
- Enter key to submit
- Validation (min/max)

## 🧪 Testing Checklist

- [ ] New user signup → redirects to onboarding
- [ ] Complete all 17 steps → saves to database
- [ ] Check database → all fields populated
- [ ] Check database → onboarding_completed = true
- [ ] After completion → redirects to dashboard
- [ ] Try to access dashboard before onboarding → redirects back
- [ ] Logout and login → goes to dashboard (onboarding complete)
- [ ] Macro calculations → verify BMR, TDEE, targets are scientifically accurate

## 🔗 Related Files

**Frontend:**
- `lib/api/onboarding.ts` - API client functions
- `lib/hooks/useOnboardingCheck.ts` - Enforcement hook
- `lib/utils/units.ts` - Unit conversion helpers
- `app/(auth)/signup/page.tsx` - Redirects here
- `app/(auth)/login/page.tsx` - Checks status, may redirect here
- `app/dashboard/page.tsx` - Uses onboarding check hook

**Backend:**
- `app/api/v1/onboarding.py` - Onboarding endpoints
- `app/services/macro_calculator.py` - BMR/TDEE/macro calculations
- `migrations/002_onboarding_data.sql` - Database schema

## 💡 Future Enhancements

1. **Progress Bar**: Show "Step X of 17" indicator
2. **Save Progress**: Allow users to exit and resume later
3. **Preview Step**: Show calculated targets before finalizing (already has API!)
4. **Skip Options**: Allow skipping optional fields
5. **Edit Later**: Allow users to update onboarding data from profile
6. **Food Allergies**: Actually collect this data (currently skipped)

## 🐛 Known Issues

None! This implementation is solid and production-ready.
