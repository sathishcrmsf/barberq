#!/bin/bash

# Database Setup Helper Script
# This script helps you set up a new database connection

echo "🗄️  BarberQ Database Setup Helper"
echo "=================================="
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating one..."
    echo "DATABASE_URL=\"\"" > .env
    echo "✅ Created .env file"
    echo ""
fi

echo "Choose your database provider:"
echo "1) Supabase (Recommended - Free)"
echo "2) Vercel Postgres (If deploying to Vercel)"
echo "3) Railway (Free tier available)"
echo "4) I already have a connection string"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📝 Supabase Setup:"
        echo "1. Go to https://supabase.com and create a project"
        echo "2. Go to Settings → Database"
        echo "3. Copy the Connection string (URI format)"
        echo "4. Replace [YOUR-PASSWORD] with your actual password"
        echo ""
        read -p "Paste your Supabase connection string: " db_url
        # Add pgbouncer params for Supabase
        if [[ $db_url != *"pgbouncer"* ]]; then
            db_url="${db_url}?pgbouncer=true&connection_limit=1"
        fi
        ;;
    2)
        echo ""
        echo "📝 Vercel Postgres Setup:"
        echo "1. Go to Vercel Dashboard → Your Project → Storage"
        echo "2. Create Postgres database"
        echo "3. Copy the DATABASE_URL from Environment Variables"
        echo ""
        read -p "Paste your Vercel connection string: " db_url
        ;;
    3)
        echo ""
        echo "📝 Railway Setup:"
        echo "1. Go to railway.app and create a project"
        echo "2. Add PostgreSQL database"
        echo "3. Copy DATABASE_URL from Variables tab"
        echo ""
        read -p "Paste your Railway connection string: " db_url
        ;;
    4)
        echo ""
        read -p "Paste your connection string: " db_url
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

# Update .env file
if [ -n "$db_url" ]; then
    # Check if DATABASE_URL already exists in .env
    if grep -q "DATABASE_URL" .env; then
        # Replace existing DATABASE_URL
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        else
            # Linux
            sed -i "s|DATABASE_URL=.*|DATABASE_URL=\"$db_url\"|" .env
        fi
    else
        # Add new DATABASE_URL
        echo "DATABASE_URL=\"$db_url\"" >> .env
    fi
    echo ""
    echo "✅ Updated .env file with new DATABASE_URL"
    echo ""
    
    # Ask to run migrations
    read -p "Run database migrations now? (y/n): " run_migrations
    if [ "$run_migrations" = "y" ] || [ "$run_migrations" = "Y" ]; then
        echo ""
        echo "🔄 Running Prisma migrations..."
        npx prisma migrate deploy
        echo ""
        
        read -p "Generate Prisma client? (y/n): " gen_client
        if [ "$gen_client" = "y" ] || [ "$gen_client" = "Y" ]; then
            echo ""
            echo "🔄 Generating Prisma client..."
            npx prisma generate
            echo ""
        fi
        
        read -p "Seed database with sample data? (y/n): " seed_db
        if [ "$seed_db" = "y" ] || [ "$seed_db" = "Y" ]; then
            echo ""
            echo "🌱 Seeding database..."
            npm run seed
            echo ""
        fi
    fi
    
    echo ""
    echo "✅ Database setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Restart your dev server: npm run dev"
    echo "2. Visit http://127.0.0.1:3000/dashboard"
    echo "3. Test adding a customer"
    echo ""
else
    echo "❌ No connection string provided"
    exit 1
fi

