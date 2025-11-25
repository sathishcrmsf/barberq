# BarberQ MVP - Walk-In Queue Management

A mobile-first walk-in queue management system for barbershops. Built with Next.js 16, Prisma, and PostgreSQL.

**Version:** 1.1

## Features

✅ Add walk-in customers with service details  
✅ Real-time queue management with status-based grouping  
✅ Status tracking (Waiting → In Progress → Done)  
✅ Visual organization into three sections (v1.1)  
✅ Delete protection for completed customers (v1.1)  
✅ Mobile-optimized Uber-style UI  
✅ Simple, fast, and minimal design  

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL + Prisma ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- PostgreSQL database (required for Vercel deployment)

### Local Development Setup

**⚠️ Important**: The schema is configured for **PostgreSQL** by default (required for Vercel).

#### Option 1: Use PostgreSQL Locally (Recommended)

```bash
# 1. Install PostgreSQL (if not installed)
# macOS: brew install postgresql
# Ubuntu: sudo apt-get install postgresql

# 2. Create database
createdb barberq

# 3. Set up .env file
cp .env.example .env
# Update DATABASE_URL with your local PostgreSQL credentials

# 4. Install dependencies and run migrations
npm install
npx prisma migrate dev
npx prisma generate
```

#### Option 2: Use SQLite Locally (Simpler, but needs manual step)

```bash
# 1. Update .env file
DATABASE_URL="file:./prisma/dev.db"

# 2. Change schema.prisma provider from "postgresql" to "sqlite"
# Then run:
npm install
npx prisma migrate dev
npx prisma generate
```

**Note**: If using SQLite locally, remember to change back to PostgreSQL before deploying to Vercel!

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
barberq-mvp/
├── app/
│   ├── (mobile)/          # Mobile-first pages
│   │   ├── queue/         # Queue view page
│   │   └── add/           # Add customer form
│   ├── api/walkins/       # REST API routes
│   └── layout.tsx
├── components/ui/         # Reusable UI components
├── lib/                   # Utilities & Prisma client
├── prisma/                # Database schema & migrations
└── public/
```

## API Routes

- `GET /api/walkins` - Get all walk-ins
- `POST /api/walkins` - Create new walk-in
- `PATCH /api/walkins/[id]` - Update walk-in status
- `DELETE /api/walkins/[id]` - Delete walk-in (protected for completed customers)

## Deployment to Vercel

⚠️ **IMPORTANT**: SQLite does NOT work on Vercel. You must set up PostgreSQL first!

### Quick Setup (5 minutes)

1. **Create free PostgreSQL database:**
   - Go to [neon.tech](https://neon.tech) (recommended)
   - Or use Vercel Postgres, Supabase, or Railway
   - Copy your connection string

2. **Deploy to Vercel:**
   - Push code to GitHub
   - Import to Vercel
   - Add environment variable:
     ```
     DATABASE_URL=postgresql://user:password@host/database?sslmode=require
     ```
   - Deploy!

📖 **Detailed Instructions**: See [VERCEL_FIX.md](./VERCEL_FIX.md) for step-by-step guide

📖 **Full Deployment Guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

📖 **Database Setup**: See [DATABASE_SETUP.md](./DATABASE_SETUP.md)

## Testing

The MVP has been thoroughly tested:
- ✅ Queue page with empty state
- ✅ Add customer form with validation
- ✅ Status updates (Waiting → In Progress → Done)
- ✅ Status-based UI grouping (v1.1)
- ✅ Delete protection for completed customers (v1.1)
- ✅ Delete functionality
- ✅ Mobile responsiveness (375px - 1920px)
- ✅ Touch-friendly interactions

📖 **v1.1 Changes**: See [BRD_V1.1_CHANGES.md](./BRD_V1.1_CHANGES.md) for detailed implementation notes

## Contributing

This is an MVP. Follow the BRD strictly - no feature creep!

## License

MIT
