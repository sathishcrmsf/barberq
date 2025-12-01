// @cursor: Redesigned customer UX with pagination, infinite scroll, compact view, and sorting
// Mobile-first, optimized for large datasets

"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Phone, 
  ArrowLeft, 
  Search, 
  Plus, 
  History, 
  Star,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  X,
  Filter,
  ChevronDown,
  List,
  Grid,
  ArrowUpDown,
  Loader2
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";

interface Customer {
  id: string;
  phone: string;
  name: string;
  createdAt: string;
  visitCount?: number;
  lifetimeValue?: number;
  lastVisitDate?: string | null;
  daysSinceLastVisit?: number | null;
  needsReminder?: boolean;
  _count?: {
    walkIns: number;
  };
}

type CustomerSegment = "all" | "not30days" | "not60days" | "never";
type SortOption = "name" | "visits" | "ltv" | "lastVisit";
type ViewMode = "detailed" | "compact";

interface CustomerWithSegment extends Customer {
  timeCategory: "not30days" | "not60days" | "never" | "recent";
  preferredService?: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSegment, setSelectedSegment] = useState<CustomerSegment>("all");
  const [showFilters, setShowFilters] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("detailed");
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const observerTarget = useRef<HTMLDivElement>(null);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch customers with pagination
  const fetchCustomers = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "50",
        sortBy,
        sortOrder,
      });

      // Use server-side search if available, otherwise client-side
      if (debouncedSearch.trim()) {
        params.append("search", debouncedSearch.trim());
      }

      const res = await fetch(`/api/customers?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();

      if (data.customers && data.pagination) {
        // New paginated API response
        if (append) {
          setCustomers((prev) => [...prev, ...data.customers]);
        } else {
          setCustomers(data.customers);
        }
        setPagination(data.pagination);
      } else {
        // Fallback for old API format
        if (append) {
          setCustomers((prev) => [...prev, ...data]);
        } else {
          setCustomers(data);
        }
        setPagination({
          page: 1,
          limit: data.length,
          total: data.length,
          totalPages: 1,
          hasMore: false,
        });
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedSearch, sortBy, sortOrder]);

  // Initial load and when filters change
  useEffect(() => {
    fetchCustomers(1, false);
  }, [debouncedSearch, sortBy, sortOrder]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination.hasMore && !loadingMore && !loading) {
          fetchCustomers(pagination.page + 1, true);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [pagination.hasMore, loadingMore, loading, fetchCustomers, pagination.page]);

  // Categorize customers by last visit time
  // Only categorize customers who have NOT visited in last 30 days
  const customersWithSegments = useMemo((): CustomerWithSegment[] => {
    return customers.map((customer) => {
      const daysSince = customer.daysSinceLastVisit;
      
      let timeCategory: "not30days" | "not60days" | "never" | "recent";
      if (daysSince === null || daysSince === undefined) {
        timeCategory = "never"; // Never visited
      } else if (daysSince <= 30) {
        timeCategory = "recent"; // Visited within last 30 days - exclude from categorization
      } else if (daysSince <= 60) {
        timeCategory = "not30days"; // Not visited in last 30 days (but visited 31-60 days ago)
      } else {
        timeCategory = "not60days"; // Not visited in last 60 days (61+ days ago)
      }

      return {
        ...customer,
        timeCategory,
      };
    });
  }, [customers]);

  // Filter by time category (client-side for now)
  // When filtering by category, exclude customers who visited within last 30 days
  const filteredCustomers = useMemo(() => {
    let filtered = customersWithSegments;

    // Filter by time category
    if (selectedSegment !== "all") {
      // For specific categories, exclude recent customers
      filtered = filtered.filter((c) => 
        c.timeCategory !== "recent" && c.timeCategory === selectedSegment
      );
    } else {
      // For "all", show everyone including recent (they just won't have a category badge)
      filtered = filtered;
    }

    return filtered;
  }, [customersWithSegments, selectedSegment]);

  // Calculate stats from all loaded customers
  const stats = useMemo(() => {
    const totalCustomers = pagination.total || customers.length;
    const activeCustomers = customers.filter(
      (c) => (c.daysSinceLastVisit ?? Infinity) <= 30
    ).length;
    const totalLTV = customers.reduce((sum, c) => sum + (c.lifetimeValue ?? 0), 0);
    const avgVisits = customers.length > 0
      ? customers.reduce((sum, c) => sum + (c.visitCount ?? 0), 0) / customers.length
      : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalLTV,
      avgVisits: Math.round(avgVisits * 10) / 10,
    };
  }, [customers, pagination.total]);

  // Time category counts (from loaded customers)
  // Only count customers who have NOT visited in last 30 days
  const segmentCounts = useMemo(() => {
    const customersToCount = customersWithSegments.filter((c) => {
      const daysSince = c.daysSinceLastVisit;
      return daysSince === null || daysSince === undefined || daysSince > 30;
    });
    
    return {
      all: customersToCount.length,
      not30days: customersToCount.filter((c) => c.timeCategory === "not30days").length,
      not60days: customersToCount.filter((c) => c.timeCategory === "not60days").length,
      never: customersToCount.filter((c) => c.timeCategory === "never").length,
    };
  }, [customersWithSegments]);

  // Helper functions
  const formatPhone = (phone: string) => {
    if (phone.startsWith("+91") && phone.length === 13) {
      return `${phone.slice(0, 3)} ${phone.slice(3, 8)} ${phone.slice(8)}`;
    }
    return phone;
  };

  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getSegmentColor = (category: string) => {
    switch (category) {
      case "not30days":
        return "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200";
      case "not60days":
        return "bg-gradient-to-br from-orange-50 to-red-50 border-orange-200";
      case "never":
        return "bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getSegmentIcon = (category: string) => {
    switch (category) {
      case "not30days":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "not60days":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "never":
        return <Users className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getSortLabel = (sort: SortOption) => {
    switch (sort) {
      case "name": return "Name";
      case "visits": return "Visits";
      case "ltv": return "Lifetime Value";
      case "lastVisit": return "Last Visit";
      default: return "Name";
    }
  };

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(newSort);
      setSortOrder("asc");
    }
    setShowSortMenu(false);
  };

  // Quick add to queue
  const handleQuickAdd = (customer: CustomerWithSegment) => {
    router.push(`/add?phone=${encodeURIComponent(customer.phone)}&name=${encodeURIComponent(customer.name)}`);
  };

  // Call customer
  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold">Customers</h1>
                <p className="text-xs text-gray-600">
                  {stats.totalCustomers} total customers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewMode(viewMode === "detailed" ? "compact" : "detailed")}
                title={viewMode === "detailed" ? "Compact view" : "Detailed view"}
              >
                {viewMode === "detailed" ? (
                  <List className="w-5 h-5" />
                ) : (
                  <Grid className="w-5 h-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-11 pl-10 pr-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 mb-2">
            <div className="relative flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSortMenu(!showSortMenu)}
                className="w-full justify-between"
              >
                <span className="flex items-center gap-2">
                  <ArrowUpDown className="w-4 h-4" />
                  {getSortLabel(sortBy)} ({sortOrder === "asc" ? "↑" : "↓"})
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
              {showSortMenu && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-30">
                  {(["name", "visits", "ltv", "lastVisit"] as SortOption[]).map((option) => (
                    <button
                      key={option}
                      onClick={() => handleSortChange(option)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-100 ${
                        sortBy === option ? "bg-blue-50 text-blue-700" : ""
                      }`}
                    >
                      {getSortLabel(option)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filter Chips */}
        {showFilters && (
          <div className="px-4 pb-3 flex gap-2 overflow-x-auto">
            {(
              [
                { id: "all", label: "All", count: segmentCounts.all },
                { id: "not30days", label: "Not in Last 30 Days", count: segmentCounts.not30days },
                { id: "not60days", label: "Not in Last 60 Days", count: segmentCounts.not60days },
                { id: "never", label: "Never Visited", count: segmentCounts.never },
              ] as const
            ).map((segment) => (
              <button
                key={segment.id}
                onClick={() => setSelectedSegment(segment.id as CustomerSegment)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedSegment === segment.id
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {segment.label} ({segment.count})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stats Dashboard */}
      {!loading && customers.length > 0 && (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">Total</span>
              </div>
              <p className="text-2xl font-bold text-blue-900">{stats.totalCustomers}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-700">Active</span>
              </div>
              <p className="text-2xl font-bold text-green-900">{stats.activeCustomers}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-amber-600" />
                <span className="text-xs font-medium text-amber-700">LTV</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">₹{stats.totalLTV.toFixed(0)}</p>
            </Card>
            <Card className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-700">Avg Visits</span>
              </div>
              <p className="text-2xl font-bold text-purple-900">{stats.avgVisits}</p>
            </Card>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-24">
        {loading && customers.length === 0 ? (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500">Loading customers...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <EmptyState
            icon={Users}
            title={
              searchQuery
                ? "No customers found"
                : selectedSegment !== "all"
                ? `No customers in this category`
                : "No Customers Yet"
            }
            description={
              searchQuery
                ? "Try adjusting your search query"
                : "Customers will appear here once they register using their mobile number when adding a walk-in."
            }
            actionLabel={searchQuery ? "Clear Search" : "Go to Queue"}
            onAction={() => {
              if (searchQuery) {
                setSearchQuery("");
              } else {
                router.push("/queue");
              }
            }}
          />
        ) : (
          <>
            <div className="space-y-3">
              {filteredCustomers.map((customer) => (
                <Card
                  key={customer.id}
                  className={`transition-all hover:shadow-md ${
                    viewMode === "compact" ? "p-3" : "p-4"
                  } ${getSegmentColor(customer.timeCategory)}`}
                >
                  {viewMode === "compact" ? (
                    // Compact View
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(customer.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-base text-gray-900 truncate">
                            {toTitleCase(customer.name)}
                          </h3>
                          {getSegmentIcon(customer.timeCategory)}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1 flex-wrap">
                          <span>{formatPhone(customer.phone)}</span>
                          <span>•</span>
                          <span>{customer.visitCount ?? 0} visits</span>
                          <span>•</span>
                          <span>₹{(customer.lifetimeValue ?? 0).toFixed(0)}</span>
                          <span>•</span>
                          {customer.timeCategory !== "recent" && (
                            <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                              customer.timeCategory === "not30days"
                                ? "bg-blue-100 text-blue-700"
                                : customer.timeCategory === "not60days"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-gray-100 text-gray-600"
                            }`}>
                              {customer.timeCategory === "not30days"
                                ? "Not 30d"
                                : customer.timeCategory === "not60days"
                                ? "Not 60d"
                                : "New"}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleQuickAdd(customer)}
                          className="px-2"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCall(customer.phone)}
                          className="px-2"
                        >
                          <Phone className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // Detailed View
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                          {getInitials(customer.name)}
                        </div>
                      </div>

                      {/* Customer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg text-gray-900 truncate">
                                {toTitleCase(customer.name)}
                              </h3>
                              {getSegmentIcon(customer.timeCategory)}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a
                                href={`tel:${customer.phone}`}
                                className="font-mono hover:text-blue-600"
                              >
                                {formatPhone(customer.phone)}
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-3 mb-3 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-600">Visits:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                (customer.visitCount ?? 0) > 0
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {customer.visitCount ?? 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium text-gray-600">LTV:</span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-semibold ${
                                (customer.lifetimeValue ?? 0) > 0
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              ₹{(customer.lifetimeValue ?? 0).toFixed(0)}
                            </span>
                          </div>
                          {customer.lastVisitDate && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 text-gray-400" />
                              <span className="text-xs text-gray-600">
                                {customer.daysSinceLastVisit === 0
                                  ? "Today"
                                  : customer.daysSinceLastVisit === 1
                                  ? "Yesterday"
                                  : `${customer.daysSinceLastVisit} days ago`}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Time Category Badge - Only show for customers not in last 30 days */}
                        {customer.timeCategory !== "recent" && (
                          <div className="mb-3">
                            <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${
                              customer.timeCategory === "not30days"
                                ? "bg-blue-100 text-blue-700 border border-blue-200"
                                : customer.timeCategory === "not60days"
                                ? "bg-orange-100 text-orange-700 border border-orange-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}>
                              {customer.timeCategory === "not30days"
                                ? "⚠ Not in Last 30 Days"
                                : customer.timeCategory === "not60days"
                                ? "⚠ Not in Last 60 Days"
                                : "○ Never Visited"}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleQuickAdd(customer)}
                            className="flex-1 bg-black text-white hover:bg-gray-900"
                          >
                            <Plus className="w-4 h-4" />
                            Add to Queue
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCall(customer.phone)}
                            className="flex-shrink-0"
                          >
                            <Phone className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {pagination.hasMore && (
              <div ref={observerTarget} className="py-4 text-center">
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more...</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Scroll for more customers
                  </p>
                )}
              </div>
            )}

            {/* End of List Indicator */}
            {!pagination.hasMore && customers.length > 0 && (
              <div className="py-4 text-center">
                <p className="text-sm text-gray-500">
                  Showing {customers.length} of {pagination.total} customers
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
