# How to Get Your Supabase Database Connection String

You've provided the public Supabase credentials, but we need the **PostgreSQL connection string** for Prisma.

## Steps to Get Database Connection String:

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard
   - Select your project: `mcphvyfryizizdxtvnoh`

2. **Navigate to Database Settings:**
   - Click **Settings** (gear icon in left sidebar)
   - Click **Database** in the settings menu

3. **Find Connection String:**
   - Scroll down to **Connection string** section
   - Click on **URI** tab (not "Session mode" or "Transaction mode")
   - You'll see something like:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.mcphvyfryizizdxtvnoh.supabase.co:5432/postgres
     ```

4. **Get Your Database Password:**
   - If you don't remember your password, click **Reset database password**
   - Copy the new password (save it somewhere safe!)

5. **Replace [YOUR-PASSWORD] in the connection string:**
   - Take the connection string
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - Final string should look like:
     ```
     postgresql://postgres:your_actual_password@db.mcphvyfryizizdxtvnoh.supabase.co:5432/postgres
     ```

6. **Add Connection Pooling (Important for Supabase):**
   - Add `?pgbouncer=true&connection_limit=1` at the end
   - Final connection string:
     ```
     postgresql://postgres:your_actual_password@db.mcphvyfryizizdxtvnoh.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1
     ```

## Alternative: Use Connection Pooling URL

Supabase also provides a direct connection pooling URL:
- Look for **Connection pooling** section in Database settings
- Use the **Session mode** connection string
- It will have `pooler.supabase.com` in the URL instead of `db.supabase.co`

---

**Once you have the connection string, paste it here and I'll set everything up!**

