# 🔧 Fix Production Issues - Vercel Deployment

## Current Problems

### 1. ❌ Logout Redirects to Localhost

When clicking logout on production (`https://karangtaruna-five.vercel.app`), users are redirected to `http://localhost:3000/anggota/login`

### 2. ❓ Possible Redirect Loop at `/member/dashboard`

Members login successfully but may get stuck in redirect loop at member dashboard.

---

## 🎯 Root Cause

The **AUTH_URL** environment variable in Vercel is currently set to:

```
AUTH_URL=http://localhost:3000
```

This causes NextAuth to use `localhost` as the base URL for all authentication operations including logout redirects.

---

## ✅ SOLUTION - Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard

1. Visit: https://vercel.com/dashboard
2. Select your project: **karangtaruna**
3. Go to **Settings** → **Environment Variables**

### Step 2: Update AUTH_URL

Find the `AUTH_URL` variable and change it from:

```
http://localhost:3000
```

To:

```
https://karangtaruna-five.vercel.app
```

**IMPORTANT**: Make sure to:

- ✅ Use `https://` (NOT `http://`)
- ✅ Remove any trailing slash
- ✅ Click **Save** button
- ✅ Set for all environments (Production, Preview, Development) or at least Production

### Step 3: Redeploy

After saving the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click the **⋮** (three dots) menu
4. Select **Redeploy**
5. Wait for deployment to complete (~2-3 minutes)

---

## 🧪 Testing After Deployment

### Test 1: Logout Redirect

1. Login as anggota: `https://karangtaruna-five.vercel.app/anggota/login`
2. Access member dashboard: `https://karangtaruna-five.vercel.app/member/dashboard`
3. Click **Logout** button
4. ✅ Should redirect to: `https://karangtaruna-five.vercel.app/anggota/login` (NOT localhost)

### Test 2: No Redirect Loop

1. Login as anggota
2. Navigate to: `https://karangtaruna-five.vercel.app/member/dashboard`
3. ✅ Should display member dashboard without redirect loop

---

## 📋 Additional Environment Variables to Verify

While you're in Vercel environment variables, make sure these are also set correctly:

```env
# Authentication (THIS IS THE CRITICAL ONE!)
AUTH_URL=https://karangtaruna-five.vercel.app
AUTH_SECRET=gIQmC4NfBEBbvR6/FnZaCVZeRKJEQvWmM7sj/votBy0=

# App URLs
NEXT_PUBLIC_APP_URL=https://karangtaruna-five.vercel.app
NEXT_PUBLIC_APP_NAME=Karang Taruna Generasi Emas

# Database (should already be set)
DATABASE_URL=postgresql://postgres.csacgdbuckmrhudtoejz:%40Achmddfzn17@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.csacgdbuckmrhudtoejz:%40Achmddfzn17@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# Supabase (should already be set)
NEXT_PUBLIC_SUPABASE_URL=https://csacgdbuckmrhudtoejz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYWNnZGJ1Y2ttcmh1ZHRvZWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3ODc3NDYsImV4cCI6MjA5MzM2Mzc0Nn0.TzdLxehAT0XDBlFZS8dQozg5sJAX6AAUcFD6HKZEFMc
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzYWNnZGJ1Y2ttcmh1ZHRvZWp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Nzc4Nzc0NiwiZXhwIjoyMDkzMzYzNzQ2fQ.Bh4EFiEVWxSb5duNDWsobo4rUrkekv7XkraeL4V8y5w
```

---

## 🤔 Why This Happens

NextAuth.js uses the `AUTH_URL` (or legacy `NEXTAUTH_URL`) as the canonical base URL for:

- Callback URLs after OAuth
- Redirect URLs after login/logout
- CSRF token validation
- Cookie domain settings

When `AUTH_URL=http://localhost:3000`, all authentication flows will use localhost as the base, even in production.

---

## 📝 Code Changes Made (Already Committed)

I've already updated the codebase to:

1. **✅ Fixed role gate in `src/auth.ts`**
   - Now properly blocks ANGGOTA role from admin login form
   - Returns `null` instead of throwing to avoid stack traces

2. **✅ Updated middleware in `src/proxy.ts`**
   - Allows all logged-in users (including admins) to access `/member/*` routes
   - This prevents potential redirect loops

3. **✅ Environment variable fallbacks**
   - `src/lib/certificate.ts` - Falls back to `VERCEL_URL` if available
   - `src/lib/email.ts` - Falls back to `VERCEL_URL` if available

These code changes are already deployed, but **the Vercel environment variable is the critical missing piece**.

---

## 🚨 CRITICAL ACTION REQUIRED

**You MUST update AUTH_URL in Vercel and redeploy** for the production site to work correctly.

The code is ready. The environment variable is not.

---

## Need Help?

If after updating AUTH_URL and redeploying you still see issues:

1. Check browser console for errors
2. Check Vercel deployment logs
3. Share the error message with me
