# ✅ Final Solution: Use Direct Connection

The connection pooler URLs aren't working (might not be enabled for your plan). Let's use the direct connection and make sure the database stays awake.

## What I Just Did

I've updated Vercel to use the **direct connection** (port 5432) with SSL mode.

## Important: Wake Up Your Database

Supabase free tier databases **auto-sleep** after inactivity. You need to wake it up:

### Step 1: Wake Up Database

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/sql/new

2. **Run this query:**
   ```sql
   SELECT 1;
   ```

3. **This wakes up the database immediately**

### Step 2: Test Dashboard

After waking the database, test:
https://barberq-mvp.vercel.app/dashboard

It should work now!

## Keep Database Awake

To prevent it from sleeping:

1. **Visit your Supabase dashboard regularly**
2. **Or set up a cron job** (if you have one) to ping the database
3. **Or upgrade to Supabase Pro** (no auto-sleep)

## If It Still Doesn't Work

1. **Check Vercel logs:**
   ```bash
   npx vercel logs --follow
   ```

2. **Verify database is awake:**
   - Run `SELECT 1;` in SQL Editor
   - Check if you can query tables

3. **Test connection locally:**
   ```bash
   npx prisma db push
   ```

## Current Connection String

```
postgresql://postgres:SatzWolf04%21@db.mcphvyfryizizdxtvnoh.supabase.co:5432/postgres?sslmode=require
```

This is the **direct connection** which works when the database is awake.

---

**Next step: Wake up the database (Step 1 above) and test!** 🚀

