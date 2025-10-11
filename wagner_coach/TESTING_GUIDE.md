# Adaptive Dashboard Testing Guide

**Status:** Phase 9 - Testing & Polish
**Date:** October 11, 2025
**Phases Completed:** 1-8 ✅

---

## Testing Checklist

### 1. Backend API Testing ✅

#### Dashboard Context Endpoint

**Test 1: GET /api/v1/dashboard/context**
```bash
# Test authenticated request
curl -X GET "http://localhost:8000/api/v1/dashboard/context" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with complete context
# Verify: user, program, events objects all present
# Verify: streakDays calculated correctly
# Verify: auto-detection works (weight tracking if 2+ logs in 14 days)
```

**Test 2: Streak Calculation**
```sql
-- Insert consecutive meal logs
INSERT INTO meal_logs (user_id, logged_at, meal_type, calories)
VALUES
  ('USER_ID', NOW(), 'breakfast', 400),
  ('USER_ID', NOW() - INTERVAL '1 day', 'lunch', 500),
  ('USER_ID', NOW() - INTERVAL '2 days', 'dinner', 600);

-- Call /context endpoint
-- Expected: streakDays = 3
```

**Test 3: Program Context**
```sql
-- Insert active program
INSERT INTO programs (user_id, program_name, start_date, status)
VALUES ('USER_ID', 'Test Program', NOW() - INTERVAL '5 days', 'active');

-- Call /context endpoint
-- Expected: program.dayNumber = 6, program.weekNumber = 1
```

**Test 4: Error Handling**
```bash
# Test without JWT token
curl -X GET "http://localhost:8000/api/v1/dashboard/context"

# Expected: 401 Unauthorized

# Test with invalid token
curl -X GET "http://localhost:8000/api/v1/dashboard/context" \
  -H "Authorization: Bearer INVALID_TOKEN"

# Expected: 401 Unauthorized
```

#### Behavior Logging Endpoints

**Test 5: POST /api/v1/dashboard/behavior**
```bash
curl -X POST "http://localhost:8000/api/v1/dashboard/behavior" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "signal_type": "dashboard_open",
    "signal_value": "balanced",
    "metadata": {"timestamp": "2025-10-11T10:30:00Z"}
  }'

# Expected: 201 Created
# Verify: Row inserted in behavior_signals table
```

**Test 6: POST /api/v1/dashboard/app-open**
```bash
curl -X POST "http://localhost:8000/api/v1/dashboard/app-open" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "notification",
    "time_of_day": "morning"
  }'

# Expected: 201 Created
# Verify: Row inserted in app_opens table
```

**Test 7: PUT /api/v1/dashboard/preference**
```bash
curl -X PUT "http://localhost:8000/api/v1/dashboard/preference" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"preference": "detailed"}'

# Expected: 200 OK
# Verify: profiles.dashboard_preference updated
```

#### Notification Endpoints

**Test 8: GET /api/v1/notifications/analyze**
```bash
curl -X GET "http://localhost:8000/api/v1/notifications/analyze?days=14" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Expected: 200 OK with patterns_detected array
# Verify: Patterns have confidence scores
# Verify: Recommended times are valid (HH:MM format)
```

**Test 9: POST /api/v1/notifications/schedule**
```bash
curl -X POST "http://localhost:8000/api/v1/notifications/schedule" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "enabled": true,
    "notification_time": "07:00",
    "timezone": "America/New_York",
    "days_of_week": [1, 2, 3, 4, 5],
    "notification_type": "daily_reminder"
  }'

# Expected: 201 Created
# Verify: Row inserted in notification_schedules table
```

**Test 10: Pattern Detection Logic**
```sql
-- Insert 14 app opens at 7am
DO $$
BEGIN
  FOR i IN 0..13 LOOP
    INSERT INTO app_opens (user_id, opened_at, time_of_day)
    VALUES (
      'USER_ID',
      (NOW() - (i || ' days')::INTERVAL) + TIME '07:15:00',
      'morning'
    );
  END LOOP;
END $$;

-- Call /notifications/analyze
-- Expected: Pattern detected with confidence >= 0.9
-- Expected: Recommended time = 07:10 (5 min before 07:15)
```

