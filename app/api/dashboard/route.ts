// @cursor: Dashboard API endpoint that aggregates all dashboard data in one request
// Returns KPIs, insights, and queue status for performance optimization
// Real-time insights only (smart insights disabled for performance)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get today's start time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch data in parallel with optimized queries (filter in database, not in memory)
    // Only fetch recent walk-ins (last 7 days) for insights to improve performance
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const [recentWalkIns, todayWalkIns, completedToday, inProgressToday, waitingWalkIns, services, staff, products] = await Promise.all([
      // Get recent walk-ins for insights (last 7 days only - much faster)
      prisma.walkIn.findMany({
        where: {
          createdAt: { gte: sevenDaysAgo },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          startedAt: true,
          service: true,
          staffId: true,
        } as any,
        orderBy: { createdAt: "asc" },
      }),
      // Get today's walk-ins only
      prisma.walkIn.findMany({
        where: {
          createdAt: { gte: todayStart },
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
          startedAt: true,
          service: true,
          staffId: true,
        } as any,
      }),
      // Get completed today
      prisma.walkIn.findMany({
        where: {
          status: "done",
          createdAt: { gte: todayStart },
        },
        select: {
          id: true,
          service: true,
          staffId: true,
          startedAt: true,
          completedAt: true,
        } as any,
      }),
      // Get in-progress
      prisma.walkIn.findMany({
        where: {
          status: "in-progress",
        },
        select: {
          id: true,
          staffId: true,
          customerName: true,
          service: true,
        },
        orderBy: { startedAt: "asc" },
      }),
      // Get waiting
      prisma.walkIn.findMany({
        where: {
          status: "waiting",
        },
        select: {
          id: true,
          createdAt: true,
          customerName: true,
          service: true,
        },
        orderBy: { createdAt: "asc" },
      }),
      prisma.service.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          price: true,
        },
      }),
      prisma.staff.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
        },
      }),
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
      }),
    ]);

    // Calculate average wait time
    const avgWaitTime =
      waitingWalkIns.length > 0
        ? Math.round(
            waitingWalkIns.reduce((sum, w) => {
              const waitMinutes = (Date.now() - w.createdAt.getTime()) / 60000;
              return sum + waitMinutes;
            }, 0) / waitingWalkIns.length
          )
        : 0;

    // Calculate staff active (staff currently working on a walk-in)
    const staffActive = staff.filter((s) =>
      inProgressToday.some((w) => w.staffId === s.id)
    ).length;

    // Create a service price map for accurate revenue calculation
    // Use both exact match and case-insensitive match for robustness
    const servicePriceMap = new Map(services.map(s => [s.name, s.price]));
    const servicePriceMapLower = new Map(services.map((s: any) => [s.name.toLowerCase().trim(), s.price]));
    
    // Calculate total revenue today from all completed walk-ins
    const revenueToday = completedToday.reduce((sum, w: any) => {
      // Try exact match first, then case-insensitive match
      const price = servicePriceMap.get(w.service) || 
                    servicePriceMapLower.get((w.service || '').toLowerCase().trim()) || 
                    0;
      return sum + price;
    }, 0);

    // Generate smart insights - more actionable and data-driven
    const insights: Array<{
      id: string;
      emoji: string;
      title: string;
      value: string;
      priority: number; // Lower = higher priority
    }> = [];

    // Insight 1: Long wait time alert (high priority)
    if (avgWaitTime > 30 && waitingWalkIns.length > 0) {
      insights.push({
        id: "long-wait",
        emoji: "⏰",
        title: "Long Wait Time",
        value: `Average wait: ${avgWaitTime} min. Consider adding staff.`,
        priority: 1,
      });
    }

    // Insight 2: Peak hour prediction (using recent data)
    const currentHour = new Date().getHours();
    const hourlyBookings = recentWalkIns.reduce(
      (acc, w: any) => {
        const hour = w.createdAt?.getHours() || 0;
        acc[hour] = (acc[hour] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>
    );

    const peakHourEntry = Object.entries(hourlyBookings).sort(
      (a, b) => b[1] - a[1]
    )[0];
    const peakHour = peakHourEntry ? parseInt(peakHourEntry[0]) : null;
    const peakHourCount = peakHourEntry ? peakHourEntry[1] : 0;

    if (peakHour !== null && peakHourCount >= 3) {
      const isUpcoming = peakHour >= currentHour && peakHour <= currentHour + 2;
      if (isUpcoming) {
        insights.push({
          id: "peak-hour",
          emoji: "🔥",
          title: "Busy Hour Ahead",
          value: `Peak time ${peakHour}:00-${peakHour + 1}:00 (${peakHourCount} bookings typically)`,
          priority: 2,
        });
      } else if (currentHour === peakHour || currentHour === peakHour + 1) {
        insights.push({
          id: "peak-hour-now",
          emoji: "🔥",
          title: "Currently Busy",
          value: `Peak hour in progress. ${waitingWalkIns.length} in queue.`,
          priority: 1,
        });
      }
    }

    // Insight 3: Revenue performance
    const yesterdayStart = new Date();
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    yesterdayStart.setHours(0, 0, 0, 0);
    const yesterdayEnd = new Date(yesterdayStart);
    yesterdayEnd.setHours(23, 59, 59, 999);

    // Get yesterday's revenue from recent walk-ins (more efficient)
    const yesterdayRevenue = recentWalkIns
      .filter(
        (w: any) =>
          w.status === "done" &&
          w.completedAt &&
          w.completedAt >= yesterdayStart &&
          w.completedAt <= yesterdayEnd
      )
      .reduce((sum: number, w: any) => {
        // Try exact match first, then case-insensitive match
        const price = servicePriceMap.get(w.service) || 
                      servicePriceMapLower.get((w.service || '').toLowerCase().trim()) || 
                      0;
        return sum + price;
      }, 0);

    if (yesterdayRevenue > 0) {
      const revenueChange = ((revenueToday - yesterdayRevenue) / yesterdayRevenue) * 100;
      if (revenueChange > 20) {
        insights.push({
          id: "revenue-up",
          emoji: "📈",
          title: "Revenue Up",
          value: `${Math.round(revenueChange)}% higher than yesterday`,
          priority: 3,
        });
      } else if (revenueChange < -20 && revenueToday > 0) {
        insights.push({
          id: "revenue-down",
          emoji: "📉",
          title: "Revenue Down",
          value: `${Math.abs(Math.round(revenueChange))}% lower than yesterday`,
          priority: 2,
        });
      }
    }

    // Insight 4: Top service today
    const serviceCounts = todayWalkIns.reduce(
      (acc, w) => {
        acc[w.service] = (acc[w.service] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topServiceEntry = Object.entries(serviceCounts).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topServiceEntry && topServiceEntry[1] >= 2) {
      insights.push({
        id: "top-service",
        emoji: "✂️",
        title: "Most Popular Service",
        value: `${topServiceEntry[0]} (${topServiceEntry[1]} today)`,
        priority: 4,
      });
    }

    // Insight 5: Staff efficiency
    const staffPerformance = staff
      .map((s) => {
        const staffCompleted = completedToday.filter((w) => w.staffId === s.id);
        const avgCompletionTime = staffCompleted
          .filter((w: any) => w.startedAt && w.completedAt)
          .reduce((sum: number, w: any) => {
            if (w.startedAt && w.completedAt) {
              const duration = (w.completedAt.getTime() - w.startedAt.getTime()) / 60000;
              return sum + duration;
            }
            return sum;
          }, 0) / (staffCompleted.length || 1);

        return {
          name: s.name,
          completed: staffCompleted.length,
          avgTime: avgCompletionTime,
        };
      })
      .filter((s) => s.completed > 0)
      .sort((a, b) => b.completed - a.completed);

    if (staffPerformance.length > 0 && staffPerformance[0].completed >= 3) {
      const topStaff = staffPerformance[0];
      insights.push({
        id: "staff-performance",
        emoji: "⭐",
        title: "Top Performer",
        value: `${topStaff.name}: ${topStaff.completed} services today`,
        priority: 4,
      });
    }

    // Insight 6: Queue status alert
    if (waitingWalkIns.length > 5) {
      insights.push({
        id: "queue-backlog",
        emoji: "⚠️",
        title: "Queue Backlog",
        value: `${waitingWalkIns.length} customers waiting. Consider optimizing.`,
        priority: 1,
      });
    }

    // Insight 7: Service completion rate
    const totalToday = todayWalkIns.length;
    const completionRate = totalToday > 0 ? (completedToday.length / totalToday) * 100 : 0;
    
    if (totalToday >= 5) {
      if (completionRate < 50 && completedToday.length > 0) {
        insights.push({
          id: "completion-low",
          emoji: "🐌",
          title: "Low Completion Rate",
          value: `Only ${Math.round(completionRate)}% completed. ${inProgressToday.length} in progress.`,
          priority: 2,
        });
      } else if (completionRate > 80 && completedToday.length >= 5) {
        insights.push({
          id: "completion-high",
          emoji: "⚡",
          title: "High Efficiency",
          value: `${Math.round(completionRate)}% completion rate today`,
          priority: 5,
        });
      }
    }

    // Insight 8: Low stock alert
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

    // Sort by priority and take top 3
    const sortedInsights = insights.sort((a, b) => a.priority - b.priority).slice(0, 3);

    // Use only real-time insights (smart insights disabled for performance)
    // See PERFORMANCE_NOTES.md for details on re-enabling smart insights
    const allInsights = sortedInsights;

    // Queue status
    const inProgressWalkIn = inProgressToday[0];
    const nextWaitingWalkIn = waitingWalkIns[0];

    const queueStatus = {
      nowServing: inProgressWalkIn
        ? {
            customerName: inProgressWalkIn.customerName,
            service: inProgressWalkIn.service,
          }
        : undefined,
      nextUp: nextWaitingWalkIn
        ? {
            customerName: nextWaitingWalkIn.customerName,
            service: nextWaitingWalkIn.service,
          }
        : undefined,
      estimatedWait: avgWaitTime,
      queueCount: waitingWalkIns.length,
    };

    // Calculate product statistics
    const totalProducts = products.length;
    const lowStockCount = products.filter(
      (p) => p.stockQuantity <= p.lowStockThreshold
    ).length;
    const inventoryValue = products.reduce((sum, p) => {
      const unitValue = p.cost ?? p.price;
      return sum + p.stockQuantity * unitValue;
    }, 0);

    // Return all dashboard data
    return NextResponse.json(
      {
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
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=3, stale-while-revalidate=10',
        }
      }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Provide more detailed error information
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const isDatabaseError = errorMessage.includes("Can't reach database") || 
                            errorMessage.includes("database server") ||
                            errorMessage.includes("P1001");
    
    return NextResponse.json(
      { 
        error: "Failed to fetch dashboard data",
        details: isDatabaseError 
          ? "Database connection failed. Please check your database is active and connection string is correct."
          : errorMessage
      },
      { status: 500 }
    );
  }
}

