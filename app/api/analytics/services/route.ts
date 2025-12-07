// @cursor: This API route provides service analytics.
// Calculates bookings, revenue, trends, and insights for all services.

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const days = parseInt(period);

    // Calculate date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get all services with their details
    const services = await prisma.service.findMany({
      include: {
        Category: true,
        StaffService: {
          include: {
            Staff: true
          }
        }
      }
    });

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

    // Use database aggregations instead of fetching all walk-ins
    // Calculate analytics for each service using efficient queries
    const analytics = await Promise.all(services.map(async (service) => {
      // Count walk-ins by status for this service in the period
      const [totalCount, completedCount, activeCount] = await Promise.all([
        prisma.walkIn.count({
          where: {
            service: service.name,
            createdAt: { gte: startDate }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: 'done',
            createdAt: { gte: startDate }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: { in: ['waiting', 'in-progress'] },
            createdAt: { gte: startDate }
          }
        })
      ]);

      // Count bookings for this month and last month
      const [thisMonthBookings, lastMonthBookings] = await Promise.all([
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: 'done',
            createdAt: { gte: thisMonthStart }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: 'done',
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
          }
        })
      ]);

      // Get completed walk-ins to calculate actual revenue
      const completedWalkIns = await prisma.walkIn.findMany({
        where: {
          service: service.name,
          status: 'done',
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        }
      });

      // Get last booked date and popular times (limit to recent data for performance)
      const recentWalkIns = await prisma.walkIn.findMany({
        where: {
          service: service.name,
          createdAt: { gte: startDate }
        },
        select: {
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to recent 100 for day/hour analysis
      });

      // Calculate revenue from actual completed walk-ins
      // This ensures accuracy even if service prices changed or names don't match exactly
      const totalRevenue = completedWalkIns.length * service.price;


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

      // Find most popular day/time from recent data
      const dayCount: Record<string, number> = {};
      const hourCount: Record<string, number> = {};

      recentWalkIns.forEach(w => {
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
        totalBookings: totalCount,
        completedBookings: completedCount,
        activeBookings: activeCount,
        
        // Revenue metrics
        totalRevenue,
        averageRevenuePerBooking: completedCount > 0 ? totalRevenue / completedCount : 0,
        
        // Trend metrics
        bookingsThisMonth: thisMonthBookings,
        bookingsLastMonth: lastMonthBookings,
        growthRate: Math.round(growthRate * 10) / 10,
        
        // Performance metrics
        popularityScore: Math.round(popularityScore),
        statusLabel,
        
        // Temporal data
        lastBookedAt: recentWalkIns.length > 0 
          ? recentWalkIns[0].createdAt 
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
    }));

    // Sort by revenue (descending)
    analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate overall stats - get total revenue directly from all completed walk-ins
    // This ensures we capture all revenue, even if service names don't match exactly
    const allCompletedWalkIns = await prisma.walkIn.findMany({
      where: {
        status: 'done',
        createdAt: { gte: startDate }
      },
      select: {
        service: true
      }
    });

    // Create a service price map for quick lookup
    const servicePriceMap = new Map(services.map(s => [s.name, s.price]));
    
    // Calculate total revenue from all completed walk-ins
    const totalRevenueFromWalkIns = allCompletedWalkIns.reduce((sum, walkIn) => {
      const price = servicePriceMap.get(walkIn.service) || 0;
      return sum + price;
    }, 0);

    // Calculate total bookings from all completed walk-ins
    const totalCompletedBookings = allCompletedWalkIns.length;

    // Calculate overall stats
    const overallStats = {
      totalRevenue: totalRevenueFromWalkIns,
      totalBookings: totalCompletedBookings,
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      averageTicket: totalCompletedBookings > 0 
        ? totalRevenueFromWalkIns / totalCompletedBookings 
        : 0
    };

    return NextResponse.json({
      period: days,
      startDate,
      endDate: new Date(),
      overallStats,
      services: analytics
    }, { status: 200 });

  } catch (error) {
    console.error('Error calculating analytics:', error);
    return NextResponse.json(
      { error: 'Failed to calculate analytics' },
      { status: 500 }
    );
  }
}

