// @cursor: Premium empty state component
// Beautiful placeholder for empty lists/screens

"use client";

import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  children,
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center border-2 border-dashed border-gray-300 bg-gray-50">
      <div className="flex justify-center mb-6">
        <div className="p-4 bg-white rounded-full shadow-sm">
          <Icon className="w-12 h-12 text-gray-400" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      
      {children}
      
      {(actionLabel || secondaryActionLabel) && (
        <div className="flex gap-3 justify-center flex-wrap">
          {actionLabel && onAction && (
            <Button onClick={onAction} size="lg">
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button onClick={onSecondaryAction} variant="outline" size="lg">
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

