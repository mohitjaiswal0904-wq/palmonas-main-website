import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';

import { toastTypeConfig } from '@/config/toast/toast.config';
import { getToastAnimationClass } from '@/lib/toast/toast-manager';
import { cn } from '@/lib/utils/cn';
import type { ToastAnimationType, ToastType } from '@/types/toast/toast.types';

const toastIconMap: Record<(typeof toastTypeConfig)[ToastType]['icon'], LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  type?: ToastType;
  animationType?: ToastAnimationType;
  showIcon?: boolean;
}

export const Toast = forwardRef<HTMLDivElement, ToastProps>(function Toast(
  { className, children, type = 'normal', animationType = 'slide-in', showIcon = true, ...props },
  ref,
) {
  const typeConfig = toastTypeConfig[type];
  const Icon = toastIconMap[typeConfig.icon];

  return (
    <div
      ref={ref}
      className={cn(
        'text-palmonas-ink flex w-fit max-w-[min(calc(100vw-2rem),24rem)] items-center gap-1.5 rounded border-[0.5px] px-2 py-1.5 text-xs tracking-[0.24px]',
        typeConfig.containerClass,
        getToastAnimationClass(animationType),
        className,
      )}
      role="status"
      {...props}
    >
      {showIcon ? (
        <Icon aria-hidden="true" className={cn('size-[13.5px] shrink-0', typeConfig.iconClass)} />
      ) : null}
      <span className="min-w-0 text-center leading-normal">{children}</span>
    </div>
  );
});
