# ✅ Quick Fix Checklist - Production Issues

## 🎯 Problem

- ❌ Logout redirects to `http://localhost:3000/anggota/login`
- ❓ Possible redirect loop at `/member/dashboard`

## 🔥 ONE CRITICAL FIX NEEDED

**The ONLY thing you need to do in Vercel:**

### Update AUTH_URL Environment Variable

1. Go to: https://vercel.com/dashboard
2. Select project: **karangtaruna**
3. Go to: **Settings** → **Environment Variables**
4. Find: `AUTH_URL`
5. Change FROM: `http://localhost:3000`
6. Change TO: `https://karangtaruna-five.vercel.app`
7. Click **SAVE**
8. Go to **Deployments** → Click latest → **⋮** → **Redeploy**

---

## ✅ What's Already Done (No Action Needed)

The code has been fixed and committed:

- ✅ Middleware allows all logged-in users to access `/member/*` routes
- ✅ Role gate blocks ANGGOTA from admin forms and vice versa
- ✅ Auth returns `null` instead of throwing to avoid stack traces
- ✅ Fallback to `VERCEL_URL` in certificate and email utilities

---

## 🧪 After Redeploying - Test This:

1. Login as anggota: https://karangtaruna-five.vercel.app/anggota/login
2. Go to member dashboard: https://karangtaruna-five.vercel.app/member/dashboard
3. Click logout
4. **SHOULD redirect to**: `https://karangtaruna-five.vercel.app/anggota/login` ✅
5. **SHOULD NOT redirect to**: `http://localhost:3000/anggota/login` ❌

---

## 🤔 If Still Not Working

If after updating `AUTH_URL` and redeploying you still see issues:

1. **Clear browser cookies** for `https://karangtaruna-five.vercel.app`
2. **Check Vercel deployment logs** for errors
3. **Check browser console** (F12) for error messages
4. **Verify the environment variable** was actually saved (go back to Settings → Environment Variables and confirm the value is `https://karangtaruna-five.vercel.app`)

---

## 📸 Screenshot Request

After you update the `AUTH_URL` variable in Vercel, please:

1. Take a screenshot showing `AUTH_URL=https://karangtaruna-five.vercel.app`
2. Confirm you clicked **Save**
3. Confirm you clicked **Redeploy**
4. Share if it's working or still having issues

---

## Why This Happens

NextAuth.js uses `AUTH_URL` as the base URL for ALL authentication operations:

- Login redirects
- Logout redirects
- Callback URLs
- Cookie settings
- CSRF validation

When `AUTH_URL=http://localhost:3000`, NextAuth thinks it's running on localhost even when deployed to production.

That's why logout redirects to localhost instead of your production URL.

---

## Code Analysis

I've verified the code flow:

1. User logs in at `/anggota/login` → NextAuth creates session with role "ANGGOTA"
2. User navigates to `/member/dashboard` → Middleware checks:
   - ✅ Is logged in? Yes
   - ✅ Is accessing `/member/*` route? Yes
   - ✅ Allow access (no redirect)
3. Page runs `requireMemberAuth()`:
   - ✅ Session exists? Yes
   - ✅ Returns session (no redirect)
4. User clicks logout → NextAuth redirects to: `${AUTH_URL}/anggota/login`
   - ❌ If `AUTH_URL=http://localhost:3000` → Redirects to localhost
   - ✅ If `AUTH_URL=https://karangtaruna-five.vercel.app` → Redirects to production

**The code is correct. The environment variable is the problem.**
