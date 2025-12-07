// @cursor: Customer creation modal
// Allows adding customers directly to the database without adding to queue

"use client";

import { useState, useEffect } from 'react';
import { Modal } from '@/components/shared/modal';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/ui/button';
import { validateAndNormalizePhone } from '@/lib/utils';
import { toast } from 'sonner';

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CustomerModal({ isOpen, onClose, onSuccess }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({ name: '', phone: '', email: '' });
      setPhoneError('');
    }
  }, [isOpen]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData({ ...formData, phone: value });
    setPhoneError('');
    
    // Auto-format phone number as user types
    if (value && !value.startsWith('+91')) {
      // If user starts typing numbers, prepend +91
      if (/^\d/.test(value)) {
        setFormData({ ...formData, phone: '+91' + value.replace(/^\+91/, '') });
      }
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter customer name');
      return false;
    }

    if (!formData.phone.trim()) {
      toast.error('Please enter phone number');
      return false;
    }

    const normalizedPhone = validateAndNormalizePhone(formData.phone);
    if (!normalizedPhone) {
      setPhoneError('Invalid phone format. Expected: +91 followed by 10 digits');
      toast.error('Invalid phone format. Expected: +91 followed by 10 digits');
      return false;
    }

    // Validate email format if provided
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setPhoneError('');

    try {
      const normalizedPhone = validateAndNormalizePhone(formData.phone);
      
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: normalizedPhone,
          email: formData.email.trim() || undefined,
        }),
      });

      // Read and parse the response body
      let data: any = {};
      
      try {
        // Check content type first
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        
        const rawText = await response.text();
        console.log('[Customer Modal] Response status:', response.status);
        console.log('[Customer Modal] Content-Type:', contentType);
        console.log('[Customer Modal] Response text length:', rawText?.length || 0);
        
        // If response is HTML (Next.js error page), handle it specially
        if (contentType.includes('text/html')) {
          console.error('[Customer Modal] Received HTML error page instead of JSON');
          data = {
            error: `Server error (${response.status})`,
            details: 'The server returned an HTML error page. This usually means the API route crashed or there is a configuration issue. Check the server logs for details.'
          };
        } else if (rawText && rawText.trim()) {
          if (isJson) {
            try {
              data = JSON.parse(rawText);
              console.log('[Customer Modal] Parsed JSON data:', data);
              
              // Validate that we got actual error data
              if (!data.error && !data.details && Object.keys(data).length === 0) {
                console.warn('[Customer Modal] Received empty JSON object');
                data = {
                  error: `Server error (${response.status})`,
                  details: 'Server returned an empty response object. Check server logs for the actual error.'
                };
              }
            } catch (parseError) {
              console.error('[Customer Modal] JSON parse error:', parseError);
              data = { 
                error: 'Invalid JSON response from server',
                details: rawText.substring(0, 200) || 'Server returned malformed JSON'
              };
            }
          } else {
            // Non-JSON response
            console.error('[Customer Modal] Received non-JSON response');
            data = {
              error: 'Unexpected response format',
              details: `Server returned ${contentType} instead of JSON. Response: ${rawText.substring(0, 200)}`
            };
          }
        } else {
          // Empty response body
          console.error('[Customer Modal] Empty response body received');
          data = { 
            error: `Server returned empty response`,
            details: `HTTP ${response.status} ${response.statusText || 'Unknown error'}. The server may have crashed or failed to send a proper error response. Check server logs.`
          };
        }
      } catch (readError) {
        console.error('[Customer Modal] Failed to read response body:', readError);
        data = { 
          error: 'Failed to read server response',
          details: readError instanceof Error ? readError.message : String(readError)
        };
      }

      if (!response.ok) {
        // Handle different error status codes
        if (response.status === 409) {
          const errorMsg = data.error || 'Customer with this phone number already exists';
          toast.error(errorMsg);
          setPhoneError('This phone number is already registered');
        } else if (response.status === 400) {
          // Validation error
          const errorMsg = data.error || 'Invalid input. Please check your data.';
          const details = data.details ? ` ${data.details}` : '';
          toast.error(errorMsg + details);
          if (data.details) {
            console.error('Validation details:', data.details);
          }
        } else if (response.status >= 500) {
          // Server errors
          // Check if data is empty or missing error fields
          const hasErrorInfo = data && (data.error || data.details || data.message);
          const isEmpty = !data || Object.keys(data || {}).length === 0;
          
          if (isEmpty || !hasErrorInfo) {
            console.error('[Customer Modal] Empty or invalid error data received:', {
              status: response.status,
              statusText: response.statusText,
              contentType: response.headers.get('content-type'),
              data: data,
              dataType: typeof data,
              dataKeys: Object.keys(data || {}),
              isEmpty: isEmpty,
              hasErrorInfo: hasErrorInfo,
            });
            
            // Provide helpful error message
            const helpfulMsg = `Server error (${response.status}). ` +
              (response.status === 500 
                ? 'This usually means a database connection issue or server crash. Check server logs.'
                : 'Please check the server logs for details.');
            toast.error(helpfulMsg);
          } else {
            const errorMsg = data.error || data.message || 'Server error occurred';
            const details = data.details ? `: ${data.details}` : '';
            toast.error(errorMsg + details);
            console.error('[Customer Modal] Server error:', {
              status: response.status,
              statusText: response.statusText,
              error: data.error,
              details: data.details,
              code: data.code,
            });
          }
        } else {
          // Other errors
          const errorMsg = data.error || data.details || `Failed to create customer (HTTP ${response.status})`;
          toast.error(errorMsg);
        }
        setIsSaving(false);
        return;
      }

      toast.success('Customer added successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating customer:', error);
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Failed to create customer. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Customer"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1 bg-black text-white hover:bg-gray-900" disabled={isSaving || !formData.name.trim() || !formData.phone.trim()}>
            {isSaving ? 'Creating...' : 'Create'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Input
            label="Customer Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter customer name"
            required
            autoFocus
          />
        </div>

        <div>
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handlePhoneChange}
            placeholder="+91 1234567890"
            required
            error={phoneError}
            hint="Format: +91 followed by 10 digits"
          />
        </div>

        <div>
          <Input
            label="Email (Optional)"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="customer@example.com"
            hint="Optional email address"
          />
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-900">
            <strong>Note:</strong> This will add the customer to your database. 
            To add them to the queue, use the "Add to Queue" button from the customer list.
          </p>
        </div>
      </form>
    </Modal>
  );
}

