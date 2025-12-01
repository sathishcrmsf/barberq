// @cursor: StaffAvatar component displays staff photo or initials
// Used in staff lists, queue items, and assignments

import React from 'react';
import { cn } from '@/lib/utils';

interface StaffAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StaffAvatar({ name, imageUrl, size = 'md', className }: StaffAvatarProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-lg'
  };

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold',
        imageUrl ? 'overflow-hidden' : 'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
        sizeClasses[size],
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}

