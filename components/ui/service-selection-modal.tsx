// @cursor: This component must be mobile-first,
// Uber-style minimalistic, with thumb-friendly controls.
// Avoid complex layout. Prioritize clarity and speed.

"use client";

import { Scissors, X, Check } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (serviceNames: string[]) => void;
  services: Service[];
  loading?: boolean;
  customerName: string;
}

export function ServiceSelectionModal({
  isOpen,
  onClose,
  onConfirm,
  services,
  loading = false,
  customerName,
}: ServiceSelectionModalProps) {
  const [show, setShow] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setSelectedServices(new Set()); // Reset selection when opening
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleToggleService = (serviceId: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleConfirm = () => {
    if (selectedServices.size > 0) {
      const selectedServiceNames = Array.from(selectedServices)
        .map(id => {
          const service = activeServices.find(s => s.id === id);
          return service?.name || "";
        })
        .filter(name => name !== "");
      
      if (selectedServiceNames.length > 0) {
        onConfirm(selectedServiceNames);
        handleClose();
      }
    }
  };

  const activeServices = services.filter((s) => s.isActive);
  
  // Calculate totals for selected services
  const selectedServiceObjects = activeServices.filter(s => selectedServices.has(s.id));
  const totalPrice = selectedServiceObjects.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServiceObjects.reduce((sum, s) => sum + s.duration, 0);

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
            <div className="p-2 bg-green-100 rounded-lg">
              <Scissors className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Select Service
              </h2>
              <p className="text-sm text-gray-600 mt-0.5">
                Complete service for {customerName}
              </p>
            </div>
          </div>

          {/* Service Selection */}
          <div className="mb-6">
            <label
              className="block text-sm sm:text-base font-medium text-gray-700 mb-3"
            >
              Select Service Type * (Multiple allowed)
            </label>
            
            {loading ? (
              <div className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl flex items-center text-gray-500">
                Loading services...
              </div>
            ) : activeServices.length === 0 ? (
              <div className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl flex items-center justify-center text-gray-500 bg-gray-50">
                No active services available
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-xl p-2">
                {activeServices.map((service) => {
                  const isSelected = selectedServices.has(service.id);
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => handleToggleService(service.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-black bg-gray-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? "border-black bg-black"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            ₹{service.price.toFixed(2)} • {service.duration} min
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Service Details */}
          {selectedServices.size > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  {selectedServices.size} service{selectedServices.size !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Price</span>
                <span className="text-lg font-semibold text-gray-900">
                  ₹{totalPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Duration</span>
                <span className="text-lg font-semibold text-gray-900">
                  {totalDuration} min
                </span>
              </div>
            </div>
          )}

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
              disabled={selectedServices.size === 0 || loading}
            >
              Complete Service{selectedServices.size > 0 ? ` (${selectedServices.size})` : ""}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

