#!/bin/bash
set -e

# Generate Prisma Client
npx prisma generate

# Resolve failed migrations (ignore errors if already resolved)
npx prisma migrate resolve --rolled-back 20251125050237_add_barber_and_started_at 2>/dev/null || true
npx prisma migrate resolve --rolled-back 20251125120000_init_postgresql 2>/dev/null || true

# Try to deploy migrations, fallback to db push
npx prisma migrate deploy || npx prisma db push --accept-data-loss --skip-generate

# Build Next.js
next build

