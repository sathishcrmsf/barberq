// @cursor: Custom hook for managing category data and operations
// Provides centralized category state management with CRUD operations

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    services: number;
  };
}

export interface CategoryFormData {
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
  isActive: boolean;
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load categories';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCategory = useCallback(async (data: CategoryFormData) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.status === 409) {
        toast.error('Category name already exists');
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create category');
      }

      const newCategory = await response.json();
      toast.success('Category created successfully');
      await fetchCategories(); // Refresh list
      return newCategory;
    } catch (err: any) {
      toast.error(err.message || 'Failed to create category');
      return null;
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update category');
      }

      const updatedCategory = await response.json();
      toast.success('Category updated successfully');
      await fetchCategories(); // Refresh list
      return updatedCategory;
    } catch (err: any) {
      toast.error(err.message || 'Failed to update category');
      return null;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"? Services will remain but become uncategorized.`)) {
      return false;
    }

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete category');
      }

      toast.success('Category deleted successfully');
      await fetchCategories(); // Refresh list
      return true;
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete category');
      return false;
    }
  }, [fetchCategories]);

  const toggleCategoryStatus = useCallback(async (id: string, currentStatus: boolean) => {
    return updateCategory(id, { isActive: !currentStatus });
  }, [updateCategory]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const activeCategories = categories.filter(c => c.isActive);
  const inactiveCategories = categories.filter(c => !c.isActive);

  return {
    categories,
    activeCategories,
    inactiveCategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  };
}

