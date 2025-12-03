# 🗄️ Database Setup Guide - Quick Fix

## Current Issue
Your Neon database has exceeded its quota. Let's set up a new database.

---

## Option 1: Supabase (Recommended - Free & Easy)

### Step 1: Create Supabase Account
1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"

### Step 2: Create Project
- **Name:** `barberq-mvp`
- **Database Password:** Create a strong password (save it!)
- **Region:** Choose closest to you
- Click "Create new project"
- Wait 2-3 minutes for setup

### Step 3: Get Connection String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string**
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual password

### Step 4: Update .env File
Open your `.env` file and update:
```bash
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
```

**Important:** Add `?pgbouncer=true&connection_limit=1` at the end for better connection handling.

---

## Option 2: Vercel Postgres (If Deploying to Vercel)

### Step 1: Create Database in Vercel
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (or create one)
3. Go to **Storage** tab
4. Click **Create Database** → **Postgres**
5. Name: `barberq-db`
6. Click **Create**

### Step 2: Get Connection String
1. Vercel automatically adds `DATABASE_URL` to your environment variables
2. Go to **Settings** → **Environment Variables**
3. Copy the `DATABASE_URL` value

### Step 3: Update Local .env
Add the connection string to your local `.env` file:
```bash
DATABASE_URL="your_vercel_connection_string_here"
```

---

## Option 3: Railway (Free Tier Available)

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **New Project**

### Step 2: Add PostgreSQL
1. Click **+ New** → **Database** → **Add PostgreSQL**
2. Wait for database to provision

### Step 3: Get Connection String
1. Click on the PostgreSQL service
2. Go to **Variables** tab
3. Copy `DATABASE_URL`

### Step 4: Update .env
```bash
DATABASE_URL="your_railway_connection_string_here"
```

---

## After Setting Up Database

### Step 1: Update .env File
Make sure your `.env` file has the new `DATABASE_URL`:
```bash
DATABASE_URL="your_new_connection_string_here"
```

### Step 2: Run Migrations
```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
npx prisma migrate deploy
```

This will create all the tables in your new database.

### Step 3: Generate Prisma Client
```bash
npx prisma generate
```

### Step 4: Test Connection
```bash
npx prisma db push
```

If successful, you'll see: "Database schema is up to date"

### Step 5: (Optional) Seed Database
```bash
npm run seed
```

This adds sample data for testing.

### Step 6: Test the App
1. Restart your dev server:
   ```bash
   npm run dev
   ```
2. Visit `http://127.0.0.1:3000/dashboard`
3. Try adding a customer
4. Check the queue page

---

## Troubleshooting

### Error: "Connection refused"
- Check your `DATABASE_URL` is correct
- Make sure database is running (Supabase/Railway dashboard)
- Check firewall settings

### Error: "Authentication failed"
- Verify password in connection string
- Make sure you replaced `[YOUR-PASSWORD]` with actual password

### Error: "Database does not exist"
- Run migrations: `npx prisma migrate deploy`
- Or push schema: `npx prisma db push`

### Error: "Too many connections"
- Add `?connection_limit=1` to connection string
- For Supabase, use: `?pgbouncer=true&connection_limit=1`

---

## Quick Commands Reference

```bash
# Update Prisma client after schema changes
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# Run migrations
npx prisma migrate deploy

# View database in Prisma Studio
npx prisma studio

# Seed database with sample data
npm run seed
```

---

## Need Help?

If you get stuck:
1. Check the error message in terminal
2. Verify your `.env` file has correct `DATABASE_URL`
3. Make sure database is running (check provider dashboard)
4. Try `npx prisma db push` to create tables

---

**Recommended:** Start with **Supabase** - it's free, easy, and works great for development and production!

