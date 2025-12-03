# 🚀 Quick Deployment Guide

## ✅ Pre-Deployment Checklist

- [x] Code committed and pushed to GitHub
- [x] Build passes locally
- [ ] PostgreSQL database set up
- [ ] DATABASE_URL environment variable ready

---

## Step 1: Set Up PostgreSQL Database (REQUIRED)

**⚠️ Important:** You need a PostgreSQL database before deploying. SQLite won't work on Vercel.

### Option A: Neon (Recommended - Free)

1. Go to [neon.tech](https://neon.tech) and sign up (GitHub login, no credit card)
2. Create a new project: `barberq-mvp`
3. Copy your connection string (looks like):
   ```
   postgresql://user:password@ep-xxx.region.aws.neon.tech/barberq?sslmode=require
   ```
4. **Save this connection string** - you'll need it in Step 3

### Option B: Vercel Postgres (Easiest)

1. After deploying to Vercel (Step 2), go to your project dashboard
2. Click **Storage** tab → **Create Database** → **Postgres**
3. Vercel will automatically add `DATABASE_URL` - no manual setup needed!

---

## Step 2: Deploy to Vercel

### Via Vercel Website (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Import repository: `sathishcrmsf/barberq`
4. **Root Directory:** Set to `barberq-mvp` (if needed)
5. **Framework:** Next.js (auto-detected)
6. Click **"Deploy"** (you can add DATABASE_URL after)

### Via CLI (Alternative)

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx vercel --prod
```

Follow the prompts to link your project.

---

## Step 3: Add DATABASE_URL Environment Variable

1. In Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name:** `DATABASE_URL`
   - **Value:** Your PostgreSQL connection string (from Step 1)
   - **Environments:** ✅ Production, ✅ Preview, ✅ Development
3. Click **"Save"**
4. **Redeploy** your project (Vercel Dashboard → Deployments → ... → Redeploy)

---

## Step 4: Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://barberq-mvp-xxxxx.vercel.app`)
2. Test these features:
   - ✅ Homepage loads
   - ✅ Queue page works (`/queue`)
   - ✅ Add customer form works (`/add`)
   - ✅ Services page works (`/services`)
   - ✅ Dashboard works (`/dashboard`)

---

## 🐛 Troubleshooting

### Build Fails
- Check Vercel build logs
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

## ✅ Success!

Your app is now live! 🎉

**Next Steps:**
- Share the URL with your team
- Monitor performance in Vercel dashboard
- Gather user feedback

