// @cursor v1.2: Service card component displaying service information with CRUD actions.
// Delete button disabled for in-use services with tooltip explanation.

"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ServiceBadge } from "./service-badge";

interface ServiceCardProps {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  isActive: boolean;
  onToggle: (id: string, currentStatus: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  inUseCount?: number;
}

export function ServiceCard({
  id,
  name,
  price,
  duration,
  description,
  isActive,
  onToggle,
  onEdit,
  onDelete,
  inUseCount = 0
}: ServiceCardProps) {
  const canDelete = inUseCount === 0;

  return (
    <div className="w-full px-4">
      <Card className={`my-3 overflow-hidden ${!isActive && "opacity-60"}`}>
        <CardContent className="p-4 sm:p-5 w-full">
          <div className="flex justify-between items-start mb-3 gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base sm:text-lg truncate">{name}</h3>
              <p className="text-gray-600 text-sm sm:text-base mt-1 truncate">
                ₹{price.toFixed(2)} • {duration} min
              </p>
            </div>
            <ServiceBadge isActive={isActive} />
          </div>

          {description && (
            <p className="text-sm sm:text-base text-gray-500 mb-4 break-words">
              {description.length > 100
                ? `${description.substring(0, 100)}...`
                : description}
            </p>
          )}

          <div className="w-full flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => onEdit(id)}
              className="w-full sm:flex-1 min-w-0"
            >
              Edit
            </Button>

            <Button
              variant="outline"
              size="default"
              onClick={() => onToggle(id, isActive)}
              className="w-full sm:flex-1 min-w-0"
            >
              {isActive ? "Deactivate" : "Activate"}
            </Button>

            <Button
              variant="destructive"
              size="default"
              onClick={() => onDelete(id)}
              disabled={!canDelete}
              className="w-full sm:flex-1 min-w-0"
              title={!canDelete ? "Cannot delete: service in use" : ""}
            >
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

