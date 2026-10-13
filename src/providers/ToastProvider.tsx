'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';

import { Toast } from '@/components/ui/Toast';
import { toastDefaults } from '@/config/toast/toast.config';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
  showWarningToast,
} from '@/lib/toast/app-toast';
import {
  buildToastRecord,
  groupToastsByPlacement,
  resolveToastDuration,
} from '@/lib/toast/toast-manager';
import { cn } from '@/lib/utils/cn';
import type {
  ToastAnimationType,
  ToastPlacement,
  ToastRecord,
  ToastShowOptions,
} from '@/types/toast/toast.types';

interface ToastProviderProps {
  children: ReactNode;
  placement?: ToastPlacement;
  duration?: number;
  animationType?: ToastAnimationType;
  animationDurationMs?: number;
  offset?: number;
  offsetTop?: number;
  offsetBottomMobileRem?: number;
  offsetBottomDesktopRem?: number;
}

interface ToastContextValue {
  toasts: ToastRecord[];
  show: (message: string, options?: ToastShowOptions) => string;
  hide: (id: string) => void;
  hideAll: () => void;
  showSuccess: (message: string, options?: Omit<ToastShowOptions, 'type'>) => string;
  showError: (message: string, options?: Omit<ToastShowOptions, 'type'>) => string;
  showWarning: (message: string, options?: Omit<ToastShowOptions, 'type'>) => string;
  showInfo: (message: string, options?: Omit<ToastShowOptions, 'type'>) => string;
  /** Alias for {@link ToastContextValue.show} — matches existing call sites. */
  showToast: (message: string, options?: ToastShowOptions) => string;
  /** Alias for {@link ToastContextValue.hide}. */
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastStackProps {
  placement: ToastPlacement;
  toasts: ToastRecord[];
  offset: number;
  offsetTop: number;
  offsetBottomMobileRem: number;
  offsetBottomDesktopRem: number;
  animationDurationMs: number;
  onDismiss: (id: string) => void;
}

function ToastStack({
  placement,
  toasts,
  offset,
  offsetTop,
  offsetBottomMobileRem,
  offsetBottomDesktopRem,
  animationDurationMs,
  onDismiss,
}: ToastStackProps) {
  if (toasts.length === 0) {
    return null;
  }

  const isTop = placement === 'top';

  return (
    <div
      className={cn(
        'z-toast pointer-events-none fixed inset-x-0 flex flex-col gap-2 px-4',
        isTop
          ? 'top-0 items-center pt-[calc(env(safe-area-inset-top)+var(--toast-offset-top))]'
          : 'laptop:pb-[calc(env(safe-area-inset-bottom)+var(--toast-offset-bottom-desktop))] bottom-0 items-center pb-[calc(env(safe-area-inset-bottom)+var(--toast-offset-bottom))]',
      )}
      style={
        {
          '--toast-offset-top': `${offsetTop + offset}px`,
          '--toast-offset-bottom': `${offsetBottomMobileRem}rem`,
          '--toast-offset-bottom-desktop': `${offsetBottomDesktopRem}rem`,
          '--toast-animation-duration': `${animationDurationMs}ms`,
        } as CSSProperties
      }
      aria-live="polite"
      data-testid={`toast-container-${placement}`}
    >
      {toasts.map((toast) => {
        const content = (
          <Toast type={toast.type} animationType={toast.animationType}>
            {toast.message}
          </Toast>
        );

        if (!toast.onPress) {
          return <div key={toast.id}>{content}</div>;
        }

        return (
          <button
            key={toast.id}
            type="button"
            className="pointer-events-auto border-0 bg-transparent p-0 text-left"
            onClick={() => {
              toast.onPress?.();
              onDismiss(toast.id);
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Global toast stack — web port of the `react-native-toast-notifications` API (`show`, `hide`, `hideAll`).
 */
export function ToastProvider({
  children,
  placement = toastDefaults.placement,
  duration = toastDefaults.duration,
  animationType = toastDefaults.animationType,
  animationDurationMs = toastDefaults.animationDurationMs,
  offset = toastDefaults.offset,
  offsetTop = toastDefaults.offsetTop,
  offsetBottomMobileRem = toastDefaults.offsetBottomMobileRem,
  offsetBottomDesktopRem = toastDefaults.offsetBottomDesktopRem,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timeoutRefs = useRef<Map<string, number>>(new Map());

  const clearScheduledHide = useCallback((id: string) => {
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }
  }, []);

  const hide = useCallback(
    (id: string) => {
      clearScheduledHide(id);
      setToasts((current) => {
        const toast = current.find((entry) => entry.id === id);
        toast?.onHide?.();
        return current.filter((entry) => entry.id !== id);
      });
    },
    [clearScheduledHide],
  );

  const hideAll = useCallback(() => {
    timeoutRefs.current.forEach((timeoutId) => {
      window.clearTimeout(timeoutId);
    });
    timeoutRefs.current.clear();
    setToasts((current) => {
      current.forEach((toast) => toast.onHide?.());
      return [];
    });
  }, []);

  const scheduleHide = useCallback(
    (id: string, toastDuration: number) => {
      clearScheduledHide(id);
      if (toastDuration <= 0) {
        return;
      }

      const timeoutId = window.setTimeout(() => hide(id), toastDuration);
      timeoutRefs.current.set(id, timeoutId);
    },
    [clearScheduledHide, hide],
  );

  const show = useCallback(
    (message: string, options?: ToastShowOptions) => {
      const record = buildToastRecord(message, options, placement, animationType);
      const toastDuration = resolveToastDuration(options, duration);

      setToasts((current) => [...current, record]);
      scheduleHide(record.id, toastDuration);

      return record.id;
    },
    [animationType, duration, placement, scheduleHide],
  );

  const showSuccess = useCallback(
    (message: string, options?: Omit<ToastShowOptions, 'type'>) =>
      showSuccessToast(show, message, options),
    [show],
  );

  const showError = useCallback(
    (message: string, options?: Omit<ToastShowOptions, 'type'>) =>
      showErrorToast(show, message, options),
    [show],
  );

  const showWarning = useCallback(
    (message: string, options?: Omit<ToastShowOptions, 'type'>) =>
      showWarningToast(show, message, options),
    [show],
  );

  const showInfo = useCallback(
    (message: string, options?: Omit<ToastShowOptions, 'type'>) =>
      showInfoToast(show, message, options),
    [show],
  );

  const value = useMemo<ToastContextValue>(
    () => ({
      toasts,
      show,
      hide,
      hideAll,
      showSuccess,
      showError,
      showWarning,
      showInfo,
      showToast: show,
      dismissToast: hide,
    }),
    [hide, hideAll, show, showError, showInfo, showSuccess, showWarning, toasts],
  );

  const groupedToasts = useMemo(() => groupToastsByPlacement(toasts), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastStack
        placement="top"
        toasts={groupedToasts.top}
        offset={offset}
        offsetTop={offsetTop}
        offsetBottomMobileRem={offsetBottomMobileRem}
        offsetBottomDesktopRem={offsetBottomDesktopRem}
        animationDurationMs={animationDurationMs}
        onDismiss={hide}
      />
      <ToastStack
        placement="bottom"
        toasts={groupedToasts.bottom}
        offset={offset}
        offsetTop={offsetTop}
        offsetBottomMobileRem={offsetBottomMobileRem}
        offsetBottomDesktopRem={offsetBottomDesktopRem}
        animationDurationMs={animationDurationMs}
        onDismiss={hide}
      />
    </ToastContext.Provider>
  );
}

/**
 * Access toast actions from React context.
 *
 * @returns Toast stack plus show/hide helpers (`show` mirrors react-native-toast-notifications).
 * @throws Error when used outside ToastProvider.
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
