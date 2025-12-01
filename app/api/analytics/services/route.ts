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
        category: true,
        staffServices: {
          include: {
            staff: true
          }
        }
      }
    });

    // Get all walk-ins within the period
    const walkIns = await prisma.walkIn.findMany({
      where: {
        createdAt: {
          gte: startDate
        }
      }
    });

    // Calculate analytics for each service
    const analytics = services.map(service => {
      // Filter walk-ins for this service
      const serviceWalkIns = walkIns.filter(w => w.service === service.name);
      const completedWalkIns = serviceWalkIns.filter(w => w.status === 'done');
      const activeWalkIns = serviceWalkIns.filter(w => ['waiting', 'in-progress'].includes(w.status));

      // Calculate revenue
      const totalRevenue = completedWalkIns.length * service.price;

      // Calculate this month vs last month
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      const lastMonthStart = new Date();
      lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
      lastMonthStart.setDate(1);
      const lastMonthEnd = new Date();
      lastMonthEnd.setDate(0);

      const thisMonthBookings = completedWalkIns.filter(w => 
        w.createdAt >= thisMonthStart
      ).length;

      const lastMonthBookings = completedWalkIns.filter(w => 
        w.createdAt >= lastMonthStart && w.createdAt <= lastMonthEnd
      ).length;

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

      // Find most popular day/time
      const dayCount: Record<string, number> = {};
      const hourCount: Record<string, number> = {};

      serviceWalkIns.forEach(w => {
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
        categoryName: service.category?.name,
        imageUrl: service.imageUrl,
        
        // Booking metrics
        totalBookings: serviceWalkIns.length,
        completedBookings: completedWalkIns.length,
        activeBookings: activeWalkIns.length,
        
        // Revenue metrics
        totalRevenue,
        averageRevenuePerBooking: completedWalkIns.length > 0 ? totalRevenue / completedWalkIns.length : 0,
        
        // Trend metrics
        bookingsThisMonth: thisMonthBookings,
        bookingsLastMonth: lastMonthBookings,
        growthRate: Math.round(growthRate * 10) / 10,
        
        // Performance metrics
        popularityScore: Math.round(popularityScore),
        statusLabel,
        
        // Temporal data
        lastBookedAt: serviceWalkIns.length > 0 
          ? serviceWalkIns[serviceWalkIns.length - 1].createdAt 
          : null,
        mostPopularDay,
        mostPopularHour: mostPopularHour ? `${mostPopularHour}:00` : null,
        
        // Staff data
        staffCount: service.staffServices.length,
        staff: service.staffServices.map(ss => ({
          id: ss.staff.id,
          name: ss.staff.name,
          isPrimary: ss.isPrimary
        }))
      };
    });

    // Sort by revenue (descending)
    analytics.sort((a, b) => b.totalRevenue - a.totalRevenue);

    // Calculate overall stats
    const overallStats = {
      totalRevenue: analytics.reduce((sum, a) => sum + a.totalRevenue, 0),
      totalBookings: analytics.reduce((sum, a) => sum + a.completedBookings, 0),
      totalServices: services.length,
      activeServices: services.filter(s => s.isActive).length,
      averageTicket: analytics.reduce((sum, a) => sum + a.totalRevenue, 0) / 
                     analytics.reduce((sum, a) => sum + a.completedBookings, 0) || 0
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

