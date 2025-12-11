// @cursor: Server component that fetches dashboard data
// This renders on the server for better performance
// @cursor v1.5: Optimized to prevent connection pool exhaustion

import { prisma, executeWithRetry } from "@/lib/prisma";
import { DashboardClient } from "./dashboard-client";

async function fetchDashboardData() {
  try {
    // Get today's start time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Optimize: Reduce parallel queries to prevent connection pool exhaustion
    // Strategy: Fetch all walk-ins in one query, then filter in memory
    // This reduces from 5 parallel queries to 4 (walkIns, services, staff, products)
    // If parallel execution fails, fall back to sequential execution
    let allWalkIns: any[], services: any[], staff: any[], products: any[];
    
    try {
      // Try parallel execution first (faster)
      [allWalkIns, services, staff, products] = await Promise.all([
        // Fetch all walk-ins we need in a single query
        executeWithRetry(() =>
          prisma.walkIn.findMany({
            where: {
              OR: [
                { status: "waiting" },
                { status: "in-progress" },
                { status: "done", createdAt: { gte: todayStart } },
              ],
            },
            select: {
              id: true,
              status: true,
              service: true,
              staffId: true,
              customerName: true,
              createdAt: true,
              startedAt: true,
              completedAt: true,
            },
            orderBy: [
              { status: "asc" },
              { createdAt: "asc" },
            ],
          })
        ),
        // Services query
        executeWithRetry(() =>
          prisma.service.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              price: true,
            },
          })
        ),
        // Staff query
        executeWithRetry(() =>
          prisma.staff.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
            },
          })
        ),
        // Products query
        executeWithRetry(() =>
          prisma.product.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              stockQuantity: true,
              lowStockThreshold: true,
              price: true,
              cost: true,
            },
          })
        ),
      ]);
    } catch (parallelError) {
      // Fallback to sequential execution if parallel fails
      console.warn("Parallel queries failed, falling back to sequential execution:", parallelError);
      allWalkIns = await executeWithRetry(() =>
        prisma.walkIn.findMany({
          where: {
            OR: [
              { status: "waiting" },
              { status: "in-progress" },
              { status: "done", createdAt: { gte: todayStart } },
            ],
          },
          select: {
            id: true,
            status: true,
            service: true,
            staffId: true,
            customerName: true,
            createdAt: true,
            startedAt: true,
            completedAt: true,
          },
          orderBy: [
            { status: "asc" },
            { createdAt: "asc" },
          ],
        })
      );
      services = await executeWithRetry(() =>
        prisma.service.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
            price: true,
          },
        })
      );
      staff = await executeWithRetry(() =>
        prisma.staff.findMany({
          where: { isActive: true },
          select: {
            id: true,
            name: true,
          },
        })
      );
      
      // Get products data (for dashboard stats)
      try {
        products = await executeWithRetry(() =>
          prisma.product.findMany({
            where: { isActive: true },
            select: {
              id: true,
              name: true,
              stockQuantity: true,
              lowStockThreshold: true,
              price: true,
              cost: true,
            },
          })
        );
      } catch (error) {
        // If products table doesn't exist yet, use empty array
        console.warn("Products table may not exist:", error);
        products = [];
      }
    }

    // Filter walk-ins in memory (much faster than multiple DB queries)
    const completedToday = allWalkIns.filter(
      (w) => w.status === "done" && w.createdAt >= todayStart
    );
    const inProgressToday = allWalkIns
      .filter((w) => w.status === "in-progress")
      .sort((a, b) => {
        if (!a.startedAt || !b.startedAt) return 0;
        return a.startedAt.getTime() - b.startedAt.getTime();
      });
    const waitingWalkIns = allWalkIns
      .filter((w) => w.status === "waiting")
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  // Calculate metrics
  const avgWaitTime =
    waitingWalkIns.length > 0
      ? Math.round(
          waitingWalkIns.reduce((sum, w) => {
            const waitMinutes = (Date.now() - w.createdAt.getTime()) / 60000;
            return sum + waitMinutes;
          }, 0) / waitingWalkIns.length
        )
      : 0;

  const staffActive = staff.filter((s) =>
    inProgressToday.some((w) => w.staffId === s.id)
  ).length;

  // Create a service price map for accurate revenue calculation
  // Use both exact match and case-insensitive match for robustness
  const servicePriceMap = new Map(services.map(s => [s.name, s.price]));
  const servicePriceMapLower = new Map(services.map(s => [s.name.toLowerCase().trim(), s.price]));
  
  // Calculate revenue from all completed walk-ins today
  const revenueToday = completedToday.reduce((sum, w) => {
    // Try exact match first, then case-insensitive match
    const price = servicePriceMap.get(w.service) || 
                  servicePriceMapLower.get(w.service.toLowerCase().trim()) || 
                  0;
    return sum + price;
  }, 0);

  // Generate insights (simplified for performance)
  const insights: Array<{
    id: string;
    emoji: string;
    title: string;
    value: string;
    priority: number;
  }> = [];

  if (avgWaitTime > 30 && waitingWalkIns.length > 0) {
    insights.push({
      id: "long-wait",
      emoji: "⏰",
      title: "Long Wait Time",
      value: `Average wait: ${avgWaitTime} min. Consider adding staff.`,
      priority: 1,
    });
  }

  if (waitingWalkIns.length > 5) {
    insights.push({
      id: "queue-backlog",
      emoji: "⚠️",
      title: "Queue Backlog",
      value: `${waitingWalkIns.length} customers waiting. Consider optimizing.`,
      priority: 1,
    });
  }

  // Product insights
  if (products && products.length > 0) {
    const lowStockProducts = products.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    );
    if (lowStockProducts.length > 0) {
      insights.push({
        id: "low-stock",
        emoji: "📦",
        title: "Low Stock Alert",
        value: `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} need restocking`,
        priority: 2,
      });
    }
  }

  // Use only real-time insights (smart insights disabled for performance)
  // See PERFORMANCE_NOTES.md for details
  const allInsights = insights
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5);

  // Queue status
  const inProgressWalkIn = inProgressToday[0];
  const nextWaitingWalkIn = waitingWalkIns[0];

  const queueStatus = {
    nowServing: inProgressWalkIn
      ? {
          customerName: inProgressWalkIn.customerName || "Customer",
          service: inProgressWalkIn.service,
        }
      : undefined,
    nextUp: nextWaitingWalkIn
      ? {
          customerName: nextWaitingWalkIn.customerName || "Customer",
          service: nextWaitingWalkIn.service,
        }
      : undefined,
    estimatedWait: avgWaitTime,
    queueCount: waitingWalkIns.length,
  };

  // Calculate product statistics
  const totalProducts = products?.length || 0;
  const lowStockCount = products?.filter(
    (p) => p.stockQuantity <= p.lowStockThreshold
  ).length || 0;
  const inventoryValue = products?.reduce((sum, p) => {
    const unitValue = p.cost ?? p.price;
    return sum + p.stockQuantity * unitValue;
  }, 0) || 0;

  return {
    kpis: {
      queueCount: waitingWalkIns.length,
      avgWaitTime,
      staffActive,
      inProgressToday: inProgressToday.length,
      revenueToday: Math.round(revenueToday),
      totalProducts,
      lowStockCount,
      inventoryValue: Math.round(inventoryValue),
    },
    insights: allInsights,
    queueStatus,
  };
  } catch (error) {
    console.error("Error in fetchDashboardData:", error);
    throw error; // Re-throw to be caught by component error boundary
  }
}

export async function DashboardContent() {
  try {
    const data = await fetchDashboardData();
    return <DashboardClient initialData={data} />;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Return error state with empty data
    const errorData = {
      kpis: {
        queueCount: 0,
        avgWaitTime: 0,
        staffActive: 0,
        inProgressToday: 0,
        revenueToday: 0,
        totalProducts: 0,
        lowStockCount: 0,
        inventoryValue: 0,
      },
      insights: [],
      queueStatus: {
        nowServing: undefined,
        nextUp: undefined,
        estimatedWait: 0,
        queueCount: 0,
      },
    };

    // Log detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isDatabaseError = 
      errorMessage.includes("Can't reach database") || 
      errorMessage.includes("database server") ||
      errorMessage.includes("P1001") ||
      errorMessage.includes("connection");

    if (isDatabaseError) {
      console.error("Database connection error. Check DATABASE_URL and ensure database is accessible.");
    }

    // Still render the dashboard with empty data so the UI doesn't crash
    return <DashboardClient initialData={errorData} />;
  }
}

