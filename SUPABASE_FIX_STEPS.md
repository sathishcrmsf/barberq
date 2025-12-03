# 🔧 Fix Supabase Connection - Step by Step

## Step 1: Check if Project is Paused

1. **Go to your Supabase dashboard:**
   https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh

2. **Look for:**
   - A message saying "Project is paused" or "Resume project"
   - A big button that says "Resume" or "Restore"
   - Any warning about inactivity

3. **If paused:**
   - Click "Resume" or "Restore" button
   - Wait 1-2 minutes for it to wake up
   - Then proceed to Step 2

## Step 2: Find Connection Pooler URL

### Method A: Database Settings (Most Common)

1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database

2. Scroll down and look for:
   - **"Connection pooling"** section
   - **"Pooler"** tab or section
   - **"Connection string"** with tabs (URI, Session mode, Transaction mode)

3. **If you see tabs:**
   - Click on **"Session mode"** tab
   - Copy the connection string shown
   - It should have port **6543** and **pooler.supabase.com**

### Method B: Project Settings

1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/general

2. Look for:
   - **"Connection info"**
   - **"Database URL"**
   - **"Connection parameters"**

### Method C: API Settings

1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/api

2. Sometimes connection info is here

## Step 3: What to Look For

The connection pooler URL should have:
- ✅ Port **6543** (not 5432)
- ✅ Domain with **pooler.supabase.com** (not db.supabase.co)
- ✅ User might be **postgres.mcphvyfryizizdxtvnoh** or just **postgres**

Example formats:
```
postgresql://postgres.mcphvyfryizizdxtvnoh:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

OR

```
postgresql://postgres:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres
```

## Step 4: Tell Me What You Found

Once you have the connection pooler URL:
1. **Copy it**
2. **Paste it here**
3. I'll update Vercel automatically!

## If You Can't Find It

Tell me:
1. **Is the project paused?** (Yes/No)
2. **What sections do you see** in Database settings?
3. **Any connection strings visible?** (What do they show?)
4. **What's your Supabase plan?** (Free/Pro)

Then I can help construct the correct URL or find another solution!

---

**Start with Step 1 - check if your project is paused!** 🚀

