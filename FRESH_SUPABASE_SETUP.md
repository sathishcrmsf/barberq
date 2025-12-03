# 🆕 Fresh Supabase Database Setup

## Step 1: Create New Supabase Project

1. **Go to Supabase Dashboard:**
   https://supabase.com/dashboard

2. **Click "New Project"** (top right)

3. **Fill in the details:**
   - **Name:** `barberq-mvp` (or any name you prefer)
   - **Database Password:** Create a strong password (save it!)
   - **Region:** Choose closest to you (US East recommended)
   - **Pricing Plan:** Free (or Pro if you want)

4. **Click "Create new project"**
   - Wait 2-3 minutes for setup to complete

## Step 2: Get Connection String

Once the project is created:

1. **Go to Settings → Database:**
   - Click the gear icon (Settings) in left sidebar
   - Click "Database" in settings menu

2. **Find Connection String:**
   - Scroll to **"Connection string"** section
   - Click on **"URI"** tab
   - You'll see: `postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres`

3. **Copy the connection string**
   - Replace `[YOUR-PASSWORD]` with your actual password
   - Final format: `postgresql://postgres:your_password@db.xxx.supabase.co:5432/postgres`

## Step 3: Get Connection Pooler URL (Important!)

For Vercel, we need the **connection pooler URL**:

1. **Still in Database settings**, scroll to **"Connection pooling"** section
2. **Click "Session mode"** tab
3. **Copy that connection string**
   - Should have port **6543** and **pooler.supabase.com**
   - Format: `postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres`

## Step 4: Update Vercel

Once you have the connection pooler URL:

1. **Paste it here** and I'll update Vercel automatically!
2. Or I can guide you through updating it manually

## Step 5: Run Migrations

After updating Vercel:

1. The migrations will run automatically on next deploy
2. Or we can run them manually

---

## Quick Checklist

- [ ] Create new Supabase project
- [ ] Get connection pooler URL (Session mode)
- [ ] Paste URL here for me to update Vercel
- [ ] Redeploy (I'll do this automatically)
- [ ] Test dashboard

---

**Once you create the new project and get the connection pooler URL, paste it here and I'll set everything up!** 🚀

