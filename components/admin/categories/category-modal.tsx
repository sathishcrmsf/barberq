// @cursor: Category creation/edit modal
// Clean modal for managing categories with icon picker

"use client";

import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/modal';
import { Input, Textarea } from '@/components/shared/input';
import { Button } from '@/components/ui/button';
import { Category, CategoryFormData } from '@/hooks/useCategories';
import { 
  Scissors, Palette, Sparkles, Paintbrush, Droplet, Flame,
  Star, Heart, Crown, Gem, Zap, Wind, Coffee, Flower2, Sun, Moon, LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormData) => Promise<void>;
  category?: Category | null;
  mode: 'create' | 'edit';
}

const ICON_OPTIONS: { name: string; component: LucideIcon; value: string }[] = [
  { name: 'Scissors', component: Scissors, value: 'Scissors' },
  { name: 'Palette', component: Palette, value: 'Palette' },
  { name: 'Sparkles', component: Sparkles, value: 'Sparkles' },
  { name: 'Paintbrush', component: Paintbrush, value: 'Paintbrush' },
  { name: 'Droplet', component: Droplet, value: 'Droplet' },
  { name: 'Flame', component: Flame, value: 'Flame' },
  { name: 'Star', component: Star, value: 'Star' },
  { name: 'Heart', component: Heart, value: 'Heart' },
  { name: 'Crown', component: Crown, value: 'Crown' },
  { name: 'Gem', component: Gem, value: 'Gem' },
  { name: 'Zap', component: Zap, value: 'Zap' },
  { name: 'Wind', component: Wind, value: 'Wind' },
  { name: 'Coffee', component: Coffee, value: 'Coffee' },
  { name: 'Flower', component: Flower2, value: 'Flower2' },
  { name: 'Sun', component: Sun, value: 'Sun' },
  { name: 'Moon', component: Moon, value: 'Moon' },
];

export function CategoryModal({ isOpen, onClose, onSave, category, mode }: CategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    icon: 'Scissors',
    displayOrder: 0,
    isActive: true,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (category && mode === 'edit') {
      // Use setTimeout to avoid setState in effect warning
      setTimeout(() => {
        setFormData({
          name: category.name,
          description: category.description || '',
          icon: category.icon || 'Scissors',
          displayOrder: category.displayOrder,
          isActive: category.isActive,
        });
      }, 0);
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'Scissors',
        displayOrder: 0,
        isActive: true,
      });
    }
  }, [category, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  };

  const selectedIcon = ICON_OPTIONS.find((i) => i.value === formData.icon);
  const SelectedIconComponent = selectedIcon?.component || Scissors;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create Category' : 'Edit Category'}
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSaving || !formData.name.trim()}>
            {isSaving ? 'Saving...' : mode === 'create' ? 'Create' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Category Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g., Haircuts, Coloring, Treatments"
          required
          maxLength={50}
          hint={`${formData.name.length}/50 characters`}
        />

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-3">
            Icon
          </label>
          <div className="grid grid-cols-4 gap-3 mb-3">
            {ICON_OPTIONS.map((iconOption) => {
              const IconComponent = iconOption.component;
              const isSelected = formData.icon === iconOption.value;
              return (
                <button
                  key={iconOption.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, icon: iconOption.value })}
                  className={cn(
                    'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all min-h-[70px]',
                    isSelected
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                  )}
                >
                  <IconComponent
                    className={cn(
                      'w-6 h-6 mb-1',
                      isSelected ? 'text-blue-600' : 'text-gray-700'
                    )}
                  />
                  <span className="text-[10px] text-gray-600">{iconOption.name}</span>
                </button>
              );
            })}
          </div>
          <p className="text-sm text-gray-500">
            Selected: {selectedIcon?.name}
          </p>
        </div>

        <Textarea
          label="Description (Optional)"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of this category..."
          rows={3}
          maxLength={200}
          hint={`${formData.description.length}/200 characters`}
        />

        <Input
          label="Display Order"
          type="number"
          value={formData.displayOrder}
          onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
          min={0}
          hint="Lower numbers appear first (0 = first)"
        />

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
          <div>
            <label className="text-sm font-medium text-gray-900">Active Status</label>
            <p className="text-xs text-gray-500 mt-1">
              Category is visible and available for use
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Preview */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm font-semibold text-blue-900 mb-3">Preview</p>
          <div className="flex items-center gap-3 p-3 bg-white rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <SelectedIconComponent className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium">{formData.name || 'Category Name'}</p>
              {formData.description && (
                <p className="text-sm text-gray-600">{formData.description}</p>
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>
  );
}

