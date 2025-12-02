// @cursor: Service table component with actions
// Mobile-first table for managing services with edit, duplicate, toggle, and delete actions
// Enhanced with search, filter, sorting, and optimistic UI updates

'use client';

import { useState, useMemo } from 'react';
import { Service } from '@/hooks/useServices';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/ui/category-badge';
import { Toggle } from '@/components/ui/toggle';
import { Input } from '@/components/shared/input';
import { EmptyState } from '@/components/shared/empty-state';
import { cn } from '@/lib/utils';
import { 
  Edit2, 
  Copy, 
  Trash2,
  Clock,
  DollarSign,
  Users,
  Search,
  X,
  ArrowUpDown,
  Loader2
} from 'lucide-react';

type SortField = 'name' | 'price' | 'duration' | 'createdAt';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'inactive';

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, name: string) => void;
  loading?: boolean;
  actionLoading?: {
    [key: string]: boolean;
  };
}

export function ServiceTable({
  services,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  loading = false,
  actionLoading = {}
}: ServiceTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Extract unique categories from services
  const uniqueCategories = useMemo(() => {
    const categoriesMap = new Map<string, { id: string; name: string }>();
    services.forEach(service => {
      if (service.category) {
        categoriesMap.set(service.category.id, {
          id: service.category.id,
          name: service.category.name
        });
      }
    });
    return Array.from(categoriesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  // Filter and sort services
  const filteredAndSortedServices = useMemo(() => {
    let filtered = [...services];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(service =>
        statusFilter === 'active' ? service.isActive : !service.isActive
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(service =>
        service.category?.id === categoryFilter
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [services, searchQuery, statusFilter, categoryFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortField('name');
    setSortDirection('asc');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'all' || categoryFilter !== 'all';

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-20 bg-gray-200 rounded" />
          </Card>
        ))}
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <EmptyState
        icon={Search}
        title="No Services Found"
        description="Get started by creating your first service. You can add pricing, duration, and assign staff members."
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <Card className="p-4">
        <div className="space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Search services"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                className="px-3 py-1.5 text-sm border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {uniqueCategories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}

              <select
                value={`${sortField}|${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('|');
                  setSortField(field as SortField);
                  setSortDirection(direction as SortDirection);
                }}
                className="px-3 py-1.5 text-sm border rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name|asc">Name ↑</option>
                <option value="name|desc">Name ↓</option>
                <option value="price|asc">Price ↑</option>
                <option value="price|desc">Price ↓</option>
              </select>

              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8 px-2 text-xs text-gray-500 hover:text-gray-700 rounded-full"
                >
                  Clear
                </Button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {filteredAndSortedServices.length} of {services.length}
            </div>
          </div>
        </div>
      </Card>

      {/* Results */}
      {filteredAndSortedServices.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No Services Match Your Search"
          description="Try adjusting your search or filter criteria to find what you're looking for."
          actionLabel="Clear Filters"
          onAction={clearFilters}
        />
      ) : (
        <div className="space-y-4">
          {filteredAndSortedServices.map((service) => {
            const serviceLoading = actionLoading[service.id] || false;
            const isDeleting = actionLoading[`delete-${service.id}`] || false;
            const isToggling = actionLoading[`toggle-${service.id}`] || false;

            return (
              <Card 
                key={service.id} 
                className={cn(
                  "p-5 hover:shadow-md transition-shadow",
                  serviceLoading && "opacity-60 pointer-events-none"
                )}
              >
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4 sm:gap-6">
                  {/* Service Info */}
                  <div className="flex-1 min-w-0 w-full sm:w-auto">
                    {/* Header Row: Name, Badge, and Toggle */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-2 flex-wrap">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {service.name}
                          </h3>
                          <span
                            className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0',
                              service.isActive 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-600'
                            )}
                          >
                            {service.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        
                        {/* Category */}
                        {service.category && (
                          <div className="mb-2">
                            <CategoryBadge 
                              name={service.category.name}
                            />
                          </div>
                        )}
                      </div>
                      
                      {/* Toggle Switch - Top Right */}
                      <div className="flex items-center gap-2 shrink-0 pt-0.5">
                        <Toggle
                          checked={service.isActive}
                          onChange={() => onToggleStatus(service.id, service.isActive)}
                          disabled={isToggling}
                          aria-label={`Toggle ${service.name} status`}
                        />
                        {isToggling && (
                          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    {service.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {service.description}
                      </p>
                    )}

                    {/* Metadata Row */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">${service.price.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>{service.duration} min</span>
                      </div>
                      {service._count && service._count.staffServices > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{service._count.staffServices} staff</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions - Responsive Layout */}
                  <div className="flex sm:flex-col gap-2 sm:gap-3 w-full sm:w-auto sm:min-w-[140px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(service)}
                      className="flex-1 sm:flex-none sm:w-full justify-center sm:justify-start hover:bg-gray-100 min-w-0"
                      disabled={serviceLoading}
                      aria-label={`Edit ${service.name}`}
                    >
                      <Edit2 className="w-4 h-4 sm:mr-2.5 shrink-0" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDuplicate(service)}
                      className="flex-1 sm:flex-none sm:w-full justify-center sm:justify-start hover:bg-gray-100 min-w-0"
                      disabled={serviceLoading}
                      aria-label={`Duplicate ${service.name}`}
                    >
                      {actionLoading[`duplicate-${service.id}`] ? (
                        <Loader2 className="w-4 h-4 sm:mr-2.5 animate-spin shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 sm:mr-2.5 shrink-0" />
                      )}
                      <span className="hidden sm:inline">Duplicate</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(service.id, service.name)}
                      className="flex-1 sm:flex-none sm:w-full justify-center sm:justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium min-w-0"
                      disabled={isDeleting}
                      aria-label={`Delete ${service.name}`}
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 sm:mr-2.5 animate-spin shrink-0" />
                      ) : (
                        <Trash2 className="w-4 h-4 sm:mr-2.5 shrink-0" />
                      )}
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