---

### 2. Frontend Testing ✅

#### Dashboard Page Tests

**Test 11: Dashboard Loads with Auth**
```typescript
// Navigate to /dashboard while logged in
// Expected: Dashboard loads without errors
// Expected: Loading skeleton shows briefly
// Expected: Cards render based on user context
// Expected: No console errors
```

**Test 12: Dashboard Variant Detection**
```sql
-- Set user preference
UPDATE profiles SET dashboard_preference = 'simple' WHERE id = 'USER_ID';

-- Reload /dashboard
-- Expected: Header shows "Your next action awaits"
// Expected: NextActionCard visible (Simple only)
// Expected: TodaysPlanCard NOT visible (Balanced/Detailed only)
```

**Test 13: Conditional Card Rendering**
```sql
-- Test consultation banner
UPDATE profiles SET has_completed_consultation = FALSE WHERE id = 'USER_ID';
-- Reload dashboard
-- Expected: Red consultation banner at top

-- Test streak card
INSERT INTO meal_logs (user_id, logged_at, meal_type, calories)
VALUES ('USER_ID', NOW() - (generate_series(0, 4) || ' days')::INTERVAL, 'breakfast', 400);
-- Reload dashboard
-- Expected: Streak card shows "5 day streak"

-- Test weight card auto-detection
INSERT INTO weight_logs (user_id, weight, logged_at)
VALUES
  ('USER_ID', 180, NOW()),
  ('USER_ID', 179, NOW() - INTERVAL '7 days');
-- Reload dashboard
-- Expected: Weight card appears (auto-detected)
```

**Test 14: Behavior Tracking**
```typescript
// Open dashboard
// Open DevTools → Network tab
// Expected: POST request to /api/v1/dashboard/behavior
// Expected: signal_type = "dashboard_open"
// Expected: Request succeeds (200 or 201)
```

**Test 15: Error Handling**
```typescript
// Stop backend server
// Navigate to /dashboard
// Expected: Error message "Unable to load dashboard"
// Expected: "Retry" button appears
// Click Retry
// Expected: Retry attempts to fetch context again
```

#### Profile Page Tests

**Test 16: Dashboard Settings Card**
```typescript
// Navigate to /profile
// Scroll to "Dashboard Settings" section
// Expected: Current preference is selected (radio button checked)
// Expected: Card visibility toggles reflect database state
// Expected: "Save Changes" button disabled initially

// Change preference from "balanced" to "detailed"
// Expected: "Save Changes" button enabled
// Expected: Orange text "You have unsaved changes"

// Click "Save Changes"
// Expected: Toast notification "Settings saved!"
// Expected: Button disabled again
// Refresh page
// Expected: "detailed" preference persisted
```

**Test 17: Card Visibility Toggles**
```typescript
// Toggle "Weight Tracking Card" ON
// Click "Save Changes"
// Navigate to /dashboard
// Expected: Weight card appears (even if no weight logs)

// Return to /profile
// Toggle "Weight Tracking Card" OFF
// Click "Save Changes"
// Navigate to /dashboard
// Expected: Weight card hidden (unless auto-detected)
```

**Test 18: Reset to Auto-Detect**
```typescript
// Navigate to /profile
// Change preference to "detailed"
// Toggle multiple cards ON
// Click "Reset to Auto-Detect"
// Expected: Toast notification "Settings reset!"
// Expected: Preference back to "balanced"
// Expected: All toggles reset to defaults
// Expected: Dashboard will adapt based on behavior
```

---

### 3. Database Testing ✅

