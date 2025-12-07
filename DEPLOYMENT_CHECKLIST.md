# 🚀 Deployment Checklist

## ✅ Pre-Deployment (Before You Deploy)

### 1. Environment Variables in Vercel

**Required:**
- [ ] `DATABASE_URL` - Your Supabase pooler connection (port 6543)
- [ ] `DIRECT_URL` - Your Supabase direct connection (port 5432) **← CRITICAL for migrations!**

**How to add:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → **Settings** → **Environment Variables**
3. Add both variables
4. Select **all environments** (Production, Preview, Development)
5. Click **Save**

### 2. Get Connection Strings from Supabase

**For DATABASE_URL (pooler):**
- Supabase Dashboard → Settings → Database
- **Connection pooling** → **Transaction mode** or **Session mode**
- Copy connection string (port 6543)

**For DIRECT_URL (direct):**
- Supabase Dashboard → Settings → Database
- **Connection string** → **URI** tab
- Copy connection string (port 5432)

### 3. Verify Supabase Database is Active

- Visit [supabase.com/dashboard](https://supabase.com/dashboard)
- Open your project
- Wait 20 seconds (wakes up database if sleeping)

---

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
git push origin main
```

### Step 2: Monitor Deployment

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → **Deployments**
3. Watch the build logs

**Expected build steps:**
- ✅ Installing dependencies
- ✅ Running `prisma generate`
- ✅ Running `prisma migrate deploy` (should succeed with DIRECT_URL)
- ✅ Building Next.js app
- ✅ Deployment complete

### Step 3: Check Build Logs

**If build fails:**
- Check for "prepared statement" error → Missing `DIRECT_URL`
- Check for "Can't reach database" → Database sleeping or wrong connection string
- Check for migration errors → See `SUPABASE_MIGRATION_FIX.md`

---

## ✅ Post-Deployment Verification

### 1. Test Health Endpoint

Visit: `https://your-app.vercel.app/api/health`

**Should return:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### 2. Test Debug Endpoint

Visit: `https://your-app.vercel.app/api/debug`

**Should show:**
- Connection info
- Database counts
- Provider details

### 3. Test App Functionality

- [ ] Visit your Vercel URL
- [ ] Queue page loads
- [ ] Can add a customer
- [ ] Customer appears in queue
- [ ] Can update status
- [ ] Can delete customer

---

## 🔧 Common Issues

### Build Fails: "prepared statement does not exist"

**Fix:** Add `DIRECT_URL` to Vercel environment variables
- See `SUPABASE_MIGRATION_FIX.md`

### Build Fails: "Can't reach database"

**Fix:** 
1. Wake up Supabase database (visit dashboard)
2. Verify connection strings are correct
3. Check both `DATABASE_URL` and `DIRECT_URL` are set

### App Works But Shows "Database connection failed"

**Fix:**
1. Check Vercel environment variables are set
2. Verify connection strings are correct
3. Wake up Supabase database
4. See `DATABASE_CONNECTION_FAILED_FIX.md`

---

## 📝 Quick Reference

**Port Numbers:**
- Port **5432** = Direct connection (for migrations via `DIRECT_URL`)
- Port **6543** = Pooler connection (for app via `DATABASE_URL`)

**Connection String Formats:**
- Pooler: `postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres`
- Direct: `postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres`

---

## 🎉 Success!

Once deployed successfully:
- Your app is live at your Vercel URL
- Database migrations are applied
- All features should work

**Monitor:**
- Vercel Dashboard → Functions (for API logs)
- Supabase Dashboard → Database (for query logs)
