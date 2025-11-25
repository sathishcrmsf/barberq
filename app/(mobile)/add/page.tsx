// @cursor v1.2: Service field now uses dynamic dropdown populated from API.
// Falls back to text input if no services configured.
// Stores service name as string (not foreign key reference).

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

export default function AddPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    barberName: "",
    service: "",
    notes: "",
  });

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services/active");
        if (!response.ok) throw new Error("Failed to fetch services");
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error("Failed to load services:", error);
        // Don't show error toast, just fall back to text input
      } finally {
        setLoadingServices(false);
      }
    };

    fetchServices();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerName.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!formData.service) {
      toast.error("Please select a service");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/walkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: formData.customerName.trim(),
          barberName: formData.barberName.trim() || undefined,
          service: formData.service,
          notes: formData.notes.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add customer");
      }

      toast.success("Customer added to queue");
      router.push("/queue");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to add customer"
      );
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Add Customer</h1>
        </div>
      </header>

      {/* Form */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-5">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Walk-In Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Customer Name *
                </label>
                <input
                  id="customerName"
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter customer name"
                  required
                />
              </div>

              {/* Barber/Stylist Name */}
              <div>
                <label
                  htmlFor="barberName"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Barber/Stylist Name (Optional)
                </label>
                <input
                  id="barberName"
                  type="text"
                  value={formData.barberName}
                  onChange={(e) =>
                    setFormData({ ...formData, barberName: e.target.value })
                  }
                  className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter barber or stylist name"
                />
              </div>

              {/* Service Type */}
              <div>
                <label
                  htmlFor="service"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Service Type *
                </label>
                
                {loadingServices ? (
                  <div className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl flex items-center text-gray-500">
                    Loading services...
                  </div>
                ) : services.length > 0 ? (
                  <>
                    {/* Service dropdown - Name only - Mobile optimized with shadcn Select */}
                    <Select
                      value={formData.service}
                      onValueChange={(value) => {
                        const service = services.find(s => s.name === value) || null;
                        setSelectedService(service);
                        setFormData({ ...formData, service: value });
                      }}
                    >
                      <SelectTrigger className="w-full h-12 sm:h-14 text-base" id="service">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto">
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.name}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Service details - shown after selection */}
                    {selectedService && (
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                            Price
                          </label>
                          <div className="h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center text-base font-semibold text-gray-900">
                            ${selectedService.price.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2">
                            Duration
                          </label>
                          <div className="h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 flex items-center text-base font-semibold text-gray-900">
                            {selectedService.duration} min
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  // Fallback to text input if no services
                  <input
                    id="service"
                    type="text"
                    value={formData.service}
                    onChange={(e) =>
                      setFormData({ ...formData, service: e.target.value })
                    }
                    className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="e.g., Haircut"
                    required
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base resize-none"
                  style={{ fontSize: '16px' }}
                  placeholder="Add any special instructions or notes"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? "Adding..." : "Add to Queue"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}


