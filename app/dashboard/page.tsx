// @cursor: Dashboard v3.0 - Premium Redesign
// Modern, data-first homepage that fits everything on one screen
// Uber-style minimalist design with hamburger menu navigation
// Enhanced with filters, onboarding, and improved data hierarchy

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  UserCheck,
  Menu,
  Eye,
  UserPlus,
  BarChart3,
  Scissors,
  Tags,
  UsersIcon,
  ChevronRight,
  Activity,
  Phone,
  Brain,
  Sparkles,
  MoreVertical,
} from "lucide-react";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { PremiumActionCard } from "@/components/ui/premium-action-card";
import { SideDrawer } from "@/components/ui/side-drawer";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { CustomFilters, DashboardFilters } from "@/components/dashboard/custom-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DashboardData {
  kpis: {
    queueCount: number;
    avgWaitTime: number;
    staffActive: number;
    inProgressToday: number;
    revenueToday: number;
  };
  insights: Array<{
    id: string;
    emoji: string;
    title: string;
    value: string;
    priority: number;
  }>;
  queueStatus: {
    nowServing?: {
      customerName: string;
      service: string;
    };
    nextUp?: {
      customerName: string;
      service: string;
    };
    estimatedWait: number;
    queueCount: number;
  };
  staff: Array<{ id: string; name: string }>;
  services: Array<{ name: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "today",
    staffId: null,
    serviceName: null,
  });
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, [filters]);

  const fetchDashboardData = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.dateRange) params.append("dateRange", filters.dateRange);
      if (filters.staffId) params.append("staffId", filters.staffId);
      if (filters.serviceName) params.append("serviceName", filters.serviceName);

      const response = await fetch(`/api/dashboard?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");
      const dashboardData = await response.json();
      setData(dashboardData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSampleData = async () => {
    setIsGeneratingSample(true);
    try {
      const response = await fetch("/api/sample-data", { method: "POST" });
      if (!response.ok) throw new Error("Failed to generate sample data");
      toast.success("Sample data generated! Refreshing dashboard...");
      setTimeout(() => {
        fetchDashboardData();
      }, 1000);
    } catch (err) {
      toast.error("Failed to generate sample data");
    } finally {
      setIsGeneratingSample(false);
    }
  };

  const isFirstTimeUser = data && 
    data.kpis.revenueToday === 0 && 
    data.kpis.queueCount === 0 && 
    data.kpis.inProgressToday === 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2" />
            </div>
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </header>

        {/* Content Skeleton */}
        <div className="p-5 space-y-5">
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-24 bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
          <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 shadow-sm">
          <h1 className="text-2xl font-bold text-black">BarberQ</h1>
          <p className="text-sm text-red-600 mt-1">
            Error: {error || "Unknown error"}
          </p>
        </header>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Onboarding Wizard */}
      <OnboardingWizard />

      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />

      {/* ===== SECTION 1: HEADER ===== */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-5 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">BarberQ</h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Queue Management System
            </p>
          </div>
          <div className="flex items-center gap-2">
            {data && (
              <CustomFilters
                staff={data.staff || []}
                services={data.services || []}
                onFiltersChange={setFilters}
              />
            )}
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      <div className="p-5 space-y-5 pb-32">
        {/* Empty State for First-Time Users */}
        {isFirstTimeUser && (
          <EmptyState
            icon={Sparkles}
            title="Welcome to BarberQ!"
            description="Get started by adding your first service, or try our sample data to see how it works."
            actionLabel="Try Sample Data"
            onAction={handleGenerateSampleData}
            secondaryActionLabel="Add Service"
            onSecondaryAction={() => window.location.href = "/services"}
          >
            {isGeneratingSample && (
              <p className="text-sm text-gray-500 mt-2">Generating sample data...</p>
            )}
          </EmptyState>
        )}

        {/* ===== SECTION 2: PRIORITY METRICS (Improved Hierarchy) ===== */}
        {!isFirstTimeUser && (
          <>
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
                Key Metrics
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {/* Revenue - Priority #1 */}
                <MiniStatCard
                  label="Revenue"
                  value={`$${data.kpis.revenueToday}`}
                  icon={BarChart3}
                  variant="success"
                />
                {/* Queue Count - Priority #2 */}
                <MiniStatCard
                  label="In Queue"
                  value={data.kpis.queueCount}
                  icon={Users}
                  variant={data.kpis.queueCount > 3 ? "warning" : "default"}
                />
                {/* In Progress - Priority #3 */}
                <MiniStatCard
                  label="In Progress"
                  value={data.kpis.inProgressToday}
                  icon={Activity}
                  variant="info"
                />
              </div>
            </section>
          </>
        )}

        {/* ===== SECTION 3: MAIN ACTIONS (Progressive Disclosure) ===== */}
        {!isFirstTimeUser && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Main Actions
            </h2>
            <div className="space-y-3">
              {/* Queue - Full Width (Always Visible) */}
              <PremiumActionCard
                title="Queue"
                icon={Eye}
                href="/queue"
                gradient="from-gray-900 to-gray-700"
                queueCount={data.kpis.queueCount}
              />

              {/* Essential Actions - Always Visible */}
              <div className="grid grid-cols-2 gap-3">
                <PremiumActionCard
                  title="Add Walk-In"
                  icon={UserPlus}
                  href="/add"
                  gradient="from-blue-600 to-blue-500"
                />
                <PremiumActionCard
                  title="Analytics"
                  icon={BarChart3}
                  href="/analytics"
                  gradient="from-indigo-600 to-indigo-500"
                />
              </div>

              {/* Advanced Features - Progressive Disclosure */}
              {showAdvanced ? (
                <div className="grid grid-cols-2 gap-3">
                  <PremiumActionCard
                    title="Smart Insights"
                    icon={Brain}
                    href="/insights"
                    gradient="from-purple-600 to-purple-500"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowAdvanced(true)}
                  className="w-full p-4 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-gray-600"
                >
                  <MoreVertical className="w-5 h-5" />
                  <span className="text-sm font-medium">Show More</span>
                </button>
              )}
            </div>
          </section>
        )}

        {/* ===== SECTION 4: MANAGE SHOP (Essential Items First) ===== */}
        {!isFirstTimeUser && (
          <section>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
              Manage Shop
            </h2>
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              {/* Essential: Services and Customers */}
              <Link
                href="/services"
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 bg-gradient-to-br from-orange-500 to-orange-400 rounded-lg flex-shrink-0">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-base text-gray-900">
                    Services
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>

              <Link
                href="/customers"
                className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-lg flex-shrink-0">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-semibold text-base text-gray-900">
                    Customers
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
              </Link>

              {/* Advanced: Categories and Staff (shown if advanced is enabled) */}
              {showAdvanced && (
                <>
                  <Link
                    href="/categories"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-400 rounded-lg flex-shrink-0">
                        <Tags className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-base text-gray-900">
                        Categories
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>

                  <Link
                    href="/staff"
                    className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="p-2.5 bg-gradient-to-br from-green-500 to-green-400 rounded-lg flex-shrink-0">
                        <UsersIcon className="w-5 h-5 text-white" />
                      </div>
                      <span className="font-semibold text-base text-gray-900">
                        Staff
                      </span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </Link>
                </>
              )}
            </div>
          </section>
        )}
      </div>

      {/* ===== SECTION 6: REAL-TIME QUEUE STRIP (BOTTOM) ===== */}
      {data.queueStatus.queueCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-20 bg-gray-900 text-white px-4 py-3.5 shadow-2xl border-t border-gray-800">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-x-auto">
              {data.queueStatus.nowServing && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="text-gray-400 text-xs">Now:</span>
                  <span className="font-semibold text-sm truncate max-w-[120px]">
                    {data.queueStatus.nowServing.customerName}
                  </span>
                </div>
              )}
              {data.queueStatus.nextUp && (
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className="text-gray-400 text-xs">Next:</span>
                  <span className="font-semibold text-sm truncate max-w-[120px]">
                    {data.queueStatus.nextUp.customerName}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-sm">
                {data.queueStatus.estimatedWait}m
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
