// @cursor v1.4: Updated to use phone-based customer lookup.
// Phone number is entered first, system recognizes existing customers or creates new ones.
// Customer name can be edited when recognized.

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { validateAndNormalizePhone } from "@/lib/utils";

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  isActive: boolean;
}

interface Customer {
  id: string;
  phone: string;
  name: string;
}

function AddPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
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

  // Lookup customer by phone number
  const handlePhoneLookup = async (phone: string) => {
    const normalizedPhone = validateAndNormalizePhone(phone);
    if (!normalizedPhone) {
      setFoundCustomer(null);
      return;
    }

    setLookupLoading(true);
    try {
      const response = await fetch(`/api/customers?phone=${encodeURIComponent(normalizedPhone)}`);
      
      if (response.ok) {
        const customer = await response.json();
        setFoundCustomer(customer);
        setFormData((prev) => ({ ...prev, name: customer.name }));
      } else if (response.status === 404) {
        // Customer not found - new customer (this is expected)
        setFoundCustomer(null);
        setFormData((prev) => ({ ...prev, name: "" }));
      } else if (response.status === 400) {
        // Invalid phone format - don't show error, just clear customer
        const errorData = await response.json().catch(() => ({ error: "Invalid phone format" }));
        console.warn("Phone validation error:", errorData.error);
        setFoundCustomer(null);
        setFormData((prev) => ({ ...prev, name: "" }));
      } else {
        // Server error or other unexpected error - log but don't throw
        try {
          const errorData = await response.json();
          console.error("Error looking up customer - Full response:", {
            status: response.status,
            statusText: response.statusText,
            error: errorData.error,
            details: errorData.details,
            fullError: errorData
          });
          
          // If it's a database initialization error, show a helpful message
          if (errorData.error?.includes("Database not initialized") || 
              errorData.error?.includes("Database connection failed")) {
            console.warn("⚠️ Database setup issue detected. Please restart your dev server and ensure migrations are applied.");
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
          console.error("Response status:", response.status, response.statusText);
        }
        setFoundCustomer(null);
        // Don't show toast for lookup errors - it's not critical
      }
    } catch (error) {
      // Network error or other exception
      console.error("Error looking up customer:", error);
      setFoundCustomer(null);
      // Don't show toast for network errors during lookup - it's not critical
    } finally {
      setLookupLoading(false);
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-add +91 prefix if user starts typing digits
    if (value && !value.startsWith("+")) {
      // Remove any non-digits
      const digits = value.replace(/\D/g, "");
      if (digits.length > 0) {
        value = `+91${digits}`;
      }
    }
    
    setFormData((prev) => ({ ...prev, phone: value }));
  };

  // Handle phone blur - lookup customer
  const handlePhoneBlur = () => {
    if (formData.phone.trim()) {
      handlePhoneLookup(formData.phone);
    }
  };

  // Pre-fill form from query parameters (for quick add from customer list)
  useEffect(() => {
    const phoneParam = searchParams.get("phone");
    const nameParam = searchParams.get("name");
    
    if (phoneParam) {
      setFormData((prev) => ({
        ...prev,
        phone: phoneParam,
        name: nameParam || "",
      }));
      // Auto-lookup customer if phone is provided
      handlePhoneLookup(phoneParam);
    }
  }, [searchParams]); // handlePhoneLookup is stable, no need to include

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone number
    const normalizedPhone = validateAndNormalizePhone(formData.phone);
    if (!normalizedPhone) {
      toast.error("Please enter a valid phone number (+91 followed by 10 digits)");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Customer name is required");
      return;
    }

    if (!formData.service) {
      toast.error("Please select a service");
      return;
    }

    setLoading(true);

    try {
      // The API will handle customer lookup/creation and linking
      const response = await fetch("/api/walkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          name: formData.name.trim(),
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
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5 shadow-sm">
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
      <main className="p-4 sm:p-5 pb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Walk-In Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              {/* Phone Number */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Phone Number *
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    onBlur={handlePhoneBlur}
                    className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                    placeholder="+91XXXXXXXXXX"
                    required
                    maxLength={13}
                  />
                  {lookupLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    </div>
                  )}
                </div>
                {foundCustomer && (
                  <p className="mt-1 text-sm text-green-600">
                    ✓ Customer found: {foundCustomer.name}
                  </p>
                )}
              </div>

              {/* Customer Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm sm:text-base font-medium text-gray-700 mb-2"
                >
                  Customer Name *
                </label>
                <input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full h-12 sm:h-14 px-4 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="Enter customer name"
                  required
                />
                {foundCustomer && (
                  <p className="mt-1 text-xs text-gray-500">
                    You can edit the name if needed
                  </p>
                )}
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

export default function AddPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AddPageContent />
    </Suspense>
  );
}

