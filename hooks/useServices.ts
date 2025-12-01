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
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

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
    const loadingKey = 'create';
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

    // Create optimistic service (will be replaced with real data from server)
    const optimisticService: Service = {
      id: `temp-${Date.now()}`,
      name: data.name,
      price: data.price,
      duration: data.duration,
      description: data.description || null,
      imageUrl: data.imageUrl || null,
      thumbnailUrl: data.thumbnailUrl || null,
      imageAlt: data.imageAlt || null,
      categoryId: data.categoryId || null,
      isActive: data.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      category: null,
    };

    // Optimistically add to list
    setServices(prev => [...prev, optimisticService]);

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        // Rollback on conflict
        setServices(prev => prev.filter(s => s.id !== optimisticService.id));
        toast.error('A service with this name already exists');
        return null;
      }

      if (!response.ok) {
        // Rollback on error
        setServices(prev => prev.filter(s => s.id !== optimisticService.id));
        const error = await response.json();
        throw new Error(error.error || 'Failed to create service');
      }

      const newService = await response.json();
      // Replace optimistic service with real one
      setServices(prev => prev.map(s => 
        s.id === optimisticService.id ? newService : s
      ));
      toast.success('Service created successfully');
      return newService;
    } catch (err: any) {
      // Rollback on error
      setServices(prev => prev.filter(s => s.id !== optimisticService.id));
      toast.error(err.message || 'Failed to create service');
      return null;
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
  }, []);

  const updateService = useCallback(async (id: string, data: Partial<ServiceFormData>) => {
    const loadingKey = `update-${id}`;
    const previousServices = [...services];
    
    // Optimistic update
    setServices(prev => prev.map(service => 
      service.id === id 
        ? { ...service, ...data, updatedAt: new Date().toISOString() }
        : service
    ));

    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        // Rollback on conflict
        setServices(previousServices);
        toast.error('A service with this name already exists');
        return null;
      }

      if (!response.ok) {
        // Rollback on error
        setServices(previousServices);
        const error = await response.json();
        throw new Error(error.error || 'Failed to update service');
      }

      const updatedService = await response.json();
      // Update with server response
      setServices(prev => prev.map(service => 
        service.id === id ? updatedService : service
      ));
      toast.success('Service updated successfully');
      return updatedService;
    } catch (err: any) {
      // Rollback on error
      setServices(previousServices);
      toast.error(err.message || 'Failed to update service');
      return null;
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
  }, [services]);

  const deleteService = useCallback(async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return false;
    }

    const loadingKey = `delete-${id}`;
    const previousServices = [...services];
    const serviceToDelete = services.find(s => s.id === id);

    // Optimistic update - remove from list immediately
    setServices(prev => prev.filter(service => service.id !== id));
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.status === 403) {
        // Rollback on forbidden
        setServices(previousServices);
        const error = await response.json();
        toast.error(error.error || 'Cannot delete: service in use');
        return false;
      }

      if (!response.ok) {
        // Rollback on error
        setServices(previousServices);
        throw new Error('Failed to delete service');
      }

      toast.success('Service deleted successfully');
      return true;
    } catch (err: any) {
      // Rollback on error
      setServices(previousServices);
      toast.error(err.message || 'Failed to delete service');
      return false;
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
  }, [services]);

  const toggleServiceStatus = useCallback(async (id: string, currentStatus: boolean) => {
    const loadingKey = `toggle-${id}`;
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));
    
    try {
      const result = await updateService(id, { isActive: !currentStatus });
      return result;
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
  }, [updateService]);

  const duplicateService = useCallback(async (service: Service) => {
    const loadingKey = `duplicate-${service.id}`;
    setActionLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
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

      return await createService(newServiceData);
    } finally {
      setActionLoading(prev => {
        const next = { ...prev };
        delete next[loadingKey];
        return next;
      });
    }
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
    actionLoading,
    fetchServices,
    createService,
    updateService,
    deleteService,
    duplicateService,
    toggleServiceStatus,
  };
}

