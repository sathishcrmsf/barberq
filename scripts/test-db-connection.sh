#!/bin/bash

# Test Database Connection Script
# This script helps diagnose database connection issues

echo "🔍 Testing Database Connection..."
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "   Please create .env file with DATABASE_URL"
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL" .env; then
    echo "❌ DATABASE_URL not found in .env file"
    exit 1
fi

echo "✅ .env file found"
echo ""

# Extract DATABASE_URL
export $(grep -v '^#' .env | xargs)

if [ -z "$DATABASE_URL" ]; then
    echo "❌ DATABASE_URL is empty"
    exit 1
fi

echo "📋 Connection String Info:"
echo "   Provider: $(echo $DATABASE_URL | grep -o 'pooler.supabase.com' > /dev/null && echo 'Supabase (Pooler)' || echo 'Other')"
echo "   Port: $(echo $DATABASE_URL | grep -oE ':[0-9]+' | head -1 | cut -d: -f2)"
echo "   Has pgbouncer: $(echo $DATABASE_URL | grep -q 'pgbouncer=true' && echo 'Yes' || echo 'No')"
echo ""

# Test with Prisma
echo "🧪 Testing with Prisma..."
npx prisma db pull > /tmp/prisma-test.log 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Connection successful!"
    echo ""
    echo "📊 Database Status:"
    echo "   Connection: Working"
    echo "   Schema: Synced"
    exit 0
else
    echo "❌ Connection failed!"
    echo ""
    echo "Error details:"
    cat /tmp/prisma-test.log | tail -5
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check if database is awake (visit Supabase dashboard)"
    echo "   2. Verify connection string format"
    echo "   3. Ensure ?pgbouncer=true is at the end"
    echo "   4. Check password URL encoding (! should be %21)"
    exit 1
fi

