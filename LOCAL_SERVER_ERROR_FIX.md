# 🔧 Fix Local Server Error (500 Internal Server Error)

## Current Issue

**Symptom:** All routes return "Internal Server Error" (500) including:
- `http://127.0.0.1:3000/` (homepage redirects to /dashboard)
- `http://127.0.0.1:3000/dashboard`
- `http://127.0.0.1:3000/queue`
- `http://127.0.0.1:3000/debug`

**Database Connection Test:** ✅ Passes (connection is working)

**Issue:** Server components are failing to render, likely due to:
1. Prisma client initialization issue in Next.js
2. Server needs restart after changes
3. Build cache corruption

---

## ✅ Quick Fix (Try These in Order)

### Fix 1: Restart Development Server

1. **Stop the current server:**
   - Press `Ctrl+C` in the terminal where `npm run dev` is running
   - Or kill the process: `kill 82281` (check your actual PID)

2. **Clear Next.js cache:**
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   rm -rf .next
   ```

3. **Restart the server:**
   ```bash
   npm run dev
   ```

4. **Test:**
   - Visit: http://127.0.0.1:3000/
   - Should load dashboard or show proper error message

---

### Fix 2: Regenerate Prisma Client

If Fix 1 doesn't work:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

# Restart server
npm run dev
```

---

### Fix 3: Check Environment Variables

Make sure `.env` file exists and has correct DATABASE_URL:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Check if .env exists
cat .env | grep DATABASE_URL

# Should show:
# DATABASE_URL="postgresql://..."
```

If missing or incorrect:
1. Copy from your existing `.env` or create new one
2. Make sure it's in the project root (same level as `package.json`)
3. Restart the dev server

---

### Fix 4: Check Server Logs

Look at the terminal where `npm run dev` is running. You should see error messages like:

```
Error: ...
Prisma Client initialization failed
Cannot find module ...
```

**Common errors and fixes:**

**Error: "Prisma Client failed to initialize"**
```bash
npx prisma generate
rm -rf .next
npm run dev
```

**Error: "Cannot find module '@prisma/client'"**
```bash
npm install
npx prisma generate
```

**Error: "DATABASE_URL environment variable is not set"**
- Check `.env` file exists
- Check DATABASE_URL is set correctly
- Restart server after creating/updating `.env`

---

### Fix 5: Nuclear Option - Clean Reinstall

If nothing else works:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Stop server (Ctrl+C)

# Remove all build artifacts and cache
rm -rf .next
rm -rf node_modules/.cache

# Reinstall dependencies (optional, only if needed)
# npm install

# Regenerate Prisma
npx prisma generate

# Restart
npm run dev
```

---

## 🔍 Diagnostic Steps

### Step 1: Test Database Connection

```bash
npm run db:test
```

**Expected:** ✅ Successfully connected to database

**If fails:** Fix database connection first (see `DATABASE_FIX_QUICK_START.md`)

---

### Step 2: Check Server Status

Look at the terminal where `npm run dev` is running. You should see:

```
  ▲ Next.js 16.0.3
  - Local:        http://127.0.0.1:3000
  - Ready in Xs
```

**If server isn't running:**
```bash
npm run dev
```

---

### Step 3: Test Simple Route

Try accessing a route that doesn't use database:

```bash
curl http://127.0.0.1:3000/debug
```

**Expected:** JSON response with database status

**If fails:** Server is not running or there's a build error

---

### Step 4: Check Build Errors

If the server is running but pages fail:

1. Look at terminal output for compilation errors
2. Check browser console (F12) for client-side errors
3. Check Network tab for 500 errors

---

## 🐛 Common Causes

### 1. Prisma Client Not Generated
**Symptom:** Error about missing Prisma client
**Fix:** `npx prisma generate`

### 2. Stale Next.js Cache
**Symptom:** Code changes not reflected, 500 errors
**Fix:** `rm -rf .next && npm run dev`

### 3. Environment Variable Not Loaded
**Symptom:** DATABASE_URL not found errors
**Fix:** Check `.env` file exists, restart server

### 4. Server Component Error
**Symptom:** 500 error on server-rendered pages
**Fix:** Check server component code, add error handling

### 5. Port Already in Use
**Symptom:** Can't start server
**Fix:** Change port in `package.json` or kill process on port 3000

---

## ✅ After Fixing

Once the server is working:

1. **Test homepage:**
   - Visit: http://127.0.0.1:3000/
   - Should redirect to /dashboard and load

2. **Test dashboard:**
   - Visit: http://127.0.0.1:3000/dashboard
   - Should show dashboard with data

3. **Test queue:**
   - Visit: http://127.0.0.1:3000/queue
   - Should show queue page

---

## 📝 Changes Made

I've added error handling to:
- ✅ `app/dashboard/dashboard-content.tsx` - Added try/catch
- ✅ `app/dashboard/error.tsx` - Added error boundary
- ✅ `app/debug/route.ts` - Added diagnostic route

These will help show better error messages if issues persist.

---

## 🆘 Still Not Working?

1. **Check the terminal** where `npm run dev` is running for error messages
2. **Share the error** from terminal output
3. **Try accessing** http://127.0.0.1:3000/debug to see diagnostic info

---

**Most likely fix:** Restart the dev server after clearing `.next` cache! 🔄

