# 🔧 Run Database Migrations

## The Problem

You're seeing "Database not initialized. Please run migrations."

This means your database tables don't exist yet. You need to run migrations to create them.

## ⚠️ Important: Prisma Migrate Needs Direct Connection

**Prisma Migrate cannot use connection poolers.** You need to use the **direct connection** URL (port 5432) for migrations, not the pooler URL (port 6543).

## ✅ Solution: Use Direct Connection for Migrations

### Step 1: Get Your Direct Connection String

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **Database**
4. Under **Connection string**, click the **"URI"** tab (not Session mode)
5. Copy the connection string - it should look like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
   - Uses `db.xxx.supabase.co` (not `pooler.supabase.com`)
   - Uses port `5432` (not 6543)

### Step 2: Temporarily Update DATABASE_URL for Migrations

**Option A: Use Environment Variable Override (Recommended)**

Run the migration with the direct connection string:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Replace with your direct connection string from Supabase
DIRECT_DB_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"

# Run migration with direct connection
DATABASE_URL="$DIRECT_DB_URL" npx prisma migrate deploy
```

**Option B: Temporarily Update .env.local**

1. **Backup your current connection string:**
   ```bash
   cp .env.local .env.local.backup
   ```

2. **Temporarily update .env.local** with the direct connection string:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres"
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate deploy
   ```

4. **Restore the pooler URL** for your app:
   ```bash
   # Restore the backup
   mv .env.local.backup .env.local
   ```

### Step 3: Verify Migrations Ran Successfully

After running migrations, you should see:
```
✅ Applied migration: 20251125120000_init_postgresql
✅ Applied migration: 20251125120001_add_barber_and_started_at
✅ Applied migration: 20251130224956_add_customer_model
✅ Applied migration: 20251201234138_add_missing_tables
✅ Applied migration: 20251203013317_add_performance_indexes
✅ Applied migration: 20251204000000_add_customer_email
```

### Step 4: Restart Your Dev Server

After migrations are complete:

```bash
rm -rf .next
npm run dev
```

## Alternative: Run Migrations via Supabase SQL Editor

If Prisma migrations don't work, you can manually run the SQL:

1. Go to Supabase Dashboard → Your project
2. Go to **SQL Editor**
3. Copy the contents of each migration file from `prisma/migrations/` folder
4. Run them in order:
   - `20251125120000_init_postgresql/migration.sql`
   - `20251125120001_add_barber_and_started_at/migration.sql`
   - `20251130224956_add_customer_model/migration.sql`
   - `20251201234138_add_missing_tables/migration.sql`
   - `20251203013317_add_performance_indexes/migration.sql`
   - `20251204000000_add_customer_email/migration.sql`

## Connection String Formats

**For Migrations (Direct Connection):**
```
postgresql://postgres:PASSWORD@db.xxxxx.supabase.co:5432/postgres
```

**For App (Connection Pooler):**
```
postgresql://postgres.xxxxx:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Summary

1. Get direct connection string from Supabase (URI tab, port 5432)
2. Run migrations using direct connection: `DATABASE_URL="direct_url" npx prisma migrate deploy`
3. Keep using pooler URL in `.env.local` for your app (port 6543)
4. Restart dev server

After migrations complete, your database tables will exist and the error will be gone! 🎉

