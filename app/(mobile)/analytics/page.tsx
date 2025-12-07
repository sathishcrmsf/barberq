// @cursor: Analytics dashboard - Service performance insights
// Shows top performers, revenue, trends, and recommendations

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

interface ServiceAnalytics {
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  categoryName?: string;
  totalBookings: number;
  completedBookings: number;
  activeBookings: number;
  totalRevenue: number;
  averageRevenuePerBooking: number;
  bookingsThisMonth: number;
  bookingsLastMonth: number;
  growthRate: number;
  popularityScore: number;
  statusLabel: string;
  lastBookedAt?: string;
  mostPopularDay?: string;
  mostPopularHour?: string;
  staffCount: number;
}

interface AnalyticsData {
  period: number;
  startDate: string;
  endDate: string;
  overallStats: {
    totalRevenue: number;
    totalBookings: number;
    totalServices: number;
    activeServices: number;
    averageTicket: number;
  };
  services: ServiceAnalytics[];
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'7' | '30' | '90'>('30');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics/services?period=${period}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  // Show loading state immediately with skeleton
  if (loading && !data) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
                ← Back
              </Button>
              <h1 className="text-xl font-bold">Analytics</h1>
            </div>
          </div>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const topPerformers = data.services.slice(0, 5);
  const needsAttention = data.services.filter(s => s.growthRate < -20 || s.bookingsThisMonth < 3);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Analytics</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Period Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            variant={period === '7' ? 'default' : 'outline'}
            onClick={() => setPeriod('7')}
          >
            Last 7 Days
          </Button>
          <Button
            size="sm"
            variant={period === '30' ? 'default' : 'outline'}
            onClick={() => setPeriod('30')}
          >
            Last 30 Days
          </Button>
          <Button
            size="sm"
            variant={period === '90' ? 'default' : 'outline'}
            onClick={() => setPeriod('90')}
          >
            Last 90 Days
          </Button>
        </div>

        {/* Overview Stats */}
        <Card className="p-4 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">OVERVIEW</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-bold">₹{data.overallStats.totalRevenue.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{data.overallStats.totalBookings}</div>
              <div className="text-xs text-gray-600">Bookings</div>
            </div>
            <div>
              <div className="text-2xl font-bold">${data.overallStats.averageTicket.toFixed(0)}</div>
              <div className="text-xs text-gray-600">Avg Ticket</div>
            </div>
          </div>
        </Card>

        {/* Top Performers */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            🔥 TOP PERFORMERS
          </h2>
          {topPerformers.length === 0 ? (
            <Card className="p-6 text-center text-gray-500">
              <p>No data yet. Complete some services to see analytics.</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {topPerformers.map((service, index) => (
                <Card key={service.serviceId} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl font-bold text-gray-400 min-w-[30px]">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{service.serviceName}</h3>
                          {service.categoryName && (
                            <span className="text-xs text-gray-600">
                              {service.categoryName}
                            </span>
                          )}
                        </div>
                        <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded-full">
                          {service.statusLabel}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm mb-2">
                        <div>
                          <div className="font-semibold">₹{service.totalRevenue.toFixed(0)}</div>
                          <div className="text-xs text-gray-600">Revenue</div>
                        </div>
                        <div>
                          <div className="font-semibold">{service.completedBookings}</div>
                          <div className="text-xs text-gray-600">Bookings</div>
                        </div>
                        <div>
                          <div className={`font-semibold ${
                            service.growthRate > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {service.growthRate > 0 ? '+' : ''}{service.growthRate.toFixed(0)}%
                          </div>
                          <div className="text-xs text-gray-600">Growth</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${Math.min(100, service.popularityScore)}%` }}
                        />
                      </div>

                      {service.mostPopularDay && (
                        <p className="text-xs text-gray-500 mt-2">
                          Popular: {service.mostPopularDay} 
                          {service.mostPopularHour && ` at ${service.mostPopularHour}`}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              ⚠️ NEEDS ATTENTION
            </h2>
            <div className="space-y-3">
              {needsAttention.slice(0, 3).map((service) => (
                <Card key={service.serviceId} className="p-4 border-orange-200 bg-orange-50">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold">{service.serviceName}</h3>
                      <div className="text-sm text-gray-600">
                        {service.completedBookings} bookings • ₹{service.totalRevenue.toFixed(0)} revenue
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 bg-orange-200 text-orange-800 rounded-full">
                      {service.growthRate.toFixed(0)}% {service.growthRate < 0 ? '↓' : ''}
                    </span>
                  </div>

                  <div className="bg-white border border-orange-200 rounded p-3 mt-2">
                    <div className="text-xs font-semibold text-orange-900 mb-1">
                      💡 Recommendations:
                    </div>
                    <ul className="text-xs text-orange-800 space-y-1">
                      {service.growthRate < -20 && (
                        <li>• Consider promotional pricing or marketing campaign</li>
                      )}
                      {service.bookingsThisMonth < 3 && (
                        <li>• Low demand - review pricing or service offering</li>
                      )}
                      {service.staffCount === 0 && (
                        <li>• No staff assigned - add qualified staff members</li>
                      )}
                      <li>• Update service image to increase appeal</li>
                    </ul>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Services */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            ALL SERVICES ({data.services.length})
          </h2>
          <div className="space-y-2">
            {data.services.map((service) => (
              <Card key={service.serviceId} className="p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-medium text-sm">{service.serviceName}</div>
                    <div className="text-xs text-gray-600">
                      {service.completedBookings} bookings • ₹{service.totalRevenue.toFixed(0)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${
                      service.growthRate > 0 ? 'text-green-600' : 
                      service.growthRate < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {service.growthRate > 0 ? '+' : ''}{service.growthRate.toFixed(0)}%
                    </div>
                    <div className="text-xs text-gray-500">
                      Score: {service.popularityScore}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Help Card */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-2">
            <span className="text-blue-600">📊</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Understanding Analytics
              </p>
              <p className="text-xs text-blue-700">
                Revenue and bookings are calculated from completed services. 
                Growth rate compares this month to last month. 
                Popularity score is a weighted metric combining multiple factors.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

