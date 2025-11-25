// @cursor: This component must be mobile-first,
// Uber-style minimalistic, with thumb-friendly controls.
// Avoid complex layout. Prioritize clarity and speed.

"use client";

import { CheckCircle2, Clock, DollarSign, Scissors, User, X } from "lucide-react";
import { Button } from "./button";
import { useEffect, useState } from "react";

interface CompletionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  customerName: string;
  service: string;
  barberName?: string;
  timeTaken: number; // in minutes
  amount: number;
}

export function CompletionPopup({
  isOpen,
  onClose,
  customerName,
  service,
  barberName,
  timeTaken,
  amount,
}: CompletionPopupProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

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

      {/* Popup */}
      <div
        className={`relative bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md mx-auto transition-all duration-300 ${
          show ? "translate-y-0 opacity-100" : "translate-y-full sm:translate-y-8 opacity-0"
        }`}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="px-6 py-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75" />
              <div className="relative bg-green-500 rounded-full p-4">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-2">
            Service Complete! 🎉
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Great job! Here's the summary
          </p>

          {/* Details Card */}
          <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
            {/* Customer Name */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-white rounded-lg">
                <User className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Customer</p>
                <p className="text-lg font-semibold text-gray-900 break-words">
                  {customerName}
                </p>
              </div>
            </div>

            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-white rounded-lg">
                <Scissors className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Service</p>
                <p className="text-lg font-semibold text-gray-900 break-words">
                  {service}
                </p>
              </div>
            </div>

            {/* Barber Name (if available) */}
            {barberName && (
              <div className="flex items-start gap-3">
                <div className="mt-0.5 p-2 bg-white rounded-lg">
                  <Scissors className="w-5 h-5 text-gray-700 rotate-45" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600">Barber/Stylist</p>
                  <p className="text-lg font-semibold text-gray-900 break-words">
                    {barberName}
                  </p>
                </div>
              </div>
            )}

            {/* Time Taken */}
            <div className="flex items-start gap-3">
              <div className="mt-0.5 p-2 bg-white rounded-lg">
                <Clock className="w-5 h-5 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600">Time Taken</p>
                <p className="text-lg font-semibold text-gray-900">
                  {timeTaken} {timeTaken === 1 ? "minute" : "minutes"}
                </p>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 my-4" />

            {/* Amount to Pay */}
            <div className="flex items-start gap-3 bg-black rounded-xl p-4">
              <div className="mt-0.5 p-2 bg-white/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white/70">Total Amount</p>
                <p className="text-2xl font-bold text-white">
                  ${amount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            onClick={handleClose}
            className="w-full mt-6 h-12 bg-black text-white hover:bg-gray-900 rounded-xl text-base font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

