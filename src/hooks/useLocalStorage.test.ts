import { renderHook, act } from '@testing-library/react';

import { useLocalStorage } from '@/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('reads and writes values', () => {
    const { result } = renderHook(() => useLocalStorage('theme', 'light'));

    expect(result.current[0]).toBe('light');

    act(() => {
      result.current[1]('dark');
    });

    expect(result.current[0]).toBe('dark');
    expect(window.localStorage.getItem('theme')).toBe('"dark"');
  });
});
