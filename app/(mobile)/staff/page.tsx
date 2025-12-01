// @cursor: Staff management page - View all staff members
// Shows active and inactive staff with service counts and performance

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { StaffAvatar } from '@/components/ui/staff-avatar';

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
  staffServices: Array<{
    isPrimary: boolean;
    service: {
      id: string;
      name: string;
    };
  }>;
  _count: {
    staffServices: number;
    walkIns: number;
  };
}

export default function StaffPage() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  async function fetchStaff() {
    try {
      const res = await fetch('/api/staff');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setStaff(data);
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete staff member "${name}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/staff/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Staff member deleted');
      fetchStaff();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete staff member');
    }
  }

  async function toggleActive(member: Staff) {
    try {
      const res = await fetch(`/api/staff/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !member.isActive })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success(member.isActive ? 'Staff deactivated' : 'Staff activated');
      fetchStaff();
    } catch (error) {
      toast.error('Failed to update staff');
    }
  }

  const activeStaff = staff.filter(s => s.isActive);
  const inactiveStaff = staff.filter(s => !s.isActive);
  const primaryService = (member: Staff) => 
    member.staffServices.find(ss => ss.isPrimary)?.service.name;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">Staff</h1>
          </div>
          <Link href="/staff/add">
            <Button size="sm">+ Add</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : staff.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="font-semibold mb-2">No Staff Members Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Add staff to enable service assignments and tracking
            </p>
            <Link href="/staff/add">
              <Button>+ Add First Staff Member</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Active Staff */}
            {activeStaff.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  ACTIVE STAFF ({activeStaff.length})
                </h2>
                <div className="space-y-3">
                  {activeStaff.map((member) => (
                    <Card key={member.id} className="p-4">
                      <div className="flex gap-3 mb-3">
                        <StaffAvatar 
                          name={member.name} 
                          imageUrl={member.imageUrl}
                          size="lg"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-lg truncate">
                            {member.name}
                          </h3>
                          {member.title && (
                            <p className="text-sm text-gray-600">{member.title}</p>
                          )}
                          {primaryService(member) && (
                            <p className="text-sm text-blue-600">
                              ⭐ {primaryService(member)}
                            </p>
                          )}
                          <div className="flex gap-3 mt-1 text-xs text-gray-500">
                            <span>{member._count.staffServices} services</span>
                            <span>•</span>
                            <span>{member._count.walkIns} clients</span>
                          </div>
                        </div>
                      </div>

                      {member.bio && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {member.bio}
                        </p>
                      )}

                      <div className="flex gap-2">
                        <Link href={`/staff/${member.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(member)}
                        >
                          Deactivate
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id, member.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Inactive Staff */}
            {inactiveStaff.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  INACTIVE STAFF ({inactiveStaff.length})
                </h2>
                <div className="space-y-3">
                  {inactiveStaff.map((member) => (
                    <Card key={member.id} className="p-4 opacity-60">
                      <div className="flex gap-3 mb-3">
                        <StaffAvatar 
                          name={member.name} 
                          imageUrl={member.imageUrl}
                          size="lg"
                          className="grayscale"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{member.name}</h3>
                          {member.title && (
                            <p className="text-sm text-gray-600">{member.title}</p>
                          )}
                          <span className="inline-block text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full mt-1">
                            Inactive
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/staff/${member.id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            View Profile
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleActive(member)}
                        >
                          Activate
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tip */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-2">
            <span className="text-blue-600">💡</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Staff Management Tips
              </p>
              <p className="text-xs text-blue-700">
                Assign services to staff members to enable smart queue matching.
                Mark primary specialties to highlight expertise. Staff performance
                is tracked automatically.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

