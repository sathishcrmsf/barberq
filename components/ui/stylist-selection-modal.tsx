// @cursor: This component must be mobile-first,
// Uber-style minimalistic, with thumb-friendly controls.
// Avoid complex layout. Prioritize clarity and speed.

"use client";

import { User, X } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Staff {
  id: string;
  name: string;
  title?: string | null;
  isActive: boolean;
}

interface StylistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (staffId: string) => void;
  staff: Staff[];
  loading?: boolean;
  customerName: string;
}

export function StylistSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  staff,
  loading = false,
  customerName,
}: StylistSelectionModalProps) {
  const [show, setShow] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setSelectedStaffId(""); // Reset selection when opening
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleConfirm = () => {
    if (selectedStaffId) {
      onConfirm(selectedStaffId);
      handleClose();
    }
  };

  const activeStaff = staff.filter((s) => s.isActive);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          show ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto transition-all duration-300 max-h-[90vh] flex flex-col ${
          show ? "translate-y-0 opacity-100" : "translate-y-full sm:translate-y-8 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="px-6 py-8 flex-1 overflow-y-auto">
          {/* Title */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Assign Stylist
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Select stylist for {customerName}
              </p>
            </div>
          </div>

          {/* Stylist Selection */}
          <div className="mb-6">
            <label
              htmlFor="stylist"
              className="block text-sm sm:text-base font-medium text-gray-700 mb-3"
            >
              Select Stylist *
            </label>
            
            {loading ? (
              <div className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl flex items-center text-gray-500">
                Loading stylists...
              </div>
            ) : activeStaff.length === 0 ? (
              <div className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50">
                No active stylists available
              </div>
            ) : (
              <Select
                value={selectedStaffId}
                onValueChange={setSelectedStaffId}
              >
                <SelectTrigger className="w-full h-12 sm:h-14 text-base" id="stylist">
                  <SelectValue placeholder="Choose a stylist" />
                </SelectTrigger>
                <SelectContent 
                  className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto z-[100]"
                  position="popper"
                  style={{ zIndex: 100 }}
                >
                  {activeStaff.map((staffMember) => (
                    <SelectItem key={staffMember.id} value={staffMember.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{staffMember.name}</span>
                        {staffMember.title && (
                          <span className="text-xs text-gray-500">{staffMember.title}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 h-12 bg-black text-white hover:bg-gray-900 rounded-xl"
              disabled={!selectedStaffId || loading}
            >
              Start Service
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

