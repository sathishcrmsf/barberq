// @cursor v1.2: This page displays all services grouped by active/inactive status.
// Active services appear first. Each service card shows CRUD actions.
// Delete button disabled for in-use services.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ServiceCard } from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      const data = await response.json();
      setServices(data);
    } catch (error) {
      toast.error("Failed to load services");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleToggle = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) throw new Error("Failed to toggle status");

      toast.success(currentStatus ? "Service deactivated" : "Service activated");
      fetchServices();
    } catch (error) {
      toast.error("Failed to update service status");
      console.error(error);
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/services/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: "DELETE"
      });

      if (response.status === 403) {
        const data = await response.json();
        toast.error(data.error || "Cannot delete: service in use");
        return;
      }

      if (!response.ok) throw new Error("Failed to delete");

      toast.success("Service deleted");
      fetchServices();
    } catch (error) {
      toast.error("Failed to delete service");
      console.error(error);
    }
  };

  // Group services by active/inactive
  const groupedServices = services.reduce(
    (acc, service) => {
      if (service.isActive) {
        acc.active.push(service);
      } else {
        acc.inactive.push(service);
      }
      return acc;
    },
    { active: [] as Service[], inactive: [] as Service[] }
  );

  return (
    <div className="min-h-screen bg-gray-50 w-full pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5 w-full shadow-sm">
        <div className="flex items-center justify-between gap-4 w-full">
          <button 
            onClick={() => router.back()} 
            className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center" 
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold flex-1 text-center">Services</h1>
          <button
            onClick={() => router.push("/services/add")}
            className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center"
            aria-label="Add service"
          >
            +
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="w-full pb-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-base sm:text-lg text-gray-500">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 sm:px-6">
            <p className="text-lg sm:text-xl text-gray-700 mb-2">No services yet</p>
            <p className="text-sm sm:text-base text-gray-500 text-center mb-6">
              Add your first service to get started
            </p>
            <Button 
              onClick={() => router.push("/services/add")}
              size="lg"
              className="w-full sm:w-auto"
            >
              Add Service
            </Button>
          </div>
        ) : (
          <div className="w-full">
            {/* Active Services Section */}
            <section className="w-full">
              <h2 className="text-base sm:text-lg font-semibold px-4 py-3">
                Active ({groupedServices.active.length})
              </h2>
              {groupedServices.active.length === 0 ? (
                <p className="text-center text-sm sm:text-base text-gray-500 py-4">
                  No active services
                </p>
              ) : (
                <div className="w-full">
                  {groupedServices.active.map((service) => (
                    <ServiceCard
                      key={service.id}
                      {...service}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* Inactive Services Section */}
            {groupedServices.inactive.length > 0 && (
              <section className="w-full mt-4 sm:mt-6">
                <h2 className="text-base sm:text-lg font-semibold px-4 py-3 text-gray-600">
                  Inactive ({groupedServices.inactive.length})
                </h2>
                <div className="w-full">
                  {groupedServices.inactive.map((service) => (
                    <ServiceCard
                      key={service.id}
                      {...service}
                      onToggle={handleToggle}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      {services.length > 0 && (
        <button
          onClick={() => router.push("/services/add")}
          className="fixed bottom-6 right-4 sm:right-6 w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl sm:text-3xl hover:bg-blue-700 transition-colors"
          aria-label="Add service"
        >
          +
        </button>
      )}
    </div>
  );
}

