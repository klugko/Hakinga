import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#a1a1aa] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717a]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-[#1a1a1a] border rounded-lg px-4 py-2.5 text-white placeholder:text-[#71717a]',
              'transition-colors duration-200',
              'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0f0f0f]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-[#ef4444] focus:ring-[#ef4444]'
                : 'border-[#2a2a2a] focus:border-[#8b5cf6] focus:ring-[#8b5cf6]',
              leftIcon ? 'pl-10' : '',
              rightIcon ? 'pr-10' : '',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717a]">
              {rightIcon}
            </div>
          )}
        </div>
        {(error || helperText) && (
          <p className={cn('mt-1.5 text-sm', error ? 'text-[#ef4444]' : 'text-[#71717a]')}>
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
