// @cursor: CategoryBadge component displays category icon and name
// Used in service cards, filters, and category lists

import React from 'react';
import { cn } from '@/lib/utils';
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
  Tag
} from 'lucide-react';

interface CategoryBadgeProps {
  name: string;
  icon?: string;
  className?: string;
  variant?: 'default' | 'outline';
}

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

export function CategoryBadge({ name, icon, className, variant = 'default' }: CategoryBadgeProps) {
  const IconComponent = icon && ICON_MAP[icon] ? ICON_MAP[icon] : Tag;
  
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        variant === 'default' && 'bg-blue-100 text-blue-800',
        variant === 'outline' && 'border border-gray-300 bg-white text-gray-700',
        className
      )}
    >
      {icon && <IconComponent className="w-3 h-3" />}
      {name}
    </span>
  );
}

