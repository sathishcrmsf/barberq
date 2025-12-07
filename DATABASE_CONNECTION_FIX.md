# 🔧 Fix Database Connection Error

## Current Error
```
Can't reach database server at `aws-1-ap-south-1.pooler.supabase.com:5432`
```

## The Problem

You're trying to connect to a **Supabase connection pooler** using the **wrong port**:
- ❌ Using port `5432` (direct connection port)
- ✅ Should use port `6543` (pooler port)

## ✅ Solution

### Option 1: Use Correct Pooler Port (Recommended)

1. **Check your current DATABASE_URL** in `.env.local`:
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   cat .env.local | grep DATABASE_URL
   ```

2. **Update it to use port 6543:**
   
   Current (WRONG):
   ```
   DATABASE_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:5432/..."
   ```
   
   Should be:
   ```
   DATABASE_URL="postgresql://...@aws-1-ap-south-1.pooler.supabase.com:6543/...?pgbouncer=true"
   ```

3. **Restart your dev server:**
   ```bash
   # Stop server (Ctrl+C)
   rm -rf .next  # Clear cache
   npm run dev
   ```

### Option 2: Use Direct Connection (Fallback)

If the pooler doesn't work, use the direct connection:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your project → **Settings** → **Database**
3. Under **Connection string**, click **"URI"** tab
4. Copy the connection string (should use port `5432` and `db.xxx.supabase.co`)
5. Update your `.env.local`:
   ```env
   DATABASE_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
   ```

### Option 3: Get Fresh Connection String from Supabase

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Your project → **Settings** → **Database**
3. Scroll to **Connection pooling** section
4. Copy the **"Session mode"** connection string
5. It should look like:
   ```
   postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
6. Replace your `DATABASE_URL` in `.env.local` with this

## Quick Check

After updating, verify your connection string has:
- ✅ Port `6543` if using pooler (`pooler.supabase.com`)
- ✅ Port `5432` if using direct connection (`db.xxx.supabase.co`)
- ✅ Correct password (URL-encode special characters if needed)
- ✅ Correct database name (usually `postgres`)

## Common Issues

### Database is Sleeping (Supabase Free Tier)
- Visit your Supabase Dashboard to wake it up
- Wait 10-20 seconds after visiting
- Then try your app again

### Connection String Format
Make sure it's a complete URL:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

### Password with Special Characters
If your password has `@`, `#`, `%`, etc., URL-encode them:
- `@` → `%40`
- `#` → `%23`
- `%` → `%25`

## Test Connection

After updating, test it:
```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx prisma db pull
```

If this works, your connection is fixed! 🎉

