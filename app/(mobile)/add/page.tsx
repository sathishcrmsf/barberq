// @cursor v1.4: Updated to use phone-based customer lookup.
// Phone number is entered first, system recognizes existing customers or creates new ones.
// Customer name can be edited when recognized.

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { validateAndNormalizePhone } from "@/lib/utils";

interface Customer {
  id: string;
  phone: string;
  name: string;
}

function AddPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [foundCustomer, setFoundCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState({
    phone: "",
    name: "",
    notes: "",
  });


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
          // Check if response has content
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            // Only log if there's actual error data
            if (errorData && Object.keys(errorData).length > 0) {
              console.error("Error looking up customer:", {
                status: response.status,
                statusText: response.statusText,
                error: errorData.error,
                details: errorData.details,
              });
              
              // If it's a database initialization error, show a helpful message
              if (errorData.error?.includes("Database not initialized") || 
                  errorData.error?.includes("Database connection failed")) {
                console.warn("⚠️ Database setup issue detected. Please restart your dev server and ensure migrations are applied.");
              }
            }
          } else {
            // Non-JSON response
            const text = await response.text();
            console.error("Error looking up customer - Non-JSON response:", {
              status: response.status,
              statusText: response.statusText,
              contentType,
              preview: text.substring(0, 100),
            });
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

    setLoading(true);

    try {
      // The API will handle customer lookup/creation and linking
      const response = await fetch("/api/walkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: normalizedPhone,
          name: formData.name.trim(),
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

