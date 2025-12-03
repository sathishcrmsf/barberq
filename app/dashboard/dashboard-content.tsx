// @cursor: Server component that fetches dashboard data
// This renders on the server for better performance

import { prisma } from "@/lib/prisma";
import { getTopInsights } from "@/lib/insights";
import { DashboardClient } from "./dashboard-client";

async function fetchDashboardData() {
  // Get today's start time
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  // Only fetch recent walk-ins (last 7 days) for insights to improve performance
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Fetch data in parallel with optimized queries
  const [recentWalkIns, todayWalkIns, completedToday, inProgressToday, waitingWalkIns, services, staff] = await Promise.all([
    // Get recent walk-ins for insights (last 7 days only)
    prisma.walkIn.findMany({
      where: {
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        id: true,
        status: true,
        createdAt: true,
        startedAt: true,
        completedAt: true,
        service: true,
        staffId: true,
      },
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
        completedAt: true,
        service: true,
        staffId: true,
      },
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
      },
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
  ]);

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

  const revenueToday = completedToday.reduce((sum, w) => {
    const service = services.find((s) => s.name === w.service);
    return sum + (service?.price || 0);
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

  // Get smart insights with timeout (non-blocking)
  let smartInsights: Array<{
    id: string;
    emoji: string;
    title: string;
    value: string;
    priority: number;
  }> = [];

  try {
    const insightsPromise = getTopInsights(5);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 1000)
    );
    
    const topSmartInsights = await Promise.race([insightsPromise, timeoutPromise]);
    smartInsights = topSmartInsights.map((insight) => ({
      id: insight.id,
      emoji: insight.emoji,
      title: insight.title,
      value: insight.value.toString(),
      priority: insight.priority,
    }));
  } catch (error) {
    // Silently fail - dashboard should still load
  }

  const allInsights = [...insights, ...smartInsights]
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

  return {
    kpis: {
      queueCount: waitingWalkIns.length,
      avgWaitTime,
      staffActive,
      inProgressToday: inProgressToday.length,
      revenueToday: Math.round(revenueToday),
    },
    insights: allInsights,
    queueStatus,
  };
}

export async function DashboardContent() {
  const data = await fetchDashboardData();
  return <DashboardClient initialData={data} />;
}

