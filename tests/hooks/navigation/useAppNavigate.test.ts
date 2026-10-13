import { renderHook } from '@testing-library/react';

import { useAppNavigate } from '@/hooks/navigation/useAppNavigate';

const mockPush = jest.fn();
const mockStartNavigation = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: mockStartNavigation,
    clearNavigation: jest.fn(),
  }),
}));

describe('useAppNavigate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('starts pending navigation then pushes', () => {
    const { result } = renderHook(() => useAppNavigate());

    result.current.navigate('/cart');

    expect(mockStartNavigation).toHaveBeenCalledWith('/cart');
    expect(mockPush).toHaveBeenCalledWith('/cart', undefined);
  });

  it('forwards router options', () => {
    const { result } = renderHook(() => useAppNavigate());

    result.current.navigate('/search?q=ring', { scroll: false });

    expect(mockStartNavigation).toHaveBeenCalledWith('/search?q=ring');
    expect(mockPush).toHaveBeenCalledWith('/search?q=ring', { scroll: false });
  });

  it('can navigate to product paths', () => {
    const { result } = renderHook(() => useAppNavigate());

    result.current.navigate('/products/demo');

    expect(mockStartNavigation).toHaveBeenCalledWith('/products/demo');
  });

  it('can navigate to collections', () => {
    const { result } = renderHook(() => useAppNavigate());

    result.current.navigate('/collections/bestsellers');

    expect(mockPush).toHaveBeenCalledWith('/collections/bestsellers', undefined);
  });
});
