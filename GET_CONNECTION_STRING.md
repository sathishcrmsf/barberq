# 🔗 Get Supabase Connection String

## Quick Method (No CLI needed)

### Step 1: Go to Supabase Dashboard
Open this URL in your browser:
```
https://supabase.com/dashboard/project/jlgnvvplpnlpkgdmfriu/settings/database
```

### Step 2: Get Connection Pooler URL (Recommended for Vercel)

1. Scroll down to **"Connection pooling"** section
2. Click on **"Session mode"** tab
3. You'll see a connection string like:
   ```
   postgresql://postgres.jlgnvvplpnlpkgdmfriu:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
4. Click the **"Copy"** button or **"Reveal"** button to see the full string with password
5. Copy the entire connection string

### Step 3: Get Direct Connection URL (For Local Development)

1. In the same page, find **"Connection string"** section (above Connection pooling)
2. Click on **"URI"** tab
3. You'll see:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.jlgnvvplpnlpkgdmfriu.supabase.co:5432/postgres
   ```
4. Click **"Copy"** or **"Reveal"** to see the password
5. Copy the entire connection string

### Step 4: Set Up Environment Variable

Once you have the connection string, run:

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Create .env file with your connection string
echo 'DATABASE_URL="paste_your_connection_string_here"' > .env
```

**Important**: Make sure to replace `paste_your_connection_string_here` with the actual connection string you copied!

### Step 5: Run Migrations

```bash
npx prisma migrate deploy
```

---

## Alternative: Use Supabase CLI (If you want)

If you prefer using the CLI, you need to get an access token:

1. Go to: https://supabase.com/dashboard/account/tokens
2. Click **"Generate new token"**
3. Copy the token
4. Set it as environment variable:
   ```bash
   export SUPABASE_ACCESS_TOKEN="your_token_here"
   ```
5. Then run:
   ```bash
   supabase link --project-ref jlgnvvplpnlpkgdmfriu
   ```

But the dashboard method is simpler! 🚀

