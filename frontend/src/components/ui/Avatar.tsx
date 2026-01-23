import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

/**
 * Avatar component for user profile images
 */
export function Avatar({
  className,
  src,
  alt,
  fallback,
  size = 'md',
  ...props
}: AvatarProps) {
  const initials = fallback
    ? fallback
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : null;

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full bg-surface-hover border border-border overflow-hidden',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
        />
      ) : initials ? (
        <span className="font-medium text-text-secondary">{initials}</span>
      ) : (
        <User className={cn('text-text-muted', iconSizes[size])} />
      )}
    </div>
  );
}
