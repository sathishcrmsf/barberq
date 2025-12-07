# 🔧 Quick Fix: DATABASE_URL Environment Variable Error

## Error Message
```
❌ Failed to initialize Prisma Client: "DATABASE_URL environment variable is not set. 
Please set DATABASE_URL in your environment variables or .env file."
```

## Root Cause
The Prisma client is trying to initialize when modules are loaded, but Next.js hasn't loaded the `.env` file yet, or the dev server was started before the `.env` file existed.

## ✅ Quick Fix (2 minutes)

### Step 1: Verify .env File Exists

Your `.env` file should be in the project root:
```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp
ls -la .env
```

You should see:
```
DATABASE_URL="postgresql://postgres.jlgnvvplpnlpkgdmfriu:SatzWolf04%21@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Step 2: Restart Your Dev Server

**This is the most common fix!** Next.js only loads `.env` files when the server starts.

1. **Stop your current dev server** (press `Ctrl+C` in the terminal where it's running)

2. **Restart the dev server:**
   ```bash
   npm run dev
   ```

3. **Wait for the server to start** - you should see:
   ```
   ▲ Next.js 16.0.7
   - Local:        http://127.0.0.1:3000
   ```

4. **Test the fix** - Visit:
   - http://localhost:3000/api/debug
   - Or visit the insights page that was showing the error

### Step 3: Verify Environment Variable is Loaded

Test if DATABASE_URL is loaded:
```bash
node -e "require('dotenv').config(); console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET (' + process.env.DATABASE_URL.length + ' chars)' : '❌ NOT SET');"
```

## Alternative: Clean Restart

If a simple restart doesn't work:

```bash
# Stop dev server (Ctrl+C)

# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

## Check .env File Format

Make sure your `.env` file has the correct format:

```env
DATABASE_URL="postgresql://postgres.jlgnvvplpnlpkgdmfriu:SatzWolf04%21@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Important:**
- No spaces around the `=` sign
- Value should be in quotes if it contains special characters
- No trailing spaces

## Still Not Working?

### Check if .env.local Overrides .env

Next.js loads files in this order (later files override earlier ones):
1. `.env`
2. `.env.local`
3. `.env.development`
4. `.env.development.local`

Check if `.env.local` exists and might be overriding:
```bash
cat .env.local
```

### Verify DATABASE_URL is Accessible

```bash
cd /Users/sathishkumar/Desktop/GoldClips/barberq-mvp

# Test with dotenv
node -e "require('dotenv').config(); console.log(process.env.DATABASE_URL ? '✅ Loaded' : '❌ Not loaded');"

# Check file exists
test -f .env && echo "✅ .env file exists" || echo "❌ .env file missing"

# Check file permissions
ls -la .env
```

## For Production (Vercel)

If this error happens on Vercel:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Verify `DATABASE_URL` is set
5. Make sure it's set for all environments (Production, Preview, Development)
6. Redeploy your application

## Common Issues

### Issue: "File exists but variable not loaded"
**Solution:** Restart dev server. Next.js only loads `.env` on startup.

### Issue: "Variable loaded in terminal but not in Next.js"
**Solution:** Make sure `.env` is in the project root (same folder as `package.json`).

### Issue: "Changed .env file but still getting old value"
**Solution:** Restart dev server. Environment variables are cached on startup.

## Success Indicators

After fixing, you should see:
- ✅ No errors in console
- ✅ Database queries work
- ✅ `/api/debug` shows database connection
- ✅ Insights page loads without errors

---

**Most likely fix:** Just restart your dev server! 🚀

