# BarberQ MVP - Walk-In Queue Management

A mobile-first walk-in queue management system for barbershops. Built with Next.js 16, Prisma, and SQLite.

## Features

✅ Add walk-in customers with service details  
✅ Real-time queue management  
✅ Status tracking (Waiting → In Progress → Done)  
✅ Mobile-optimized Uber-style UI  
✅ Simple, fast, and minimal design  

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: SQLite + Prisma ORM
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma generate
npx prisma migrate deploy
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

### Option 1: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

### Option 2: Deploy via GitHub

1. Push code to GitHub
2. Import project to Vercel
3. Vercel auto-detects Next.js configuration
4. Set environment variables (if needed)
5. Deploy!

### Environment Variables

For production deployment, set:

```
DATABASE_URL="file:./prisma/dev.db"
```

**Note**: For production use, consider migrating to PostgreSQL or another hosted database solution.

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
