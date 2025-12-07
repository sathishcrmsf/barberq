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
   - ✅ **Port: 5432** (this is the direct connection port)
   - ✅ Domain: `db.xxx.supabase.co` (NOT pooler)

#### Get Pooler Connection (for app):
1. Scroll to **"Connection pooling"** section
2. You can use either:
   - **Transaction mode** (default) - for app queries (fast)
   - **Session mode** - also works for app queries
3. Copy the connection string (looks like):
   ```
   postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres
   ```
   - ✅ **Port: 6543** (this is the pooler port - always 6543)
   - ✅ Domain: `pooler.supabase.com` or `aws-X-region.pooler.supabase.com`

### Step 2: Add Both to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**

#### Add DATABASE_URL (Pooler - for app):
- **Name**: `DATABASE_URL`
- **Value**: Your pooler connection string
- **Port in URL**: **6543** (pooler always uses port 6543)
- **Environments**: ✓ Production, ✓ Preview, ✓ Development

#### Add DIRECT_URL (Direct - for migrations):
- **Name**: `DIRECT_URL`
- **Value**: Your direct connection string
- **Port in URL**: **5432** (direct connection always uses port 5432)
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

If you can't get the direct connection, you can use **Session mode** pooler for migrations:

1. In Supabase → Settings → Database → Connection pooling
2. Click **"Session mode"** tab
3. Copy that connection string (still port 6543, but session mode)
4. Use this for `DIRECT_URL` (session mode supports prepared statements)
5. Keep your existing pooler connection for `DATABASE_URL`

**Note:** Both transaction and session mode use port 6543. The difference is the mode, not the port.

---

## Why This Happens

**Supabase Connection Types:**

1. **Direct Connection** 
   - Port: **5432**
   - Domain: `db.xxx.supabase.co`
   - ✅ Full PostgreSQL features
   - ✅ Works for migrations (supports prepared statements)
   - Use for: `DIRECT_URL`

2. **Connection Pooler**
   - Port: **6543** (always)
   - Domain: `pooler.supabase.com` or `aws-X-region.pooler.supabase.com`
   - Has TWO modes:
     - **Transaction mode** (default): ❌ Doesn't support prepared statements
     - **Session mode**: ✅ Supports prepared statements
   - Use for: `DATABASE_URL` (app queries)

**The Problem:**
- Your current `DATABASE_URL` uses transaction mode pooler (port 6543)
- Prisma migrations need prepared statements
- Transaction mode pooler doesn't support prepared statements → Error!

**The Solution:**
- Use direct connection (port 5432) for `DIRECT_URL` → Migrations work ✅
- Keep pooler (port 6543) for `DATABASE_URL` → App queries work ✅

---

## Quick Test

After setting up, check your deployment logs. You should see:
```
✔ Applied migration: 20251125120000_init_postgresql
✔ Applied migration: 20251125120001_add_barber_and_started_at
...
```

Instead of the "prepared statement" error.

