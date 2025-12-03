// @cursor: Add category page - Create new service category
// Form with name, description, icon, and display order

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
  Moon
} from 'lucide-react';

const ICON_OPTIONS = [
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

export default function AddCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Scissors',
    displayOrder: 0,
    isActive: true
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to create category');
      }

      toast.success('Category created successfully');
      router.push('/categories');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create category';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href="/categories">
              <Button variant="ghost" size="sm" disabled={loading}>
                ← Back
              </Button>
            </Link>
            <h1 className="text-xl font-bold">New Category</h1>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim()}
          >
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 pb-24">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2">
              Category Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Haircuts, Coloring, Treatments"
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={50}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.name.length}/50 characters
            </p>
          </Card>

          {/* Icon */}
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2">
              Icon
            </label>
            <div className="grid grid-cols-4 gap-3 mb-3">
              {ICON_OPTIONS.map((iconOption) => {
                const IconComponent = iconOption.component;
                return (
                  <button
                    key={iconOption.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: iconOption.value })}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all min-h-[70px] ${
                      formData.icon === iconOption.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 active:bg-gray-50'
                    }`}
                  >
                    <IconComponent className={`w-6 h-6 mb-1 ${
                      formData.icon === iconOption.value ? 'text-blue-600' : 'text-gray-700'
                    }`} />
                    <span className="text-[10px] text-gray-600">{iconOption.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-xs text-gray-500">
              Selected: {ICON_OPTIONS.find(i => i.value === formData.icon)?.name}
            </p>
          </Card>

          {/* Description */}
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of this category..."
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.description.length}/200 characters
            </p>
          </Card>

          {/* Display Order */}
          <Card className="p-4">
            <label className="block text-sm font-semibold mb-2">
              Display Order
            </label>
            <input
              type="number"
              value={formData.displayOrder}
              onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) })}
              min={0}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first (0 = first)
            </p>
          </Card>

          {/* Status */}
          <Card className="p-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Active</div>
                <p className="text-xs text-gray-500">
                  Category is visible and available for use
                </p>
              </div>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
            </label>
          </Card>

          {/* Preview */}
          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="text-sm font-semibold mb-2">Preview</div>
            <div className="flex items-center gap-3">
              {(() => {
                const IconComponent = ICON_OPTIONS.find(i => i.value === formData.icon)?.component || Scissors;
                return <IconComponent className="w-7 h-7 text-blue-600" />;
              })()}
              <div>
                <div className="font-medium">{formData.name || 'Category Name'}</div>
                {formData.description && (
                  <div className="text-sm text-gray-600">{formData.description}</div>
                )}
              </div>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}

