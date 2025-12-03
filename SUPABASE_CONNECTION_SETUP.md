# 🔗 Supabase Connection Setup for Vercel

## Your Supabase Project
- **Project URL:** https://mcphvyfryizizdxtvnoh.supabase.co
- **Project Reference:** `mcphvyfryizizdxtvnoh`

## Step-by-Step: Get Connection Pooler URL

### Step 1: Access Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Sign in to your account
3. Select project: `mcphvyfryizizdxtvnoh`

### Step 2: Get Connection Pooler URL
1. Click **Settings** (gear icon in left sidebar)
2. Click **Database** in the settings menu
3. Scroll down to **Connection pooling** section
4. You'll see different connection modes:
   - **Session mode** (recommended for Prisma)
   - **Transaction mode**
   - **Statement mode**

5. **Copy the Session mode connection string**
   - It will look like:
   ```
   postgresql://postgres.mcphvyfryizizdxtvnoh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   - **Important:** Uses port **6543** (pooler) not 5432 (direct)
   - **Important:** Domain is `pooler.supabase.com` not `db.supabase.co`

### Step 3: Get Your Database Password
If you don't have the password:
1. In the same Database settings page
2. Look for **Database password** section
3. If you don't remember it, click **Reset database password**
4. **Save the password securely!**

### Step 4: Replace Password in Connection String
Replace `[YOUR-PASSWORD]` with your actual password:
```
postgresql://postgres.mcphvyfryizizdxtvnoh:your_actual_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 5: Add Connection Parameters (Optional but Recommended)
Add these parameters for better reliability:
```
postgresql://postgres.mcphvyfryizizdxtvnoh:your_password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## Update Vercel Environment Variable

### Step 1: Go to Vercel Dashboard
1. Visit: https://vercel.com/dashboard
2. Select your `barberq-mvp` project

### Step 2: Update DATABASE_URL
1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL` in the list
3. Click **Edit** (or **...** → **Edit**)
4. **Replace** the value with your connection pooler URL from Step 5 above
5. Make sure **Environments** are all selected:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
6. Click **Save**

### Step 3: Redeploy
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **three dots** (⋯) menu
4. Click **Redeploy**
5. Wait 2-3 minutes for deployment to complete

## Verify Connection

After redeploying:
1. Visit your Vercel URL: https://barberq-mvp.vercel.app
2. Go to `/dashboard`
3. Should load without "Failed to fetch dashboard data" error

## Connection String Comparison

### ❌ Direct Connection (Current - May Not Work)
```
postgresql://postgres:password@db.mcphvyfryizizdxtvnoh.supabase.co:5432/postgres
```
- Port: 5432
- Domain: `db.supabase.co`
- User: `postgres`
- **Problem:** Doesn't work well in serverless environments

### ✅ Connection Pooler (Recommended)
```
postgresql://postgres.mcphvyfryizizdxtvnoh:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```
- Port: **6543** (pooler port)
- Domain: `pooler.supabase.com`
- User: `postgres.mcphvyfryizizdxtvnoh` (includes project ref)
- **Benefits:** Works reliably in serverless, handles connection pooling

## Troubleshooting

### Still Getting Connection Errors?
1. **Check database is awake:**
   - Visit Supabase dashboard
   - Database should auto-wake
   - Or run a simple query in SQL Editor

2. **Verify connection string format:**
   - Must use port 6543
   - Must use `pooler.supabase.com` domain
   - Must include your actual password

3. **Check Vercel logs:**
   ```bash
   npx vercel logs --follow
   ```
   Look for database connection errors

4. **Test connection locally:**
   ```bash
   # Update .env with pooler URL
   npx prisma db push
   ```

## Quick Reference

- **Supabase Dashboard:** https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh
- **Database Settings:** Settings → Database
- **Connection Pooling:** Scroll to "Connection pooling" section
- **Session Mode:** Use this for Prisma

---

**Once you update the DATABASE_URL in Vercel with the connection pooler URL and redeploy, your dashboard should work!** 🚀

