// @cursor: This screen should strictly follow the BRD:
// Queue page → shows walk-ins, controls for start/done/delete.
// Add page → simple form. Do not add extra features.

"use client";

import { useEffect, useState } from "react";
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
  customerId: string;
  Customer: Customer | null; // Prisma relation uses capital C
  customerName?: string | null; // Legacy field, kept for backward compatibility
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

export default function QueuePage() {
  const router = useRouter();
  const [walkIns, setWalkIns] = useState<WalkIn[]>([]);
  const [loading, setLoading] = useState(true);
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

  const fetchWalkIns = async () => {
    try {
      const response = await fetch("/api/walkins", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store", // Prevent caching issues
      });
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `Failed to fetch (HTTP ${response.status})`;
        try {
          // Check if response is JSON
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } else {
            // Response is not JSON (likely HTML error page)
            const text = await response.text();
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
            console.error("Non-JSON error response:", text.substring(0, 200));
          }
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          console.error("Error parsing response:", parseError);
        }
        throw new Error(errorMessage);
      }
      
      // Ensure response is JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Expected JSON but got:", contentType, text.substring(0, 200));
        throw new Error("Server returned non-JSON response");
      }
      
      const data = await response.json();
      setWalkIns(data);
    } catch (error) {
      // Handle network errors (fetch fails before getting response)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error("Network error - server may not be running:", error);
        toast.error("Cannot connect to server. Please check if the server is running.");
      } else {
        const errorMessage = error instanceof Error ? error.message : "Failed to load queue";
        toast.error(errorMessage);
        console.error("Error fetching walk-ins:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalkIns();
  }, []);

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
    // Toggle selection - if clicking the same customer, deselect
    setSelectedCustomerId(prevId => prevId === id ? null : id);
  };

  const handleStart = (id: string) => {
    // Show stylist selection modal
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

      if (!response.ok) throw new Error("Failed to update");
      toast.success("Service started");
      setSelectedCustomerId(null); // Deselect after action
      setPendingStartWalkInId(null);
      fetchWalkIns();
    } catch (error) {
      toast.error("Failed to start service");
      console.error(error);
    }
  };

  const handleDone = (id: string) => {
    // Show service selection modal
    setPendingDoneWalkInId(id);
    setShowServiceModal(true);
  };

  const handleServiceConfirm = async (serviceNames: string[]) => {
    if (!pendingDoneWalkInId) return;

    try {
      // Join multiple services with " + " separator
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
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.error || "Failed to update");
      }
      
      const data = await response.json();
      
      // Show completion popup with details
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
      
      setSelectedCustomerId(null); // Deselect after action
      setPendingDoneWalkInId(null);
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

  // Calculate total visible customers (only show count for customers that are actually displayed)
  const visibleCustomerCount = waitingCustomers.length + inProgressCustomers.length + completedCustomers.length;

  // Show loading state immediately - don't wait for data
  if (loading && walkIns.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
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
              <p className="text-sm sm:text-base text-gray-600 mt-1">Loading...</p>
            </div>
          </div>
        </header>
        <main className="px-0">
          <div className="flex items-center justify-center min-h-[50vh] px-4">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-gray-300 border-t-black rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-base sm:text-lg text-gray-500">Loading queue...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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


