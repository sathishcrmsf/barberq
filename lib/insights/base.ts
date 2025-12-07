// @cursor: Base insight types and interfaces for the smart insights system
// Provides common types, priority scoring, and reusable query helpers

import { prisma } from "@/lib/prisma";

// Insight priority levels (lower = higher priority)
export enum InsightPriority {
  CRITICAL = 1,
  HIGH = 2,
  MEDIUM = 3,
  LOW = 4,
  INFO = 5,
}

// Base insight interface
export interface BaseInsight {
  id: string;
  category: InsightCategory;
  title: string;
  description: string;
  emoji: string;
  priority: InsightPriority;
  value: string | number;
  actionable?: boolean;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Insight categories
export enum InsightCategory {
  CUSTOMER_BEHAVIOR = "customer-behavior",
  REVENUE_OPTIMIZATION = "revenue-optimization",
  STAFF_PERFORMANCE = "staff-performance",
  RECOMMENDATIONS = "recommendations",
  REPEAT_VISITS = "repeat-visits",
  SLOT_OPTIMIZATION = "slot-optimization",
  CUSTOMER_PERSONALIZATION = "customer-personalization",
}

// Customer history data
export interface CustomerHistory {
  customerId: string;
  customerName: string;
  phone: string;
  totalVisits: number;
  completedVisits: number;
  lastVisitDate: Date | null;
  daysSinceLastVisit: number | null;
  averageDaysBetweenVisits: number | null;
  totalSpent: number;
  averageTicketSize: number;
  favoriteServices: Array<{ serviceName: string; count: number }>;
  servicesBooked: string[];
}

// Service trend data
export interface ServiceTrend {
  serviceId: string;
  serviceName: string;
  price: number;
  duration: number;
  totalBookings: number;
  completedBookings: number;
  totalRevenue: number;
  bookingsThisPeriod: number;
  bookingsLastPeriod: number;
  growthRate: number;
  averageRevenuePerBooking: number;
}

// Staff performance data
export interface StaffPerformance {
  staffId: string;
  staffName: string;
  totalServices: number;
  completedServices: number;
  totalRevenue: number;
  averageTicketSize: number;
  averageServiceDuration: number;
  rebookingRate: number;
  uniqueCustomers: number;
  utilizationRate: number;
}

// Query helpers
export class InsightQueries {
  /**
   * Get customer visit history
   */
  static async getCustomerHistory(
    customerId?: string,
    periodDays: number = 365
  ): Promise<CustomerHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const whereClause: any = {
      createdAt: { gte: startDate },
      customerId: customerId ? { equals: customerId } : { not: null },
    };

    // Limit to last 1000 walk-ins for performance (still enough for accurate insights)
    const walkIns = await prisma.walkIn.findMany({
      where: whereClause,
      include: {
        Customer: true,
      },
      orderBy: { createdAt: "desc" },
      take: 1000, // Performance optimization: limit data fetched
    });

    // Get all services once (optimization)
    const services = await prisma.service.findMany();
    const serviceMap = new Map(services.map((s) => [s.name, s.price]));

    // Group by customer
    const customerMap = new Map<string, CustomerHistory>();

