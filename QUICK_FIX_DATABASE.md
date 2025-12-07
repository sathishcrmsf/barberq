# 🚨 Quick Fix: Database Connection Failed

## Step 1: Check Your Environment

**Are you running:**
- ✅ **Locally** (http://localhost:3000) → See [Local Fix](#local-fix) below
- ✅ **On Vercel** (production) → See [Vercel Fix](#vercel-fix) below

---

## 🔧 Local Fix (Development)

### Option A: Use SQLite for Local Development (Fastest)

1. **Create `.env` file** in your project root:
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   ```

2. **Add this line to `.env`:**
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   ```

3. **Update schema to use SQLite temporarily:**
   - Open `prisma/schema.prisma`
   - Change line 6 from:
     ```prisma
     provider = "postgresql"
     ```
   - To:
     ```prisma
     provider = "sqlite"
     ```

4. **Reset and recreate database:**
   ```bash
   npx prisma migrate reset --force
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. **Restart dev server:**
   ```bash
   npm run dev
   ```

### Option B: Use PostgreSQL Locally (Same as Production)

If you want to use PostgreSQL locally:

1. **Set up a free database:**
   - Go to [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com)
   - Create a free account and project
   - Copy the connection string

2. **Create `.env` file:**
   ```bash
   cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
   echo "DATABASE_URL=your_postgresql_connection_string_here" > .env
   ```

3. **Run migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## ☁️ Vercel Fix (Production)

### Step 1: Check if DATABASE_URL is Set

1. Go to: https://vercel.com/dashboard
2. Click your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**
4. Check if `DATABASE_URL` exists

### Step 2: Set Up Database (If Missing)

**Choose ONE option:**

#### Option A: Vercel Postgres (Easiest)

1. In Vercel dashboard → Your project
2. Go to **Storage** tab
3. Click **"Create Database"**
4. Select **"Postgres"**
5. Name it `barberq-db`
6. Click **"Create"**
7. ✅ Vercel automatically adds `DATABASE_URL`!

#### Option B: Neon (Free, Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub (free)
3. Click **"Create a project"**
4. Name: `barberq`
5. Copy the connection string (looks like):
   ```
   postgresql://user:pass@ep-xxx.region.aws.neon.tech/barberq?sslmode=require
   ```
6. In Vercel → Settings → Environment Variables
7. Add:
   - **Key**: `DATABASE_URL`
   - **Value**: Paste connection string
   - **Environments**: ✓ All (Production, Preview, Development)
8. Click **"Save"**

#### Option C: Supabase (Free)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create project
3. Go to **Settings** → **Database**
4. Find **"Connection pooling"** section
5. Copy **"Session mode"** connection string (port 6543)
6. In Vercel → Settings → Environment Variables
7. Add `DATABASE_URL` with the pooler URL
8. Click **"Save"**

### Step 3: Redeploy

1. In Vercel dashboard → **Deployments** tab
2. Click **three dots** (⋯) on latest deployment
3. Click **"Redeploy"**
4. Wait 2-3 minutes

---

## ✅ Verify It's Fixed

### Test Connection

Visit this URL in your browser:
- **Local**: http://localhost:3000/api/debug
- **Production**: https://your-app.vercel.app/api/debug

**You should see:**
```json
{
  "status": "ok",
  "database": "connected",
  "counts": { ... }
}
```

### Test Staff Creation

1. Go to `/staff/add` page
2. Fill in staff details
3. Click **"Create"**
4. ✅ Should work without errors!

---

## 🆘 Still Not Working?

### Check Debug Endpoint

Visit `/api/debug` to see:
- Exact error message
- Whether `DATABASE_URL` is set
- Connection diagnostics
- Specific recommendations

### Common Issues

**"DATABASE_URL not set"**
- Add environment variable in Vercel
- Or create `.env` file locally

**"Can't reach database server"**
- Database might be sleeping (visit provider dashboard)
- Connection string might be wrong
- For Supabase: Use pooler URL (port 6543)

**"Connection timeout"**
- Check if database is active
- Verify connection string format
- Ensure SSL is enabled (`?sslmode=require` for Neon)

---

## 📝 Quick Commands

```bash
# Check if .env exists
ls -la .env

# Create .env file (local SQLite)
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

# Check environment variable
echo $DATABASE_URL

# Test Prisma connection
npx prisma db pull

# Generate Prisma client
npx prisma generate
```

---

## Next Steps

Once connected:
1. ✅ Test adding staff at `/staff/add`
2. ✅ Check database at `/api/debug`
3. ✅ Verify data persists

**For detailed troubleshooting, see:**
- `DIAGNOSE_DATABASE_ISSUE.md` - Full diagnostics guide
- `STAFF_DATABASE_ERROR_FIX.md` - Staff-specific fixes
- `DATABASE_SETUP.md` - Complete setup guide

