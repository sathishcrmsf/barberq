# BarberQ MVP - Walk-In Queue Management

A mobile-first walk-in queue management system for barbershops. Built with Next.js 16, Prisma, and PostgreSQL.

## Features

✅ Add walk-in customers with service details  
✅ Real-time queue management  
✅ Status tracking (Waiting → In Progress → Done)  
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
- PostgreSQL database (for production/Vercel deployment)

### Local Development

For local development, you can optionally use SQLite by setting:

```bash
# .env.local (for local development only)
DATABASE_URL="file:./prisma/dev.db"
```

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma migrate dev
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

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
- `DELETE /api/walkins/[id]` - Delete walk-in

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
- ✅ Delete functionality
- ✅ Mobile responsiveness (375px - 1920px)
- ✅ Touch-friendly interactions

## Contributing

This is an MVP. Follow the BRD strictly - no feature creep!

## License

MIT