**Test 19: RLS Policies**
```sql
-- Login as user1
SELECT * FROM behavior_signals;
-- Expected: Only user1's rows returned

-- Try to access user2's data
SELECT * FROM behavior_signals WHERE user_id = 'USER2_ID';
-- Expected: Empty result (RLS blocks)

-- Try to insert with wrong user_id
INSERT INTO behavior_signals (user_id, signal_type, signal_value)
VALUES ('USER2_ID', 'dashboard_open', 'test');
-- Expected: Error (RLS policy violation)
```

**Test 20: Triggers**
```sql
-- Insert notification schedule
INSERT INTO notification_schedules (user_id, enabled, notification_time)
VALUES ('USER_ID', true, '07:00:00');

-- Check created_at and updated_at
SELECT created_at, updated_at FROM notification_schedules WHERE user_id = 'USER_ID';
-- Expected: Both timestamps equal

-- Update schedule
UPDATE notification_schedules SET enabled = false WHERE user_id = 'USER_ID';

-- Check updated_at
SELECT created_at, updated_at FROM notification_schedules WHERE user_id = 'USER_ID';
-- Expected: updated_at > created_at
```

**Test 21: Constraints**
```sql
-- Test invalid dashboard preference
UPDATE profiles SET dashboard_preference = 'invalid' WHERE id = 'USER_ID';
-- Expected: Error (CHECK constraint)

-- Test invalid notification type
INSERT INTO notification_schedules (user_id, notification_type, notification_time)
VALUES ('USER_ID', 'invalid_type', '07:00:00');
-- Expected: Error (CHECK constraint)

-- Test confidence range
INSERT INTO notification_schedules (user_id, detection_confidence, notification_time)
VALUES ('USER_ID', 1.5, '07:00:00');
-- Expected: Error (CHECK constraint 0.0-1.0)
```

---

### 4. Performance Testing ✅

**Test 22: API Response Times**
```bash
# Install apache benchmark
# apt-get install apache2-utils

# Test dashboard context endpoint (100 requests)
ab -n 100 -c 10 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8000/api/v1/dashboard/context

# Expected metrics:
# - Mean response time: <200ms
# - 95th percentile: <500ms
# - No failed requests
```

**Test 23: Streak Calculation Performance**
```sql
-- Insert 60 days of meal logs (worst case)
INSERT INTO meal_logs (user_id, logged_at, meal_type, calories)
SELECT
  'USER_ID',
  NOW() - (generate_series(1, 60) || ' days')::INTERVAL,
  'breakfast',
  400;

-- Time the query
EXPLAIN ANALYZE
SELECT DISTINCT DATE(logged_at) as log_date
FROM meal_logs
WHERE user_id = 'USER_ID'
  AND logged_at >= NOW() - INTERVAL '60 days'
ORDER BY log_date DESC;

-- Expected: Execution time < 100ms
-- Verify: Index on (user_id, logged_at) is used
```

**Test 24: Dashboard Load Time**
```typescript
// Open Chrome DevTools → Performance tab
// Start recording
// Navigate to /dashboard
// Stop recording

// Expected metrics:
// - First Contentful Paint (FCP): <1.5s
// - Largest Contentful Paint (LCP): <2.5s
// - Time to Interactive (TTI): <3.5s
// - Cumulative Layout Shift (CLS): <0.1
```

---

### 5. Accessibility Testing ✅

**Test 25: Keyboard Navigation**
```typescript
// Navigate to /dashboard
// Press Tab repeatedly
// Expected: Focus moves through all interactive elements
// Expected: Focus indicators visible (blue ring)
// Expected: Can activate buttons with Enter key
// Expected: Can toggle switches with Space key
// Expected: No keyboard traps
```

**Test 26: Screen Reader Testing (VoiceOver/NVDA)**
```typescript
// Enable VoiceOver (Mac) or NVDA (Windows)
// Navigate to /dashboard
// Expected: Page title announced
// Expected: Card titles announced
// Expected: Button labels announced (not just "button")
// Expected: Images have alt text or aria-label
// Expected: Form inputs have associated labels
```

