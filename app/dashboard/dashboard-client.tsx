// @cursor: Client component that receives initial server data and handles interactivity
// Supports auto-refresh while showing server-rendered content immediately

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
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
} from "lucide-react";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { PremiumActionCard } from "@/components/ui/premium-action-card";
import { SideDrawer } from "@/components/ui/side-drawer";
import { MenuButton } from "./menu-button";

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
}

interface DashboardClientProps {
  initialData: DashboardData;
}

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [data, setData] = useState<DashboardData>(initialData);
  const [drawerOpen, setDrawerOpen] = useState(false);


  // Auto-refresh every 30 seconds (non-blocking, updates in background)
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/dashboard", {
          // Use cache: 'no-store' to ensure fresh data
          cache: "no-store",
        });
        if (response.ok) {
          const dashboardData = await response.json();
          setData(dashboardData);
        }
      } catch (err) {
        // Silently fail - keep showing existing data
        console.error("Failed to refresh dashboard:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Side Drawer */}
      <SideDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
      
      {/* Menu Button - hydrates after initial render */}
      <MenuButton onOpen={() => setDrawerOpen(true)} />

      <div className="p-5 space-y-5 pb-32">
        {/* ===== SECTION 2: TODAY'S OVERVIEW (3 STAT CARDS) ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            Today&apos;s Overview
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <MiniStatCard
              label="Revenue"
              value={`₹${data.kpis.revenueToday}`}
              icon={BarChart3}
              variant="success"
            />
            <MiniStatCard
              label="In Progress"
              value={data.kpis.inProgressToday}
              icon={Activity}
              variant="info"
            />
            <MiniStatCard
              label="In Queue"
              value={data.kpis.queueCount}
              icon={Users}
              variant={data.kpis.queueCount > 3 ? "warning" : "default"}
            />
          </div>
        </section>

        {/* ===== SECTION 3: MAIN ACTIONS (PRIMARY BUTTONS) ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            Main Actions
          </h2>
          <div className="space-y-3">
            {/* Queue - Full Width */}
            <PremiumActionCard
              title="Queue"
              icon={Eye}
              href="/queue"
              gradient="from-gray-900 to-gray-700"
              queueCount={data.kpis.queueCount}
            />

            {/* Add Walk-in, Analytics & Insights - Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
              <PremiumActionCard
                title="Smart Insights"
                icon={Brain}
                href="/insights"
                gradient="from-purple-600 to-purple-500"
              />
            </div>
          </div>
        </section>

        {/* ===== SECTION 4: MANAGE SHOP (SECONDARY ITEMS) ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            Manage Shop
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
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
              className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-200"
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

            <Link
              href="/customers"
              className="flex items-center justify-between p-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
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
          </div>
        </section>
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
    </>
  );
}