    for (const walkIn of walkIns) {
      if (!walkIn.customerId || !walkIn.Customer) continue;

      const customerId = walkIn.customerId;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName: walkIn.Customer.name,
          phone: walkIn.Customer.phone,
          totalVisits: 0,
          completedVisits: 0,
          lastVisitDate: null,
          daysSinceLastVisit: null,
          averageDaysBetweenVisits: null,
          totalSpent: 0,
          averageTicketSize: 0,
          favoriteServices: [],
          servicesBooked: [],
        });
      }

      const history = customerMap.get(customerId)!;
      history.totalVisits++;
      if (walkIn.status === "done") {
        history.completedVisits++;
        
        // Get service price from map (optimized)
        const servicePrice = serviceMap.get(walkIn.service) || 0;
        history.totalSpent += servicePrice;
      }

      // Track services
      if (!history.servicesBooked.includes(walkIn.service)) {
        history.servicesBooked.push(walkIn.service);
      }

      // Update last visit
      if (
        !history.lastVisitDate ||
        walkIn.createdAt > history.lastVisitDate
      ) {
        history.lastVisitDate = walkIn.createdAt;
      }
    }

    for (const history of customerMap.values()) {
      // Calculate days since last visit
      if (history.lastVisitDate) {
        const daysSince =
          (Date.now() - history.lastVisitDate.getTime()) / (1000 * 60 * 60 * 24);
        history.daysSinceLastVisit = Math.floor(daysSince);
      }

      // Calculate average ticket size
      if (history.completedVisits > 0) {
        history.averageTicketSize = history.totalSpent / history.completedVisits;
      }

      // Calculate favorite services
      const serviceCounts = new Map<string, number>();
      const customerWalkIns = walkIns.filter(
        (w) => w.customerId === history.customerId
      );
      for (const walkIn of customerWalkIns) {
        serviceCounts.set(
          walkIn.service,
          (serviceCounts.get(walkIn.service) || 0) + 1
        );
      }
      history.favoriteServices = Array.from(serviceCounts.entries())
        .map(([serviceName, count]) => ({ serviceName, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average days between visits
      if (customerWalkIns.length > 1) {
        const sortedDates = customerWalkIns
          .map((w) => w.createdAt.getTime())
          .sort((a, b) => a - b);
        let totalDays = 0;
        for (let i = 1; i < sortedDates.length; i++) {
          totalDays += (sortedDates[i] - sortedDates[i - 1]) / (1000 * 60 * 60 * 24);
        }
        history.averageDaysBetweenVisits =
          totalDays / (sortedDates.length - 1);
      }
    }

    return Array.from(customerMap.values());
  }

  /**
   * Get service trends
   */
  static async getServiceTrends(
    periodDays: number = 30
  ): Promise<ServiceTrend[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const previousStartDate = new Date();
    previousStartDate.setDate(previousStartDate.getDate() - periodDays * 2);

    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: { Category: true },
    });

    // Use database aggregations instead of fetching all walk-ins
    const trends: ServiceTrend[] = [];

    for (const service of services) {
      // Count bookings using database queries (much faster)
      const [totalBookings, completedBookings, bookingsThisPeriod, bookingsLastPeriod] = await Promise.all([
        prisma.walkIn.count({
          where: {
            service: service.name,
            createdAt: { gte: previousStartDate }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: "done",
            createdAt: { gte: previousStartDate }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: "done",
            createdAt: { gte: startDate }
          }
        }),
        prisma.walkIn.count({
          where: {
            service: service.name,
            status: "done",
            createdAt: { gte: previousStartDate, lt: startDate }
          }
        })
      ]);

      const growthRate =
        bookingsLastPeriod > 0
          ? ((bookingsThisPeriod - bookingsLastPeriod) / bookingsLastPeriod) *
            100
          : bookingsThisPeriod > 0
          ? 100
          : 0;

      const totalRevenue = completedBookings * service.price;

      trends.push({
        serviceId: service.id,
        serviceName: service.name,
        price: service.price,
        duration: service.duration,
        totalBookings,
        completedBookings,
        totalRevenue,
        bookingsThisPeriod,
        bookingsLastPeriod,
        growthRate: Math.round(growthRate * 10) / 10,
        averageRevenuePerBooking:
          completedBookings > 0
            ? totalRevenue / completedBookings
            : 0,
      });
    }

    return trends.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  /**
   * Get staff performance metrics
   */
  static async getStaffPerformance(
    periodDays: number = 30
  ): Promise<StaffPerformance[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    const staff = await prisma.staff.findMany({
      where: { isActive: true },
    });

    // Limit walk-ins fetched for performance (still enough for accurate metrics)
    const walkIns = await prisma.walkIn.findMany({
      where: {
        createdAt: { gte: startDate },
        staffId: { not: null },
      },
      include: {
        Customer: true,
        Staff: true,
      },
      take: 2000, // Performance optimization: limit data fetched
    });

    const services = await prisma.service.findMany();
    const serviceMap = new Map(services.map((s) => [s.name, s]));

    const performance: StaffPerformance[] = [];

    for (const staffMember of staff) {
      const staffWalkIns = walkIns.filter(
        (w) => w.staffId === staffMember.id
      );
      const completedWalkIns = staffWalkIns.filter(
        (w) => w.status === "done"
      );

      // Calculate revenue
      let totalRevenue = 0;
      let totalDuration = 0;
      for (const walkIn of completedWalkIns) {
        const service = serviceMap.get(walkIn.service);
        if (service) {
          totalRevenue += service.price;
          if (walkIn.startedAt && walkIn.completedAt) {
            totalDuration +=
              (walkIn.completedAt.getTime() - walkIn.startedAt.getTime()) /
              (1000 * 60);
          }
        }
      }

      // Calculate unique customers
      const uniqueCustomers = new Set(
        staffWalkIns
          .map((w) => w.customerId)
          .filter((id): id is string => id !== null)
      ).size;

      // Calculate rebooking rate (customers who visited this staff more than once)
      const customerVisitCounts = new Map<string, number>();
      for (const walkIn of staffWalkIns) {
        if (walkIn.customerId) {
          customerVisitCounts.set(
            walkIn.customerId,
            (customerVisitCounts.get(walkIn.customerId) || 0) + 1
          );
        }
      }
      const repeatCustomers = Array.from(customerVisitCounts.values()).filter(
        (count) => count > 1
      ).length;
      const rebookingRate =
        uniqueCustomers > 0 ? (repeatCustomers / uniqueCustomers) * 100 : 0;

      // Calculate average service duration
      const avgDuration =
        completedWalkIns.length > 0
          ? totalDuration / completedWalkIns.length
          : 0;

      // Utilization rate (simplified - would need actual working hours)
      const utilizationRate = completedWalkIns.length > 0 ? 70 : 0; // Placeholder

      performance.push({
        staffId: staffMember.id,
        staffName: staffMember.name,
        totalServices: staffWalkIns.length,
        completedServices: completedWalkIns.length,
        totalRevenue,
        averageTicketSize:
          completedWalkIns.length > 0
            ? totalRevenue / completedWalkIns.length
            : 0,
        averageServiceDuration: Math.round(avgDuration),
        rebookingRate: Math.round(rebookingRate * 10) / 10,
        uniqueCustomers,
        utilizationRate,
      });
    }

    return performance.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }
}

/**
 * Calculate insight priority based on multiple factors
 */
export function calculatePriority(
  factors: {
    urgency?: number; // 0-100
    impact?: number; // 0-100
    frequency?: number; // 0-100
  }
): InsightPriority {
  const { urgency = 0, impact = 0, frequency = 0 } = factors;
  const score = (urgency * 0.5 + impact * 0.3 + frequency * 0.2);

  if (score >= 80) return InsightPriority.CRITICAL;
  if (score >= 60) return InsightPriority.HIGH;
  if (score >= 40) return InsightPriority.MEDIUM;
  if (score >= 20) return InsightPriority.LOW;
  return InsightPriority.INFO;
}

