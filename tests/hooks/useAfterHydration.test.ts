import { renderHook } from '@testing-library/react';

import { useAfterHydration } from '@/hooks/useAfterHydration';

describe('useAfterHydration', () => {
  it('returns true in the client test environment', () => {
    const { result } = renderHook(() => useAfterHydration());

    expect(result.current).toBe(true);
  });

  it('stays true across rerenders', () => {
    const { result, rerender } = renderHook(() => useAfterHydration());

    expect(result.current).toBe(true);
    rerender();
    expect(result.current).toBe(true);
  });
});
