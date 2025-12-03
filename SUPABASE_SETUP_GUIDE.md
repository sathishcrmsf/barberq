# 🚀 Supabase Setup Guide for BarberQ

## Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
   - Sign up or log in with GitHub

2. **Create a new project:**
   - Click "New Project"
   - **Name**: `barberq-mvp`
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to your users
   - Click "Create new project"

3. **Wait 2-3 minutes** for the project to be set up

---

## Step 2: Get Connection String

### For Vercel Deployment (Use Connection Pooler)

1. **Go to Database Settings:**
   - In your Supabase project dashboard
   - Go to **Settings** → **Database**

2. **Find Connection Pooling:**
   - Scroll down to **"Connection pooling"** section
   - Click the **"Session mode"** tab
   - Click **"Copy"** to copy the connection string

3. **The connection string should look like:**
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

   **Important:** 
   - Replace `[YOUR-PASSWORD]` with your actual database password
   - URL should have `pooler.supabase.com` (not `db.supabase.co`)
   - Port should be `6543`

### For Local Development (Direct Connection)

1. In the same Database settings page
2. Find **"Connection string"** section
3. Click the **"URI"** tab
4. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

---

## Step 3: Set Up Environment Variables

### For Local Development

Create `.env` file in the project root:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
```

Create `.env` file:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

**Replace:**
- `[YOUR-PASSWORD]` with your actual database password
- `[PROJECT-REF]` with your project reference ID

### For Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project (or create new)
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - **Key**: `DATABASE_URL`
   - **Value**: Your connection pooler string (from Step 2)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
5. Click **Save**

---

## Step 4: Run Database Migrations

After setting up the connection string:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy
```

This will create all the necessary tables in your Supabase database.

---

## Step 5: Verify Connection

Test the connection:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a browser window where you can see your database tables.

---

## Step 6: Deploy to Vercel

Once the database is set up:

1. **Push your code to GitHub** (if not already)
2. **Go to Vercel Dashboard**
3. **Import your repository**
4. **Make sure `DATABASE_URL` is set** (from Step 3)
5. **Click "Deploy"**

Vercel will automatically:
- Run `prisma generate`
- Run `prisma migrate deploy`
- Build and deploy your app

---

## Troubleshooting

### "Can't reach database server"
- Make sure your Supabase project is active (visit dashboard to wake it up)
- Use the connection pooler URL (port 6543) for Vercel
- Verify your password is correct

### "Migration failed"
- Check that `DATABASE_URL` is set correctly
- Ensure your Supabase project is active
- Try using the connection pooler URL

### Connection Pooler Not Found
- Make sure you're on the **"Session mode"** tab in Connection Pooling
- Free tier includes connection pooling
- If you can't find it, use the direct connection string for now

---

## Quick Reference

### Connection Pooler (For Vercel)
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection (For Local)
```
postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

---

**Once you have your connection string, we can proceed with deployment!** 🚀

