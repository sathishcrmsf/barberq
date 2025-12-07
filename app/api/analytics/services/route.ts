// @cursor: This API route provides service analytics.
// Calculates bookings, revenue, trends, and insights for all services.
// Optimized with batch aggregations to eliminate N+1 queries
// Added in-memory caching to reduce database load

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering but add caching headers
export const dynamic = "force-dynamic";

// Simple in-memory cache for analytics
// Cache expires after 10 minutes (600000ms)
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
let analyticsCache: {
  data: any;
  timestamp: number;
  period: string;
} | null = null;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    // Check cache first
    const now = Date.now();
    if (analyticsCache && 
        analyticsCache.period === period && 
        (now - analyticsCache.timestamp) < CACHE_TTL) {
      // Return cached data
      return NextResponse.json(
        analyticsCache.data,
        {
          status: 200,
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            'X-Cache': 'HIT',
          }
        }
      );
    }

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

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
      // Aggregate all walk-ins by service and status in one query
      serviceStatusCounts,
      // Aggregate this month bookings by service
      thisMonthCounts,
      // Aggregate last month bookings by service
      lastMonthCounts,
      // Get all completed walk-ins for revenue calculation
      completedWalkIns,
      // Get recent walk-ins for temporal analysis (limit to 500 for performance)
      recentWalkIns
    ] = await Promise.all([
      // Fetch services with minimal relations
      prisma.service.findMany({
        select: {
          id: true,
          name: true,
          price: true,
          duration: true,
          categoryId: true,
          imageUrl: true,
          isActive: true,
          Category: {
            select: {
              name: true
            }
          },
          StaffService: {
            select: {
              isPrimary: true,
              Staff: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      // Batch aggregation: Count by service and status
      prisma.walkIn.groupBy({
        by: ['service', 'status'],
        where: {
          createdAt: { gte: startDate }
        },
        _count: {
          _all: true
        }
      }),
      // Batch aggregation: This month completed bookings by service
      prisma.walkIn.groupBy({
        by: ['service'],
        where: {
          status: 'done',
          createdAt: { gte: thisMonthStart }
        },
        _count: {
          _all: true
        }
      }),
      // Batch aggregation: Last month completed bookings by service
      prisma.walkIn.groupBy({
        by: ['service'],
        where: {
          status: 'done',
          createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
        },
        _count: {
          _all: true
        }
      }),
      // Get completed walk-ins for revenue (only service name needed)
      prisma.walkIn.findMany({
        where: {
          status: 'done',
          createdAt: { gte: startDate }
        },
        select: {
          service: true,
          createdAt: true
        }
      }),
      // Get recent walk-ins for temporal analysis
      prisma.walkIn.findMany({
        where: {
          createdAt: { gte: startDate }
        },
        select: {
          service: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 500 // Increased limit for better analysis
      })
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
        categoryName: service.Category?.name,
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
          ? serviceRecent[0].createdAt 
          : null,
        mostPopularDay,
        mostPopularHour: mostPopularHour ? `${mostPopularHour}:00` : null,
        
        // Staff data
        staffCount: service.StaffService.length,
        staff: service.StaffService.map(ss => ({
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

    const responseData = {
      period: days,
      startDate,
      endDate: new Date(),
      overallStats,
      services: analytics
    };

    // Store in cache
    analyticsCache = {
      data: responseData,
      timestamp: now,
      period: period,
    };

    return NextResponse.json(responseData, { 
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'X-Cache': 'MISS',
      }
    });

  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}
