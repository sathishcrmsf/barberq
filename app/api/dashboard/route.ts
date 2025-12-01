// @cursor: Dashboard API endpoint that aggregates all dashboard data in one request
// Returns KPIs, insights, and queue status for performance optimization

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get today's start time
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Fetch all necessary data in parallel
    const [walkIns, services, staff] = await Promise.all([
      prisma.walkIn.findMany({
        orderBy: { createdAt: "asc" },
      }),
      prisma.service.findMany({
        where: { isActive: true },
      }),
      prisma.staff.findMany({
        where: { isActive: true },
      }),
    ]);

    // Calculate KPIs
    const todayWalkIns = walkIns.filter((w) => w.createdAt >= todayStart);
    const completedToday = todayWalkIns.filter((w) => w.status === "done");
    const inProgressToday = walkIns.filter((w) => w.status === "in-progress");
    const waitingWalkIns = walkIns.filter((w) => w.status === "waiting");

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
      walkIns.some((w) => w.staffId === s.id && w.status === "in-progress")
    ).length;

    // Calculate total revenue today
    const revenueToday = completedToday.reduce((sum, w) => {
      const service = services.find((s) => s.name === w.service);
      return sum + (service?.price || 0);
    }, 0);

    // Generate insights
    const insights: Array<{
      id: string;
      type: "alert" | "info" | "success" | "trending";
      title: string;
      description: string;
      action?: { label: string; href: string };
    }> = [];

    // Insight 1: Peak hour prediction
    const currentHour = new Date().getHours();
    const hourlyBookings = walkIns.reduce(
      (acc, w) => {
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

    if (
      peakHour !== null &&
      peakHour >= currentHour &&
      peakHour <= currentHour + 2
    ) {
      insights.push({
        id: "peak-hour",
        type: "alert",
        title: "Peak Hour Alert",
        description: `High traffic expected ${peakHour}:00-${peakHour + 2}:00. Consider adding extra staff.`,
        action: { label: "View Staff", href: "/staff" },
      });
    }

    // Insight 2: Top service today
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

    if (topServiceEntry && topServiceEntry[1] > 0) {
      insights.push({
        id: "top-service",
        type: "success",
        title: "Top Service Today",
        description: `${topServiceEntry[0]} (${topServiceEntry[1]} bookings)`,
        action: { label: "View Analytics", href: "/analytics" },
      });
    }

    // Insight 3: Staff performance highlight
    const staffPerformance = staff
      .map((s) => ({
        name: s.name,
        completed: completedToday.filter((w) => w.staffId === s.id).length,
      }))
      .sort((a, b) => b.completed - a.completed);

    if (staffPerformance.length > 0 && staffPerformance[0].completed > 0) {
      insights.push({
        id: "staff-performance",
        type: "trending",
        title: "Top Performer Today",
        description: `${staffPerformance[0].name} completed ${staffPerformance[0].completed} services`,
      });
    }

    // Insight 4: Trending services (week-over-week)
    const lastWeekStart = new Date();
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);

    const trending = services
      .map((s) => {
        const lastWeekCount = walkIns.filter(
          (w) =>
            w.service === s.name &&
            w.createdAt >= lastWeekStart &&
            w.createdAt < thisWeekStart
        ).length;

        const thisWeekCount = walkIns.filter(
          (w) => w.service === s.name && w.createdAt >= thisWeekStart
        ).length;

        const growth =
          lastWeekCount > 0
            ? ((thisWeekCount - lastWeekCount) / lastWeekCount) * 100
            : 0;

        return { name: s.name, growth };
      })
      .filter((s) => s.growth > 30); // 30%+ growth

    if (trending.length > 0) {
      insights.push({
        id: "trending-service",
        type: "info",
        title: "Trending Service",
        description: `${trending[0].name} is up ${Math.round(trending[0].growth)}% this week`,
        action: { label: "View Analytics", href: "/analytics" },
      });
    }

    // Queue status
    const inProgressWalkIn = walkIns.find((w) => w.status === "in-progress");
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

    // Return all dashboard data
    return NextResponse.json(
      {
        kpis: {
          queueCount: waitingWalkIns.length,
          avgWaitTime,
          staffActive,
          inProgressToday: inProgressToday.length,
          revenueToday: Math.round(revenueToday),
        },
        insights,
        queueStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}

