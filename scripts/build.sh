#!/bin/bash
set -e

# Generate Prisma Client (required for build)
npx prisma generate

# Try to run migrations, but don't fail the build if database is unreachable
# Migrations will be handled at runtime or via separate deployment step
if npx prisma migrate deploy 2>/dev/null; then
  echo "✓ Migrations deployed successfully"
else
  echo "⚠ Migration deployment skipped (database may be unreachable during build)"
  echo "  Migrations will be handled at runtime or via post-deploy script"
fi

# Build Next.js (this is the critical step)
next build

