// @cursor: Frictionless signup page for free trial
// Minimal form: email/name only, no credit card

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mark user as having visited
      if (typeof window !== "undefined") {
        localStorage.setItem("barberq_has_visited", "true");
        localStorage.setItem("barberq_user_name", formData.name);
        localStorage.setItem("barberq_user_email", formData.email);
        localStorage.setItem("barberq_trial_started", new Date().toISOString());
      }

      // Show success message
      toast.success("Welcome to BarberQ! Let's get you started.");

      // Redirect to onboarding
      setTimeout(() => {
        router.push("/dashboard?onboarding=true");
      }, 500);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/landing"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to home</span>
        </Link>

        {/* Signup Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Start your free trial
          </h1>
          <p className="text-gray-600 mb-8">
            No credit card required. Get started in 2 minutes.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none transition-all"
                placeholder="john@example.com"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white hover:bg-gray-800"
              size="lg"
            >
              {loading ? "Setting up..." : "Start Free Trial"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-6">
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        {/* Trust Indicators */}
        <div className="mt-8 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>14-day free trial</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <span className="text-green-500">✓</span>
            <span>Cancel anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
}

