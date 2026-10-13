import { forwardRef, type ReactNode } from 'react';

import { cn } from '@/lib/utils/cn';

interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-palmonas-lg shadow-palmonas-soft bg-white p-6', className)}
      role="dialog"
      aria-modal="true"
      {...props}
    >
      {children}
    </div>
  ),
);

Modal.displayName = 'Modal';
