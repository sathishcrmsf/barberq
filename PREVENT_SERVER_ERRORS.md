# 🛡️ Why Server Errors Occurred & How to Prevent Them

## 🔍 Root Cause Analysis

### Why the Internal Server Error (500) Happened

#### 1. **Missing Error Handling in Server Components**
**Problem:**
- The `dashboard-content.tsx` server component had **no error handling**
- Any database error, Prisma client issue, or network problem would throw an unhandled exception
- Next.js converts unhandled exceptions in server components to 500 errors

**Before (vulnerable):**
```typescript
export async function DashboardContent() {
  const data = await fetchDashboardData(); // ❌ No try/catch
  return <DashboardClient initialData={data} />;
}
```

**After (fixed):**
```typescript
export async function DashboardContent() {
  try {
    const data = await fetchDashboardData();
    return <DashboardClient initialData={data} />;
  } catch (error) {
    // ✅ Gracefully handle errors
    console.error("Error fetching dashboard data:", error);
    return <DashboardClient initialData={emptyData} />;
  }
}
```

---

#### 2. **Stale Next.js Build Cache**
**Problem:**
- Next.js caches compiled code in `.next/` directory
- When Prisma schema or environment variables change, the cache becomes stale
- Server tries to use old Prisma client or cached code that references missing modules

**Triggers:**
- Prisma schema changes without regenerating client
- Environment variable changes without restarting server
- Dependency updates without clearing cache

---

#### 3. **Prisma Client Not Initialized**
**Problem:**
- Prisma client needs to be regenerated after schema changes
- If `prisma generate` wasn't run, the client might be outdated or missing
- Next.js dev server might have stale Prisma client in memory

**Symptoms:**
- Error: "Cannot find module '@prisma/client'"
- Error: "Prisma Client is not initialized"
- Type mismatches in queries

---

#### 4. **Database Connection Issues**
**Problem:**
- Database connection might be temporarily unavailable
- Connection pool exhausted (too many connections)
- Database auto-sleeping (Supabase free tier)
- Network timeouts

**Symptoms:**
- "Can't reach database server"
- Connection timeout errors
- Query failures

---

#### 5. **Environment Variable Not Loaded**
**Problem:**
- `.env` file missing or not in correct location
- `DATABASE_URL` not set or incorrect format
- Next.js not picking up environment variables (requires restart)

---

## ✅ How to Prevent Future Occurrences

### 1. Add Error Handling to All Server Components

**Best Practice Pattern:**

```typescript
// app/[page]/page.tsx or component.tsx
export async function ServerComponent() {
  try {
    const data = await fetchData();
    return <ClientComponent data={data} />;
  } catch (error) {
    console.error("Error in ServerComponent:", error);
    
    // Option A: Return fallback UI
    return <ErrorState />;
    
    // Option B: Return empty data (graceful degradation)
    return <ClientComponent data={defaultData} />;
    
    // Option C: Redirect to error page
    redirect("/error");
  }
}
```

**Apply to:**
- ✅ All server components that fetch data
- ✅ All API routes
- ✅ All data-fetching functions

---

### 2. Use Error Boundaries

**Create error.tsx files for each route:**

```typescript
// app/dashboard/error.tsx
"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="error-container">
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Benefits:**
- Catches React component errors
- Shows user-friendly error messages
- Allows retry without page reload

---

### 3. Implement Health Checks

**Create a health check route:**

```typescript
// app/api/health/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
```

**Use for:**
- Monitoring
- Deployment verification
- Debugging

---

### 4. Add Database Connection Retry Logic

**Update `lib/prisma.ts`:**

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // Add connection retry logic
    // Prisma handles retries automatically, but you can configure timeouts
  });
};

const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Add connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    return { connected: true };
  } catch (error) {
    console.error("Database connection failed:", error);
    return { 
      connected: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    };
  }
}

export { prisma };
```

---

### 5. Clear Cache on Prisma Schema Changes

**Create a script:**

```bash
#!/bin/bash
# scripts/reload-prisma.sh

echo "🔄 Reloading Prisma..."

# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next

echo "✅ Prisma reloaded. Restart dev server."
```

**Run after:**
- Prisma schema changes
- Migration updates
- Prisma client updates

**Add to package.json:**
```json
{
  "scripts": {
    "db:reload": "prisma generate && rm -rf .next",
    "dev:clean": "rm -rf .next && npm run dev"
  }
}
```

---

### 6. Validate Environment Variables on Startup

**Create `lib/env.ts`:**

```typescript
// lib/env.ts
export function validateEnv() {
  const required = ['DATABASE_URL'];
  const missing: string[] = [];

  required.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}`
    );
  }

  // Validate DATABASE_URL format
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && !dbUrl.startsWith('postgresql://')) {
    console.warn('⚠️  DATABASE_URL format might be incorrect');
  }
}

