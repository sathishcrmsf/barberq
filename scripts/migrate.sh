#!/bin/bash
# Migration script that handles missing DIRECT_URL gracefully

set -e

echo "🔍 Checking database configuration..."

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL is not set"
  exit 1
fi

# If DIRECT_URL is not set, use DATABASE_URL as fallback
# This allows builds to proceed, but migrations may fail with Supabase pooler
if [ -z "$DIRECT_URL" ]; then
  echo "⚠️  DIRECT_URL not set - using DATABASE_URL for migrations"
  echo "💡 For Supabase, set DIRECT_URL to direct connection (port 5432) for migrations to work"
  export DIRECT_URL="$DATABASE_URL"
fi

echo "✅ Running migrations..."
npx prisma migrate deploy

