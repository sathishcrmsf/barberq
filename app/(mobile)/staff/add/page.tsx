// @cursor: Add staff page - Create new staff member
// Form with name, title, contact info, bio, and service assignments

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

export default function AddStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [primaryServiceId, setPrimaryServiceId] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    bio: '',
    displayOrder: 0,
    isActive: true
  });

  useEffect(() => {
    fetchServices();
  }, []);

  async function fetchServices() {
    try {
      const res = await fetch('/api/services/active');
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      // Create staff member
      const staffRes = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!staffRes.ok) {
        const errorData = await staffRes.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to create staff (${staffRes.status})`;
        const errorDetails = errorData.details || errorData.message || '';
        
        // Provide helpful guidance for common errors
        let userMessage = errorMessage;
        if (errorDetails) {
          userMessage += `: ${errorDetails}`;
        }
        
        // Check if it's a database connection error and provide specific guidance
        if (errorMessage.includes('Database connection') || errorMessage.includes('connection failed') || errorDetails.includes('database')) {
          // Log helpful troubleshooting info (these are informational, not errors)
          console.log('🔍 Database connection troubleshooting:');
          console.log('  1. Check if DATABASE_URL is set in environment variables');
          console.log('  2. Verify database server is running');
          console.log('  3. For Supabase: Use connection pooler URL (port 6543)');
          console.log('  4. See STAFF_DATABASE_ERROR_FIX.md for detailed steps');
          console.log('  5. Test connection at: /api/debug');
          userMessage = 'Database connection failed. Visit /api/debug for diagnostics or see DIAGNOSE_DATABASE_ISSUE.md';
        }
        
        throw new Error(userMessage);
      }

      const staff = await staffRes.json();

      // Assign services if any selected
      if (selectedServices.size > 0) {
        const servicesRes = await fetch(`/api/staff/${staff.id}/services`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceIds: Array.from(selectedServices),
            primaryServiceId
          })
        });

        if (!servicesRes.ok) {
          console.warn('Failed to assign services');
        }
      }

      toast.success('Staff member created successfully');
      router.push('/staff');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create staff member';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  function toggleService(serviceId: string) {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceId)) {
      newSelected.delete(serviceId);
      if (primaryServiceId === serviceId) {
        setPrimaryServiceId('');
      }
    } else {
      newSelected.add(serviceId);
    }
    setSelectedServices(newSelected);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/staff">
              <Button variant="ghost" size="sm" disabled={loading}>
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">New Staff Member</h1>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Basic Information</h3>
            
            <label className="block text-sm font-medium mb-2">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., John Smith"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              maxLength={100}
              required
            />

            <label className="block text-sm font-medium mb-2">
              Title / Role
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Barber, Master Stylist"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={100}
            />
          </Card>

          {/* Contact Info */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            
            <label className="block text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="john@example.com"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            />

            <label className="block text-sm font-medium mb-2">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="(555) 123-4567"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />
          </Card>

          {/* Bio */}
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2">
              Bio (Optional)
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Brief description of experience and specialties..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.bio.length}/300 characters
            </p>
          </Card>

          {/* Service Assignments */}
          <Card className="p-4">
            <h3 className="font-semibold mb-2">Service Assignments</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select services this staff member can perform
            </p>

            {services.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No services available. Create services first.
              </p>
            ) : (
              <div className="space-y-2">
                {services.map((service) => {
                  const isSelected = selectedServices.has(service.id);
                  const isPrimary = primaryServiceId === service.id;

                  return (
                    <div 
                      key={service.id} 
                      className={`border rounded-lg p-3 ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <label className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleService(service.id)}
                          className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium">{service.name}</div>
                          <div className="text-sm text-gray-600">
                            ₹{service.price} • {service.duration} min
                          </div>
                          {isSelected && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                setPrimaryServiceId(isPrimary ? '' : service.id);
                              }}
                              className={`mt-2 text-xs px-2 py-1 rounded ${
                                isPrimary
                                  ? 'bg-yellow-500 text-white'
                                  : 'bg-gray-200 text-gray-700'
                              }`}
                            >
                              {isPrimary ? '⭐ Primary Specialty' : 'Mark as Primary'}
                            </button>
                          )}
                        </div>
                      </label>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-3">
              {selectedServices.size} service(s) selected
              {primaryServiceId && ' • 1 marked as primary'}
            </p>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Active</div>
                <p className="text-xs text-gray-500">
                  Staff member is available for assignments
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </Card>
        </form>
      </div>
    </div>
  );
}

