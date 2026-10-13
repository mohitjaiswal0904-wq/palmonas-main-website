import type { ToastShowOptions } from '@/types/toast/toast.types';

/** Shared jest mock for {@link useToast} with typed helpers. */
export function createUseToastMock() {
  const show = jest.fn((_message: string, _options?: ToastShowOptions) => 'toast-id');
  const showSuccess = jest.fn((message: string, options?: Omit<ToastShowOptions, 'type'>) =>
    show(message, { ...options, type: 'success' }),
  );
  const showError = jest.fn((message: string, options?: Omit<ToastShowOptions, 'type'>) =>
    show(message, { ...options, type: 'danger' }),
  );
  const showWarning = jest.fn((message: string, options?: Omit<ToastShowOptions, 'type'>) =>
    show(message, { ...options, type: 'warning' }),
  );
  const showInfo = jest.fn((message: string, options?: Omit<ToastShowOptions, 'type'>) =>
    show(message, { ...options, type: 'normal' }),
  );

  return {
    show,
    showToast: show,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hide: jest.fn(),
    hideAll: jest.fn(),
    dismissToast: jest.fn(),
    toasts: [],
  };
}
