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
}: QueueItemProps) {
  return (
    <div className="flex flex-col gap-3 p-4 border-b border-gray-200 bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {customerName}
          </h3>
          <p className="text-sm text-gray-600 mt-1">{service}</p>
          {notes && (
            <p className="text-xs text-gray-500 mt-1 italic">{notes}</p>
          )}
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="flex gap-2">
        {status === "waiting" && (
          <Button
            onClick={() => onStart(id)}
            className="flex-1 h-11 text-sm font-medium"
            size="default"
          >
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
        )}
        {status === "in-progress" && (
          <Button
            onClick={() => onDone(id)}
            className="flex-1 h-11 text-sm font-medium bg-green-600 hover:bg-green-700"
            size="default"
          >
            <Check className="w-4 h-4 mr-2" />
            Done
          </Button>
        )}
        <Button
          onClick={() => onDelete(id)}
          variant="outline"
          className="h-11 px-4 text-sm font-medium"
          size="default"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}


