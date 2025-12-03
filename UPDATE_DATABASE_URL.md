# 🔄 Simple Steps to Fix Database Connection

## What You Need to Do (3 Steps)

### Step 1: Get the Connection Pooler URL from Supabase

1. **Open this link in your browser:**
   ```
   https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database
   ```

2. **Scroll down** until you see **"Connection pooling"** section

3. **Find "Session mode"** - it will show a connection string like:
   ```
   postgresql://postgres.mcphvyfryizizdxtvnoh:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```

4. **Click the "Copy" button** next to it (or select all and copy)

5. **Replace `[YOUR-PASSWORD]`** with your actual database password
   - If you don't know it, click "Reset database password" in the same page
   - Your password is: `SatzWolf04!` (from your current connection)

6. **Final URL should look like:**
   ```
   postgresql://postgres.mcphvyfryizizdxtvnoh:SatzWolf04!@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Step 2: Update in Vercel (Using Terminal - Automatic!)

Once you have the connection pooler URL, run this command:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx vercel env rm DATABASE_URL production
npx vercel env add DATABASE_URL production
# When prompted, paste your connection pooler URL
```

Or I can help you do it - just paste the connection pooler URL here!

### Step 3: Redeploy

```bash
npx vercel --prod
```

---

## 🎯 Quick Visual Guide

**What you're looking for in Supabase:**

```
Connection pooling
┌─────────────────────────────────────────┐
│ Session mode                            │
│ postgresql://postgres.mcphvyfryizizdxtvnoh:│
│ [YOUR-PASSWORD]@aws-0-us-east-1.       │
│ pooler.supabase.com:6543/postgres       │
│ [Copy] button                            │
└─────────────────────────────────────────┘
```

**Key things to check:**
- ✅ Port is **6543** (not 5432)
- ✅ Domain has **pooler.supabase.com** (not db.supabase.co)
- ✅ User is **postgres.mcphvyfryizizdxtvnoh** (has project ref)

---

## 🤖 Or Let Me Do It For You!

If you paste the connection pooler URL here, I can update it automatically using the Vercel CLI!

