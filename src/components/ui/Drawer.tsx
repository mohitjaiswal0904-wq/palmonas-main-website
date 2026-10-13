import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface DrawerProps extends React.HTMLAttributes<HTMLElement> {
  children: ReactNode;
}

export const Drawer = forwardRef<HTMLElement, DrawerProps>(
  ({ className, children, ...props }, ref) => (
    <aside
      ref={ref}
      className={cn('rounded-palmonas-lg shadow-palmonas-soft bg-white p-6', className)}
      {...props}
    >
      {children}
    </aside>
  ),
);

Drawer.displayName = 'Drawer';