// Call on app startup (in a startup script or middleware)
```

---

### 7. Add Logging and Monitoring

**Create `lib/logger.ts`:**

```typescript
// lib/logger.ts
export const logger = {
  error: (message: string, error?: Error) => {
    console.error(`[ERROR] ${message}`, error);
    // In production, send to monitoring service (Sentry, LogRocket, etc.)
  },
  warn: (message: string) => {
    console.warn(`[WARN] ${message}`);
  },
  info: (message: string) => {
    console.log(`[INFO] ${message}`);
  },
};
```

**Use in server components:**
```typescript
try {
  const data = await fetchData();
  logger.info('Dashboard data fetched successfully');
  return <Dashboard data={data} />;
} catch (error) {
  logger.error('Failed to fetch dashboard data', error as Error);
  return <ErrorState />;
}
```

---

### 8. Implement Graceful Degradation

**Pattern: Return empty/fallback data instead of crashing:**

```typescript
async function fetchDashboardData() {
  try {
    // Try to fetch data
    const data = await Promise.all([
      prisma.walkIn.findMany({ /* ... */ }),
      prisma.service.findMany({ /* ... */ }),
    ]);
    return data;
  } catch (error) {
    // Return empty data instead of throwing
    console.error("Error fetching dashboard data:", error);
    return {
      walkIns: [],
      services: [],
      // ... empty defaults
    };
  }
}
```

**Benefits:**
- App still renders (degraded functionality)
- Users see something instead of error page
- Can retry later via client-side refresh

---

### 9. Add Timeout Protection

**Prevent hanging requests:**

```typescript
async function fetchWithTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 5000
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
  );
  
  return Promise.race([promise, timeout]);
}

// Usage
try {
  const data = await fetchWithTimeout(
    prisma.walkIn.findMany(),
    5000 // 5 second timeout
  );
} catch (error) {
  // Handle timeout
}
```

---

### 10. Create Development Scripts

**Update `package.json`:**

```json
{
  "scripts": {
    "dev": "next dev -H 127.0.0.1",
    "dev:clean": "rm -rf .next && npm run dev",
    "dev:reload": "prisma generate && rm -rf .next && npm run dev",
    "db:test": "tsx scripts/test-db-connection.ts",
    "db:reload": "prisma generate && rm -rf .next",
    "health": "curl http://localhost:3000/api/health"
  }
}
```

---

## 📋 Prevention Checklist

### ✅ Code Level
- [ ] Add try/catch to all server components
- [ ] Add error boundaries (`error.tsx`) for each route
- [ ] Return fallback data instead of throwing
- [ ] Add timeout protection for database queries
- [ ] Validate environment variables on startup
- [ ] Add logging for all errors

### ✅ Development Workflow
- [ ] Run `prisma generate` after schema changes
- [ ] Clear `.next` cache when needed (`rm -rf .next`)
- [ ] Restart dev server after `.env` changes
- [ ] Test database connection before starting server
- [ ] Use health check endpoint for verification

### ✅ Infrastructure
- [ ] Use connection pooling (Supabase pooler)
- [ ] Configure proper timeouts
- [ ] Set up monitoring/alerting (optional)
- [ ] Document error handling patterns

---

## 🚨 Common Triggers to Watch For

### High Risk Actions (Clear cache after these):

1. **Prisma Schema Changes**
   ```bash
   npx prisma generate
   rm -rf .next
   npm run dev
   ```

2. **Environment Variable Changes**
   - Update `.env`
   - Restart dev server

3. **Dependency Updates**
   ```bash
   npm install
   npx prisma generate
   rm -rf .next
   npm run dev
   ```

4. **Migration Changes**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   rm -rf .next
   ```

---

## 🔄 Recovery Procedure (When Errors Occur)

**Standard recovery steps:**

1. **Check terminal logs** for specific error message
2. **Test database connection:** `npm run db:test`
3. **Clear cache:** `rm -rf .next`
4. **Regenerate Prisma:** `npx prisma generate`
5. **Restart server:** `npm run dev`
6. **Test health endpoint:** `curl http://localhost:3000/api/health`

---

## 📚 Additional Resources

- ✅ **Error Handling:** See `app/dashboard/dashboard-content.tsx` (now has error handling)
- ✅ **Error Boundary:** See `app/dashboard/error.tsx`
- ✅ **Health Check:** See `app/debug/route.ts` (can be enhanced to `/api/health`)
- ✅ **Database Test:** See `scripts/test-db-connection.ts`

---

## 🎯 Summary

**Why it happened:**
- Missing error handling in server components
- Stale Next.js cache
- Prisma client not initialized
- Database connection issues

**How to prevent:**
1. ✅ Add error handling everywhere
2. ✅ Use error boundaries
3. ✅ Clear cache after changes
4. ✅ Validate environment variables
5. ✅ Add health checks
6. ✅ Implement graceful degradation
7. ✅ Add logging
8. ✅ Use proper development workflows

**Follow these practices and your app will be much more resilient!** 🛡️

