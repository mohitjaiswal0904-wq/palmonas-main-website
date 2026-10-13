export type ToastType = 'normal' | 'success' | 'warning' | 'danger';

export type ToastPlacement = 'top' | 'bottom';

export type ToastAnimationType = 'slide-in' | 'zoom-in';

export interface ToastShowOptions {
  type?: ToastType;
  placement?: ToastPlacement;
  duration?: number;
  offset?: number;
  animationType?: ToastAnimationType;
  data?: Record<string, unknown>;
  onHide?: () => void;
  onPress?: () => void;
}

export interface ToastRecord {
  id: string;
  message: string;
  type: ToastType;
  placement: ToastPlacement;
  animationType: ToastAnimationType;
  data?: Record<string, unknown>;
  onHide?: () => void;
  onPress?: () => void;
}

export interface ToastProviderDefaults {
  duration: number;
  placement: ToastPlacement;
  animationType: ToastAnimationType;
  animationDurationMs: number;
  offset: number;
  offsetTop: number;
  offsetBottomMobileRem: number;
  offsetBottomDesktopRem: number;
}
