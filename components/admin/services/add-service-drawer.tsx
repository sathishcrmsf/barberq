// @cursor: Multi-step service creation drawer
// Guided 5-step workflow: Category → Details → Staff → Settings → Review

"use client";

import { useState, useEffect } from 'react';
import { Drawer } from '@/components/shared/drawer';
import { Input, Textarea, Select } from '@/components/shared/input';
import { Button } from '@/components/ui/button';
import { useCategories } from '@/hooks/useCategories';
import { useStaff } from '@/hooks/useStaff';
import { useServices, ServiceFormData } from '@/hooks/useServices';
import { Check, ChevronRight, ChevronLeft, Sparkles, Users, Settings, FileCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AddServiceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const STEPS = [
  { number: 1, title: 'Category', icon: Sparkles },
  { number: 2, title: 'Details', icon: FileCheck },
  { number: 3, title: 'Staff', icon: Users },
  { number: 4, title: 'Settings', icon: Settings },
  { number: 5, title: 'Review', icon: Check },
];

export function AddServiceDrawer({ isOpen, onClose, onSuccess }: AddServiceDrawerProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    price: 0,
    duration: 30,
    description: '',
    categoryId: '',
    staffIds: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ServiceFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { activeCategories, loading: categoriesLoading } = useCategories();
  const { activeStaff, loading: staffLoading } = useStaff();
  const { createService } = useServices();

  // Reset form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        name: '',
        price: 0,
        duration: 30,
        description: '',
        categoryId: '',
        staffIds: [],
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateStep = (step: Step): boolean => {
    const newErrors: Partial<Record<keyof ServiceFormData, string>> = {};

    if (step === 1) {
      if (!formData.categoryId) {
        newErrors.categoryId = 'Please select a category';
      }
    }

    if (step === 2) {
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(5, prev + 1) as Step);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1) as Step);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) return; // Validate required fields

    setIsSubmitting(true);
    const result = await createService(formData);
    setIsSubmitting(false);

    if (result) {
      onSuccess?.();
      onClose();
    }
  };

  const toggleStaff = (staffId: string) => {
    setFormData((prev) => ({
      ...prev,
      staffIds: prev.staffIds?.includes(staffId)
        ? prev.staffIds.filter((id) => id !== staffId)
        : [...(prev.staffIds || []), staffId],
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

  const selectedCategory = activeCategories.find((c) => c.id === formData.categoryId);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Service"
      size="lg"
      footer={
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          {currentStep < 5 ? (
            <Button onClick={handleNext} className="flex-1">
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? 'Creating...' : 'Create Service'}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      isActive && 'bg-blue-600 text-white ring-4 ring-blue-100',
                      isCompleted && 'bg-green-600 text-white',
                      !isActive && !isCompleted && 'bg-gray-200 text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Icon className="w-5 h-5" />
                    )}
                  </div>
                  <p className="text-xs mt-2 font-medium text-gray-600 hidden sm:block">
                    {step.title}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-all',
                      isCompleted ? 'bg-green-600' : 'bg-gray-200'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {/* Step 1: Choose Category */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Choose a Category</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select the category this service belongs to. This helps organize your services.
                </p>
              </div>

              {categoriesLoading ? (
                <p className="text-gray-500">Loading categories...</p>
              ) : activeCategories.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600 mb-2">No categories available</p>
                  <p className="text-sm text-gray-500">
                    Create a category first to organize your services
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {activeCategories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, categoryId: category.id })}
                      className={cn(
                        'p-4 border-2 rounded-xl text-left transition-all',
                        formData.categoryId === category.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold">{category.name}</h4>
                          {category.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {category.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {category._count?.services || 0} services
                          </p>
                        </div>
                        {formData.categoryId === category.id && (
                          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {errors.categoryId && (
                <p className="text-red-500 text-sm">{errors.categoryId}</p>
              )}
            </div>
          )}

          {/* Step 2: Service Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Service Details</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Provide the basic information about this service.
                </p>
              </div>

              <Input
                label="Service Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Men's Haircut"
                error={errors.name}
                required
                maxLength={100}
              />

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
          )}

          {/* Step 3: Assign Staff */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Assign Staff</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Select which staff members can perform this service. You can skip this step and assign staff later.
                </p>
              </div>

              {staffLoading ? (
                <p className="text-gray-500">Loading staff...</p>
              ) : activeStaff.length === 0 ? (
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl text-center">
                  <p className="text-gray-600 mb-2">No staff members available</p>
                  <p className="text-sm text-gray-500">
                    Add staff members to assign them to services
                  </p>
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

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {activeStaff.map((staff) => {
                      const isSelected = formData.staffIds?.includes(staff.id);
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
                    {formData.staffIds?.length || 0} staff member(s) selected
                  </p>
                </>
              )}
            </div>
          )}

          {/* Step 4: Additional Settings */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Additional Settings</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Optional settings to enhance your service listing.
                </p>
              </div>

              <div className="p-6 bg-gray-50 rounded-xl text-center">
                <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 font-medium mb-2">Coming Soon</p>
                <p className="text-sm text-gray-500">
                  Features like tags, service images, and custom fields will be available in future updates.
                </p>
              </div>
            </div>
          )}

          {/* Step 5: Review & Confirm */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold mb-2">Review & Confirm</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please review all the details before creating the service.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Category</h4>
                  <p className="font-medium">{selectedCategory?.name || 'None'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Service Details</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="font-medium">{formData.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Price</p>
                        <p className="font-medium">${formData.price.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Duration</p>
                        <p className="font-medium">{formData.duration} min</p>
                      </div>
                    </div>
                    {formData.description && (
                      <div>
                        <p className="text-sm text-gray-600">Description</p>
                        <p className="text-sm">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Assigned Staff</h4>
                  {formData.staffIds && formData.staffIds.length > 0 ? (
                    <div className="space-y-1">
                      {formData.staffIds.map((staffId) => {
                        const staff = activeStaff.find((s) => s.id === staffId);
                        return staff ? (
                          <div key={staffId} className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            <span>{staff.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500">No staff assigned</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}

