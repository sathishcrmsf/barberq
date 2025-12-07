// @cursor: Staff detail page - View and edit individual staff member
// Shows full profile, services, performance metrics, and edit options

'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StaffAvatar } from '@/components/ui/staff-avatar';

interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
}

interface StaffService {
  isPrimary: boolean;
  Service: Service;
}

interface Staff {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  imageUrl?: string;
  bio?: string;
  displayOrder: number;
  isActive: boolean;
  StaffService: StaffService[];
  _count: {
    StaffService: number;
    WalkIn: number;
  };
}

export default function StaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const staffId = params.id as string;
  
  const [staff, setStaff] = useState<Staff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (staffId) {
      fetchStaff();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId]);

  async function fetchStaff() {
    try {
      const res = await fetch(`/api/staff/${staffId}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff member');
      router.push('/staff');
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!staff) return;
    
    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !staff.isActive })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success(staff.isActive ? 'Staff deactivated' : 'Staff activated');
      fetchStaff();
    } catch {
      toast.error('Failed to update staff');
    }
  }

  async function handleDelete() {
    if (!staff) return;
    
    if (!confirm(`Delete staff member "${staff.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/${staffId}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Staff member deleted');
      router.push('/staff');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete staff member';
      toast.error(errorMessage);
    }
  }

  const primaryService = staff?.StaffService?.find(ss => ss.isPrimary);
  const otherServices = staff?.StaffService?.filter(ss => !ss.isPrimary) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Staff member not found</p>
          <Link href="/staff">
            <Button>Back to Staff List</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/staff">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Staff Profile</h1>
          </div>
          <div className="flex items-center gap-2">
            {!staff.isActive && (
              <span className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded-full">
                Inactive
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {/* Profile Header */}
        <Card className="p-6 mb-4">
          <div className="flex flex-col items-center text-center">
            <StaffAvatar 
              name={staff.name}
              imageUrl={staff.imageUrl}
              size="xl"
              className={!staff.isActive ? 'grayscale opacity-60' : ''}
            />
            <h2 className="text-2xl font-bold mt-4">{staff.name}</h2>
            {staff.title && (
              <p className="text-gray-600 mt-1">{staff.title}</p>
            )}
            
            {/* Quick Stats */}
            <div className="flex gap-6 mt-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {staff._count.StaffService}
                </div>
                <div className="text-xs text-gray-500">Services</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {staff._count.WalkIn}
                </div>
                <div className="text-xs text-gray-500">Clients Served</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Bio */}
        {staff.bio && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-2">About</h3>
            <p className="text-sm text-gray-700">{staff.bio}</p>
          </Card>
        )}

        {/* Contact Info */}
        {(staff.email || staff.phone) && (
          <Card className="p-4 mb-4">
            <h3 className="font-semibold mb-3">Contact Information</h3>
            {staff.email && (
              <div className="mb-2">
                <div className="text-xs text-gray-500">Email</div>
                <a 
                  href={`mailto:${staff.email}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {staff.email}
                </a>
              </div>
            )}
            {staff.phone && (
              <div>
                <div className="text-xs text-gray-500">Phone</div>
                <a 
                  href={`tel:${staff.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {staff.phone}
                </a>
              </div>
            )}
          </Card>
        )}

        {/* Services */}
        <Card className="p-4 mb-4">
          <h3 className="font-semibold mb-3">Services</h3>
          
          {staff.StaffService?.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">
              No services assigned yet
            </p>
          ) : (
            <div className="space-y-2">
              {/* Primary Service */}
              {primaryService && (
                <div className="border border-yellow-300 bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-600">⭐</span>
                        <span className="font-medium">
                          {primaryService.Service.name}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        ₹{primaryService.Service.price} • {primaryService.Service.duration} min
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full">
                      Primary
                    </span>
                  </div>
                </div>
              )}

              {/* Other Services */}
              {otherServices.map(({ Service }) => (
                <div key={Service.id} className="border rounded-lg p-3">
                  <div className="font-medium">{Service.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    ₹{Service.price} • {Service.duration} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3">Actions</h3>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleToggleActive}
            >
              {staff.isActive ? '⏸️ Deactivate Staff' : '▶️ Activate Staff'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleDelete}
            >
              🗑️ Delete Staff Member
            </Button>
          </div>
        </Card>

        {/* Info */}
        <Card className="mt-4 p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-2">
            <span className="text-blue-600">ℹ️</span>
            <div className="flex-1">
              <p className="text-xs text-blue-700">
                Staff editing features will be added in a future update. 
                For now, you can activate/deactivate or delete staff members.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

