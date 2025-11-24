# Database Setup Guide - Fix Vercel Deployment Error

## 🔴 Issue: "Failure to create queue" on Vercel

**Root Cause:** SQLite doesn't work on Vercel's serverless environment because the file system is read-only.

**Solution:** Migrate to PostgreSQL using Neon (free serverless database).

---

## ✅ Quick Setup - Neon Database (Recommended)

### Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (free tier - no credit card required)
3. Click "Create a project"

### Step 2: Create Your Database

1. **Project Name**: `barberq-mvp`
2. **Region**: Choose the closest to your users
3. **PostgreSQL Version**: 16 (latest)
4. Click "Create Project"

### Step 3: Copy Your Connection String

Neon will show you a connection string like:

```
postgresql://username:password@ep-xxx.region.aws.neon.tech/barberq?sslmode=require
```

**Keep this safe!** You'll need it in the next step.

---

## 🚀 Deploy to Vercel with Database

### Step 1: Set Environment Variable in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name**: `DATABASE_URL`
   - **Value**: Your Neon connection string (from above)
   - **Environment**: Production, Preview, Development (select all)
5. Click "Save"

### Step 2: Push Updated Code

The Prisma schema has been updated to use PostgreSQL. Now push the changes:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Add the changes
git add .
git commit -m "Migrate to PostgreSQL for Vercel deployment"
git push origin main
```

### Step 3: Vercel Will Auto-Deploy

Vercel will automatically:
1. Detect the push
2. Run `prisma generate` (configured in package.json)
3. Run `prisma migrate deploy` (if migrations exist)
4. Build and deploy your app

---

## 🧪 Test Your Deployment

Once deployed, test:

1. Visit your Vercel URL
2. Click "Add Customer"
3. Fill in the form and submit
4. ✅ Customer should appear in the queue (no errors!)

---

## Alternative: Vercel Postgres

If you prefer Vercel's built-in database:

### Step 1: Create Vercel Postgres Database

1. In your Vercel project dashboard
2. Go to **Storage** tab
3. Click "Create Database"
4. Select "Postgres"
5. Name it `barberq-db`
6. Click "Create"

### Step 2: Connect to Project

1. Vercel will automatically add `DATABASE_URL` to your environment variables
2. No manual configuration needed!

### Step 3: Redeploy

```bash
# Trigger a redeploy (or use Vercel dashboard)
git commit --allow-empty -m "Trigger redeploy with database"
git push origin main
```

---

## Alternative: Supabase

For a free PostgreSQL database with additional features:

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Click "New Project"
4. Name: `barberq-mvp`
5. Database Password: (create a strong password)
6. Region: Choose closest to you
7. Click "Create Project"

### Step 2: Get Connection String

1. Go to **Settings** → **Database**
2. Find "Connection string" → "URI"
3. Copy the connection string
4. Replace `[YOUR-PASSWORD]` with your actual password

### Step 3: Add to Vercel

Follow the same steps as Neon above to add `DATABASE_URL` to Vercel.

---

## 🔧 Local Development with PostgreSQL

If you want to test locally with PostgreSQL:

### Option 1: Use Neon's Development Branch

Neon allows branching for development:

```bash
# Use the same connection string locally
echo "DATABASE_URL=your_neon_connection_string" > .env
```

### Option 2: Keep SQLite for Local Development

Create a `.env` file:

```bash
# For local development only
DATABASE_URL="file:./prisma/dev.db"
```

In production (Vercel), the environment variable will override this.

---

## 📋 Verification Checklist

After setup:

- [ ] Neon/Vercel Postgres/Supabase account created
- [ ] Database connection string copied
- [ ] `DATABASE_URL` added to Vercel environment variables
- [ ] Code pushed to GitHub
- [ ] Vercel auto-deployed successfully
- [ ] Tested adding a customer on live site
- [ ] Queue displays correctly
- [ ] Status updates work
- [ ] Delete functionality works

---

## 🆘 Troubleshooting

### "Error: P1001 - Can't reach database server"

**Solution:** Check your `DATABASE_URL`:
- Ensure it includes `?sslmode=require` at the end
- Verify the connection string is correct
- Check if your database is active (Neon has auto-sleep)

### "Error: P3009 - migrate failed"

**Solution:** Reset and create migrations:

```bash
# Create a new migration
npx prisma migrate dev --name init
```

Then commit and push.

### Build Fails on Vercel

**Solution:** Check build logs:
1. Vercel Dashboard → Your Project → Deployments
2. Click the failed deployment
3. Check logs for specific errors
4. Common fix: Ensure `postinstall` script runs `prisma generate`

---

## ✅ Done!

Your app should now work perfectly on Vercel with a production-ready PostgreSQL database! 🎉

The "failure to create queue" error will be resolved.