**Test 27: Color Contrast**
```typescript
// Open Chrome DevTools → Lighthouse
// Run Accessibility audit
// Expected: 100 score
// Expected: No color contrast issues
// Verify: Text on iron-gray background has 4.5:1 ratio
// Verify: Iron-orange on iron-black has 3:1 ratio (UI elements)
```

**Test 28: Focus Management**
```typescript
// Navigate to /profile
// Click "Save Changes" button
// Expected: Toast notification appears
// Expected: Focus returns to button (not lost)
// Expected: Toast is announced by screen reader

// Open modal/dialog (if any)
// Press Escape
// Expected: Modal closes
// Expected: Focus returns to trigger element
```

---

### 6. Mobile Testing ✅

**Test 29: Responsive Design**
```typescript
// Open Chrome DevTools → Device Toolbar
// Test breakpoints:
// - 320px (iPhone SE)
// - 375px (iPhone 12/13)
// - 414px (iPhone 14 Pro Max)
// - 768px (iPad)
// - 1024px (iPad Pro)

// Expected: No horizontal scroll
// Expected: Cards stack vertically on mobile
// Expected: Text readable (min 16px)
// Expected: Touch targets >= 44x44px
// Expected: Bottom nav visible and accessible
```

**Test 30: Touch Gestures**
```typescript
// Test on real iOS/Android device
// Expected: Tap targets large enough (44x44px)
// Expected: Swipe works for horizontal scrolling (if any)
// Expected: Pinch-to-zoom disabled (intentional for app UX)
// Expected: No accidental clicks (proper spacing)
```

**Test 31: Mobile Performance**
```typescript
// Open Chrome DevTools → Lighthouse
// Select "Mobile" device
// Run Performance audit
// Expected: Performance score >= 85
// Expected: First Contentful Paint < 2s (on 3G)
// Expected: Total Blocking Time < 300ms
```

---

### 7. Integration Testing ✅

**Test 32: Full User Flow - New User**
```typescript
// 1. Sign up (new user)
// 2. Navigate to /dashboard
// Expected: Consultation banner visible (has_completed_consultation = false)
// Expected: No program context (no active program)
// Expected: No streak (no meal logs)
// Expected: Quick actions card visible

// 3. Complete consultation
// 4. Return to /dashboard
// Expected: Consultation banner gone
// Expected: Program context appears (if program generated)
```

**Test 33: Full User Flow - Active User**
```typescript
// 1. Log 3 meals today
// 2. Navigate to /dashboard
// Expected: Nutrition card shows today's totals
// Expected: Today's plan card shows completed meals (checkmarks)

// 3. Log weight
// 4. Navigate to /dashboard
// Expected: Weight card appears (auto-detected if first time)

// 5. Open app at same time for 14 days
// 6. Navigate to /profile
// Expected: Notification analysis suggests time pattern
```

**Test 34: Full User Flow - Preference Changes**
```typescript
// 1. Navigate to /profile
// 2. Change dashboard preference to "simple"
// 3. Click "Save Changes"
// 4. Navigate to /dashboard
// Expected: NextActionCard visible (large, centered)
// Expected: Today's Plan card NOT visible
// Expected: Macro Details card collapsible

// 5. Return to /profile
// 6. Change to "detailed"
// 7. Navigate to /dashboard
// Expected: All analytics cards visible
// Expected: Weekly Trends card with charts
// Expected: Activity Summary card with list
```

---

### 8. Error & Edge Case Testing ✅

**Test 35: Network Failures**
```typescript
// Simulate network failure in DevTools
// Navigate to /dashboard
// Expected: Error message "Unable to load dashboard"
// Expected: Retry button works after network restored
```

**Test 36: Expired Session**
```typescript
// Manually expire JWT token
// Navigate to /dashboard
// Expected: Redirect to /auth login page
// Expected: After login, redirect back to /dashboard
```

