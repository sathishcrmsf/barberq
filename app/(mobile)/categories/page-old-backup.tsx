// @cursor: Category management page - Create, view, edit, and delete categories
// Categories organize services for better browsing and discovery

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/category-badge';
import { 
  Scissors, 
  Palette, 
  Sparkles, 
  Paintbrush, 
  Droplet, 
  Flame,
  Star,
  Heart,
  Crown,
  Gem,
  Zap,
  Wind,
  Coffee,
  Flower2,
  Sun,
  Moon,
  Tag,
  FolderOpen
} from 'lucide-react';

// Map icon names to components
const ICON_MAP: Record<string, any> = {
  Scissors,
  Palette,
  Sparkles,
  Paintbrush,
  Droplet,
  Flame,
  Star,
  Heart,
  Crown,
  Gem,
  Zap,
  Wind,
  Coffee,
  Flower2,
  Sun,
  Moon,
};

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
  isActive: boolean;
  _count?: {
    services: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"? Services will remain but become uncategorized.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to delete');
      }

      toast.success('Category deleted');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete category');
    }
  }

  async function toggleActive(category: Category) {
    try {
      const res = await fetch(`/api/categories/${category.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !category.isActive })
      });

      if (!res.ok) throw new Error('Failed to update');

      toast.success(category.isActive ? 'Category deactivated' : 'Category activated');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to update category');
    }
  }

  const activeCategories = categories.filter(c => c.isActive);
  const inactiveCategories = categories.filter(c => !c.isActive);

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              ← Back
            </Button>
            <h1 className="text-xl font-bold">Categories</h1>
          </div>
          <Link href="/categories/add">
            <Button size="sm">+ Add</Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : categories.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <FolderOpen className="w-16 h-16 text-gray-400" />
            </div>
            <h3 className="font-semibold mb-2">No Categories Yet</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create categories to organize your services
            </p>
            <Link href="/categories/add">
              <Button>+ Create First Category</Button>
            </Link>
          </Card>
        ) : (
          <>
            {/* Active Categories */}
            {activeCategories.length > 0 && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  ACTIVE CATEGORIES ({activeCategories.length})
                </h2>
                <div className="space-y-3">
                  {activeCategories.map((category) => {
                    const IconComponent = category.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : Tag;
                    return (
                      <Card key={category.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-blue-600" />
                              </div>
                              <h3 className="font-semibold text-lg">{category.name}</h3>
                            </div>
                            {category.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {category.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{category._count?.services || 0} services</span>
                              <span>•</span>
                              <span>Order: {category.displayOrder}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link href={`/categories/${category.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(category)}
                          >
                            Deactivate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Inactive Categories */}
            {inactiveCategories.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  INACTIVE CATEGORIES ({inactiveCategories.length})
                </h2>
                <div className="space-y-3">
                  {inactiveCategories.map((category) => {
                    const IconComponent = category.icon && ICON_MAP[category.icon] ? ICON_MAP[category.icon] : Tag;
                    return (
                      <Card key={category.id} className="p-4 opacity-60">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                                <IconComponent className="w-5 h-5 text-gray-400" />
                              </div>
                              <h3 className="font-semibold text-lg">{category.name}</h3>
                              <CategoryBadge name="Inactive" variant="outline" />
                            </div>
                            <div className="text-sm text-gray-500">
                              {category._count?.services || 0} services
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Link href={`/categories/${category.id}/edit`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleActive(category)}
                          >
                            Activate
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(category.id, category.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Tip */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Organizing Tips
              </p>
              <p className="text-xs text-blue-700">
                Use categories to group similar services. Drag to reorder (coming soon).
                Deactivating a category hides it from filters but keeps services intact.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

