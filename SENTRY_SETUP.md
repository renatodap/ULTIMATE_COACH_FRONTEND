# Sentry Error Tracking Setup

Sentry is configured for both frontend (Next.js) and backend (FastAPI) to capture and track errors in production.

## Quick Setup (5 minutes)

### 1. Create Sentry Project

1. Go to [sentry.io](https://sentry.io) and create a free account
2. Create a new project:
   - **Frontend**: Select "Next.js" platform
   - **Backend**: Select "FastAPI" or "Python" platform
3. Copy the **DSN** (Data Source Name) from each project

### 2. Add Environment Variables

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
```

**Backend (.env or environment):**
```bash
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
```

**Vercel (Production):**
- Go to Project Settings → Environment Variables
- Add `NEXT_PUBLIC_SENTRY_DSN` for frontend
- Make sure backend deployment has `SENTRY_DSN` set

### 3. Test It Works

**Frontend Test:**
```typescript
// Add this temporarily to any page to test
import { captureException } from '@/lib/sentry'

// Trigger test error
captureException(new Error('Test error from frontend'))
```

**Backend Test:**
```python
# Add this to any endpoint temporarily
raise Exception("Test error from backend")
```

Visit the page/endpoint, then check your Sentry dashboard - you should see the error!

---

## What's Already Configured

### Frontend (Next.js)

**Files:**
- `lib/sentry.ts` - Sentry configuration and helper functions
- `instrumentation.ts` - Next.js instrumentation for Sentry
- `app/layout.tsx` - Initializes Sentry on app start
- `app/error.tsx` - Captures global errors
- `components/ErrorBoundary.tsx` - Captures React component errors

**Features:**
- ✅ Automatic error capture
- ✅ Session replay (10% of sessions, 100% on error)
- ✅ Performance monitoring (10% sample rate in prod)
- ✅ User context tracking
- ✅ Breadcrumbs for user actions
- ✅ Filters out browser extension errors
- ✅ Only sends errors in production

**Helper Functions:**
```typescript
import { captureException, captureMessage, setUser, addBreadcrumb } from '@/lib/sentry'

// Capture exceptions with context
captureException(error, { userId: '123', action: 'submit-form' })

// Log messages
captureMessage('User completed onboarding', 'info')

// Set user context (call after login)
setUser({ id: user.id, email: user.email, username: user.username })

// Add breadcrumbs for debugging
addBreadcrumb('User clicked submit button', 'user-action', { formId: 'signup' })
```

### Backend (FastAPI)

**Files:**
- `app/main.py` - Sentry initialization in lifespan

**Features:**
- ✅ Automatic error capture
- ✅ FastAPI integration (captures request context)
- ✅ Starlette integration
- ✅ Performance monitoring (10% sample rate in prod)
- ✅ Structured logging integration
- ✅ Only sends errors in production

**Manual Capture:**
```python
import sentry_sdk

# Capture exception with context
try:
    do_something()
except Exception as e:
    sentry_sdk.capture_exception(e)

# Log message
sentry_sdk.capture_message("Something important happened", level="info")

# Set user context
sentry_sdk.set_user({"id": user_id, "email": user_email})
```

---

## Monitoring in Production

### 1. Dashboard

Go to your Sentry project dashboard to see:
- Error frequency and trends
- Affected users
- Stack traces and context
- Session replays (see what user was doing when error occurred)
- Performance metrics

### 2. Alerts

Set up alerts to notify you when:
- New errors appear
- Error rate spikes
- Specific errors occur
- Performance degrades

Go to: **Alerts → Create Alert Rule**

Recommended alerts:
- ❗ **Critical**: New unique errors (Slack/Email immediately)
- ⚠️ **Warning**: Error rate > 10/minute (Slack notification)
- 📊 **Info**: Weekly error digest (Email)

### 3. Releases

Track errors by deployment:

**Frontend (Vercel):**
Vercel automatically sends release info to Sentry if you set:
```bash
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
```

**Backend:**
Tag your Docker images or deployments with version numbers.

---

## What Gets Captured

### Automatic

**Frontend:**
- ❌ Unhandled JavaScript errors
- ❌ Promise rejections
- ❌ React component errors (Error Boundary)
- ❌ Network failures (fetch errors)
- 📊 Performance metrics
- 🎬 Session replays (on error)
- 🔍 User actions (breadcrumbs)

**Backend:**
- ❌ Unhandled Python exceptions
- ❌ FastAPI endpoint errors
- ❌ Database errors
- ❌ Third-party API failures
- 📊 API performance metrics
- 🔍 Request context (URL, method, headers, user)

### Not Captured

- ✅ Browser extension errors (filtered out)
- ✅ Network request failed (too noisy)
- ✅ Development errors (only production)
- ✅ Errors you explicitly catch and handle
- ✅ Console.log statements

---

## Privacy & Security

### What Sentry Can See

- Error messages and stack traces
- User IDs, emails, usernames (if you call `setUser()`)
- Request URLs and parameters
- Session replays (visual recording of user actions)
- Performance metrics

### What Sentry Can't See

- ❌ Passwords (automatically scrubbed)
- ❌ Credit card numbers (automatically scrubbed)
- ❌ Authorization headers (filtered)
- ❌ Database contents
- ❌ Environment variables
- ❌ httpOnly cookie contents

### GDPR Compliance

Sentry is GDPR compliant. To handle user data requests:

```typescript
// On user deletion, remove their Sentry data
// Contact Sentry support or use their API
```

---

## Cost

**Free Tier:**
- 5,000 errors/month
- 10,000 performance transactions/month
- 50 session replays/month
- 1 user

**Paid Plans:**
- Start at $26/month
- More errors, transactions, replays
- Team collaboration
- Better retention

**Recommendation:** Start with free tier, upgrade if you hit limits.

---

## Troubleshooting

### "Sentry not initialized" in console

**Cause:** `NEXT_PUBLIC_SENTRY_DSN` not set
**Fix:** Add DSN to `.env.local` and restart dev server

### No errors showing in Sentry

**Checks:**
1. Is DSN correct? (Check Sentry project settings)
2. Is error in production? (Sentry disabled in development)
3. Is error being caught? (Only uncaught errors are sent automatically)
4. Check browser console for Sentry logs

### Too many errors

**Solutions:**
1. Filter noisy errors in `lib/sentry.ts` → `ignoreErrors` array
2. Use `beforeSend` to filter specific errors
3. Increase sample rate threshold
4. Fix the bugs! 😄

### Session replays not working

**Causes:**
- Not enough quota (free tier = 50/month)
- Not sampled (only 10% of sessions by default)
- User has "Do Not Track" enabled

**Fix:** Increase `replaysSessionSampleRate` in `lib/sentry.ts` for testing

---

## Next Steps

1. ✅ **Set DSN environment variables** (both frontend and backend)
2. ✅ **Test error capture** (trigger test error, check Sentry dashboard)
3. ✅ **Set up alerts** (get notified of new errors)
4. ✅ **Integrate with Slack** (optional, for team notifications)
5. ✅ **Add release tracking** (optional, track errors by deployment)

---

**Questions?** Check [Sentry Docs](https://docs.sentry.io) or contact support.

**Last Updated:** 2025-10-12
