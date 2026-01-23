import { type ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f0f0f] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#8b5cf6] hover:bg-[#7c3aed] text-white focus-visible:ring-[#8b5cf6]',
      secondary: 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#2a2a2a] focus-visible:ring-[#2a2a2a]',
      outline: 'border border-[#2a2a2a] hover:bg-[#1a1a1a] text-white focus-visible:ring-[#2a2a2a]',
      ghost: 'hover:bg-[#1a1a1a] text-[#a1a1aa] hover:text-white focus-visible:ring-[#2a2a2a]',
      danger: 'bg-[#ef4444] hover:bg-[#dc2626] text-white focus-visible:ring-[#ef4444]',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : leftIcon ? (
          leftIcon
        ) : null}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
