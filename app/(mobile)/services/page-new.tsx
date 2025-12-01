// @cursor: Refactored service management page
// Modern admin panel with multi-step creation, filters, and actions

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServices, Service } from '@/hooks/useServices';
import { AddServiceDrawer } from '@/components/admin/services/add-service-drawer';
import { ServiceTable } from '@/components/admin/services/service-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scissors, Plus, TrendingUp, DollarSign, Clock } from 'lucide-react';

export default function ServicesPageNew() {
  const router = useRouter();
  const {
    services,
    activeServices,
    inactiveServices,
    loading,
    actionLoading,
    deleteService,
    duplicateService,
    toggleServiceStatus,
  } = useServices();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const handleCreate = () => {
    setEditingService(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (service: Service) => {
    // For now, redirect to edit page. Could be replaced with drawer later
    router.push(`/services/${service.id}/edit`);
  };

  const handleDuplicate = async (service: Service) => {
    await duplicateService(service);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteService(id, name);
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    await toggleServiceStatus(id, currentStatus);
  };

  // Calculate stats
  const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);
  const avgDuration = services.length > 0
    ? services.reduce((sum, s) => sum + s.duration, 0) / services.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
            <div>
              <h1 className="text-xl font-bold">Services</h1>
              <p className="text-sm text-gray-600">
                Manage your service catalog
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {loading ? (
          <SkeletonTable />
        ) : services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No Services Yet"
            description="Create your first service to start managing your business offerings. Add details like pricing, duration, and assign staff members."
            actionLabel="Create First Service"
            onAction={handleCreate}
          />
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold">{services.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Price</p>
                    <p className="text-2xl font-bold">
                      ${services.length > 0 ? (totalRevenue / services.length).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Duration</p>
                    <p className="text-2xl font-bold">{Math.round(avgDuration)} min</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Service Table */}
            <ServiceTable
              services={services}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              loading={loading}
              actionLoading={actionLoading}
            />

            {/* Quick Actions */}
            <Card className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-900 mb-1">
                    Quick Tip
                  </p>
                  <p className="text-sm text-purple-800">
                    Use the duplicate feature to quickly create similar services. 
                    Assign staff to services to enable skill-based matching.
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Add Service Drawer */}
      <AddServiceDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSuccess={() => {
          // Drawer will auto-refresh via the hook
        }}
      />

      {/* Floating Action Button */}
      {services.length > 0 && (
        <button
          onClick={handleCreate}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-all hover:scale-110"
          aria-label="Add service"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

