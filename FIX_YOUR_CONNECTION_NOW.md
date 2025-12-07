# 🔧 Fix Your Database Connection - Step by Step

## Current Status

✅ **You have a Supabase connection string configured**  
✅ **Using connection pooler (port 6543) - Correct!**  
❌ **Connection is failing**

---

## Quick Fix Steps

### Step 1: Check if Database is Active

Supabase databases can "sleep" after inactivity. Let's wake it up:

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Login to your account
   - Click on your project

2. **Check Database Status**
   - The database should auto-wake when you visit the dashboard
   - Wait 10-20 seconds for it to fully wake up

### Step 2: Verify Connection String Format

Your connection string should match this format:

```
postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Important checks:**
- ✅ Port is `6543` (pooler port) - You have this!
- ✅ Domain has `pooler.supabase.com` - You have this!
- ✅ Should include `?pgbouncer=true` at the end

### Step 3: Update .env File

Your `.env.local` has the correct format with `?pgbouncer=true`. Let's make sure your main `.env` matches:

**Option A: Use .env.local format (Recommended)**

1. Copy the connection string from `.env.local`:
   ```bash
   cat .env.local
   ```

2. Update your `.env` file to match:
   ```bash
   # Make sure your .env has:
   DATABASE_URL="postgresql://postgres.jlgnvvplpnlpkgdmfriu:SatzWolf04%21@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

   Note: The `!` in password is URL-encoded as `%21`

### Step 4: Test Connection

1. **Make sure dev server is running:**
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   npm run dev
   ```

2. **In another terminal or browser, test:**
   - Visit: http://localhost:3000/api/debug
   - Or run: `curl http://localhost:3000/api/debug`

3. **Check the response:**
   - If `"status": "ok"` → Connection works! ✅
   - If `"status": "error"` → See error message for details

### Step 5: Restart Dev Server

After updating `.env`:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

---

## Alternative: Check Supabase Connection String

If the connection still fails, get a fresh connection string:

1. **Go to Supabase Dashboard**
   - https://supabase.com/dashboard
   - Select your project

2. **Get Pooler Connection String**
   - Settings → Database
   - Scroll to **"Connection pooling"**
   - Click **"Session mode"** tab
   - Click **"Copy"** button
   - It should look like:
     ```
     postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
     ```

3. **Update .env:**
   ```bash
   # Edit .env file
   nano .env
   # Or
   code .env
   ```
   
   Replace `DATABASE_URL` with the fresh connection string, making sure to:
   - Keep the pooler URL (port 6543)
   - Add `?pgbouncer=true` at the end
   - URL-encode special characters in password (`!` becomes `%21`)

---

## Common Issues & Fixes

### Issue 1: Database is Sleeping

**Symptoms:**
- Connection timeout
- "Can't reach database server"

**Fix:**
1. Visit Supabase dashboard (wakes the database)
2. Wait 10-20 seconds
3. Try connecting again

### Issue 2: Password Special Characters

**Symptoms:**
- Authentication failed
- Connection refused

**Fix:**
- URL-encode special characters in password:
  - `!` → `%21`
  - `@` → `%40`
  - `#` → `%23`
  - etc.

Your password has `!` which should be `%21` in the URL.

### Issue 3: Missing pgbouncer Parameter

**Symptoms:**
- Connection works but queries fail
- Pooling issues

**Fix:**
- Add `?pgbouncer=true` to the end of connection string

---

## Quick Test Commands

```bash
# Test Prisma connection directly
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx prisma db pull

# Check if DATABASE_URL is loaded
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? 'SET' : 'NOT SET')"

# Test API endpoint
curl http://localhost:3000/api/debug
```

---

## Still Not Working?

1. **Check Debug Endpoint:**
   - Visit: http://localhost:3000/api/debug
   - Read the error message
   - Follow the troubleshooting steps shown

2. **Check Supabase Status:**
   - Visit your Supabase dashboard
   - Check if project is active
   - Look for any service alerts

3. **Verify Connection String:**
   - Copy fresh connection string from Supabase
   - Make sure it's the pooler URL (port 6543)
   - Add `?pgbouncer=true` parameter

4. **Check Logs:**
   - Terminal where `npm run dev` is running
   - Browser console (F12)
   - Look for specific error messages

---

## Your Current Configuration

Based on what I see:

✅ **Provider:** Supabase  
✅ **Using pooler:** Yes (port 6543)  
✅ **Connection string format:** Looks correct  
⚠️ **Issue:** Connection failing - likely database sleeping or password encoding

**Next Steps:**
1. Wake up database (visit Supabase dashboard)
2. Ensure `.env` matches `.env.local` format with `?pgbouncer=true`
3. Restart dev server
4. Test at `/api/debug`

---

**Need more help? See:**
- `DIAGNOSE_DATABASE_ISSUE.md` - Full diagnostics
- `QUICK_FIX_DATABASE.md` - Quick reference
- `STAFF_DATABASE_ERROR_FIX.md` - Detailed fixes

