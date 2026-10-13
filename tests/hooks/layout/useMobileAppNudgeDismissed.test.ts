import { act, renderHook } from '@testing-library/react';

import { useMobileAppNudgeDismissed } from '@/hooks/layout/useMobileAppNudgeDismissed';
import { mobileAppNudgeDismissStorageKey } from '@/config/layout/mobile-app-nudge.config';

describe('useMobileAppNudgeDismissed', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns not dismissed when localStorage is empty', () => {
    const { result } = renderHook(() => useMobileAppNudgeDismissed());

    expect(result.current.isDismissed).toBe(false);
  });

  it('returns dismissed when localStorage flag is set', () => {
    localStorage.setItem(mobileAppNudgeDismissStorageKey, '1');

    const { result } = renderHook(() => useMobileAppNudgeDismissed());

    expect(result.current.isDismissed).toBe(true);
  });

  it('persists dismiss via dismiss callback', () => {
    const { result } = renderHook(() => useMobileAppNudgeDismissed());

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.isDismissed).toBe(true);
    expect(localStorage.getItem(mobileAppNudgeDismissStorageKey)).toBe('1');
  });
});
