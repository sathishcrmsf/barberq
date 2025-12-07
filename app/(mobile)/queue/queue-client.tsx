// @cursor: Client component for interactive queue UI
// Handles modals, state management, and user interactions
// Data is passed as props from server component

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QueueItem } from "@/components/ui/queue-item";
import { Button } from "@/components/ui/button";
import { CompletionPopup } from "@/components/ui/completion-popup";
import { StylistSelectionModal } from "@/components/ui/stylist-selection-modal";
import { ServiceSelectionModal } from "@/components/ui/service-selection-modal";
import { Plus, Settings, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Customer {
  id: string;
  phone: string;
  name: string;
}

interface StaffRelation {
  id: string;
  name: string;
  title?: string | null;
}

interface WalkIn {
  id: string;
  customerId: string | null;
  Customer: Customer | null;
  customerName?: string | null;
  service: string;
  barberName?: string | null;
  status: "waiting" | "in-progress" | "done";
  notes?: string | null;
  createdAt: string;
  startedAt?: string | null;
  completedAt?: string | null;
  Staff?: StaffRelation | null;
}

interface CompletionData {
  customerName: string;
  service: string;
  barberName?: string;
  timeTaken: number;
  amount: number;
}

interface Staff {
  id: string;
  name: string;
  title?: string | null;
  isActive: boolean;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

interface QueueClientProps {
  initialWalkIns: WalkIn[];
}

export function QueueClient({ initialWalkIns }: QueueClientProps) {
  const router = useRouter();
  const [walkIns, setWalkIns] = useState<WalkIn[]>(initialWalkIns);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [completionData, setCompletionData] = useState<CompletionData | null>(null);
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  // Stylist selection modal state
  const [showStylistModal, setShowStylistModal] = useState(false);
  const [pendingStartWalkInId, setPendingStartWalkInId] = useState<string | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  
  // Service selection modal state
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [pendingDoneWalkInId, setPendingDoneWalkInId] = useState<string | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);

  // Refresh walk-ins after mutations
  const refreshWalkIns = async () => {
    try {
      const response = await fetch("/api/walkins", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      });
      
      if (response.ok) {
        const data = await response.json();
        setWalkIns(data);
      }
    } catch (error) {
      console.error("Error refreshing walk-ins:", error);
    }
  };

  // Fetch staff when stylist modal might open
  useEffect(() => {
    if (showStylistModal && staff.length === 0 && !loadingStaff) {
      const fetchStaff = async () => {
        setLoadingStaff(true);
        try {
          const response = await fetch("/api/staff");
          if (response.ok) {
            const data = await response.json();
            setStaff(data);
          }
        } catch (error) {
          console.error("Failed to fetch staff:", error);
        } finally {
          setLoadingStaff(false);
        }
      };
      fetchStaff();
    }
  }, [showStylistModal, staff.length, loadingStaff]);

  // Fetch services when service modal might open
  useEffect(() => {
    if (showServiceModal && services.length === 0 && !loadingServices) {
      const fetchServices = async () => {
        setLoadingServices(true);
        try {
          const response = await fetch("/api/services/active");
          if (response.ok) {
            const data = await response.json();
            setServices(data);
          }
        } catch (error) {
          console.error("Failed to fetch services:", error);
        } finally {
          setLoadingServices(false);
        }
      };
      fetchServices();
    }
  }, [showServiceModal, services.length, loadingServices]);

  const handleSelect = (id: string) => {
    setSelectedCustomerId(prevId => prevId === id ? null : id);
  };

  const handleStart = (id: string) => {
    setPendingStartWalkInId(id);
    setShowStylistModal(true);
  };

  const handleStylistConfirm = async (staffId: string) => {
    if (!pendingStartWalkInId) return;

    try {
      const response = await fetch(`/api/walkins/${pendingStartWalkInId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "in-progress",
          staffId: staffId,
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to update";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          // If response isn't JSON, use status text
          errorMessage = `Failed to update (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }
      
      toast.success("Service started");
      setSelectedCustomerId(null);
      setPendingStartWalkInId(null);
      await refreshWalkIns();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to start service";
      toast.error(errorMessage);
      console.error("Error starting service:", error);
    }
  };

  const handleDone = (id: string) => {
    setPendingDoneWalkInId(id);
    setShowServiceModal(true);
  };

  const handleServiceConfirm = async (serviceNames: string[]) => {
    if (!pendingDoneWalkInId) return;

    try {
      const serviceString = serviceNames.join(" + ");
      
      const response = await fetch(`/api/walkins/${pendingDoneWalkInId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: "done",
          service: serviceString,
        }),
      });

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to update";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          errorMessage = `Failed to update (${response.status} ${response.statusText})`;
        }
        console.error("API Error:", errorMessage);
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (data.serviceDetails) {
        const customerName = data.Customer?.name || data.customerName || "Customer";
        setCompletionData({
          customerName: customerName,
          service: data.service,
          barberName: data.barberName,
          timeTaken: data.serviceDetails.timeTaken,
          amount: data.serviceDetails.price,
        });
        setShowCompletionPopup(true);
      } else {
        toast.success("Service completed");
      }
      
      setSelectedCustomerId(null);
      setPendingDoneWalkInId(null);
      await refreshWalkIns();
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

      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = "Failed to delete";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.details || errorMessage;
        } catch {
          errorMessage = `Failed to delete (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }
      
      toast.success("Customer removed");
      setSelectedCustomerId(null);
      await refreshWalkIns();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove customer";
      toast.error(errorMessage);
      console.error("Error deleting customer:", error);
    }
  };

  // Helper function to check if a date is today
  const isToday = (dateString: string | null | undefined) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Group walk-ins by status
  const waitingCustomers = walkIns.filter((w) => w.status === "waiting");
  const inProgressCustomers = walkIns.filter((w) => w.status === "in-progress");
  const completedCustomers = walkIns.filter((w) => w.status === "done" && isToday(w.completedAt));

  const visibleCustomerCount = waitingCustomers.length + inProgressCustomers.length + completedCustomers.length;

  // Get customer name for modals
  const getCustomerName = (walkInId: string) => {
    const walkIn = walkIns.find((w) => w.id === walkInId);
    return walkIn?.Customer?.name || walkIn?.customerName || "Customer";
  };

  return (
    <>
      {/* Completion Popup */}
      {completionData && (
        <CompletionPopup
          isOpen={showCompletionPopup}
          onClose={() => {
            setShowCompletionPopup(false);
            setCompletionData(null);
          }}
          customerName={completionData.customerName}
          service={completionData.service}
          barberName={completionData.barberName}
          timeTaken={completionData.timeTaken}
          amount={completionData.amount}
        />
      )}

      {/* Stylist Selection Modal */}
      {pendingStartWalkInId && (
        <StylistSelectionModal
          isOpen={showStylistModal}
          onClose={() => {
            setShowStylistModal(false);
            setPendingStartWalkInId(null);
          }}
          onConfirm={handleStylistConfirm}
          staff={staff}
          loading={loadingStaff}
          customerName={getCustomerName(pendingStartWalkInId)}
        />
      )}

      {/* Service Selection Modal */}
      {pendingDoneWalkInId && (
        <ServiceSelectionModal
          isOpen={showServiceModal}
          onClose={() => {
            setShowServiceModal(false);
            setPendingDoneWalkInId(null);
          }}
          onConfirm={handleServiceConfirm}
          services={services}
          loading={loadingServices}
          customerName={getCustomerName(pendingDoneWalkInId)}
        />
      )}

      <div className="min-h-screen bg-gray-50 pb-32">
        {/* Sticky Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5 shadow-sm">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/dashboard')}
              aria-label="Back to dashboard"
              className="mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Queue</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                {visibleCustomerCount} customer{visibleCustomerCount !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMenu(!showMenu)}
                aria-label="Menu"
              >
                <Settings className="w-5 h-5" />
              </Button>
              
              {/* Quick Menu Dropdown */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={() => {
                      router.push('/services');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b text-sm font-medium"
                  >
                    ✂️ Services
                  </button>
                  <button
                    onClick={() => {
                      router.push('/categories');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b text-sm font-medium"
                  >
                    📂 Categories
                  </button>
                  <button
                    onClick={() => {
                      router.push('/staff');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b text-sm font-medium"
                  >
                    👥 Staff
                  </button>
                  <button
                    onClick={() => {
                      router.push('/analytics');
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 text-sm font-medium rounded-b-lg"
                  >
                    📊 Analytics
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Queue List */}
        <main className="px-0">
          {walkIns.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
              <p className="text-base sm:text-lg text-gray-600 mb-2">No customers in queue</p>
              <p className="text-sm sm:text-base text-gray-500">
                Tap the button below to add a walk-in
              </p>
            </div>
          ) : (
            <div className="pb-4">
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
                      customerName={walkIn.Customer?.name || walkIn.customerName || "Customer"}
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
                      customerName={walkIn.Customer?.name || walkIn.customerName || "Customer"}
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
                      customerName={walkIn.Customer?.name || walkIn.customerName || "Customer"}
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
        <div className="fixed bottom-4 left-4 right-4 z-40">
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
    </>
  );
}

