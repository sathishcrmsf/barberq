#!/bin/bash
set -e

# Generate Prisma Client (required for build)
# This is fast and doesn't require database connection
npx prisma generate

# Build Next.js
# Migrations will run automatically via postinstall or can be run manually after deployment
next build

