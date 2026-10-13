import { renderHook, act } from '@testing-library/react';

import { useMediaQuery } from '@/hooks/useMediaQuery';

describe('useMediaQuery', () => {
  const listeners = new Map<string, (event: MediaQueryListEvent) => void>();

  beforeEach(() => {
    listeners.clear();

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn((query: string): MediaQueryList => {
        const mediaQueryList = {
          matches: query === '(min-width: 768px)',
          media: query,
          onchange: null,
          addEventListener: (_event: string, handler: EventListenerOrEventListenerObject) => {
            if (typeof handler === 'function') {
              listeners.set(query, handler as (event: MediaQueryListEvent) => void);
            }
          },
          removeEventListener: () => undefined,
          dispatchEvent: () => true,
          addListener: () => undefined,
          removeListener: () => undefined,
        };

        return mediaQueryList as MediaQueryList;
      }),
    });
  });

  it('returns true when the breakpoint matches', () => {
    const { result } = renderHook(() => useMediaQuery('tab'));
    expect(result.current).toBe(true);
  });

  it('updates when the media query changes', () => {
    const { result } = renderHook(() => useMediaQuery('mobile'));
    expect(result.current).toBe(false);

    act(() => {
      listeners.get('(min-width: 480px)')?.({
        matches: true,
        media: '(min-width: 480px)',
      } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });
});
