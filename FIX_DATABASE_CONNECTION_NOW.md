# 🔧 Fix Database Connection Error - URGENT

## Current Error
```
Can't reach database server at `aws-1-ap-south-1.pooler.supabase.com:5432`
```

## The Problem

You're trying to connect to a Supabase pooler using the **wrong port**:
- ❌ Using port `5432` (direct connection port)
- ✅ Should use port `6543` (pooler port)

OR the connection string format is incorrect for the pooler.

## ✅ Quick Fix

### Step 1: Get the Correct Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Look for **"Session mode"** or **"Connection pooling"**
6. Copy the connection string that uses:
   - Port **6543** (not 5432)
   - Domain: `pooler.supabase.com`

It should look like:
```
postgresql://postgres.xxxxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 2: Update Your .env.local File

1. Open your `.env.local` file:
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   nano .env.local
   # or open in your editor
   ```

2. Update the `DATABASE_URL` line with the pooler URL (port 6543):
   ```env
   DATABASE_URL="postgresql://postgres.xxxxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   ```

3. **IMPORTANT**: Make sure it uses:
   - ✅ Port `6543` (pooler port)
   - ✅ Domain `pooler.supabase.com`
   - ✅ User format `postgres.xxxxx` (with project reference)

### Step 3: Restart Your Dev Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## Alternative: Use Direct Connection (If Pooler Doesn't Work)

If the pooler still doesn't work, try the direct connection:

1. In Supabase Dashboard → Settings → Database
2. Copy the **"Direct connection"** string (uses port 5432)
3. Update your `.env.local` with this URL
4. Restart dev server

**Note**: Direct connections may have issues in serverless environments, but should work for local development.

## Verify the Fix

After updating and restarting:

1. Try accessing your dashboard again
2. The database connection should work
3. You should be able to create customers

## Common Issues

### Issue 1: Database is Sleeping (Supabase Free Tier)

If your database is sleeping:
1. Go to Supabase Dashboard
2. The database should auto-wake when you visit it
3. Wait a few seconds for it to wake up
4. Then try your app again

### Issue 2: Wrong Connection String Format

Make sure your connection string looks like one of these:

**Pooler (Recommended):**
```
postgresql://postgres.xxxxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Direct:**
```
postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres
```

### Issue 3: Password Has Special Characters

If your password has special characters like `@`, `#`, `%`, etc., you need to URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`
- etc.

## Need Help?

If you're still having issues:
1. Check that your `.env.local` file exists and has `DATABASE_URL` set
2. Verify the connection string in Supabase Dashboard
3. Make sure your Supabase project is active (not paused)
4. Check your internet connection

