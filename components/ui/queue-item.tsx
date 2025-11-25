// @cursor: This component must be mobile-first,
// Uber-style minimalistic, with thumb-friendly controls.
// Avoid complex layout. Prioritize clarity and speed.

import { StatusBadge } from "./status-badge";
import { Button } from "./button";
import { Play, Check, Trash2 } from "lucide-react";

interface QueueItemProps {
  id: string;
  customerName: string;
  service: string;
  status: "waiting" | "in-progress" | "done";
  notes?: string | null;
  onStart: (id: string) => void;
  onDone: (id: string) => void;
  onDelete: (id: string) => void;
  disableDelete?: boolean;
}

export function QueueItem({
  id,
  customerName,
  service,
  status,
  notes,
  onStart,
  onDone,
  onDelete,
  disableDelete = false,
}: QueueItemProps) {
  return (
    <div className="flex flex-col gap-3 p-4 sm:p-5 border-b border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
            {customerName}
          </h3>
          <p className="text-sm sm:text-base text-gray-600 mt-1">{service}</p>
          {notes && (
            <p className="text-xs sm:text-sm text-gray-500 mt-1 italic">{notes}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex gap-2">
        {status === "waiting" && (
          <Button
            onClick={() => onStart(id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="default"
          >
            <Play className="w-5 h-5" />
            <span className="sm:inline">Start</span>
          </Button>
        )}
        {status === "in-progress" && (
          <Button
            onClick={() => onDone(id)}
            className="flex-1 bg-green-600 hover:bg-green-700"
            size="default"
          >
            <Check className="w-5 h-5" />
            <span className="sm:inline">Done</span>
          </Button>
        )}
        {!disableDelete && (
          <Button
            onClick={() => onDelete(id)}
            variant="outline"
            size="icon"
            className="shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </Button>
        )}
      </div>
    </div>
  );
}


