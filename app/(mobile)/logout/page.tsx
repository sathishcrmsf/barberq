// @cursor: This screen should strictly follow the BRD:
// Logout page → handles user logout and redirects.
// Mobile-first, Uber-style minimalistic design.

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LogoutPage() {
  const router = useRouter();

  const handleLogout = () => {
    // TODO: Implement actual logout logic (clear session, tokens, etc.)
    // For now, just show a message and redirect
    toast.success("Logged out successfully");
    
    // Clear any local storage/session if needed
    // localStorage.clear();
    // sessionStorage.clear();
    
    // Redirect to home or login page
    router.push("/");
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-gray-700" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Log Out</h1>
          <p className="text-sm text-gray-600">
            Are you sure you want to log out? You'll need to sign in again to access your account.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleLogout}
            className="w-full h-12 bg-black text-white hover:bg-gray-900"
          >
            Log Out
          </Button>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="w-full h-12"
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

