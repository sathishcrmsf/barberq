# 🔍 Get the Correct Connection URL

The pooler URL I tried might have the wrong format or region. Let's get the exact one from Supabase.

## What to Do

### Step 1: Go to Supabase Database Settings

Open this link:
```
https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database
```

### Step 2: Look for Connection String

Look for ANY section that shows a connection string. It might be labeled as:
- **Connection string**
- **Connection info**
- **Database URL**
- **URI**
- **Connection parameters**

### Step 3: Check What You See

Do you see:
1. **A connection string with port 5432?** (Direct connection - we have this)
2. **A connection string with port 6543?** (Pooler - this is what we need!)
3. **Multiple connection strings?** (Look for one with "pooler" or "6543")
4. **Tabs like "URI", "Session mode", "Transaction mode"?** (Click "Session mode")

### Step 4: Copy What You Find

**Even if it's not labeled "Connection pooling", copy any connection string you see that:**
- Has port **6543** (not 5432)
- Has **pooler.supabase.com** in the domain
- Or shows "Session mode" or "Transaction mode"

## Alternative: Check Project Settings

1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/general
2. Look for **"Region"** - tell me what it says
3. This will help me construct the correct pooler URL

## What I Need From You

Please tell me:
1. **What connection strings do you see** in the Database settings?
2. **What's your project region?** (from General settings)
3. **Any tabs or sections** that mention "pooler", "pooling", or "6543"?

Then I can construct the exact URL that will work!

---

## Quick Test: Wake Up Database First

The database might just be sleeping. Try this:

1. Go to Supabase Dashboard
2. Click on your project
3. Go to **SQL Editor**
4. Run a simple query: `SELECT 1;`
5. This wakes up the database
6. Then test the dashboard again

Sometimes the direct connection works if the database is awake!

