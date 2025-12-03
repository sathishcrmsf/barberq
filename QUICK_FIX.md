# ⚡ Quick Fix Options

## Option 1: Wake Up Database (Easiest!)

The database might just be sleeping. Try this:

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/sql/new

2. **Run this query:**
   ```sql
   SELECT 1;
   ```

3. **This wakes up the database**

4. **Then test your dashboard:**
   https://barberq-mvp.vercel.app/dashboard

The direct connection (port 5432) might work if the database is awake!

---

## Option 2: Get Exact Pooler URL

I need to see what's actually in your Supabase dashboard:

1. **Go to:** https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database

2. **Take a screenshot** or tell me:
   - What sections do you see?
   - Any connection strings visible?
   - What tabs are available?

3. **Or check General Settings:**
   https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/general
   - What region is shown?

---

## Option 3: Try Different Regions

The pooler URL might be in a different region. Tell me your region and I'll update it:

- **US East** (most common)
- **US West** 
- **Europe**
- **Asia Pacific**

---

## What I Just Did

I've reverted to the direct connection (port 5432) with SSL mode. 

**Next steps:**
1. Wake up the database (Option 1 above)
2. Test the dashboard
3. If it works, great! If not, we'll get the exact pooler URL

