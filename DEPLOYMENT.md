# BarberQ MVP - Deployment Guide

## 🎉 Your MVP is Ready for Deployment!

All code has been tested and committed to Git. You can now deploy to Vercel.

---

## ⚠️ IMPORTANT: Database Setup Required First

**SQLite does NOT work on Vercel!** You must set up a PostgreSQL database before deploying.

👉 **Follow the [DATABASE_SETUP.md](./DATABASE_SETUP.md) guide first**, then return here.

---

## Option 1: Deploy via Vercel Website (Recommended)

This is the easiest method and requires no CLI installation.

### Prerequisites:

✅ PostgreSQL database created (Neon/Vercel Postgres/Supabase)
✅ `DATABASE_URL` connection string ready

### Steps:

1. **Go to [vercel.com](https://vercel.com)** and sign in with your GitHub account

2. **Click "Add New Project"**

3. **Import your Git repository:**
   - If you've pushed to GitHub, select your `barberq-mvp` repository
   - If not pushed yet, you'll need to push first:
     ```bash
     git remote add origin YOUR_GITHUB_REPO_URL
     git push -u origin main
     ```

4. **Configure Project:**
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: Uses vercel.json config (includes Prisma migrations)
   - **Output Directory**: `.next` (default)

5. **Environment Variables** (REQUIRED):
   
   Add this environment variable:
   ```
   DATABASE_URL=your_postgresql_connection_string
   ```
   
   Example (Neon):
   ```
   DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/barberq?sslmode=require
   ```
   
   **Important:** Select all environments (Production, Preview, Development)

6. **Click "Deploy"**

7. **Wait 2-3 minutes** for the build to complete
   - Prisma will automatically run migrations
   - Database tables will be created

8. **Your app is live!** 🚀
   - Vercel will provide a URL like: `https://barberq-mvp-xxxxx.vercel.app`

---

## Option 2: Deploy via Vercel CLI

If you prefer using the CLI:

### Installation:

```bash
# Install Vercel CLI
npm install -g vercel

# Or use without installing
npx vercel
```

### Deploy:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production directly
vercel --prod
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N** (first time)
- What's your project's name? `barberq-mvp`
- In which directory is your code located? `./`
- Override settings? **N**

---

## Post-Deployment Steps

### 1. Test Your Deployment

Once deployed, test these features:

- ✅ Visit the homepage (should redirect to `/queue`)
- ✅ Add a new customer via `/add` form
- ✅ View the queue at `/queue`
- ✅ Update status: Waiting → In Progress → Done
- ✅ Delete a customer
- ✅ Test on mobile device (responsive design)

### 2. Share Your URL

Your app is now live! Share the Vercel URL with:
- Team members for testing
- Beta users for feedback
- Stakeholders for review

### 3. Monitor Performance

Vercel provides:
- Real-time analytics
- Error tracking
- Performance metrics

Access these from your Vercel dashboard.

---

## Database Considerations

### Current Setup (Production-Ready)
- Using **PostgreSQL** for production deployment
- Serverless database (Neon/Vercel Postgres/Supabase)
- Perfect for MVP and scales to production
- Data persists reliably
- Automatic migrations on deployment

### Why PostgreSQL?
SQLite doesn't work on Vercel because:
- Vercel uses serverless functions (stateless)
- File system is read-only in production
- Database writes would fail

### Database Options:

**Recommended Options:**
1. **Neon** - Free tier, serverless PostgreSQL, auto-scaling
2. **Vercel Postgres** - Seamless Vercel integration
3. **Supabase** - PostgreSQL with realtime features + free tier
4. **Railway** - Simple PostgreSQL hosting

All options work perfectly with this app - choose based on your preference!

---

## Troubleshooting

### "Failure to create queue" Error
This means SQLite is being used instead of PostgreSQL.

**Solution:**
1. Ensure `DATABASE_URL` is set in Vercel environment variables
2. Verify the connection string includes `?sslmode=require` for Neon
3. Redeploy after setting the environment variable

### Build Fails
- Check Vercel build logs for errors
- Ensure all dependencies are in `package.json`
- Verify `prisma generate` runs in build script
- Check if migrations ran: Look for "prisma migrate deploy" in logs

### Database Connection Errors
**Error: "Can't reach database server"**
- Confirm `DATABASE_URL` is set correctly in Vercel
- Verify your database is active (Neon auto-sleeps after inactivity)
- Check connection string format matches your provider
- Ensure SSL mode is enabled: `?sslmode=require`

**Error: "Migration failed"**
- Database might not exist yet
- Connection string might be incorrect
- Check Vercel build logs for specific migration errors

### Page Not Found
- Verify app router structure in `app/` directory
- Check for errors in `layout.tsx` and `page.tsx` files
- Review Vercel deployment logs

### Empty Queue After Deployment
- Check browser console for API errors
- Verify API routes are working: Visit `https://your-app.vercel.app/api/walkins`
- Check Vercel Functions logs for API errors

---

## Continuous Deployment

Vercel automatically redeploys when you push to your Git repository:

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push origin main

# Vercel auto-deploys! ✨
```

---

## Testing Complete ✅

Your MVP has been thoroughly tested:

| Feature | Status |
|---------|--------|
| Queue page with empty state | ✅ Tested |
| Add customer form | ✅ Tested |
| Status updates (Waiting → In Progress → Done) | ✅ Tested |
| Delete functionality | ✅ Tested |
| Mobile responsiveness (375px - 1920px) | ✅ Tested |
| Touch-friendly UI | ✅ Tested |
| API routes (GET, POST, PATCH, DELETE) | ✅ Tested |
| Error handling & validation | ✅ Tested |

---

## Next Steps After Deployment

1. **Gather Feedback** - Share with real users
2. **Monitor Usage** - Check Vercel analytics
3. **Iterate** - Based on user feedback
4. **Scale** - Consider database migration when needed

---

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Prisma Docs**: [prisma.io/docs](https://prisma.io/docs)

---

**Ready to Deploy?** Follow Option 1 above and your app will be live in minutes! 🚀

