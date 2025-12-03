#!/bin/bash

# Script to update DATABASE_URL in Vercel
# Usage: ./update-db-url.sh "your-connection-pooler-url"

if [ -z "$1" ]; then
  echo "❌ Error: Please provide the connection pooler URL"
  echo ""
  echo "Usage: ./update-db-url.sh \"postgresql://postgres.xxx:password@pooler.supabase.com:6543/postgres\""
  echo ""
  echo "To get the URL:"
  echo "1. Go to: https://supabase.com/dashboard/project/mcphvyfryizizdxtvnoh/settings/database"
  echo "2. Scroll to 'Connection pooling' → 'Session mode'"
  echo "3. Copy the connection string"
  exit 1
fi

NEW_URL="$1"

echo "🔄 Updating DATABASE_URL in Vercel..."
echo ""

# Remove old DATABASE_URL from all environments
echo "Removing old DATABASE_URL from Production..."
npx vercel env rm DATABASE_URL production --yes

echo "Removing old DATABASE_URL from Preview..."
npx vercel env rm DATABASE_URL preview --yes

echo "Removing old DATABASE_URL from Development..."
npx vercel env rm DATABASE_URL development --yes

# Add new DATABASE_URL to all environments
echo ""
echo "Adding new DATABASE_URL to Production..."
echo "$NEW_URL" | npx vercel env add DATABASE_URL production

echo "Adding new DATABASE_URL to Preview..."
echo "$NEW_URL" | npx vercel env add DATABASE_URL preview

echo "Adding new DATABASE_URL to Development..."
echo "$NEW_URL" | npx vercel env add DATABASE_URL development

echo ""
echo "✅ DATABASE_URL updated!"
echo ""
echo "🔄 Now redeploying..."
npx vercel --prod --yes

echo ""
echo "✅ Done! Your database connection should work now."
echo "Test it at: https://barberq-mvp.vercel.app/dashboard"

