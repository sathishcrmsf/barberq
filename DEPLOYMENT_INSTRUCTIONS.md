# 🚀 Deployment Instructions

## Current Status

✅ **Build successful** - Project builds without errors
✅ **Deployment initiated** - Currently deploying to Vercel
⚠️ **Database setup required** - Need to add PostgreSQL DATABASE_URL

---

## Step 1: Set Up PostgreSQL Database

**⚠️ IMPORTANT:** Vercel requires PostgreSQL (SQLite won't work in production).

### Option A: Use Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project: `barberq-mvp`
3. Copy your connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/barberq?sslmode=require
   ```

### Option B: Use Vercel Postgres (Easiest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Storage** tab → **Create Database** → **Postgres**
4. Vercel will automatically add `DATABASE_URL` - no manual setup needed!

### Option C: Use Supabase (Free)

1. Go to [supabase.com](https://supabase.com) and sign up
2. Create a new project: `barberq-mvp`
3. Go to **Settings** → **Database** → **Connection string** → **URI**
4. Copy the connection string and replace `[YOUR-PASSWORD]` with your password

---

## Step 2: Add DATABASE_URL to Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add:
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
6. Click **Save**

---

## Step 3: Redeploy

After adding the environment variable:

1. Go to **Deployments** tab in Vercel
2. Click the **three dots** (⋯) on the latest deployment
3. Click **Redeploy**
4. Wait for the build to complete (2-3 minutes)

---

## Step 4: Run Database Migrations

After deployment, the database tables need to be created:

### Option A: Via Vercel CLI (Recommended)

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx vercel env pull .env.production
npx prisma migrate deploy
```

### Option B: Via Vercel Dashboard

1. Go to your project → **Deployments**
2. Click on the latest deployment
3. Check the build logs - migrations should run automatically
4. If not, you can run them manually via Vercel CLI

---

## Step 5: Verify Deployment

Visit your Vercel URL (e.g., `https://barberq-2d396r522-barberqs-projects.vercel.app`) and test:

- ✅ Homepage loads
- ✅ Queue page works (`/queue`)
- ✅ Add customer form works (`/add`)
- ✅ Services page works (`/services`)
- ✅ Dashboard works (`/dashboard`)

---

## Troubleshooting

### Build Fails
- Check Vercel build logs for specific errors
- Ensure `DATABASE_URL` is set for all environments
- Verify connection string includes `?sslmode=require`

### "Can't reach database server"
- Verify `DATABASE_URL` is correct
- Check database is active (Neon auto-sleeps - wake it up)
- Ensure SSL mode is enabled

### Database Migration Errors
- Check build logs for specific errors
- Verify database exists and is accessible
- Connection string format must be correct

---

## Your Deployment URLs

- **Production:** https://barberq-2d396r522-barberqs-projects.vercel.app
- **Dashboard:** https://vercel.com/barberqs-projects/barberq-mvp

---

## Next Steps

1. ✅ Set up PostgreSQL database (choose one option above)
2. ✅ Add `DATABASE_URL` to Vercel environment variables
3. ✅ Redeploy the project
4. ✅ Run database migrations
5. ✅ Test the live application

**Your app will be fully functional once the database is set up!** 🎉

