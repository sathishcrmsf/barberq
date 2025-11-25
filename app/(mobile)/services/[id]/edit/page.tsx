// @cursor v1.2: Edit service form with pre-populated values.
// Same validation as add form. Handles 409 conflict for duplicate names.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ServiceFormData {
  name: string;
  price: string;
  duration: string;
  description: string;
}

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  isActive: boolean;
}

export default function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState<string>("");
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    price: "",
    duration: "",
    description: ""
  });
  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});
  const [loading, setLoading] = useState(false);
  const [loadingService, setLoadingService] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const resolvedParams = await params;
        setServiceId(resolvedParams.id);
        
        const response = await fetch("/api/services");
        if (!response.ok) throw new Error("Failed to fetch services");
        const services: Service[] = await response.json();
        const service = services.find((s) => s.id === resolvedParams.id);

        if (!service) {
          toast.error("Service not found");
          router.push("/services");
          return;
        }

        setFormData({
          name: service.name,
          price: service.price.toString(),
          duration: service.duration.toString(),
          description: service.description || ""
        });
      } catch (error) {
        toast.error("Failed to load service");
        console.error(error);
        router.push("/services");
      } finally {
        setLoadingService(false);
      }
    };

    fetchService();
  }, [params, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ServiceFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Service name is required";
    } else if (formData.name.length > 100) {
      newErrors.name = "Name too long (max 100 characters)";
    }

    const priceNum = parseFloat(formData.price);
    if (!formData.price || isNaN(priceNum)) {
      newErrors.price = "Price is required";
    } else if (priceNum < 0) {
      newErrors.price = "Price must be positive";
    } else if (priceNum > 9999.99) {
      newErrors.price = "Price too high (max $9999.99)";
    }

    const durationNum = parseInt(formData.duration);
    if (!formData.duration || isNaN(durationNum)) {
      newErrors.duration = "Duration is required";
    } else if (durationNum < 5) {
      newErrors.duration = "Minimum 5 minutes";
    } else if (durationNum > 480) {
      newErrors.duration = "Maximum 480 minutes";
    }

    if (formData.description.length > 500) {
      newErrors.description = "Description too long (max 500 characters)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        description: formData.description.trim() || null
      };

      const response = await fetch(`/api/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        toast.error("A service with this name already exists");
        return;
      }

      if (!response.ok) throw new Error("Failed to update service");

      toast.success("Service updated");
      router.push("/services");
    } catch (error) {
      toast.error("Failed to update service");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingService) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-base sm:text-lg text-gray-500">Loading service...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center" 
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold flex-1 text-center">Edit Service</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1">
        <main className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* Name Field */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="name" className="block text-sm sm:text-base font-medium mb-2">
              Service Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="e.g., Men's Haircut"
              maxLength={100}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Price Field */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="price" className="block text-sm sm:text-base font-medium mb-2">
              Price (USD) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-3 text-gray-500 text-base">$</span>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 pl-8 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                placeholder="25.00"
                min="0"
                max="9999.99"
              />
            </div>
            {errors.price && (
              <p className="text-red-500 text-sm mt-1">{errors.price}</p>
            )}
          </div>

          {/* Duration Field */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="duration" className="block text-sm sm:text-base font-medium mb-2">
              Duration (minutes) *
            </label>
            <input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              placeholder="30"
              min="5"
              max="480"
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration}</p>
            )}
          </div>

          {/* Description Field */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="description" className="block text-sm sm:text-base font-medium mb-2">
              Description (optional)
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
              placeholder="Describe this service..."
              maxLength={500}
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length}/500
            </p>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="p-4 sm:p-5 border-t bg-white">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Update Service"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

