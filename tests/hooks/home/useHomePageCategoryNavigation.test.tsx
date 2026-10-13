import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';

import { useHomePageCategoryNavigation } from '@/hooks/home/useHomePageCategoryNavigation';
import { HomePageCategoryNavigationProvider } from '@/providers/home/HomePageCategoryNavigationProvider';

const mockPush = jest.fn();
const mockPrefetch = jest.fn();
const mockStartNavigation = jest.fn();
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, prefetch: mockPrefetch }),
  usePathname: () => mockUsePathname(),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: mockStartNavigation,
    clearNavigation: jest.fn(),
  }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <HomePageCategoryNavigationProvider>{children}</HomePageCategoryNavigationProvider>;
}

describe('useHomePageCategoryNavigation', () => {
  const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterAll(() => {
    scrollToSpy.mockRestore();
  });

  it('no-ops when selecting the already-active category', () => {
    const { result } = renderHook(() => useHomePageCategoryNavigation('silver'), { wrapper });

    act(() => {
      result.current.handleSelect('silver');
    });

    expect(mockStartNavigation).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
    expect(scrollToSpy).not.toHaveBeenCalled();
  });

  it('on home pushes without full-page startNavigation so tabs can stay visible', () => {
    const { result } = renderHook(() => useHomePageCategoryNavigation('silver'), { wrapper });

    act(() => {
      result.current.handleSelect('gold');
    });

    expect(mockStartNavigation).not.toHaveBeenCalled();
    // `?category=` keeps the pathname, so RouteScrollReset skips it — reset locally instead.
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(mockPrefetch).toHaveBeenCalledWith('/?category=gold');
    expect(mockPush).toHaveBeenCalledWith('/?category=gold', { scroll: true });
    expect(result.current.activeCategory).toBe('gold');
  });

  it('off home starts destination overlay then pushes', () => {
    mockUsePathname.mockReturnValue('/cart');
    const { result } = renderHook(() => useHomePageCategoryNavigation(), { wrapper });

    act(() => {
      result.current.handleSelect('gold');
    });

    expect(mockStartNavigation).toHaveBeenCalledWith('/?category=gold');
    expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'auto' });
    expect(mockPush).toHaveBeenCalledWith('/?category=gold', { scroll: true });
  });

  it('off home still navigates to default Home even when URL has no category param (PW-720)', () => {
    mockUsePathname.mockReturnValue('/gifting');
    const { result } = renderHook(() => useHomePageCategoryNavigation(), { wrapper });

    act(() => {
      result.current.handleSelect('silver');
    });

    expect(mockStartNavigation).toHaveBeenCalledWith('/');
    expect(mockPush).toHaveBeenCalledWith('/', { scroll: true });
  });

  it('navigates to "/" when selecting the default silver category', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=gold'));
    const { result } = renderHook(() => useHomePageCategoryNavigation('gold'), { wrapper });

    act(() => {
      result.current.handleSelect('silver');
    });

    expect(mockPush).toHaveBeenCalledWith('/', { scroll: true });
  });

  it('navigates to demifine via category query', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=gold'));
    const { result } = renderHook(() => useHomePageCategoryNavigation('gold'), { wrapper });

    act(() => {
      result.current.handleSelect('demifine');
    });

    expect(mockPush).toHaveBeenCalledWith('/?category=demifine', { scroll: true });
  });

  it('prefetchCategory warms the target href', () => {
    const { result } = renderHook(() => useHomePageCategoryNavigation('silver'), { wrapper });

    act(() => {
      result.current.prefetchCategory('gold');
    });

    expect(mockPrefetch).toHaveBeenCalledWith('/?category=gold');
  });

  it('prefetchCategory no-ops for the active category', () => {
    const { result } = renderHook(() => useHomePageCategoryNavigation('silver'), { wrapper });

    act(() => {
      result.current.prefetchCategory('silver');
    });

    expect(mockPrefetch).not.toHaveBeenCalled();
  });

  it('prefetchCategory warms default Home from an off-home route (PW-720)', () => {
    mockUsePathname.mockReturnValue('/gifting');
    const { result } = renderHook(() => useHomePageCategoryNavigation(), { wrapper });

    act(() => {
      result.current.prefetchCategory('silver');
    });

    expect(mockPrefetch).toHaveBeenCalledWith('/');
  });
});
