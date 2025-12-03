// @cursor: This screen should strictly follow the BRD:
// Hours & Pricing page → displays business hours and pricing information.
// Mobile-first, Uber-style minimalistic design.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, DollarSign, Edit } from "lucide-react";
import { toast } from "sonner";

interface DayHours {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

export default function HoursPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder hours data - in production, fetch from API
  const [hours, setHours] = useState<DayHours[]>([
    { day: "Monday", open: "09:00", close: "18:00", isClosed: false },
    { day: "Tuesday", open: "09:00", close: "18:00", isClosed: false },
    { day: "Wednesday", open: "09:00", close: "18:00", isClosed: false },
    { day: "Thursday", open: "09:00", close: "18:00", isClosed: false },
    { day: "Friday", open: "09:00", close: "19:00", isClosed: false },
    { day: "Saturday", open: "10:00", close: "17:00", isClosed: false },
    { day: "Sunday", open: "", close: "", isClosed: true },
  ]);

  const handleSave = () => {
    // TODO: Implement API call to save hours
    toast.success("Hours updated");
    setIsEditing(false);
  };

  const toggleDayClosed = (index: number) => {
    const updated = [...hours];
    updated[index].isClosed = !updated[index].isClosed;
    setHours(updated);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Back"
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Hours & Pricing</h1>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
            >
              <Edit className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-6">
        {/* Business Hours */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Business Hours</h2>
          </div>

          <div className="space-y-3">
            {hours.map((dayHours, index) => (
              <div
                key={dayHours.day}
                className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{dayHours.day}</p>
                </div>
                {isEditing ? (
                  <div className="flex items-center gap-3">
                    {!dayHours.isClosed ? (
                      <>
                        <input
                          type="time"
                          value={dayHours.open}
                          onChange={(e) => {
                            const updated = [...hours];
                            updated[index].open = e.target.value;
                            setHours(updated);
                          }}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 w-24"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="time"
                          value={dayHours.close}
                          onChange={(e) => {
                            const updated = [...hours];
                            updated[index].close = e.target.value;
                            setHours(updated);
                          }}
                          className="text-sm border border-gray-300 rounded-lg px-2 py-1 w-24"
                        />
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">Closed</span>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleDayClosed(index)}
                      className="text-xs"
                    >
                      {dayHours.isClosed ? "Open" : "Close"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">
                    {dayHours.isClosed
                      ? "Closed"
                      : `${dayHours.open} - ${dayHours.close}`}
                  </p>
                )}
              </div>
            ))}
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-black text-white hover:bg-gray-900"
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>

        {/* Pricing Info */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-bold text-gray-900">Pricing</h2>
          </div>
          <p className="text-sm text-gray-600">
            View and manage service pricing in the{" "}
            <button
              onClick={() => router.push("/services")}
              className="text-black font-medium underline"
            >
              Services
            </button>{" "}
            section.
          </p>
        </Card>
      </main>
    </div>
  );
}

