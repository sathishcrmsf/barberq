# 🔍 How to Find the Connection Pooler URL

You're looking at PgBouncer info! Now we need the actual connection string.

## Where to Find It

### Step 1: Go to Database Settings
1. Go to: https://supabase.com/dashboard/project/YOUR_NEW_PROJECT_ID/settings/database
   (Replace YOUR_NEW_PROJECT_ID with your new project's ID)

### Step 2: Find Connection Pooling Section
Scroll down until you see **"Connection pooling"** section

### Step 3: Look for Connection String
You should see something like:

```
Connection pooling
┌─────────────────────────────────────────────────────────┐
│ Session mode                                             │
│ postgresql://postgres.xxx:password@aws-0-region.        │
│ pooler.supabase.com:6543/postgres                      │
│ [Copy] button                                           │
└─────────────────────────────────────────────────────────┘
```

### Step 4: Copy the Full String
- Click the **"Copy"** button (or select all and copy)
- The full string should look like:
  ```
  postgresql://postgres.xxx:password@aws-0-us-east-2.pooler.supabase.com:6543/postgres
  ```

## What to Look For

The connection string should have:
- ✅ Starts with `postgresql://`
- ✅ Has `pooler.supabase.com` in the domain
- ✅ Port is **6543** (not 5432)
- ✅ User might be `postgres.xxx` (with project ID)

## If You See Tabs

If you see tabs like:
- **URI**
- **Session mode** ← Click this one!
- **Transaction mode**

Click on **"Session mode"** and copy that connection string.

## Alternative: Direct Connection String

If you can't find the pooler, get the direct connection string:
1. In Database settings, find **"Connection string"** section
2. Click **"URI"** tab
3. Copy that string
4. We can try that first, though pooler is better

---

**Once you have the full connection string (the entire URL), paste it here and I'll update Vercel!** 🚀

