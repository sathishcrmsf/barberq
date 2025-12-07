#!/bin/bash

# Quick Fix Script for Database Connection
# Run this script to diagnose and fix database connection issues

echo "🔍 Checking Database Connection..."
echo ""

cd "$(dirname "$0")"

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

# Show connection string info
echo "📋 Connection String Status:"
DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2- | tr -d '"')

if echo "$DB_URL" | grep -q "%21"; then
    echo "   ✅ Password is URL-encoded"
else
    echo "   ❌ Password needs URL encoding (! should be %21)"
fi

if echo "$DB_URL" | grep -q "pgbouncer=true"; then
    echo "   ✅ Has pgbouncer parameter"
else
    echo "   ❌ Missing ?pgbouncer=true parameter"
fi

if echo "$DB_URL" | grep -q "pooler.supabase.com"; then
    echo "   ✅ Using Supabase pooler"
else
    echo "   ⚠️  Not using pooler URL"
fi

echo ""
echo "🌐 Step 1: Wake Up Database"
echo "   Please open this URL in your browser:"
echo "   https://supabase.com/dashboard/project/jlgnvvplpnlpkgdmfriu"
echo ""
echo "   Wait 15-20 seconds for database to wake up..."
echo ""
read -p "   Press Enter after you've opened the Supabase dashboard and waited..."

echo ""
echo "🔄 Step 2: Starting Dev Server..."
echo "   (Press Ctrl+C to stop when done testing)"
echo ""

# Check if port 3000 is in use
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "   ⚠️  Port 3000 is already in use"
    echo "   Please stop the existing server first (Ctrl+C in that terminal)"
    echo ""
    read -p "   Press Enter after stopping the server..."
fi

# Start dev server
npm run dev

