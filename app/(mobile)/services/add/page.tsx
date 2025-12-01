// @cursor v1.2: Add service form with validation.
// Fields: name (required), price (required), duration (required), description (optional).
// Handles 409 conflict for duplicate names.

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface ServiceFormData {
  name: string;
  price: string;
  duration: string;
  description: string;
  categoryId: string;
}

export default function AddServicePage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ServiceFormData>({
    name: "",
    price: "",
    duration: "",
    description: "",
    categoryId: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [errors, setErrors] = useState<Partial<ServiceFormData>>({});
  const [loading, setLoading] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        if (response.ok) {
          const data = await response.json();
          // Only show active categories
          setCategories(data.filter((cat: Category) => cat.isActive));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };
    fetchCategories();
  }, []);

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
        description: formData.description.trim() || undefined,
        categoryId: formData.categoryId || undefined
      };

      const response = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.status === 409) {
        toast.error("A service with this name already exists");
        return;
      }

      if (!response.ok) throw new Error("Failed to save service");

      toast.success("Service added");
      router.push("/services");
    } catch (error) {
      toast.error("Failed to save service");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-40">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 sm:py-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={() => router.back()} 
            className="text-2xl sm:text-3xl w-10 h-10 flex items-center justify-center" 
            aria-label="Go back"
          >
            ←
          </button>
          <h1 className="text-xl sm:text-2xl font-semibold flex-1 text-center">Add Service</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="pb-20">
        <main className="p-4 sm:p-5">
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

          {/* Category Field */}
          <div className="mb-4 sm:mb-5">
            <label htmlFor="category" className="block text-sm sm:text-base font-medium mb-2">
              Category (optional)
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-base bg-white"
            >
              <option value="">-- No Category --</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              {categories.length === 0 ? (
                <span>No categories available. <button type="button" onClick={() => router.push('/categories/add')} className="text-blue-600 underline">Create one</button></span>
              ) : (
                <span>Organize this service into a category</span>
              )}
            </p>
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
        <footer className="sticky bottom-0 p-4 sm:p-5 border-t bg-white shadow-lg">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={loading}
          >
            {loading ? "Saving..." : "Add Service"}
          </Button>
        </footer>
      </form>
    </div>
  );
}

