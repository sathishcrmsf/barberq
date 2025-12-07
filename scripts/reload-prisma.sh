#!/bin/bash

# Script to reload Prisma client and clear Next.js cache
# Use after Prisma schema changes or migration updates

echo "🔄 Reloading Prisma Client and clearing cache..."

# Regenerate Prisma client
echo "📦 Regenerating Prisma client..."
npx prisma generate

# Clear Next.js cache
echo "🧹 Clearing Next.js cache..."
rm -rf .next

echo "✅ Prisma reloaded successfully!"
echo ""
echo "💡 Next steps:"
echo "   1. Restart your dev server: npm run dev"
echo "   2. Test database connection: npm run db:test"
echo "   3. Check health: npm run health"

