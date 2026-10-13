import { forwardRef } from 'react';

import { cn } from '@/lib/utils/cn';

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-md border border-stone-300 px-3 py-2 text-base outline-none focus:border-stone-900',
      className,
    )}
    {...props}
  />
));

Textarea.displayName = 'Textarea';
