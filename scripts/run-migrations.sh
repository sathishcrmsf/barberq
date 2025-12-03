#!/bin/bash
# Post-deployment migration script
# Run this after deployment to ensure database migrations are applied

set -e

echo "Running Prisma migrations..."

# Generate Prisma Client
npx prisma generate

# Deploy migrations
npx prisma migrate deploy

echo "✓ Migrations completed successfully"

