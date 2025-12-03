# 🔧 Supabase Database Setup

## Your Supabase Project
- **Project URL**: `https://jlgnvvplpnlpkgdmfriu.supabase.co`
- **Project Reference**: `jlgnvvplpnlpkgdmfriu`

## Step 1: Get Your Database Connection String

### Option A: Connection Pooler (Recommended for Vercel/Serverless)

1. Go to your Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/jlgnvvplpnlpkgdmfriu/settings/database
   ```

2. Scroll down to **"Connection pooling"** section

3. Find **"Session mode"** tab and click it

4. Click the **"Copy"** button to copy the connection string

5. The connection string should look like:
   ```
   postgresql://postgres.jlgnvvplpnlpkgdmfriu:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

### Option B: Direct Connection (For Local Development)

1. In the same Database settings page

2. Find **"Connection string"** section

3. Click the **"URI"** tab

4. Copy the connection string (it will look like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres
   ```

5. **Important**: Replace `[YOUR-PASSWORD]` with your actual database password
   - If you don't remember it, you can reset it in Supabase Dashboard → Settings → Database → Database Password

## Step 2: Set Up Environment Variable

### For Local Development

Create or update `.env` file in the project root:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
```

Create `.env` file:
```bash
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres"
```

**Replace `[YOUR-PASSWORD]` with your actual password!**

### For Vercel Deployment

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `barberq-mvp` project
3. Go to **Settings** → **Environment Variables**
4. Add or update `DATABASE_URL`:
   - **Key**: `DATABASE_URL`
   - **Value**: Your connection pooler string (from Step 1, Option A)
   - **Environments**: Select all (Production, Preview, Development)
5. Click **Save**

## Step 3: Run Database Migrations

After setting up the connection string:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Generate Prisma Client
npx prisma generate

# Run migrations to create tables
npx prisma migrate deploy
```

## Step 4: Verify Connection

Test the connection:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a browser window where you can see your database tables.

## Connection String Examples

### Connection Pooler (Recommended for Production)
```
postgresql://postgres.jlgnvvplpnlpkgdmfriu:yourpassword@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection (For Local)
```
postgresql://postgres:yourpassword@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres
```

## Troubleshooting

### If you get "Can't reach database server"
- Make sure your database is not sleeping (visit Supabase dashboard to wake it up)
- Use the connection pooler URL (port 6543) instead of direct connection (port 5432)
- Verify your password is correct

### If migrations fail
- Make sure `DATABASE_URL` is set correctly
- Check that your Supabase project is active
- Try using the connection pooler URL

---

**Once you have the connection string, update your `.env` file and run the migrations!** 🚀

