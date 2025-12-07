# 🔍 How to Diagnose Database Connection Issues

## Understanding Console Messages

### ❌ Not an Error: Informational Logs

When you see messages like:
```
🔍 Database connection troubleshooting:
  1. Check if DATABASE_URL is set in environment variables
  2. Verify database server is running
  ...
```

**These are NOT errors!** They are helpful troubleshooting logs to guide you.

### ✅ The Real Error

The actual error is usually shown in:
- **Toast notification**: Red error message at the top of the screen
- **Browser console**: The error that comes BEFORE the troubleshooting logs

---

## Quick Diagnosis Steps

### Step 1: Test Database Connection

Visit this URL in your browser:
```
http://localhost:3000/api/debug
```
(Or on production: `https://your-app.vercel.app/api/debug`)

**What you'll see:**

✅ **If Connected:**
```json
{
  "status": "ok",
  "database": "connected",
  "counts": { ... }
}
```

❌ **If Disconnected:**
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "...",
  "diagnostics": { ... }
}
```

### Step 2: Check Environment Variables

**On Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Check if `DATABASE_URL` exists

**Locally:**
```bash
# Check if .env file exists
cat .env | grep DATABASE_URL

# Or check if it's set
echo $DATABASE_URL
```

### Step 3: Verify Connection String Format

The debug endpoint will show hints about your connection:

- **Supabase**: Should use `pooler.supabase.com:6543`
- **Neon**: Should include `?sslmode=require`
- **Vercel Postgres**: Auto-configured

---

## Common Issues & Quick Fixes

### Issue 1: "DATABASE_URL not set"

**Fix:**
1. Set `DATABASE_URL` in Vercel environment variables
2. Or create `.env` file locally with `DATABASE_URL=your_connection_string`
3. Redeploy/restart server

### Issue 2: "Can't reach database server"

**Fix:**
- **Supabase**: Use connection pooler URL (port 6543)
- **Neon**: Database might be sleeping - visit dashboard to wake it
- **Any provider**: Check if connection string is correct

### Issue 3: "Connection timeout"

**Fix:**
- Check if database is active
- Verify connection string format
- Ensure network/firewall allows connection

---

## Using the Debug Endpoint

### What It Tests

1. ✅ Database connection
2. ✅ Query execution
3. ✅ Table counts
4. ✅ Connection string format
5. ✅ Environment variables

### Example Response (Success)

```json
{
  "status": "ok",
  "database": "connected",
  "counts": {
    "walkIns": 5,
    "services": 10,
    "staff": 3,
    "customers": 8
  },
  "diagnostics": {
    "connectionInfo": {
      "provider": "Supabase",
      "usingPooler": true
    }
  }
}
```

### Example Response (Error)

```json
{
  "status": "error",
  "database": "disconnected",
  "error": "Can't reach database server",
  "diagnostics": {
    "env": {
      "hasDatabaseUrl": true,
      "databaseUrlPrefix": "postgresql://postgres..."
    },
    "troubleshooting": {
      "step1": "Check if DATABASE_URL is set...",
      "step2": "Verify database server is running...",
      "step3": "For Supabase: Use connection pooler URL..."
    }
  }
}
```

---

## Step-by-Step Fix

### If Database is Not Connected

1. **Check Debug Endpoint**
   - Visit `/api/debug`
   - Read the error message and diagnostics

2. **Identify Your Provider**
   - Check the `connectionInfo.provider` in debug response
   - Or check your `DATABASE_URL` format

3. **Follow Provider-Specific Guide**
   - **Supabase**: See `FIX_DATABASE_CONNECTION.md`
   - **Neon**: See `DATABASE_SETUP.md`
   - **General**: See `STAFF_DATABASE_ERROR_FIX.md`

4. **Update Connection String**
   - Get correct connection string from your provider
   - Update in Vercel environment variables
   - Or update local `.env` file

5. **Redeploy/Restart**
   - Push changes to trigger Vercel redeploy
   - Or restart local dev server: `npm run dev`

6. **Test Again**
   - Visit `/api/debug` again
   - Should show `"status": "ok"` now

---

## Quick Commands

### Test Connection Locally
```bash
# Start dev server
npm run dev

# In another terminal, test debug endpoint
curl http://localhost:3000/api/debug
```

### Check Prisma Connection
```bash
# Test Prisma connection directly
npx prisma db pull

# Or open Prisma Studio (will fail if no connection)
npx prisma studio
```

### Check Environment Variables
```bash
# Local
cat .env | grep DATABASE_URL

# Vercel (check dashboard or use CLI)
vercel env ls
```

---

## Still Stuck?

1. **Check the Error Message**
   - What does `/api/debug` say?
   - What's the exact error in browser console?

2. **Check Documentation**
   - `STAFF_DATABASE_ERROR_FIX.md` - Step-by-step fixes
   - `FIX_DATABASE_CONNECTION.md` - Supabase-specific
   - `DATABASE_SETUP.md` - Complete setup guide

3. **Verify Provider Status**
   - Check if your database provider is up
   - Supabase: Visit dashboard
   - Neon: Visit console
   - Vercel Postgres: Check Storage tab

---

**Remember:** The console logs with "🔍 Database connection troubleshooting" are **helpful guides**, not errors! The real error is usually shown in the toast notification or the debug endpoint.