**Test 37: Empty States**
```typescript
// New user with no data
// Navigate to /dashboard
// Expected: Cards show empty states (not errors)
// Example: Weight card shows "No weight logged" with CTA
// Example: Activity Summary shows "No activities today"
```

**Test 38: Data Boundaries**
```sql
-- Test streak calculation with gap
INSERT INTO meal_logs (user_id, logged_at, meal_type)
VALUES
  ('USER_ID', NOW(), 'breakfast'),
  ('USER_ID', NOW() - INTERVAL '1 day', 'lunch'),
  ('USER_ID', NOW() - INTERVAL '3 days', 'dinner'); -- Gap on day 2

-- Call /context endpoint
-- Expected: streakDays = 2 (stops at gap)
```

---

## Manual Testing Checklist

### Browser Compatibility
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS 15+)
- [ ] Mobile Chrome (Android 10+)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces content
- [ ] Color contrast passes WCAG AA
- [ ] Focus indicators visible
- [ ] No keyboard traps
- [ ] ARIA labels on all interactive elements

### Performance
- [ ] Lighthouse Performance >= 90
- [ ] Lighthouse Accessibility = 100
- [ ] Dashboard loads in <2s
- [ ] API responses <500ms (p95)
- [ ] No memory leaks (DevTools Memory profiler)

### Mobile
- [ ] Touch targets >= 44x44px
- [ ] No horizontal scroll
- [ ] Bottom nav works on all pages
- [ ] Responsive on 320px width
- [ ] Text readable without zoom

### Security
- [ ] JWT validation works
- [ ] RLS policies enforced
- [ ] No SQL injection vulnerabilities
- [ ] No XSS vulnerabilities
- [ ] HTTPS only in production
- [ ] Sensitive data not logged

---

## Automated Testing

### Backend Tests (pytest)

**Create: `tests/test_dashboard_api.py`**
```python
import pytest
from fastapi.testclient import TestClient

def test_dashboard_context_requires_auth(client: TestClient):
    """Test that /context requires authentication."""
    response = client.get("/api/v1/dashboard/context")
    assert response.status_code == 401

def test_dashboard_context_success(authenticated_client: TestClient):
    """Test successful context retrieval."""
    response = authenticated_client.get("/api/v1/dashboard/context")
    assert response.status_code == 200
    data = response.json()
    assert "user" in data
    assert "hasCompletedConsultation" in data["user"]

def test_behavior_signal_logging(authenticated_client: TestClient):
    """Test behavior signal logging."""
    response = authenticated_client.post(
        "/api/v1/dashboard/behavior",
        json={
            "signal_type": "dashboard_open",
            "signal_value": "balanced",
            "metadata": {}
        }
    )
    assert response.status_code == 201
    assert response.json()["success"] is True
```

### Frontend Tests (React Testing Library)

**Create: `__tests__/DashboardEngine.test.tsx`**
```typescript
import { render, screen, waitFor } from '@testing-library/react'
import { DashboardEngine } from '@/components/dashboard/DashboardEngine'

describe('DashboardEngine', () => {
  it('shows loading skeleton initially', () => {
    render(<DashboardEngine userId="test-user" variant="balanced" />)
    expect(screen.getByLabelText(/loading dashboard card/i)).toBeInTheDocument()
  })

  it('renders cards after context loads', async () => {
    render(<DashboardEngine userId="test-user" variant="balanced" />)

    await waitFor(() => {
      expect(screen.getByText(/Quick Actions/i)).toBeInTheDocument()
    })
  })

  it('shows error state on API failure', async () => {
    // Mock fetch to fail
    global.fetch = jest.fn(() => Promise.reject('API error'))

    render(<DashboardEngine userId="test-user" variant="balanced" />)

    await waitFor(() => {
      expect(screen.getByText(/unable to load dashboard/i)).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
    })
  })
})
```

