# 🚀 Quick Fix: Database Connection (2 Minutes)

## The Problem
```
Error: Can't reach database server at `db.mcphvyfryizizdxtvnoh.supabase.co:5432`
```

## The Fix (2 Steps)

### Step 1: Get Connection Pooler URL (1 min)

1. Go to: **https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database**
2. Scroll to **"Connection pooling"** section
3. Click **"Session mode"** tab
4. Click **"Copy"** button
5. You'll get a URL like:
   ```
   postgresql://postgres.mcphvyfryizizdxtvnoh:password@aws-0-region.pooler.supabase.com:6543/postgres
   ```

### Step 2: Update Vercel (1 min)

1. Go to: **https://vercel.com/dashboard** → Your project → **Settings** → **Environment Variables**
2. Find `DATABASE_URL` → Click **Edit**
3. **Replace** with the pooler URL from Step 1
4. Select all environments (✅ Production, ✅ Preview, ✅ Development)
5. Click **Save**
6. Go to **Deployments** → Click **⋯** on latest → **Redeploy**

**Done!** Wait 2-3 minutes, then test your dashboard.

---

## ✅ Verify It Works

**Test locally:**
```bash
npm run db:test
```

**Test in production:**
- Visit your Vercel URL → `/dashboard`
- Should load without errors

---

## 📖 Full Guide

For detailed instructions, see: **`FIX_DATABASE_CONNECTION_V2.md`**

---

## Key Differences

**❌ Old (Direct):**
```
postgresql://postgres:pass@db.xxx.supabase.co:5432/postgres
```
Port: 5432, Domain: `db.supabase.co`

**✅ New (Pooler):**
```
postgresql://postgres.xxx:pass@aws-0-region.pooler.supabase.com:6543/postgres
```
Port: **6543**, Domain: `pooler.supabase.com`

---

**That's it!** After updating and redeploying, your connection should work. 🎉

