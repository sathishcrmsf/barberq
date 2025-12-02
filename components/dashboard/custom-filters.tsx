// @cursor: Customizable filters for dashboard
// Date range, staff, and service type filters with localStorage persistence

"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface DashboardFilters {
  dateRange: "today" | "week" | "month";
  staffId: string | null;
  serviceName: string | null;
}

interface CustomFiltersProps {
  staff: Array<{ id: string; name: string }>;
  services: Array<{ name: string }>;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function CustomFilters({ staff, services, onFiltersChange }: CustomFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "today",
    staffId: null,
    serviceName: null,
  });

  useEffect(() => {
    // Load saved filters from localStorage
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("barberq_dashboard_filters");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setFilters(parsed);
          onFiltersChange(parsed);
        } catch (e) {
          // Ignore parse errors
        }
      }
    }
  }, [onFiltersChange]);

  const handleFilterChange = (key: keyof DashboardFilters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("barberq_dashboard_filters", JSON.stringify(newFilters));
    }
    
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters: DashboardFilters = {
      dateRange: "today",
      staffId: null,
      serviceName: null,
    };
    setFilters(defaultFilters);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("barberq_dashboard_filters", JSON.stringify(defaultFilters));
    }
    
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.staffId !== null || filters.serviceName !== null;

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Filter className="w-4 h-4" />
        Filters
        {hasActiveFilters && (
          <span className="w-2 h-2 bg-gray-900 rounded-full" />
        )}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg z-20 p-4 min-w-[280px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filter Dashboard</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <select
                  value={filters.dateRange}
                  onChange={(e) =>
                    handleFilterChange("dateRange", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                >
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>

              {/* Staff Filter */}
              {staff.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Staff Member
                  </label>
                  <select
                    value={filters.staffId || ""}
                    onChange={(e) =>
                      handleFilterChange("staffId", e.target.value || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  >
                    <option value="">All Staff</option>
                    {staff.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Service Filter */}
              {services.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <select
                    value={filters.serviceName || ""}
                    onChange={(e) =>
                      handleFilterChange("serviceName", e.target.value || null)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                  >
                    <option value="">All Services</option>
                    {services.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

