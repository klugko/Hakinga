import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Toast as ToastType } from '@/types';

export interface ToastProps extends ToastType {
  onClose: (id: string) => void;
}

function Toast({ id, type, message, duration = 5000, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => onClose(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#22c55e]" />,
    error: <XCircle className="w-5 h-5 text-[#ef4444]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />,
    info: <Info className="w-5 h-5 text-[#3b82f6]" />,
  };

  const borderColors = {
    success: 'border-l-[#22c55e]',
    error: 'border-l-[#ef4444]',
    warning: 'border-l-[#f59e0b]',
    info: 'border-l-[#3b82f6]',
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 bg-[#1a1a1a] border border-[#2a2a2a] border-l-4 rounded-lg shadow-lg',
        'transition-all duration-300',
        borderColors[type],
        isExiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'
      )}
      role="alert"
    >
      {icons[type]}
      <p className="flex-1 text-sm text-white">{message}</p>
      <button
        onClick={handleClose}
        className="p-1 rounded text-[#71717a] hover:text-white hover:bg-[#252525] transition-colors"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export interface ToastContainerProps {
  toasts: ToastType[];
  onClose: (id: string) => void;
}

function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

export { Toast, ToastContainer };
