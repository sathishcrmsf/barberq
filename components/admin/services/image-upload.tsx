// @cursor: Service image upload component
// Supports file upload, URL input, and camera capture (mobile)
// Generates thumbnails and stores as base64 (MVP approach)

'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/shared/input';
import { Card } from '@/components/ui/card';
import { Upload, X, Camera, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ImageUploadData {
  imageUrl: string | null;
  thumbnailUrl: string | null;
  imageAlt: string | null;
}

interface ImageUploadProps {
  value: ImageUploadData;
  onChange: (data: ImageUploadData) => void;
  label?: string;
  error?: string;
}

// Generate thumbnail from image (resize to 200x200 max)
function generateThumbnail(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate dimensions (max 200x200, maintain aspect ratio)
        const maxSize = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function ImageUpload({ value, onChange, label = 'Service Image', error }: ImageUploadProps) {
  const [uploadMode, setUploadMode] = useState<'file' | 'url' | 'camera' | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setIsUploading(true);
    try {
      // Generate full image and thumbnail
      const [fullImage, thumbnail] = await Promise.all([
        fileToBase64(file),
        generateThumbnail(file)
      ]);

      onChange({
        imageUrl: fullImage,
        thumbnailUrl: thumbnail,
        imageAlt: file.name.replace(/\.[^/.]+$/, '') || 'Service image'
      });

      setUploadMode(null);
      setImageUrlInput('');
    } catch (err) {
      console.error('Error processing image:', err);
      alert('Failed to process image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [onChange]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };

  const handleUrlSubmit = () => {
    if (!imageUrlInput.trim()) {
      alert('Please enter an image URL');
      return;
    }

    // Validate URL
    try {
      new URL(imageUrlInput);
    } catch {
      alert('Please enter a valid URL');
      return;
    }

    onChange({
      imageUrl: imageUrlInput.trim(),
      thumbnailUrl: imageUrlInput.trim(), // Use same URL for thumbnail (external URLs)
      imageAlt: 'Service image'
    });

    setUploadMode(null);
    setImageUrlInput('');
  };

  const handleRemove = () => {
    onChange({
      imageUrl: null,
      thumbnailUrl: null,
      imageAlt: null
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const hasImage = value.imageUrl !== null && value.imageUrl !== '';

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      </div>

      {/* Image Preview */}
      {hasImage && (
        <Card className="p-4">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setUploadMode('file');
                fileInputRef.current?.click();
              }}
              className="relative w-full h-48 rounded-lg overflow-hidden group cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all p-0"
              disabled={isUploading}
            >
              <img
                src={value.imageUrl ?? ''}
                alt={value.imageAlt || 'Service image'}
                className="w-full h-full object-cover block"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              {isUploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity flex items-center justify-center pointer-events-none z-10">
                <p className="text-white text-sm font-medium">
                  Click to replace image
                </p>
              </div>
            </button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="absolute top-2 right-2 bg-white hover:bg-gray-100 shadow-md z-10"
              title="Delete image"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          {value.imageAlt && (
            <Input
              label="Image Alt Text"
              value={value.imageAlt}
              onChange={(e) => onChange({ ...value, imageAlt: e.target.value })}
              placeholder="Describe the image for accessibility"
              className="mt-3"
              maxLength={200}
            />
          )}
        </Card>
      )}

      {/* Upload Options */}
      {!hasImage && (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-xl p-6 transition-colors',
            uploadMode === null
              ? 'border-gray-300 hover:border-gray-400 bg-gray-50'
              : 'border-blue-300 bg-blue-50'
          )}
        >
          {uploadMode === null ? (
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Add a service image
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Drag and drop an image, or choose an option below
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadMode('file');
                    fileInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadMode('url')}
                  disabled={isUploading}
                >
                  <LinkIcon className="w-4 h-4 mr-2" />
                  From URL
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadMode('camera');
                    cameraInputRef.current?.click();
                  }}
                  disabled={isUploading}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Camera
                </Button>
              </div>
            </div>
          ) : uploadMode === 'url' ? (
            <div className="space-y-3">
              <Input
                label="Image URL"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                type="url"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setUploadMode(null);
                    setImageUrlInput('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleUrlSubmit}
                  disabled={!imageUrlInput.trim()}
                >
                  Add Image
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
        className="hidden"
      />

      {/* Help Text */}
      <p className="text-xs text-gray-500">
        Supported formats: JPG, PNG, GIF. Max size: 5MB. Images are stored as base64 (MVP).
      </p>
    </div>
  );
}
