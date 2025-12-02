// @cursor: Dashboard API endpoint that aggregates all dashboard data in one request
// Returns KPIs, insights, and queue status for performance optimization
// Enhanced with smart insights system

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTopInsights } from "@/lib/insights";

export async function GET(request: Request) {
  try {
    // Check database connection first
    try {
      await prisma.$connect();
    } catch (dbError) {
      console.error("Database connection failed:", dbError);
      return NextResponse.json(
        { 
          error: "Database connection failed. Please check your DATABASE_URL environment variable.",
          details: process.env.NODE_ENV === "development" 
            ? (dbError instanceof Error ? dbError.message : String(dbError))
            : undefined
        },
        { status: 500 }
      );
    }

    // Parse query parameters for filters
    const { searchParams } = new URL(request.url);
    let dateRange = searchParams.get("dateRange") || "today";
    
    // Validate and sanitize dateRange parameter
    // Handle cases like "today:1" by extracting just the base value
    if (dateRange.includes(":")) {
      dateRange = dateRange.split(":")[0];
    }
    
    // Ensure dateRange is one of the valid values
    if (!["today", "week", "month"].includes(dateRange)) {
      dateRange = "today";
    }
    
    const staffId = searchParams.get("staffId");
    const serviceName = searchParams.get("serviceName");

    // Calculate date range
    const now = new Date();
    let startDate = new Date();
    startDate.setHours(0, 0, 0, 0);

    if (dateRange === "week") {
      startDate.setDate(startDate.getDate() - 7);
    } else if (dateRange === "month") {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    // "today" is already set above

    // Fetch all necessary data in parallel
    let walkIns: Awaited<ReturnType<typeof prisma.walkIn.findMany>> = [];
    let services: Awaited<ReturnType<typeof prisma.service.findMany>> = [];
    let staff: Awaited<ReturnType<typeof prisma.staff.findMany>> = [];
    
    try {
      const results = await Promise.all([
        prisma.walkIn.findMany({
          orderBy: { createdAt: "asc" },
          include: {
            customer: true,
          },
        }).catch((err) => {
          console.error("Error fetching walkIns:", err);
          return [];
        }),
        prisma.service.findMany({
          where: { isActive: true },
        }).catch((err) => {
          console.error("Error fetching services:", err);
          return [];
        }),
        prisma.staff.findMany({
          where: { isActive: true },
        }).catch((err) => {
          console.error("Error fetching staff:", err);
          return [];
        }),
      ]);
      
      walkIns = results[0] || [];
      services = results[1] || [];
      staff = results[2] || [];
    } catch (dbError) {
      console.error("Database query error:", dbError);
      console.error("Error stack:", dbError instanceof Error ? dbError.stack : "No stack");
      // Return empty arrays instead of throwing to allow partial data
      walkIns = [];
      services = [];
      staff = [];
    }

    // Apply filters
    let filteredWalkIns = walkIns.filter((w) => {
      if (!w.createdAt) return false;
      return w.createdAt >= startDate;
    });
    if (staffId) {
      filteredWalkIns = filteredWalkIns.filter((w) => w.staffId === staffId);
    }
    if (serviceName) {
      filteredWalkIns = filteredWalkIns.filter((w) => w.service === serviceName);
    }

    // Calculate KPIs based on filtered data
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayWalkIns = filteredWalkIns.filter((w) => {
      if (!w.createdAt) return false;
      return w.createdAt >= todayStart;
    });
    const completedToday = todayWalkIns.filter((w) => w.status === "done");
    const inProgressToday = filteredWalkIns.filter((w) => w.status === "in-progress");
    const waitingWalkIns = filteredWalkIns.filter((w) => w.status === "waiting");

    // Calculate average wait time
    const avgWaitTime =
      waitingWalkIns.length > 0
        ? Math.round(
            waitingWalkIns.reduce((sum, w) => {
              if (!w.createdAt) return sum;
              const waitMinutes = (Date.now() - w.createdAt.getTime()) / 60000;
              return sum + (waitMinutes > 0 ? waitMinutes : 0);
            }, 0) / waitingWalkIns.length
          )
        : 0;

    // Calculate staff active (staff currently working on a walk-in)
    const staffActive = staff.filter((s) =>
      walkIns.some((w) => w.staffId === s.id && w.status === "in-progress")
    ).length || 0;

    // Calculate total revenue today
    const revenueToday = completedToday.reduce((sum, w) => {
      if (!w.service) return sum;
      const service = services.find((s) => s.name === w.service);
      return sum + (service?.price || 0);
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

    // Insight 2: Peak hour prediction
    const currentHour = new Date().getHours();
    const hourlyBookings = walkIns.reduce(
      (acc, w) => {
        if (!w.createdAt) return acc;
        const hour = w.createdAt.getHours();
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

    const yesterdayRevenue = walkIns
      .filter(
        (w) =>
          w.status === "done" &&
          w.completedAt &&
          w.completedAt >= yesterdayStart &&
          w.completedAt <= yesterdayEnd
      )
      .reduce((sum, w) => {
        if (!w.service) return sum;
        const service = services.find((s) => s.name === w.service);
        return sum + (service?.price || 0);
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
        if (!w.service) return acc;
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
        const avgCompletionTime = staffCompleted.length > 0
          ? staffCompleted
              .filter((w) => w.startedAt && w.completedAt)
              .reduce((sum, w) => {
                if (w.startedAt && w.completedAt) {
                  const duration = (w.completedAt.getTime() - w.startedAt.getTime()) / 60000;
                  return sum + (duration > 0 ? duration : 0);
                }
                return sum;
              }, 0) / (staffCompleted.filter((w) => w.startedAt && w.completedAt).length || 1)
          : 0;

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

    // Sort by priority and take top 3
    const sortedInsights = insights.sort((a, b) => a.priority - b.priority).slice(0, 3);

    // Get smart insights from the insights system
    let smartInsights: Array<{
      id: string;
      emoji: string;
      title: string;
      value: string;
      priority: number;
    }> = [];

    try {
      // Add timeout to prevent hanging
      const insightsPromise = getTopInsights(5);
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error("Insights timeout after 5 seconds")), 5000)
      );
      
      const topSmartInsights = await Promise.race([insightsPromise, timeoutPromise]);
      smartInsights = topSmartInsights.map((insight) => ({
        id: insight.id || `insight-${Date.now()}`,
        emoji: insight.emoji || "ℹ️",
        title: insight.title || "Insight",
        value: insight.value?.toString() || "N/A",
        priority: insight.priority || 5,
      }));
    } catch (error) {
      console.error("Error fetching smart insights:", error);
      console.error("Error details:", error instanceof Error ? error.message : String(error));
      console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
      // Continue without smart insights if there's an error - this is not critical
      smartInsights = [];
    }

    // Merge insights: prioritize existing real-time insights, then add smart insights
    const allInsights = [...sortedInsights, ...smartInsights]
      .sort((a, b) => a.priority - b.priority)
      .slice(0, 5); // Top 5 total

    // Queue status
    const inProgressWalkIn = walkIns.find((w) => w.status === "in-progress");
    const nextWaitingWalkIn = waitingWalkIns[0];

    const queueStatus = {
      nowServing: inProgressWalkIn && inProgressWalkIn.customerName
        ? {
            customerName: inProgressWalkIn.customerName || "Unknown",
            service: inProgressWalkIn.service || "Unknown",
          }
        : undefined,
      nextUp: nextWaitingWalkIn && nextWaitingWalkIn.customerName
        ? {
            customerName: nextWaitingWalkIn.customerName || "Unknown",
            service: nextWaitingWalkIn.service || "Unknown",
          }
        : undefined,
      estimatedWait: avgWaitTime,
      queueCount: waitingWalkIns.length,
    };

    // Return all dashboard data including staff and services for filters
    return NextResponse.json(
      {
        kpis: {
          queueCount: waitingWalkIns.length,
          avgWaitTime,
          staffActive,
          inProgressToday: inProgressToday.length,
          revenueToday: Math.round(revenueToday),
        },
        insights: allInsights,
        queueStatus,
        staff: staff.map((s) => ({ id: s.id, name: s.name })),
        services: services.map((s) => ({ name: s.name })),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace");
    
    // Return more detailed error in development, generic in production
    const errorMessage = process.env.NODE_ENV === "development" 
      ? (error instanceof Error ? error.message : "Unknown error")
      : "Failed to fetch dashboard data";
    
    return NextResponse.json(
      { 
        error: errorMessage,
        ...(process.env.NODE_ENV === "development" && {
          stack: error instanceof Error ? error.stack : undefined
        })
      },
      { status: 500 }
    );
  }
}

