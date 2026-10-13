import { renderHook, act } from '@testing-library/react';

import { useDebounce } from '@/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the value after the delay', () => {
    const { result, rerender } = renderHook(({ value, delayMs }) => useDebounce(value, delayMs), {
      initialProps: { value: 'a', delayMs: 300 },
    });

    expect(result.current).toBe('a');
    rerender({ value: 'b', delayMs: 300 });

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe('a');

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe('b');
  });
});
