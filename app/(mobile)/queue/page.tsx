// @cursor: This screen should strictly follow the BRD:
// Queue page → shows walk-ins, controls for start/done/delete.
// Add page → simple form. Do not add extra features.

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QueueItem } from "@/components/ui/queue-item";
import { Button } from "@/components/ui/button";
import { Plus, Settings } from "lucide-react";
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
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

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

  const handleSelect = (id: string) => {
    // Toggle selection - if clicking the same customer, deselect
    setSelectedCustomerId(prevId => prevId === id ? null : id);
  };

  const handleStart = async (id: string) => {
    try {
      const response = await fetch(`/api/walkins/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });

      if (!response.ok) throw new Error("Failed to update");
      toast.success("Service started");
      setSelectedCustomerId(null); // Deselect after action
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
      setSelectedCustomerId(null); // Deselect after action
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
      setSelectedCustomerId(null); // Deselect after deletion
      fetchWalkIns();
    } catch (error) {
      toast.error("Failed to remove customer");
      console.error(error);
    }
  };

  // Group walk-ins by status
  const waitingCustomers = walkIns.filter((w) => w.status === "waiting");
  const inProgressCustomers = walkIns.filter((w) => w.status === "in-progress");
  const completedCustomers = walkIns.filter((w) => w.status === "done");

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Queue</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              {walkIns.length} {walkIns.length === 1 ? "customer" : "customers"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/services")}
            aria-label="Manage services"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </header>

      {/* Queue List */}
      <main className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base sm:text-lg text-gray-500">Loading...</p>
          </div>
        ) : walkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <p className="text-base sm:text-lg text-gray-600 mb-2">No customers in queue</p>
            <p className="text-sm sm:text-base text-gray-500">
              Tap the button below to add a walk-in
            </p>
          </div>
        ) : (
          <div className="pb-24">
            {/* Waiting Section */}
            {waitingCustomers.length > 0 && (
              <div className="mb-2">
                <div className="bg-gray-50 px-3 py-2">
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-gray-700">
                    WAITING ({waitingCustomers.length})
                  </h2>
                </div>
                {waitingCustomers.map((walkIn) => (
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
                    isSelected={selectedCustomerId === walkIn.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {/* In Progress Section */}
            {inProgressCustomers.length > 0 && (
              <div className="mb-2">
                <div className="bg-blue-50 px-3 py-2">
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#007AFF]">
                    IN PROGRESS ({inProgressCustomers.length})
                  </h2>
                </div>
                {inProgressCustomers.map((walkIn) => (
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
                    isSelected={selectedCustomerId === walkIn.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}

            {/* Completed Section */}
            {completedCustomers.length > 0 && (
              <div className="mb-2">
                <div className="bg-green-50 px-3 py-2">
                  <h2 className="text-xs font-semibold tracking-wider uppercase text-[#34C759]">
                    COMPLETED ({completedCustomers.length})
                  </h2>
                </div>
                {completedCustomers.map((walkIn) => (
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
                    disableDelete={true}
                    isSelected={selectedCustomerId === walkIn.id}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Add Customer CTA */}
      <div className="fixed bottom-4 left-4 right-4 z-50">
        <Button
          onClick={() => router.push("/add")}
          className="w-full h-12 bg-black text-white hover:bg-gray-900 rounded-xl shadow-lg"
          aria-label="Add customer to queue"
        >
          <Plus className="w-5 h-5" />
          Add Customer
        </Button>
      </div>
    </div>
  );
}


