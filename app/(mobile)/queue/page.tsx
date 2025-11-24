// @cursor: This screen should strictly follow the BRD:
// Queue page → shows walk-ins, controls for start/done/delete.
// Add page → simple form. Do not add extra features.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueueItem } from "@/components/ui/queue-item";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";

interface WalkIn {
  id: string;
  customerName: string;
  service: string;
  status: "waiting" | "in-progress" | "done";
  notes?: string | null;
  createdAt: string;
}

export default function QueuePage() {
  const router = useRouter();
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWalkIns = async () => {
    try {
      const response = await fetch("/api/walkins");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setWalkIns(data);
    } catch (error) {
      toast.error("Failed to load queue");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkIns();
  }, []);

  const handleStart = async (id: string) => {
    try {
      const response = await fetch(`/api/walkins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });

      if (!response.ok) throw new Error("Failed to update");
      toast.success("Service started");
      fetchWalkIns();
    } catch (error) {
      toast.error("Failed to start service");
      console.error(error);
    }
  };

  const handleDone = async (id: string) => {
    try {
      const response = await fetch(`/api/walkins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });

      if (!response.ok) throw new Error("Failed to update");
      toast.success("Service completed");
      fetchWalkIns();
    } catch (error) {
      toast.error("Failed to complete service");
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this customer?")) return;

    try {
      const response = await fetch(`/api/walkins/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Customer removed");
      fetchWalkIns();
    } catch (error) {
      toast.error("Failed to remove customer");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Queue</h1>
        <p className="text-sm text-gray-600 mt-1">
          {walkIns.length} {walkIns.length === 1 ? "customer" : "customers"}
        </p>
      </header>

      {/* Queue List */}
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : walkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <p className="text-lg text-gray-600 mb-2">No customers in queue</p>
            <p className="text-sm text-gray-500">
              Tap the button below to add a walk-in
            </p>
          </div>
        ) : (
          <div className="pb-24">
            {walkIns.map((walkIn) => (
              <QueueItem
                key={walkIn.id}
                id={walkIn.id}
                customerName={walkIn.customerName}
                service={walkIn.service}
                status={walkIn.status}
                notes={walkIn.notes}
                onStart={handleStart}
                onDone={handleDone}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>

      {/* Bottom Add Button (Thumb Zone) */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={() => router.push("/add")}
          className="w-full h-14 text-base font-semibold"
          size="lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Customer
        </Button>
      </div>
    </div>
  );
}


