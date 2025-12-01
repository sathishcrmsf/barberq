// @cursor: Custom hook for managing staff data and operations
// Provides centralized staff state management for service assignments

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Staff {
  id: string;
  name: string;
  title?: string | null;
  email?: string | null;
  phone?: string | null;
  imageUrl?: string | null;
  bio?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  staffServices?: {
    id: string;
    service: {
      id: string;
      name: string;
    };
    isPrimary: boolean;
  }[];
  _count?: {
    staffServices: number;
    walkIns: number;
  };
}

export function useStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/staff');
      if (!response.ok) throw new Error('Failed to fetch staff');
      const data = await response.json();
      setStaff(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load staff';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const activeStaff = staff.filter(s => s.isActive);
  const inactiveStaff = staff.filter(s => !s.isActive);

  return {
    staff,
    activeStaff,
    inactiveStaff,
    loading,
    error,
    fetchStaff,
  };
}

