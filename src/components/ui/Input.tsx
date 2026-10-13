import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-stone-900',
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = 'Input';
