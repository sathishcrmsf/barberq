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
  Activity,
  Phone,
  Package,
} from "lucide-react";
import { MiniStatCard } from "@/components/ui/mini-stat-card";
import { SideDrawer } from "@/components/ui/side-drawer";
import { MenuButton } from "./menu-button";

interface DashboardData {
  kpis: {
    queueCount: number;
    avgWaitTime: number;
    staffActive: number;
    inProgressToday: number;
    revenueToday: number;
    totalProducts?: number;
    lowStockCount?: number;
    inventoryValue?: number;
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

        {/* ===== SECTION 3: MAIN ACTIONS (PRIMARY BUTTONS - GRID VIEW) ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            Main Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/queue"
              className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-gray-900 to-gray-700 rounded-xl border border-gray-800 hover:shadow-lg active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
              <div className="relative z-10 p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <Eye className="w-7 h-7 text-white" />
              </div>
              <span className="relative z-10 font-bold text-base text-white text-center">
                Queue
              </span>
              {data.kpis.queueCount > 0 && (
                <span className="relative z-10 text-xs text-white/80 mt-1">
                  ({data.kpis.queueCount})
                </span>
              )}
            </Link>

            <Link
              href="/add"
              className="group flex flex-col items-center justify-center p-5 bg-gradient-to-br from-blue-600 to-blue-500 rounded-xl border border-blue-700 hover:shadow-lg active:scale-[0.98] transition-all relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors pointer-events-none" />
              <div className="relative z-10 p-3 bg-white/20 backdrop-blur-sm rounded-xl mb-3 group-hover:scale-110 transition-transform">
                <UserPlus className="w-7 h-7 text-white" />
              </div>
              <span className="relative z-10 font-bold text-base text-white text-center">
                Add Walk-In
              </span>
            </Link>
          </div>
        </section>

        {/* ===== SECTION 4: MANAGE SHOP (SECONDARY ITEMS - GRID VIEW) ===== */}
        <section>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3 px-1">
            Manage Shop
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/services"
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-orange-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl mb-2.5 group-hover:scale-110 transition-transform">
                <Scissors className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 text-center">
                Services
              </span>
            </Link>

            <Link
              href="/categories"
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl mb-2.5 group-hover:scale-110 transition-transform">
                <Tags className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 text-center">
                Categories
              </span>
            </Link>

            <Link
              href="/staff"
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-400 rounded-xl mb-2.5 group-hover:scale-110 transition-transform">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 text-center">
                Staff
              </span>
            </Link>

            <Link
              href="/customers"
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-400 rounded-xl mb-2.5 group-hover:scale-110 transition-transform">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 text-center">
                Customers
              </span>
            </Link>

            <Link
              href="/products"
              className="group flex flex-col items-center justify-center p-4 bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-md active:scale-[0.98] transition-all"
            >
              <div className="p-3 bg-gradient-to-br from-indigo-500 to-indigo-400 rounded-xl mb-2.5 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900 text-center">
                Products
              </span>
              {data.kpis.lowStockCount && data.kpis.lowStockCount > 0 && (
                <span className="text-xs text-orange-600 font-medium mt-1">
                  {data.kpis.lowStockCount} low stock
                </span>
              )}
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

