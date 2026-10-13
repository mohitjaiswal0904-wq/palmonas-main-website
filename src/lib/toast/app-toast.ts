import type { ToastShowOptions } from '@/types/toast/toast.types';

/** Toast show function signature (matches `react-native-toast-notifications`). */
export type ToastShowFn = (message: string, options?: ToastShowOptions) => string;

/**
 * Shows a success toast.
 *
 * @param show - Bound `show` from {@link useToast}.
 * @param message - User-visible message.
 * @param options - Optional placement/duration overrides.
 * @returns Toast id for later `hide`.
 */
export function showSuccessToast(
  show: ToastShowFn,
  message: string,
  options?: Omit<ToastShowOptions, 'type'>,
): string {
  return show(message, { ...options, type: 'success' });
}

/**
 * Shows an error toast.
 *
 * @param show - Bound `show` from {@link useToast}.
 * @param message - User-visible message.
 * @param options - Optional placement/duration overrides.
 * @returns Toast id for later `hide`.
 */
export function showErrorToast(
  show: ToastShowFn,
  message: string,
  options?: Omit<ToastShowOptions, 'type'>,
): string {
  return show(message, { ...options, type: 'danger' });
}

/**
 * Shows a warning toast.
 *
 * @param show - Bound `show` from {@link useToast}.
 * @param message - User-visible message.
 * @param options - Optional placement/duration overrides.
 * @returns Toast id for later `hide`.
 */
export function showWarningToast(
  show: ToastShowFn,
  message: string,
  options?: Omit<ToastShowOptions, 'type'>,
): string {
  return show(message, { ...options, type: 'warning' });
}

/**
 * Shows a neutral toast.
 *
 * @param show - Bound `show` from {@link useToast}.
 * @param message - User-visible message.
 * @param options - Optional placement/duration overrides.
 * @returns Toast id for later `hide`.
 */
export function showInfoToast(
  show: ToastShowFn,
  message: string,
  options?: Omit<ToastShowOptions, 'type'>,
): string {
  return show(message, { ...options, type: 'normal' });
}
