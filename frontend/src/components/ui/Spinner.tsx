import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
};

/**
 * Loading spinner component
 */
export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <Loader2
      className={cn('animate-spin text-primary', sizeStyles[size], className)}
      aria-label="Chargement..."
    />
  );
}

interface LoadingOverlayProps {
  message?: string;
}

/**
 * Full-screen loading overlay
 */
export function LoadingOverlay({ message }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <Spinner size="lg" />
      {message && <p className="mt-4 text-text-secondary">{message}</p>}
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
}

/**
 * Loading state for cards and sections
 */
export function LoadingCard({ message = 'Chargement...' }: LoadingCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Spinner size="lg" />
      <p className="mt-4 text-text-secondary">{message}</p>
    </div>
  );
}
