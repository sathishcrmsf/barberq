# Fix Database Migration Connection Issue

## Problem
Cannot reach database server when running `npx prisma migrate dev`

## Solution for Supabase

Supabase requires **two different connection strings**:

1. **Pooler URL** (port 6543) - For runtime/application
2. **Direct URL** (port 5432) - For migrations

### Step 1: Get Your Supabase Connection Strings

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **Database**
3. Find **Connection string** section
4. Copy **BOTH**:
   - **Connection pooling** (port 6543) → Use for `DATABASE_URL`
   - **Direct connection** (port 5432) → Use for `DIRECT_URL`

### Step 2: Update Your .env File

In `/barberq-mvp/.env`, make sure you have:

```env
# For runtime (pooler - port 6543)
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# For migrations (direct - port 5432)
DIRECT_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-1-ap-south-1.pooler.supabase.com:5432/postgres
```

**Important:** 
- Replace `[YOUR-PASSWORD]` with your actual database password
- The DIRECT_URL should use port **5432** (not 6543)
- Remove `?pgbouncer=true` from DIRECT_URL

### Step 3: Test Connection

```bash
# Test if you can connect
npx prisma db pull
```

If this works, proceed to migration.

### Step 4: Run Migration

```bash
npx prisma migrate dev --name add_inventory_management
```

### Alternative: Use db push (Faster for Development)

If migrations still fail, you can push the schema directly:

```bash
npx prisma db push
```

This will create the tables without creating a migration file.

## Troubleshooting

### Still Can't Connect?

1. **Check Supabase Project Status**
   - Make sure your project is active
   - Check if there are any service interruptions

2. **Verify Connection Strings**
   - Make sure passwords are correct
   - Check for extra spaces or quotes in .env file

3. **Check Firewall/Network**
   - Make sure your IP is allowed in Supabase
   - Try from a different network

4. **Use Supabase SQL Editor**
   - Go to Supabase Dashboard → SQL Editor
   - Run the migration SQL manually from:
     `prisma/migrations/20250101000000_add_inventory_management/migration.sql`

## Quick Fix: Manual SQL Execution

If all else fails, you can run the migration SQL directly in Supabase:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `prisma/migrations/20250101000000_add_inventory_management/migration.sql`
3. Paste and run it
4. Mark migration as applied:
   ```bash
   npx prisma migrate resolve --applied 20250101000000_add_inventory_management
   ```
