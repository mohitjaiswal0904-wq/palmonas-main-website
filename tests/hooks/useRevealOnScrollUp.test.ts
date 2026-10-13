import { act, renderHook } from '@testing-library/react';

import { useRevealOnScrollUp } from '@/hooks/useRevealOnScrollUp';

function setScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    value,
  });
}

describe('useRevealOnScrollUp', () => {
  beforeEach(() => {
    setScrollY(0);
  });

  it('stays fully visible near the top of the page', () => {
    const { result } = renderHook(() => useRevealOnScrollUp());

    expect(result.current).toBe(1);

    act(() => {
      setScrollY(12);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(1);
  });

  it('hides proportionally while scrolling down and reappears while scrolling up', () => {
    const { result } = renderHook(() => useRevealOnScrollUp({ offset: 0, hideDistance: 80 }));

    act(() => {
      setScrollY(40);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0.5);

    act(() => {
      setScrollY(80);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    act(() => {
      setScrollY(40);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0.5);
  });

  it('stays fully visible when disabled', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({ enabled: false, offset: 0, hideDistance: 80 }),
    );

    act(() => {
      setScrollY(80);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(1);
  });

  it('ignores small scroll jitter around the top of the page', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({ offset: 80, snap: true, tolerance: 12 }),
    );

    act(() => {
      setScrollY(24);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);

    act(() => {
      setScrollY(8);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);
  });

  it('starts hidden when the page loads below the offset in snap mode', () => {
    setScrollY(480);

    const { result } = renderHook(() =>
      useRevealOnScrollUp({ offset: 80, snap: true, tolerance: 12 }),
    );

    expect(result.current).toBe(0);
  });

  it('resyncs after scroll restoration on pageshow', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({ offset: 80, snap: true, tolerance: 12 }),
    );

    expect(result.current).toBe(1);

    act(() => {
      setScrollY(640);
      window.dispatchEvent(new Event('pageshow'));
    });

    expect(result.current).toBe(0);
  });

  it('snaps hidden after accumulated downward scroll and visible after accumulated upward scroll', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({
        offset: 80,
        snap: true,
        tolerance: 4,
        hideDistance: 40,
        revealDistance: 32,
      }),
    );

    act(() => {
      setScrollY(20);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);

    act(() => {
      setScrollY(55);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);

    act(() => {
      setScrollY(100);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    act(() => {
      setScrollY(88);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    act(() => {
      setScrollY(52);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);
  });

  it('ignores tiny opposite-direction scroll jitter before thresholds are met', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({
        offset: 80,
        snap: true,
        tolerance: 4,
        hideDistance: 40,
        revealDistance: 32,
      }),
    );

    act(() => {
      setScrollY(140);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    act(() => {
      setScrollY(128);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);
  });

  it('does not hide from sub-tolerance scroll jitter', () => {
    const { result } = renderHook(() =>
      useRevealOnScrollUp({
        offset: 80,
        snap: true,
        tolerance: 12,
        hideDistance: 16,
        revealDistance: 16,
      }),
    );

    act(() => {
      setScrollY(80);
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      setScrollY(86);
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      setScrollY(92);
      window.dispatchEvent(new Event('scroll'));
    });
    act(() => {
      setScrollY(98);
      window.dispatchEvent(new Event('scroll'));
    });

    expect(result.current).toBe(1);
  });

  it('ignores reverse scroll while the settle lock is active after a snap', () => {
    const nowSpy = jest.spyOn(performance, 'now');
    nowSpy.mockReturnValue(1_000);

    const { result } = renderHook(() =>
      useRevealOnScrollUp({
        offset: 80,
        snap: true,
        tolerance: 4,
        hideDistance: 40,
        revealDistance: 32,
        settleMs: 350,
      }),
    );

    act(() => {
      setScrollY(160);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    nowSpy.mockReturnValue(1_200);
    act(() => {
      setScrollY(80);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    nowSpy.mockRestore();
  });

  it('allows reverse snap after the settle lock expires', () => {
    const nowSpy = jest.spyOn(performance, 'now');
    nowSpy.mockReturnValue(1_000);

    const { result } = renderHook(() =>
      useRevealOnScrollUp({
        offset: 80,
        snap: true,
        tolerance: 4,
        hideDistance: 40,
        revealDistance: 32,
        settleMs: 350,
      }),
    );

    act(() => {
      setScrollY(160);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(0);

    nowSpy.mockReturnValue(1_400);
    act(() => {
      setScrollY(100);
      window.dispatchEvent(new Event('scroll'));
    });
    expect(result.current).toBe(1);

    nowSpy.mockRestore();
  });
});
