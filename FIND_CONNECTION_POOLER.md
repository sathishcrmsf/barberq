# 🔍 How to Find Connection Pooler in Supabase

## If You Can't See "Connection Pooling" Section

The connection pooler might be in a different location or your Supabase plan might have it elsewhere. Let's try these locations:

### Location 1: Database Settings
1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh
2. Click **Settings** (gear icon, bottom left)
3. Click **Database** (in the left sidebar under Settings)
4. Look for these sections:
   - **Connection string** (at the top)
   - **Connection pooling** (scroll down)
   - **Pooler** (might be a separate tab)

### Location 2: Project Settings → Database
1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database
2. Scroll through all sections
3. Look for anything mentioning:
   - "Pooler"
   - "Connection pooling"
   - "PgBouncer"
   - "Session mode"

### Location 3: API Settings
1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/api
2. Sometimes connection info is here

## Alternative: Construct the URL Manually

If you can't find it, we can construct it based on your project details:

**Your project reference:** `mcphvyfryizizdxtvnoh`
**Your password:** `SatzWolf04!`
**Your region:** (we need to find this - usually shown in project settings)

The pattern is:
```
postgresql://postgres.mcphvyfryizizdxtvnoh:SatzWolf04!@aws-0-REGION.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Common regions:
- `us-east-1` (US East)
- `us-west-1` (US West)
- `eu-west-1` (Europe)
- `ap-southeast-1` (Asia)

## What to Look For

In Supabase Dashboard, you might see:
- **Connection string** section with tabs: "URI", "JDBC", "Session mode", "Transaction mode"
- **Connection pooling** as a separate section
- **Pooler connection** in the database settings

## Screenshot Guide

Look for something that shows:
```
Connection pooling
Session mode: postgresql://postgres.xxx:xxx@pooler.supabase.com:6543/...
```

The key indicators:
- Port **6543** (not 5432)
- Domain has **pooler.supabase.com**
- User has **postgres.mcphvyfryizizdxtvnoh** (with your project ref)

## If Still Can't Find It

1. **Check your Supabase plan** - Free tier should have it
2. **Try the direct link:** https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database#connection-pooling
3. **Contact me with:**
   - What sections you DO see in Database settings
   - Your Supabase plan (Free/Pro/etc)
   - Screenshot if possible

Then I can help construct the URL or find another solution!

