import { useEffect, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Modal dialog component with overlay
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    },
    [closeOnEscape, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={handleOverlayClick}
      />
      <div
        className={cn(
          'relative w-full bg-surface rounded-xl border border-border shadow-lg',
          'animate-slide-up',
          sizeStyles[size]
        )}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 p-6 pb-0">
            {title && (
              <div className="flex-1">
                <h2 id="modal-title" className="text-xl font-semibold text-text">
                  {title}
                </h2>
                {description && (
                  <p className="mt-1 text-sm text-text-secondary">{description}</p>
                )}
              </div>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="shrink-0 -mr-2 -mt-2"
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </Button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>,
    document.body
  );
}

interface ModalActionsProps {
  children: ReactNode;
  className?: string;
}

/**
 * Modal actions container for buttons
 */
export function ModalActions({ children, className }: ModalActionsProps) {
  return (
    <div className={cn('flex items-center justify-end gap-3 mt-6', className)}>
      {children}
    </div>
  );
}
