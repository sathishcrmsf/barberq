// @cursor: This screen should strictly follow the BRD:
// Shop Profile page → displays shop information and settings.
// Mobile-first, Uber-style minimalistic design.

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Store, MapPin, Phone, Mail, Edit } from "lucide-react";
import { toast } from "sonner";

export default function ShopPage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Placeholder shop data - in production, fetch from API
  const [shopData, setShopData] = useState({
    name: "BarberQ Shop",
    address: "123 Main Street, City, State 12345",
    phone: "+1 (555) 123-4567",
    email: "info@barberq.com",
    description: "Premium barber shop offering quality cuts and styling services.",
  });

  const handleSave = () => {
    // TODO: Implement API call to save shop data
    toast.success("Shop profile updated");
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Back"
            className="mr-3"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Shop Profile</h1>
          </div>
          {!isEditing && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsEditing(true)}
              aria-label="Edit"
            >
              <Edit className="w-5 h-5" />
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="px-4 py-6 space-y-4">
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-600" />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={shopData.name}
                  onChange={(e) => setShopData({ ...shopData, name: e.target.value })}
                  className="w-full text-xl font-bold text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-black outline-none"
                />
              ) : (
                <h2 className="text-xl font-bold text-gray-900">{shopData.name}</h2>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-start gap-3 mb-2">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Address</p>
                  {isEditing ? (
                    <textarea
                      value={shopData.address}
                      onChange={(e) => setShopData({ ...shopData, address: e.target.value })}
                      className="w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-black outline-none resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{shopData.address}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Phone className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Phone</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={shopData.phone}
                      onChange={(e) => setShopData({ ...shopData, phone: e.target.value })}
                      className="w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-black outline-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{shopData.phone}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <Mail className="w-5 h-5 text-gray-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={shopData.email}
                      onChange={(e) => setShopData({ ...shopData, email: e.target.value })}
                      className="w-full text-sm text-gray-900 bg-transparent border-b-2 border-gray-300 focus:border-black outline-none"
                    />
                  ) : (
                    <p className="text-sm text-gray-900">{shopData.email}</p>
                  )}
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Description</p>
              {isEditing ? (
                <textarea
                  value={shopData.description}
                  onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                  className="w-full text-sm text-gray-900 bg-transparent border-2 border-gray-300 rounded-lg p-3 focus:border-black outline-none resize-none"
                  rows={4}
                />
              ) : (
                <p className="text-sm text-gray-600">{shopData.description}</p>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsEditing(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-black text-white hover:bg-gray-900"
              >
                Save Changes
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}

