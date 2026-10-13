import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap gap-2', className)} role="tablist" {...props}>
      {children}
    </div>
  ),
);

Tabs.displayName = 'Tabs';
