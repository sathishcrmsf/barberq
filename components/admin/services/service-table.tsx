// @cursor: Service table component with actions
// Mobile-first table for managing services with edit, duplicate, toggle, and delete actions

'use client';

import { Service } from '@/hooks/useServices';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBadge } from '@/components/ui/category-badge';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { 
  Edit2, 
  Copy, 
  Trash2,
  Clock,
  DollarSign,
  Users
} from 'lucide-react';

interface ServiceTableProps {
  services: Service[];
  onEdit: (service: Service) => void;
  onDuplicate: (service: Service) => void;
  onToggleStatus: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string, name: string) => void;
  loading?: boolean;
}

export function ServiceTable({
  services,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  loading = false
}: ServiceTableProps) {
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
    return null;
  }

  return (
    <div className="space-y-4">
      {services.map((service) => (
        <Card key={service.id} className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between gap-6">
            {/* Service Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="font-semibold text-lg truncate">
                  {service.name}
                </h3>
                <span
                  className={cn(
                    'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
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
                <div className="mb-3">
                  <CategoryBadge 
                    name={service.category.name}
                  />
                </div>
              )}

              {/* Description */}
              {service.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {service.description}
                </p>
              )}

              {/* Metadata Row */}
              <div className="flex flex-wrap items-center gap-5 text-sm text-gray-700">
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">${service.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration} min</span>
                </div>
                {service._count && service._count.staffServices > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    <span>{service._count.staffServices} staff</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 min-w-[140px]">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(service)}
                className="w-full justify-start hover:bg-gray-100"
              >
                <Edit2 className="w-4 h-4 mr-2.5" />
                Edit
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDuplicate(service)}
                className="w-full justify-start hover:bg-gray-100"
              >
                <Copy className="w-4 h-4 mr-2.5" />
                Duplicate
              </Button>

              {/* Toggle Switch */}
              <div className="flex items-center gap-3 px-2 py-1">
                <Toggle
                  checked={service.isActive}
                  onChange={() => onToggleStatus(service.id, service.isActive)}
                />
                <span className="text-sm font-medium text-gray-700">
                  {service.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(service.id, service.name)}
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2.5" />
                Delete
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
