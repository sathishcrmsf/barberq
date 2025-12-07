# 🚀 Run Database Migrations - Quick Guide

## Current Status
✅ Database connection is working  
❌ Database tables don't exist yet  
✅ Migrations are ready to run

## ⚠️ Important: Migrations Need Direct Connection

Prisma Migrate **cannot use connection poolers**. You need the **direct connection string** (port 5432) for migrations, but keep using the **pooler** (port 6543) for your app.

## ✅ Quick Fix (3 Steps)

### Step 1: Get Direct Connection String from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Click the **"URI"** tab (not "Session mode")
6. Copy the connection string - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres
   ```
   - Uses `db.xxx.supabase.co` domain (not pooler)
   - Uses port `5432` (not 6543)
   - Replace `[YOUR-PASSWORD]` with your actual password

### Step 2: Run Migrations with Direct Connection

Run this command (replace with your direct connection string):

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Replace YOUR_PASSWORD with your actual database password
DIRECT_URL="postgresql://postgres:YOUR_PASSWORD@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres"

# Run migrations
DATABASE_URL="$DIRECT_URL" npx prisma migrate deploy
```

**Or if your password has special characters, URL-encode them:**
- `!` → `%21`
- `@` → `%40`
- `#` → `%23`
- etc.

Example:
```bash
DATABASE_URL="postgresql://postgres:SatzWolf04%21@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres" npx prisma migrate deploy
```

### Step 3: Verify Success

You should see output like:
```
✅ Applied migration: 20251125120000_init_postgresql
✅ Applied migration: 20251125120001_add_barber_and_started_at
✅ Applied migration: 20251130224956_add_customer_model
✅ Applied migration: 20251201234138_add_missing_tables
✅ Applied migration: 20251203013317_add_performance_indexes
✅ Applied migration: 20251204000000_add_customer_email
```

## After Migrations Complete

1. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next
   npm run dev
   ```

2. **Try accessing customers page again** - it should work now!

## Your Current Setup

- **App connection (in .env.local):** Pooler URL (port 6543) ✅ Keep this!
- **Migrations:** Need direct URL (port 5432) ✅ Use temporarily

## Connection String Comparison

**For Migrations (Direct - port 5432):**
```
postgresql://postgres:PASSWORD@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres
```

**For App (Pooler - port 6543):**
```
postgresql://postgres.jlgnvvplpnlpkgdmfriu:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Quick Command (Copy & Paste)

Replace `YOUR_PASSWORD` with your actual password:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp && DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres" npx prisma migrate deploy
```

**If password has special characters, URL-encode them!**

After migrations complete, your database will have all the tables and everything will work! 🎉

