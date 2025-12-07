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
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

// Helper function to convert name to Title Case
function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
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
  isSelected = false,
  onSelect,
}: QueueItemProps) {
  const handleCardClick = () => {
    if (onSelect && status !== "done") {
      onSelect(id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  return (
    <div 
      className={`flex flex-col gap-2 py-2 px-4 border-b border-gray-200 w-full h-auto min-h-[44px] transition-colors ${
        status !== "done" && onSelect ? "cursor-pointer active:bg-gray-50" : ""
      } ${
        isSelected ? "bg-blue-50" : "bg-white"
      }`}
      onClick={handleCardClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-gray-900 truncate">
            {toTitleCase(customerName)}
          </h3>
          {service && service !== "TBD" && (
            <p className="text-sm text-gray-600">{service}</p>
          )}
          {(!service || service === "TBD") && status === "waiting" && (
            <p className="text-sm text-gray-400 italic">Service to be selected</p>
          )}
          {notes && (
            <p className="text-xs text-gray-500 mt-0.5 italic">{notes}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={status} />
          {!disableDelete && (
            <button
              onClick={handleDelete}
              className="shrink-0 p-1 hover:bg-gray-100 rounded transition-opacity min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Delete customer"
            >
              <Trash2 className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Action buttons - only show when selected */}
      {isSelected && (
        <div className="flex gap-2">
          {status === "waiting" && (
            <Button
              onClick={(e) => handleActionClick(e, () => onStart(id))}
              className="w-full h-10 rounded-lg text-base font-semibold bg-green-600 hover:bg-green-700 transition-opacity py-2"
              aria-label="Start service"
            >
              <Play className="w-4 h-4" />
              Start
            </Button>
          )}
          {status === "in-progress" && (
            <Button
              onClick={(e) => handleActionClick(e, () => onDone(id))}
              className="w-full h-10 rounded-lg text-base font-semibold bg-green-600 hover:bg-green-700 transition-opacity py-2"
              aria-label="Complete service"
            >
              <Check className="w-4 h-4" />
              Done
            </Button>
          )}
        </div>
      )}
    </div>
  );
}


