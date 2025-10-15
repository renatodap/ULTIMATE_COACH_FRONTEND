# Railway Backend Configuration

## Required Environment Variable Fix

### ⚠️ CRITICAL: Fix CORS_ORIGINS

In your Railway dashboard, update the `CORS_ORIGINS` variable:

**Current (WRONG):**
```
CORS_ORIGINS="https://www.sharpened.me,https://sharpened.me,https://localhost:3000"
```

**Fixed (CORRECT):**
```
CORS_ORIGINS="https://www.sharpened.me,https://sharpened.me,http://localhost:3000"
```

**Why:** Localhost uses HTTP, not HTTPS. The `https://localhost:3000` causes CORS errors in development.

---

## Railway Environment Variables Checklist

Make sure these are set correctly in Railway:

```bash
# Environment
ENVIRONMENT="production"  # ✓ Already correct
DEBUG="false"             # ✓ Already correct
LOG_LEVEL="INFO"          # ✓ Already correct

# CORS - ⚠️ FIX THIS
CORS_ORIGINS="https://www.sharpened.me,https://sharpened.me,http://localhost:3000"
ALLOW_ALL_ORIGINS="false"  # ✓ Already correct

# Database (Supabase)
SUPABASE_URL="https://txuebspgxwtnwmwiwxfo.supabase.co"
SUPABASE_KEY="[your-key]"
SUPABASE_SERVICE_KEY="[your-service-key]"

# AI API Keys
OPENAI_API_KEY="[your-key]"
ANTHROPIC_API_KEY="[your-key]"
GROQ_API_KEY="[your-key]"
OPENROUTER_API_KEY="[your-key]"

# Redis (if using)
REDIS_URL="redis://localhost:6379"
CELERY_BROKER_URL="redis://localhost:6379/0"
CELERY_RESULT_BACKEND="redis://localhost:6379/0"

# Security
JWT_SECRET="[your-secret]"
JWT_ALGORITHM="HS256"
CRON_SECRET="[your-secret]"
WEBHOOK_SECRET="[your-secret]"

# Monitoring
SENTRY_DSN="[your-sentry-dsn]"
```

---

## After Updating:

1. Railway will automatically redeploy (takes ~2 minutes)
2. Wait for deployment to complete
3. Test login on `www.sharpened.me`
4. Check browser DevTools → Cookies → Should now see `access_token` cookie!

---

## Verifying Cookie Settings

The backend sets cookies with these settings in production:

```python
# app/api/v1/auth.py
response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=True,              # ← HTTPS only (production)
    samesite="none",          # ← Allow cross-origin (not needed with proxy!)
    path="/",
    max_age=60 * 60 * 24 * 7  # 7 days
)
```

With the new proxy setup, `samesite="none"` is no longer needed since all requests are same-origin from the browser's perspective. But it doesn't hurt to leave it.

---

## Finding Your Railway URL

Your Railway backend URL should be something like:
```
https://ultimate-coach-backend-production.up.railway.app
```

To find it:
1. Go to Railway Dashboard
2. Select your backend service
3. Click "Settings" → "Networking"
4. Copy the "Public Domain" URL
5. Add this URL to Vercel as `RAILWAY_API_URL`
