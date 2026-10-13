import { toastDefaults } from '@/config/toast/toast.config';
import type {
  ToastAnimationType,
  ToastPlacement,
  ToastRecord,
  ToastShowOptions,
  ToastType,
} from '@/types/toast/toast.types';

/** Creates a stable toast id for stack bookkeeping. */
export function createToastId(): string {
  return (
    globalThis.crypto?.randomUUID() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  );
}

/**
 * Merges caller options with provider defaults into a toast record.
 *
 * @param message - User-visible toast text.
 * @param options - Per-toast overrides (react-native-toast-notifications shape).
 * @param providerPlacement - Provider-level default placement.
 * @param providerAnimationType - Provider-level default animation.
 * @returns Normalised toast record without timer state.
 */
export function buildToastRecord(
  message: string,
  options: ToastShowOptions | undefined,
  providerPlacement: ToastPlacement = toastDefaults.placement,
  providerAnimationType: ToastAnimationType = toastDefaults.animationType,
): ToastRecord {
  const trimmedMessage = message.trim();

  return {
    id: createToastId(),
    message: trimmedMessage || message,
    type: options?.type ?? 'normal',
    placement: options?.placement ?? providerPlacement,
    animationType: options?.animationType ?? providerAnimationType,
    ...(options?.data ? { data: options.data } : {}),
    ...(options?.onHide ? { onHide: options.onHide } : {}),
    ...(options?.onPress ? { onPress: options.onPress } : {}),
  };
}

/**
 * Resolves auto-dismiss duration for a toast.
 *
 * @param options - Per-toast options.
 * @param providerDuration - Provider default duration in ms.
 * @returns Duration in milliseconds; `0` disables auto-dismiss.
 */
export function resolveToastDuration(
  options: ToastShowOptions | undefined,
  providerDuration: number = toastDefaults.duration,
): number {
  if (typeof options?.duration === 'number') {
    return Math.max(0, options.duration);
  }

  return providerDuration;
}

/**
 * Returns animation class names for a toast entrance.
 *
 * @param animationType - Slide or zoom entrance.
 * @returns Tailwind animation utility classes.
 */
export function getToastAnimationClass(animationType: ToastAnimationType): string {
  return animationType === 'zoom-in' ? 'toast-animate-zoom-in' : 'toast-animate-slide-in';
}

/**
 * Groups toast records by vertical placement for stacked rendering.
 *
 * @param toasts - Active toast stack.
 * @returns Top and bottom placement buckets.
 */
export function groupToastsByPlacement(toasts: readonly ToastRecord[]): {
  top: ToastRecord[];
  bottom: ToastRecord[];
} {
  return toasts.reduce<{ top: ToastRecord[]; bottom: ToastRecord[] }>(
    (groups, toast) => {
      groups[toast.placement].push(toast);
      return groups;
    },
    { top: [], bottom: [] },
  );
}

/**
 * Resolves type-safe toast type config key.
 *
 * @param type - Toast semantic type.
 * @returns Normalised toast type union member.
 */
export function normalizeToastType(type: ToastType | undefined): ToastType {
  return type ?? 'normal';
}
