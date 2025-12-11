// @cursor: Refactored service management page
// Modern admin panel with multi-step creation, filters, and actions

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useServices, Service } from '@/hooks/useServices';
import { AddServiceDrawer } from '@/components/admin/services/add-service-drawer';
import { EditServiceDrawer } from '@/components/admin/services/edit-service-drawer';
import { ServiceTable } from '@/components/admin/services/service-table';
import { EmptyState } from '@/components/shared/empty-state';
import { SkeletonTable } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Scissors, Plus, TrendingUp, Tag } from 'lucide-react';

export default function ServicesPageNew() {
  const router = useRouter();
  const {
    services,
    loading,
    actionLoading,
    deleteService,
    duplicateService,
    toggleServiceStatus,
  } = useServices();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [editInitialStep, setEditInitialStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const handleCreate = () => {
    setEditingService(null);
    setIsDrawerOpen(true);
  };

  const handleEdit = (service: Service, initialStep: 1 | 2 | 3 | 4 | 5 = 1) => {
    setEditingService(service);
    setEditInitialStep(initialStep);
    setIsEditDrawerOpen(true);
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
  // const totalRevenue = services.reduce((sum, s) => sum + s.price, 0);
  const servicesWithCategories = services.filter(s => s.category !== null);
  const uniqueCategoriesCount = new Set(servicesWithCategories.map(s => s.category?.id)).size;

  // Show loading state immediately
  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 pb-32">
        <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={() => router.back()}>
                  ← Back
                </Button>
                <div>
                  <h1 className="text-xl font-bold">Services</h1>
                  <p className="text-sm text-gray-600">Loading...</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        <div className="p-4">
          <SkeletonTable />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b shadow-sm">
        <div className="px-4 py-4 space-y-3">
          <div className="flex items-center justify-between">
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
          
          {/* Compact Stats Row */}
          {!loading && services.length > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-600 pt-2 border-t">
              <div className="flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{services.length}</span>
                <span>services</span>
              </div>
              {uniqueCategoriesCount > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <span className="font-medium text-gray-900">{uniqueCategoriesCount}</span>
                  <span>categories</span>
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <div className="p-4 pb-24">
        {services.length === 0 ? (
          <EmptyState
            icon={Scissors}
            title="No Services Yet"
            description="Create your first service to start managing your business offerings. Add details like pricing, duration, and assign staff members."
            actionLabel="Create First Service"
            onAction={handleCreate}
          />
        ) : (
          <>
            {/* Service Table */}
            <ServiceTable
              services={services}
              onEdit={(service) => handleEdit(service, 1)}
              onEditImage={(service) => handleEdit(service, 4)}
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

      {/* Edit Service Drawer */}
      <EditServiceDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
          setEditingService(null);
          setEditInitialStep(1);
        }}
        service={editingService}
        initialStep={editInitialStep}
        onSuccess={() => {
          // Drawer will auto-refresh via the hook
        }}
      />

    </div>
  );
}

