// @cursor: Analytics dashboard - Service performance insights
// Shows top performers, revenue, trends, and recommendations
// @cursor v1.6: Converted to Server Component with SSR and caching

import { prisma, executeWithRetry } from "@/lib/prisma";
import { AnalyticsClient } from "./analytics-client";

// Revalidate every 10 seconds for fresh analytics data
export const revalidate = 10;

async function fetchAnalyticsData(period: number = 30) {
  // Calculate date range
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - period);

  // Calculate this month vs last month dates
  const thisMonthStart = new Date();
  thisMonthStart.setDate(1);
  thisMonthStart.setHours(0, 0, 0, 0);
  const lastMonthStart = new Date();
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  lastMonthStart.setDate(1);
  lastMonthStart.setHours(0, 0, 0, 0);
  const lastMonthEnd = new Date();
  lastMonthEnd.setDate(0);
  lastMonthEnd.setHours(23, 59, 59, 999);

  // OPTIMIZATION: Fetch all data in parallel batch queries instead of N+1
  const [
    services,
    serviceStatusCounts,
    thisMonthCounts,
    lastMonthCounts,
    completedWalkIns,
    recentWalkIns
  ] = await Promise.all([
    // Fetch services with relations (using type assertion for Prisma types)
    executeWithRetry(() =>
      prisma.service.findMany({
        where: {
          isActive: true
        },
        include: {
          Category: true,
          StaffService: {
            include: {
              Staff: true
            }
          }
        }
      } as any) as Promise<Array<any>>
    ),
    // Batch aggregation: Count by service and status
    executeWithRetry(() =>
      prisma.walkIn.groupBy({
        by: ['service', 'status'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          _all: true
        }
      })
    ),
    // Batch aggregation: This month completed bookings by service
    executeWithRetry(() =>
      prisma.walkIn.groupBy({
        by: ['service'],
        where: {
          status: 'done',
          createdAt: { gte: thisMonthStart }
        },
        _count: {
          _all: true
        }
      })
    ),
    // Batch aggregation: Last month completed bookings by service
    executeWithRetry(() =>
      prisma.walkIn.groupBy({
        by: ['service'],
        where: {
          status: 'done',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _count: {
          _all: true
        }
      })
    ),
    // Get completed walk-ins for revenue (only service name needed)
    executeWithRetry(() =>
      prisma.walkIn.findMany({
        where: {
          status: 'done',
          createdAt: { gte: startDate }
        },
        select: {
          service: true,
          createdAt: true
        }
      })
    ),
    // Get recent walk-ins for temporal analysis
    executeWithRetry(() =>
      prisma.walkIn.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          service: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 500
      })
    )
  ]);

  // Create lookup maps for fast access
  const serviceMap = new Map(services.map(s => [s.name, s]));
  const servicePriceMap = new Map(services.map(s => [s.name, s.price]));

  // Build status count maps
  const statusCountMap = new Map<string, { total: number; completed: number; active: number }>();
  serviceStatusCounts.forEach(item => {
    const key = item.service;
    if (!statusCountMap.has(key)) {
      statusCountMap.set(key, { total: 0, completed: 0, active: 0 });
    }
    const counts = statusCountMap.get(key)!;
    counts.total += item._count._all;
    if (item.status === 'done') {
      counts.completed += item._count._all;
    } else if (['waiting', 'in-progress'].includes(item.status)) {
      counts.active += item._count._all;
    }
  });

  // Build month booking maps
  const thisMonthMap = new Map(thisMonthCounts.map(item => [item.service, item._count._all]));
  const lastMonthMap = new Map(lastMonthCounts.map(item => [item.service, item._count._all]));

  // Group recent walk-ins by service for temporal analysis
  const recentByService = new Map<string, typeof recentWalkIns>();
  recentWalkIns.forEach(w => {
    if (!recentByService.has(w.service)) {
      recentByService.set(w.service, []);
    }
    recentByService.get(w.service)!.push(w);
  });

  // Calculate analytics for each service using pre-aggregated data
  const analytics = services.map(service => {
    const statusCounts = statusCountMap.get(service.name) || { total: 0, completed: 0, active: 0 };
    const thisMonthBookings = thisMonthMap.get(service.name) || 0;
    const lastMonthBookings = lastMonthMap.get(service.name) || 0;

    // Calculate revenue from completed bookings
    const serviceCompleted = completedWalkIns.filter(w => w.service === service.name);
    const totalRevenue = serviceCompleted.length * service.price;

    // Calculate growth rate
    const growthRate = lastMonthBookings > 0
      ? ((thisMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
      : 0;

    // Calculate popularity score (weighted)
    const popularityScore = Math.min(100, 
      (thisMonthBookings * 0.4) +
      (totalRevenue / 100 * 0.3) +
      (growthRate * 0.2) +
      (50 * 0.1) // placeholder for ratings
    );

    // Determine status label
    let statusLabel = '💤 Inactive';
    if (thisMonthBookings > 20) statusLabel = '🔥 Trending';
    else if (totalRevenue > 1000) statusLabel = '⭐ Top Performer';
    else if (growthRate < -20) statusLabel = '⚠️ Declining';

    // Find most popular day/time from recent data for this service
    const serviceRecent = recentByService.get(service.name) || [];
    const dayCount: Record<string, number> = {};
    const hourCount: Record<string, number> = {};

    serviceRecent.forEach(w => {
      const day = w.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
      const hour = w.createdAt.getHours();
      dayCount[day] = (dayCount[day] || 0) + 1;
      hourCount[hour.toString()] = (hourCount[hour.toString()] || 0) + 1;
    });

    const mostPopularDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    const mostPopularHour = Object.entries(hourCount).sort((a, b) => b[1] - a[1])[0]?.[0];

    return {
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
      categoryId: service.categoryId,
      categoryName: (service as any).Category?.name || null,
      imageUrl: service.imageUrl,
      
      // Booking metrics
      totalBookings: statusCounts.total,
      completedBookings: statusCounts.completed,
      activeBookings: statusCounts.active,
      
      // Revenue metrics
      totalRevenue,
      averageRevenuePerBooking: statusCounts.completed > 0 ? totalRevenue / statusCounts.completed : 0,
      
      // Trend metrics
      bookingsThisMonth: thisMonthBookings,
      bookingsLastMonth: lastMonthBookings,
      growthRate: Math.round(growthRate * 10) / 10,
      
      // Performance metrics
      popularityScore: Math.round(popularityScore),
      statusLabel,
      
      // Temporal data
      lastBookedAt: serviceRecent.length > 0 
        ? serviceRecent[0].createdAt.toISOString()
        : null,
      mostPopularDay,
      mostPopularHour: mostPopularHour ? `${mostPopularHour}:00` : null,
      
      // Staff data
      staffCount: (service as any).StaffService?.length || 0,
      staff: ((service as any).StaffService || []).map((ss: any) => ({
        id: ss.Staff.id,
        name: ss.Staff.name,
        isPrimary: ss.isPrimary
      }))
    };
  });

  // Sort by revenue (descending)
  analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);

  // Calculate overall stats from completed walk-ins
  const totalRevenueFromWalkIns = completedWalkIns.reduce((sum, walkIn) => {
    const price = servicePriceMap.get(walkIn.service) || 0;
    return sum + price;
  }, 0);

  const totalCompletedBookings = completedWalkIns.length;

  const overallStats = {
    totalRevenue: totalRevenueFromWalkIns,
    totalBookings: totalCompletedBookings,
    totalServices: services.length,
    activeServices: services.filter(s => s.isActive).length,
    averageTicket: totalCompletedBookings > 0 
      ? totalRevenueFromWalkIns / totalCompletedBookings 
      : 0
  };

  return {
    period,
    startDate: startDate.toISOString(),
    endDate: new Date().toISOString(),
    overallStats,
    services: analytics
  };
}

export default async function AnalyticsPage() {
  // Fetch analytics data server-side with default 30-day period
  const data = await fetchAnalyticsData(30);

  return <AnalyticsClient initialData={data} />;
}
