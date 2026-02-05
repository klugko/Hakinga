import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'outline';
  size?: 'sm' | 'md';
}

function Badge({ className, variant = 'default', size = 'md', children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-[#252525] text-[#a1a1aa]',
    primary: 'bg-[#8b5cf6]/20 text-[#8b5cf6]',
    success: 'bg-[#22c55e]/20 text-[#22c55e]',
    warning: 'bg-[#f59e0b]/20 text-[#f59e0b]',
    error: 'bg-[#ef4444]/20 text-[#ef4444]',
    outline: 'border border-[#2a2a2a] text-[#a1a1aa]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
