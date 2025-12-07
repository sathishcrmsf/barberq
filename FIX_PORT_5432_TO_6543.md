# 🔧 Fix: Wrong Port in Supabase Connection String

## Problem Detected

Your `DATABASE_URL` is using the **pooler domain** but the **wrong port**:
- ✅ Domain: `pooler.supabase.com` (correct)
- ❌ Port: `5432` (wrong - should be `6543`)

**Current (WRONG):**
```
postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Should be:**
```
postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

## Quick Fix (Option 1: Manual Edit)

1. Open your `.env` file:
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   nano .env
   # or
   code .env
   ```

2. Find the line with `DATABASE_URL` and change `:5432` to `:6543`

3. Save the file

4. Test the connection:
   ```bash
   npm run db:test
   ```

## Proper Fix (Option 2: Get Correct URL from Supabase)

### Step 1: Go to Supabase Dashboard

1. Visit: https://supabase.com/dashboard
2. Select your project (the one with ID: `jlgnvvplpnlpkgdmfriu`)

### Step 2: Get Connection Pooler URL

1. Go to **Settings** → **Database**
2. Scroll down to **"Connection pooling"** section
3. Click on **"Session mode"** tab
4. Click the **"Copy"** button next to the connection string

The connection string should look like:
```
postgresql://postgres.jlgnvvplpnlpkgdmfriu:YOUR_PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
```

**Important:** Notice the port is **6543**, not 5432!

### Step 3: Update .env File

1. Open `.env` file in your project root
2. Replace the entire `DATABASE_URL` line with the new connection string
3. Make sure to replace `YOUR_PASSWORD` with your actual database password

### Step 4: Test Connection

```bash
npm run db:test
```

You should see:
```
✅ Connection Pooler (Recommended for Vercel)
   - Port: 6543 ✓
   - Domain: pooler.supabase.com ✓
✅ Successfully connected to database!
```

## Why Port 6543?

- **Port 5432**: Direct PostgreSQL connection (doesn't work well with serverless/Vercel)
- **Port 6543**: Connection pooler (PgBouncer) - optimized for serverless environments

Supabase connection poolers use port **6543** to handle connection pooling, which is essential for serverless functions on Vercel.

## Verify Fix

After updating, run:
```bash
npm run db:test
```

You should see:
- ✅ Connection successful
- ✅ Port: 6543
- ✅ Database statistics showing your tables

## If You Still Have Issues

1. **Check if database is awake:**
   - Visit your Supabase dashboard
   - The database should auto-wake when you visit it

2. **Verify password:**
   - Make sure the password in your connection string matches your Supabase database password
   - You can reset it in Supabase Dashboard → Settings → Database

3. **Check network:**
   - Ensure you have internet connectivity
   - Try accessing Supabase dashboard in browser

4. **Run migrations:**
   ```bash
   npx prisma migrate dev
   ```

---

**Once fixed, your connection should work perfectly!** 🚀

