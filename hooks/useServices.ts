// @cursor: Custom hook for managing service data and operations
// Provides centralized service state management with CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Service {
  id: string;
  name: string;
  price: number;
  duration: number;
  description?: string | null;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  imageAlt?: string | null;
  categoryId?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
  } | null;
  staffServices?: {
    id: string;
    staff: {
      id: string;
      name: string;
    };
  }[];
  _count?: {
    staffServices: number;
  };
  usageCount?: number; // Number of times service appears in WalkIn records
  isTopUsed?: boolean; // True if in top 5 most used services
}

export interface ServiceFormData {
  name: string;
  price: number;
  duration: number;
  description?: string;
  categoryId?: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  imageAlt?: string;
  staffIds?: string[]; // For staff assignments
  isActive?: boolean;
}

export function useServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/services');
      if (!response.ok) throw new Error('Failed to fetch services');
      const data = await response.json();
      setServices(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load services';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createService = useCallback(async (data: ServiceFormData) => {
    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        toast.error('A service with this name already exists');
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      const newService = await response.json();
      toast.success('Service created successfully');
      await fetchServices(); // Refresh list
      return newService;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create service');
      return null;
    }
  }, [fetchServices]);

  const updateService = useCallback(async (id: string, data: Partial<ServiceFormData>) => {
    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        toast.error('A service with this name already exists');
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      const updatedService = await response.json();
      toast.success('Service updated successfully');
      await fetchServices(); // Refresh list
      return updatedService;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update service');
      return null;
    }
  }, [fetchServices]);

  const deleteService = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return false;
    }

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 403) {
        const error = await response.json();
        toast.error(error.error || 'Cannot delete: service in use');
        return false;
      }

      if (!response.ok) {
        throw new Error('Failed to delete service');
      }

      toast.success('Service deleted successfully');
      await fetchServices(); // Refresh list
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete service');
      return false;
    }
  }, [fetchServices]);

  const toggleServiceStatus = useCallback(async (id: string, currentStatus: boolean) => {
    return updateService(id, { isActive: !currentStatus });
  }, [updateService]);

  const duplicateService = useCallback(async (service: Service) => {
    const newServiceData: ServiceFormData = {
      name: `${service.name} (Copy)`,
      price: service.price,
      duration: service.duration,
      description: service.description || undefined,
      categoryId: service.categoryId || undefined,
      imageUrl: service.imageUrl || undefined,
      thumbnailUrl: service.thumbnailUrl || undefined,
      imageAlt: service.imageAlt || undefined,
    };

    return createService(newServiceData);
  }, [createService]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const activeServices = services.filter(s => s.isActive);
  const inactiveServices = services.filter(s => !s.isActive);

  return {
    services,
    activeServices,
    inactiveServices,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
    duplicateService,
    toggleServiceStatus,
  };
}

