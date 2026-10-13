import rawConfig from '@/config/toast/toast.config.json';
import type { ToastProviderDefaults, ToastType } from '@/types/toast/toast.types';

type ToastIconKey = 'info' | 'success' | 'warning' | 'danger';

interface ToastTypeConfig {
  /** Surface + hairline border utilities for the toast pill. */
  containerClass: string;
  /** Accent colour applied to the leading icon. */
  iconClass: string;
  icon: ToastIconKey;
}

interface ToastConfigShape {
  defaults: ToastProviderDefaults;
  types: Record<ToastType, ToastTypeConfig>;
}

export const toastConfig = rawConfig as ToastConfigShape;

export const toastDefaults = toastConfig.defaults;

export const toastTypeConfig = toastConfig.types;
