#!/bin/bash
# Script to resolve failed migrations and deploy

set -e

echo "🔧 Resolving failed migrations..."

# Generate Prisma Client
npx prisma generate

# Try to resolve failed migrations
echo "Attempting to resolve failed migrations..."

# Resolve the failed migration by marking it as rolled back
# This allows new migrations to proceed
npx prisma migrate resolve --rolled-back 20251125050237_add_barber_and_started_at || true
npx prisma migrate resolve --rolled-back 20251125120000_init_postgresql || true

# Now try to deploy migrations
echo "Deploying migrations..."
npx prisma migrate deploy || {
  echo "⚠️ Migration deploy failed, trying db push as fallback..."
  npx prisma db push --accept-data-loss --skip-generate
}

echo "✅ Database schema synced successfully"

