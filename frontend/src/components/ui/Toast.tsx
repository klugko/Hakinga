import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { useToast, type Toast as ToastType } from '@/contexts/ToastContext';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'border-success/30 bg-success/10',
  error: 'border-error/30 bg-error/10',
  warning: 'border-warning/30 bg-warning/10',
  info: 'border-accent/30 bg-accent/10',
};

const iconStyles = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-accent',
};

interface ToastItemProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

/**
 * Individual toast notification item
 */
function ToastItem({ toast, onRemove }: ToastItemProps) {
  const Icon = icons[toast.type];

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm',
        'animate-slide-up',
        styles[toast.type]
      )}
      role="alert"
    >
      <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconStyles[toast.type])} />
      <p className="flex-1 text-sm text-text">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 text-text-muted hover:text-text transition-colors"
        aria-label="Fermer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

/**
 * Toast container that renders all active toasts
 */
export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
}
