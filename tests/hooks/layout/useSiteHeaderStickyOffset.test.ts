import { renderHook, waitFor } from '@testing-library/react';

import { useStickyPinState } from '@/hooks/layout/useStickyPinState';
import { useSiteHeaderStickyOffset } from '@/hooks/layout/useSiteHeaderStickyOffset';

class ResizeObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();
}

class IntersectionObserverMock {
  observe = jest.fn();
  disconnect = jest.fn();

  constructor(private readonly callback: IntersectionObserverCallback) {}

  trigger(isIntersecting: boolean): void {
    this.callback([{ isIntersecting } as IntersectionObserverEntry], this as unknown as IntersectionObserver);
  }
}

describe('useSiteHeaderStickyOffset', () => {
  beforeEach(() => {
    global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;
  });

  it('tracks header bottom edge on scroll', async () => {
    const header = document.createElement('header');
    header.setAttribute('aria-label', 'Site header');
    const rectSpy = jest
      .spyOn(header, 'getBoundingClientRect')
      .mockReturnValue({ bottom: 96, height: 96 } as DOMRect);
    document.body.appendChild(header);

    const { result } = renderHook(() => useSiteHeaderStickyOffset());

    await waitFor(() => {
      expect(result.current).toBe(96);
    });

    rectSpy.mockReturnValue({ bottom: 72, height: 72 } as DOMRect);
    window.dispatchEvent(new Event('scroll'));

    await waitFor(() => {
      expect(result.current).toBe(72);
    });

    rectSpy.mockRestore();
    document.body.removeChild(header);
  });
});

describe('useStickyPinState', () => {
  beforeEach(() => {
    global.IntersectionObserver = jest.fn(function IntersectionObserver(this: IntersectionObserverMock, callback: IntersectionObserverCallback) {
      return new IntersectionObserverMock(callback) as unknown as IntersectionObserver;
    }) as unknown as typeof IntersectionObserver;
  });

  it('starts unpinned when sentinel is visible', () => {
    const sentinel = document.createElement('div');
    document.body.appendChild(sentinel);

    const sentinelRef = { current: sentinel };

    const { result } = renderHook(() =>
      useStickyPinState({
        sentinelRef,
        stickyTop: 96,
      }),
    );

    expect(result.current).toBe(false);

    document.body.removeChild(sentinel);
  });
});
