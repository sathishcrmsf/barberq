# 🚀 Quick Deployment Guide

## ✅ Step 1: Database Setup (REQUIRED)

**You MUST have a PostgreSQL database before deploying!**

### Option A: Use Neon (Recommended - Free & Easy)
1. Go to [neon.tech](https://neon.tech) and sign up
2. Create a new project: `barberq-mvp`
3. Copy the connection string (looks like: `postgresql://user:pass@ep-xxx.region.aws.neon.tech/barberq?sslmode=require`)

### Option B: Use Vercel Postgres
1. In Vercel dashboard → Your project → Storage tab
2. Click "Create Database" → "Postgres"
3. Name it `barberq-db`
4. Connection string is auto-added to environment variables

### Option C: Use Supabase
1. Go to [supabase.com](https://supabase.com) and create a project
2. Go to Settings → Database
3. Copy the connection string

---

## ✅ Step 2: Set Environment Variable in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project (or create it if it doesn't exist)
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `DATABASE_URL`
   - **Value**: Your PostgreSQL connection string from Step 1
   - **Environments**: ✓ Production, ✓ Preview, ✓ Development (select all)
5. Click **Save**

---

## ✅ Step 3: Deploy

### Option A: Auto-Deploy (Recommended)
Just push to GitHub and Vercel will auto-deploy:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Commit all changes (if you want to deploy everything)
git add .
git commit -m "chore: prepare for deployment"

# Or just push the vercel.json change
git push origin main
```

Vercel will automatically:
- Run `prisma generate`
- Run `prisma migrate deploy` (applies migrations)
- Build your Next.js app
- Deploy to production

### Option B: Deploy via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
vercel --prod
```

### Option C: Deploy via Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New Project" (or select existing project)
3. Import your GitHub repository: `sathishcrmsf/barberq`
4. Configure:
   - Framework: Next.js (auto-detected)
   - Root Directory: `barberq-mvp` (if needed)
   - Build Command: (uses vercel.json - already configured)
5. Add `DATABASE_URL` environment variable (from Step 2)
6. Click **Deploy**

---

## ✅ Step 4: Verify Deployment

After deployment completes (2-3 minutes):

1. **Check Build Logs**
   - Go to Vercel dashboard → Your project → Deployments
   - Click on the latest deployment
   - Verify build succeeded (green checkmark)

2. **Test Your App**
   - Visit your Vercel URL: `https://barberq-mvp-xxxxx.vercel.app`
   - Test the queue page
   - Add a customer
   - Verify it appears in the queue

3. **Check Database**
   - If using Neon/Supabase, check their dashboard
   - Verify tables were created (WalkIn, Customer, Service, etc.)

---

## 🔧 Troubleshooting

### Build Fails
- Check that `DATABASE_URL` is set in Vercel
- Verify connection string format is correct
- Check build logs for specific errors

### "Can't reach database" Error
- Verify `DATABASE_URL` is correct
- Check database provider allows connections from Vercel IPs
- For Neon: Use the connection pooler URL (ends with `?sslmode=require`)

### Migrations Fail
- Check that migrations exist in `prisma/migrations/`
- Verify database is accessible
- Check Vercel build logs for migration errors

---

## 📝 What Changed

✅ Updated `vercel.json` to run Prisma migrations during build:
- `prisma generate` - Generates Prisma Client
- `prisma migrate deploy` - Applies database migrations
- `npm run build` - Builds Next.js app

This ensures your database schema is always up-to-date on deployment!

---

## 🎉 You're Done!

Once deployed, your app will be live at your Vercel URL. All future pushes to `main` will automatically trigger new deployments.
