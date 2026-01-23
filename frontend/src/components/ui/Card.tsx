import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'hover' | 'interactive';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

/**
 * Card container component
 */
export function Card({
  className,
  children,
  variant = 'default',
  padding = 'md',
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl bg-surface border border-border',
        variant === 'hover' && 'hover:border-border-hover transition-colors',
        variant === 'interactive' &&
          'hover:border-border-hover hover:bg-surface-hover cursor-pointer transition-all',
        paddingStyles[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card header component
 */
export function CardHeader({ className, children, ...props }: CardHeaderProps) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4';
}

/**
 * Card title component
 */
export function CardTitle({
  className,
  children,
  as: Component = 'h3',
  ...props
}: CardTitleProps) {
  return (
    <Component
      className={cn('text-lg font-semibold text-text', className)}
      {...props}
    >
      {children}
    </Component>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

/**
 * Card description component
 */
export function CardDescription({
  className,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={cn('text-sm text-text-secondary', className)}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card content component
 */
export function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn('', className)} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card footer component
 */
export function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div
      className={cn('flex items-center gap-4 mt-4 pt-4 border-t border-border', className)}
      {...props}
    >
      {children}
    </div>
  );
}