---

## Deployment Testing

### Pre-Deployment Checklist
- [ ] All tests passing (backend + frontend)
- [ ] Migration 025 applied to production database
- [ ] Environment variables set (backend + frontend)
- [ ] Health check endpoint returns 200
- [ ] Database connection verified
- [ ] JWT secret is 32+ characters
- [ ] API keys secured (not in git)

### Post-Deployment Verification
- [ ] /health endpoint returns healthy
- [ ] /api/v1/dashboard/context returns 200 (with auth)
- [ ] Frontend dashboard loads without errors
- [ ] Behavior tracking works (check logs)
- [ ] Database queries performant (<500ms)
- [ ] Error monitoring receiving events (Sentry)
- [ ] No console errors in production

---

## Load Testing

**Test 39: Concurrent Users**
```bash
# Install locust
pip install locust

# Create locustfile.py
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class DashboardUser(HttpUser):
    wait_time = between(1, 5)

    def on_start(self):
        # Login to get JWT token
        response = self.client.post("/auth/login", json={
            "email": "test@example.com",
            "password": "password"
        })
        self.token = response.json()["access_token"]

    @task(3)
    def view_dashboard(self):
        self.client.get(
            "/api/v1/dashboard/context",
            headers={"Authorization": f"Bearer {self.token}"}
        )

    @task(1)
    def log_behavior(self):
        self.client.post(
            "/api/v1/dashboard/behavior",
            headers={"Authorization": f"Bearer {self.token}"},
            json={
                "signal_type": "dashboard_open",
                "signal_value": "balanced",
                "metadata": {}
            }
        )
EOF

# Run load test (100 users, spawn 10/sec)
locust -f locustfile.py --host=http://localhost:8000 --users=100 --spawn-rate=10

# Expected results:
# - 95th percentile response time <500ms
# - 0% failure rate
# - Requests/sec > 100
```

---

## Monitoring & Analytics

### Error Monitoring (Sentry)
```python
# Add to app/main.py
import sentry_sdk
from app.config import settings

if settings.SENTRY_DSN:
    sentry_sdk.init(
        dsn=settings.SENTRY_DSN,
        environment=settings.ENVIRONMENT,
        traces_sample_rate=0.1,
    )
```

### Analytics (PostHog)
```typescript
// Add to app/layout.tsx
import posthog from 'posthog-js'

if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: 'https://app.posthog.com',
  })
}
```

---

## User Acceptance Testing (UAT)

### Beta User Checklist
- [ ] Recruit 5-10 beta users
- [ ] Provide onboarding instructions
- [ ] Monitor usage for 1 week
- [ ] Collect feedback via survey
- [ ] Track key metrics:
  - Dashboard load time (perceived)
  - Cards displayed per session
  - Behavior signals logged
  - Notification opt-in rate
  - User satisfaction (NPS)

### Beta User Feedback Questions
1. How easy was it to understand your dashboard?
2. Did you find the cards useful?
3. Which cards did you interact with most?
4. Which cards did you dismiss/ignore?
5. Did the dashboard adapt to your needs over time?
6. Would you enable smart notifications?
7. What's missing from your dashboard?
8. Overall satisfaction (1-10)?

---

## Success Criteria

### Technical Metrics
- ✅ Backend test coverage >= 80%
- ✅ Frontend test coverage >= 80%
- ✅ Lighthouse Performance >= 90
- ✅ Lighthouse Accessibility = 100
- ✅ API response time <500ms (p95)
- ✅ Dashboard load time <2s
- ✅ Zero production errors in first week

### User Metrics
- ✅ Daily active users increase by 30%
- ✅ Session duration increase by 50%
- ✅ Dashboard bounce rate <20%
- ✅ Notification opt-in rate >40%
- ✅ User satisfaction (NPS) >40

---

**Status:** All testing infrastructure ready for implementation
**Next:** Execute tests and iterate based on results
