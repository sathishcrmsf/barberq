# 🔧 Fix: Supabase Migration Error on Vercel

## The Problem

Your deployment fails with:
```
ERROR: prepared statement "s0" does not exist
```

**Root Cause:** Supabase's connection pooler (port 6543) uses transaction pooling mode, which doesn't support prepared statements that Prisma migrations need.

## ✅ The Solution

You need **TWO** connection strings from Supabase:

1. **Pooler URL** (port 6543) - For your application runtime
2. **Direct URL** (port 5432) - For Prisma migrations

### Step 1: Get Both Connection Strings from Supabase

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**

#### Get Direct Connection (for migrations):
1. Scroll to **"Connection string"** section
2. Click **"URI"** tab
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres
   ```
   - ✅ Port is **5432**
   - ✅ Domain is `db.xxx.supabase.co` (NOT pooler)

#### Get Pooler Connection (for app):
1. Scroll to **"Connection pooling"** section
2. Click **"Session mode"** tab (NOT transaction mode)
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
   ```
   - ✅ Port is **6543**
   - ✅ Domain is `pooler.supabase.com`

### Step 2: Add Both to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**

#### Add DATABASE_URL (Pooler - for app):
- **Name**: `DATABASE_URL`
- **Value**: Your pooler connection string (port 6543)
- **Environments**: ✓ Production, ✓ Preview, ✓ Development

#### Add DIRECT_URL (Direct - for migrations):
- **Name**: `DIRECT_URL`
- **Value**: Your direct connection string (port 5432)
- **Environments**: ✓ Production, ✓ Preview, ✓ Development

4. Click **Save**

### Step 3: Update Prisma Schema (if needed)

Prisma automatically uses `DIRECT_URL` for migrations if it's set. Make sure your `prisma/schema.prisma` has:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

### Step 4: Redeploy

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
git commit --allow-empty -m "Trigger redeploy with DIRECT_URL"
git push origin main
```

---

## Alternative: Use Session Mode Pooler

If you can't get the direct connection, try using **Session mode** pooler instead of Transaction mode:

1. In Supabase → Settings → Database → Connection pooling
2. Use **"Session mode"** connection string (not Transaction mode)
3. Session mode supports prepared statements
4. Use this for both `DATABASE_URL` and `DIRECT_URL`

---

## Why This Happens

- **Transaction pooling** (port 6543, default): Fast but doesn't support prepared statements
- **Session pooling** (port 6543, session mode): Supports prepared statements
- **Direct connection** (port 5432): Full PostgreSQL features, best for migrations

Prisma migrations need prepared statements, so they require either:
- Direct connection (port 5432), OR
- Session mode pooler (port 6543, session mode)

---

## Quick Test

After setting up, check your deployment logs. You should see:
```
✔ Applied migration: 20251125120000_init_postgresql
✔ Applied migration: 20251125120001_add_barber_and_started_at
...
```

Instead of the "prepared statement" error.

