import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

export const Loader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'h-6 w-6 animate-spin rounded-full border-2 border-stone-300 border-t-stone-900',
        className,
      )}
      role="status"
      aria-label="Loading"
      {...props}
    />
  ),
);

Loader.displayName = 'Loader';
