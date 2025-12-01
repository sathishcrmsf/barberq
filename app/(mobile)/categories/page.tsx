// @cursor: Refactored category management page
// Modern, clean UI with inline editing and better UX

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategories, Category } from '@/hooks/useCategories';
import { CategoryModal } from '@/components/admin/categories/category-modal';
import { EmptyState } from '@/components/shared/empty-state';
import { SkeletonCard } from '@/components/shared/skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CategoryBadge } from '@/components/ui/category-badge';
import { Toggle } from '@/components/ui/toggle';
import { 
  FolderOpen, Plus, Edit, Trash2,
  Sparkles, Tag, GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map icon names to components
const ICON_MAP: Record<string, any> = {
  Scissors: Tag,
  Palette: Tag,
  Sparkles,
  Paintbrush: Tag,
  Droplet: Tag,
  Flame: Tag,
  Star: Tag,
  Heart: Tag,
  Crown: Tag,
  Gem: Tag,
  Zap: Tag,
  Wind: Tag,
  Coffee: Tag,
  Flower2: Tag,
  Sun: Tag,
  Moon: Tag,
};

export default function CategoriesPageNew() {
  const router = useRouter();
  const {
    categories,
    activeCategories,
    inactiveCategories,
    loading,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  } = useCategories();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const handleCreate = () => {
    setEditingCategory(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (modalMode === 'create') {
      const result = await createCategory(formData);
      if (result) {
        setIsModalOpen(false);
      }
    } else if (editingCategory) {
      const result = await updateCategory(editingCategory.id, formData);
      if (result) {
        setIsModalOpen(false);
      }
    }
  };

  const handleDelete = async (category: Category) => {
    await deleteCategory(category.id, category.name);
  };

  const handleToggleStatus = async (category: Category) => {
    await toggleCategoryStatus(category.id, category.isActive);
  };

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
              <h1 className="text-xl font-bold">Categories</h1>
              <p className="text-sm text-gray-600">
                Organize your services into categories
              </p>
            </div>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pb-24">
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="No Categories Yet"
            description="Create categories to organize your services for better browsing and discovery"
            actionLabel="Create First Category"
            onAction={handleCreate}
          />
        ) : (
          <>
            {/* Active Categories */}
            {activeCategories.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                    Active Categories ({activeCategories.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {activeCategories.map((category) => {
                    const IconComponent = category.icon && ICON_MAP[category.icon] 
                      ? ICON_MAP[category.icon] 
                      : Tag;
                    
                    return (
                      <Card 
                        key={category.id} 
                        className="p-4 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start gap-4">
                          {/* Drag Handle (future feature) */}
                          <div className="opacity-0 group-hover:opacity-50 transition-opacity cursor-grab">
                            <GripVertical className="w-5 h-5 text-gray-400" />
                          </div>

                          {/* Icon */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-blue-600" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-lg mb-1">{category.name}</h3>
                            {category.description && (
                              <p className="text-sm text-gray-600 mb-2">
                                {category.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-gray-500">
                                {category._count?.services || 0} services
                              </span>
                              <span className="text-gray-300">•</span>
                              <span className="text-gray-500">
                                Order: {category.displayOrder}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3 min-w-[140px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="w-full justify-start hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2.5" />
                              Edit
                            </Button>

                            {/* Toggle Switch */}
                            <div className="flex items-center gap-3 px-2 py-1">
                              <Toggle
                                checked={category.isActive}
                                onChange={() => handleToggleStatus(category)}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 font-medium"
                            >
                              <Trash2 className="w-4 h-4 mr-2.5" />
                              Delete
                            </Button>
                          </div>
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide">
                    Inactive Categories ({inactiveCategories.length})
                  </h2>
                </div>
                <div className="space-y-3">
                  {inactiveCategories.map((category) => {
                    const IconComponent = category.icon && ICON_MAP[category.icon] 
                      ? ICON_MAP[category.icon] 
                      : Tag;
                    
                    return (
                      <Card 
                        key={category.id} 
                        className="p-4 opacity-60 hover:opacity-80 transition-opacity"
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <IconComponent className="w-6 h-6 text-gray-400" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-lg">{category.name}</h3>
                              <CategoryBadge name="Inactive" variant="outline" />
                            </div>
                            <p className="text-sm text-gray-500">
                              {category._count?.services || 0} services
                            </p>
                          </div>

                          <div className="flex flex-col gap-3 min-w-[140px]">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="w-full justify-start hover:bg-gray-100"
                            >
                              <Edit className="w-4 h-4 mr-2.5" />
                              Edit
                            </Button>

                            {/* Toggle Switch */}
                            <div className="flex items-center gap-3 px-2 py-1">
                              <Toggle
                                checked={category.isActive}
                                onChange={() => handleToggleStatus(category)}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {category.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pro Tip */}
            <Card className="mt-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Pro Tip
                  </p>
                  <p className="text-sm text-blue-800">
                    Organize similar services together. Good category structure helps clients 
                    find what they're looking for faster. Drag-and-drop reordering coming soon!
                  </p>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        category={editingCategory}
        mode={modalMode}
      />
    </div>
  );
}

