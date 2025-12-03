# 🔧 Fix Database Connection Error in Production

## Error Message
```
Error: Failed to fetch dashboard data
Can't reach database server at `db.mcphvyfryizizdxtvnoh.supabase.co:5432`
```

## Root Cause
Supabase free tier databases can:
1. **Auto-sleep** after inactivity (need to wake them up)
2. Require **connection pooling** for serverless environments like Vercel
3. Have connection limits that are exceeded

## ✅ Solution: Use Supabase Connection Pooler

### Step 1: Get Connection Pooler URL

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `mcphvyfryizizdxtvnoh`
3. Go to **Settings** → **Database**
4. Scroll to **Connection pooling** section
5. Copy the **Session mode** connection string
   - It should look like: `postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
   - Note: Uses port **6543** (pooler) not 5432 (direct)

### Step 2: Update Vercel Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` and click **Edit**
5. Replace with the **connection pooler URL** from Step 1
6. Make sure it includes:
   - Port **6543** (pooler port)
   - `pooler.supabase.com` domain
   - Your database password
7. Click **Save**

### Step 3: Redeploy

After updating the environment variable:

1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Alternative: Wake Up Database

If your database is sleeping:

1. Go to Supabase Dashboard
2. Your project should auto-wake when you visit it
3. Or make a simple query to wake it up
4. Then redeploy on Vercel

## Verify Connection

After redeploying, test:
1. Visit your Vercel URL
2. Go to `/dashboard`
3. Should load without errors

## Connection String Format

**Direct connection (may not work in serverless):**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**Connection pooler (recommended for Vercel):**
```
postgresql://postgres.xxx:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key differences:**
- Port: `6543` (pooler) vs `5432` (direct)
- Domain: `pooler.supabase.com` vs `db.supabase.co`
- User: `postgres.xxx` (with project ref) vs `postgres`

---

**Once you update the DATABASE_URL in Vercel and redeploy, the connection should work!** 🚀

