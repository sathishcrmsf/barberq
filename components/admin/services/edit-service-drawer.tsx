// @cursor: Edit service drawer with same multi-step UI
// Allows editing existing services with pre-filled data

"use client";

import { useState, useEffect } from 'react';
import { Drawer } from '@/components/shared/drawer';
import { Input, Textarea } from '@/components/shared/input';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useStaff } from '@/hooks/useStaff';
import { Service, useServices } from '@/hooks/useServices';
import { Check, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EditServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  service: Service | null;
  onSuccess?: () => void;
}

export function EditServiceDrawer({ isOpen, onClose, service, onSuccess }: EditServiceDrawerProps) {
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    categoryId: '',
    staffIds: [] as string[],
  });
  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeCategories } = useCategories();
  const { activeStaff } = useStaff();
  const { updateService } = useServices();

  // Populate form when service changes
  useEffect(() => {
    if (service && isOpen) {
      setFormData({
        name: service.name,
        price: service.price,
        duration: service.duration,
        description: service.description || '',
        categoryId: service.categoryId || '',
        staffIds: service.staffServices?.map(ss => ss.staff.id) || [],
      });
      setErrors({});
    }
  }, [service, isOpen]);

  const validateForm = (): boolean => {
    const newErrors: any = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name too long (max 100 characters)';
    }

    if (formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    } else if (formData.price > 9999.99) {
      newErrors.price = 'Price too high (max $9999.99)';
    }

    if (formData.duration < 5) {
      newErrors.duration = 'Minimum 5 minutes';
    } else if (formData.duration > 480) {
      newErrors.duration = 'Maximum 480 minutes';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!service || !validateForm()) return;

    setIsSubmitting(true);
    const result = await updateService(service.id, formData);
    setIsSubmitting(false);

    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  const toggleStaff = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...prev.staffIds, staffId],
    }));
  };

  const selectAllStaff = () => {
    setFormData((prev) => ({
      ...prev,
      staffIds: activeStaff.map((s) => s.id),
    }));
  };

  const deselectAllStaff = () => {
    setFormData((prev) => ({
      ...prev,
      staffIds: [],
    }));
  };

  if (!service) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Service"
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Service Details */}
        <div>
          <h3 className="text-lg font-bold mb-4">Service Details</h3>
          <div className="space-y-4">
            <Input
              label="Service Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Men's Haircut"
              error={errors.name}
              required
              maxLength={100}
            />

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Category
              </label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="w-full px-4 py-3 border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- No Category --</option>
                {activeCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (USD)"
                type="number"
                step="0.01"
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                placeholder="25.00"
                error={errors.price}
                leftIcon={<span className="text-gray-500">$</span>}
                required
                min={0}
                max={9999.99}
              />

              <Input
                label="Duration (minutes)"
                type="number"
                value={formData.duration || ''}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                placeholder="30"
                error={errors.duration}
                required
                min={5}
                max={480}
              />
            </div>

            <Textarea
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe this service..."
              rows={4}
              maxLength={500}
              hint={`${formData.description?.length || 0}/500 characters`}
            />
          </div>
        </div>

        {/* Staff Assignment */}
        <div>
          <h3 className="text-lg font-bold mb-4">Assigned Staff</h3>
          
          {activeStaff.length === 0 ? (
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
              <p className="text-gray-600">No staff members available</p>
            </div>
          ) : (
            <>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={selectAllStaff}
                  type="button"
                >
                  Select All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={deselectAllStaff}
                  type="button"
                >
                  Deselect All
                </Button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto">
                {activeStaff.map((staff) => {
                  const isSelected = formData.staffIds.includes(staff.id);
                  return (
                    <button
                      key={staff.id}
                      type="button"
                      onClick={() => toggleStaff(staff.id)}
                      className={cn(
                        'w-full p-3 border-2 rounded-xl text-left transition-all',
                        isSelected
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
                            isSelected
                              ? 'bg-blue-600 border-blue-600'
                              : 'border-gray-300'
                          )}
                        >
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{staff.name}</p>
                          {staff.title && (
                            <p className="text-sm text-gray-600">{staff.title}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-gray-600 mt-4">
                {formData.staffIds.length} staff member(s) selected
              </p>
            </>
          )}
        </div>
      </div>
    </Drawer>
  );
}

