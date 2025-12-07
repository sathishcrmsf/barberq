# 🔧 Fix: Database Connection Failed

## Quick Diagnosis

### Step 1: Check Where the Error Occurs

**Is it happening:**
- ✅ **Locally?** → Your local connection works (test passed)
- ❌ **On Vercel?** → Most likely - see fixes below
- ❓ **In browser?** → Check browser console for specific error

### Step 2: Test Your Vercel Deployment

Visit these URLs on your Vercel site:

1. **Health Check:**
   ```
   https://your-app.vercel.app/api/health
   ```
   Should show: `{"status":"healthy","database":"connected"}`

2. **Debug Endpoint:**
   ```
   https://your-app.vercel.app/api/debug
   ```
   Shows detailed connection info

---

## Common Causes & Fixes

### ❌ Issue 1: DATABASE_URL Not Set in Vercel

**Symptom:** Error on Vercel, works locally

**Fix:**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Your project → **Settings** → **Environment Variables**
3. Check if `DATABASE_URL` exists
4. If missing, add it:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Supabase pooler connection string (port 6543)
   - **Environments**: ✓ All
5. **Redeploy** (Vercel will auto-redeploy)

---

### ❌ Issue 2: DIRECT_URL Missing (For Supabase Migrations)

**Symptom:** Build fails with "prepared statement" error

**Fix:**
1. Get direct connection string from Supabase:
   - Go to [supabase.com/dashboard](https://supabase.com/dashboard)
   - Your project → **Settings** → **Database**
   - **Connection string** → **URI** tab
   - Copy (port 5432, domain: `db.xxx.supabase.co`)

2. Add to Vercel:
   - **Name**: `DIRECT_URL`
   - **Value**: Direct connection string (port 5432)
   - **Environments**: ✓ All

3. **Redeploy**

---

### ❌ Issue 3: Supabase Database Sleeping

**Symptom:** Works sometimes, fails other times

**Fix:**
1. Visit [supabase.com/dashboard](https://supabase.com/dashboard)
2. Open your project
3. Wait 20 seconds (wakes up the database)
4. Try your app again

**Note:** Free tier Supabase databases sleep after inactivity. They wake when you visit the dashboard.

---

### ❌ Issue 4: Wrong Connection String Format

**Symptom:** Connection fails immediately

**Check your connection strings:**

**For DATABASE_URL (app queries):**
```
✅ Correct: postgresql://postgres.xxx:password@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true
❌ Wrong:   postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

**For DIRECT_URL (migrations):**
```
✅ Correct: postgresql://postgres.xxx:password@db.xxx.supabase.co:5432/postgres
❌ Wrong:   postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres
```

---

### ❌ Issue 5: Environment Variables Not Applied

**Symptom:** Added env vars but still failing

**Fix:**
1. In Vercel → **Settings** → **Environment Variables**
2. Make sure variables are set for **all environments**:
   - ✓ Production
   - ✓ Preview  
   - ✓ Development
3. **Redeploy** after adding/changing variables
4. Wait for deployment to complete

---

## Quick Test Commands

### Test Locally:
```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npm run db:test
```

### Test on Vercel:
```bash
# Replace with your Vercel URL
curl https://your-app.vercel.app/api/health
curl https://your-app.vercel.app/api/debug
```

---

## Step-by-Step Fix (If Nothing Works)

1. **Verify Supabase Database:**
   - Visit Supabase dashboard
   - Check project is active
   - Copy fresh connection strings

2. **Clear Vercel Environment Variables:**
   - Delete `DATABASE_URL` and `DIRECT_URL`
   - Re-add them with fresh values
   - Make sure no extra spaces or quotes

3. **Redeploy:**
   - Go to Vercel → Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

4. **Check Build Logs:**
   - Vercel → Deployments → Click failed deployment
   - Look for specific error messages
   - Check if migrations ran successfully

---

## Still Not Working?

1. **Check Vercel Logs:**
   - Vercel Dashboard → Your Project → Functions
   - Look for error messages

2. **Test Connection String:**
   - Use the connection string in a PostgreSQL client
   - Verify it connects successfully

3. **Check Supabase Status:**
   - Supabase dashboard → Your project
   - Verify database is running
   - Check for any warnings or errors

---

## Expected Behavior

**✅ Working:**
- `/api/health` returns `{"status":"healthy"}`
- `/api/debug` shows connection info
- App can add customers, view queue, etc.

**❌ Not Working:**
- `/api/health` returns `{"status":"unhealthy"}`
- Error messages in browser console
- "Database connection failed" messages

---

## Need More Help?

See these guides:
- `SUPABASE_MIGRATION_FIX.md` - For migration errors
- `FIX_DATABASE_CONNECTION.md` - Detailed connection fixes
- `DIAGNOSE_DATABASE_ISSUE.md` - Full diagnostic guide

