import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef } from 'react';

import { Loader } from '@/components/ui/Loader';
import { cn } from '@/lib/utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-stone-900 text-white hover:bg-stone-800',
        secondary: 'bg-stone-100 text-stone-900 hover:bg-stone-200',
        ghost: 'hover:bg-stone-100 hover:text-stone-900',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

function getLoaderSizeClass(size: ButtonProps['size']): string {
  return size === 'sm' ? 'h-4 w-4' : 'h-5 w-5';
}

function getAccessibleLabel(
  ariaLabel: string | undefined,
  children: React.ReactNode,
): string | undefined {
  if (ariaLabel) return ariaLabel;
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  return undefined;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, isLoading, children, disabled, 'aria-label': ariaLabel, ...props },
    ref,
  ) => {
    const accessibleLabel = getAccessibleLabel(ariaLabel, children);
    const loaderClassName =
      variant === 'primary' || variant === 'destructive'
        ? 'border-white/30 border-t-white'
        : undefined;

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        aria-label={isLoading ? accessibleLabel : ariaLabel}
        {...props}
      >
        {isLoading ? (
          <Loader className={cn(getLoaderSizeClass(size), loaderClassName)} />
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = 'Button';
