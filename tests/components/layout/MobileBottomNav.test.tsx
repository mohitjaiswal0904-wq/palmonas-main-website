import { fireEvent, render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';

import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { bottomNavMessages } from '@/config/layout/bottom-nav.config';
import { cartMessages } from '@/config/cart/cart.config';
import { HomePageCategoryNavigationProvider } from '@/providers/home/HomePageCategoryNavigationProvider';

const mockPush = jest.fn();
const mockUsePathname = jest.fn();
const mockUseSearchParams = jest.fn();
const mockNavigate = jest.fn((href: string) => {
  mockPush(href);
});

jest.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: mockPush,
    prefetch: jest.fn(),
  }),
  useSearchParams: () => mockUseSearchParams(),
}));

jest.mock('@/hooks/navigation/useAppNavigate', () => ({
  useAppNavigate: () => ({ navigate: mockNavigate }),
}));

jest.mock('@/hooks/cart/useCartStats', () => ({
  useCartStats: () => ({
    cartCount: 0,
    cartCountHydrated: true,
    wishlistCount: 0,
    wishlistCountHydrated: true,
  }),
}));

jest.mock('@/providers/navigation/NavigationPendingProvider', () => ({
  useNavigationPending: () => ({
    pendingHref: null,
    startNavigation: jest.fn(),
    clearNavigation: jest.fn(),
  }),
}));

function renderWithProviders(ui: ReactNode) {
  return render(
    <HomePageCategoryNavigationProvider>{ui}</HomePageCategoryNavigationProvider>,
  );
}

describe('MobileBottomNav', () => {
  const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => undefined);

  beforeEach(() => {
    jest.clearAllMocks();
    document.body.className = '';
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());
  });

  afterAll(() => {
    scrollToSpy.mockRestore();
  });

  it('renders home route tabs with cart last on mobile-visible routes', () => {
    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('navigation', { name: bottomNavMessages.a11y.navLabel })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.home })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.gold })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.demifine })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.gifts })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: cartMessages.a11y.openCart })).toBeInTheDocument();
  });

  it('renders demifine route tabs when category=demifine', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=demifine'));

    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('button', { name: bottomNavMessages.labels.bestsellers })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: bottomNavMessages.labels.gold })).not.toBeInTheDocument();
  });

  it('renders gold route tabs with proposal ring and 9 KT labels when category=gold', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=gold'));

    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('button', { name: bottomNavMessages.labels['proposal-ring'] })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: bottomNavMessages.labels['nine-kt'] })).toBeInTheDocument();
  });

  it('navigates to offers page from demifine bottom nav', () => {
    mockUseSearchParams.mockReturnValue(new URLSearchParams('category=demifine'));

    renderWithProviders(<MobileBottomNav />);

    fireEvent.click(screen.getByRole('button', { name: bottomNavMessages.labels.offers }));

    expect(mockNavigate).toHaveBeenCalledWith('/offers');
    expect(mockPush).toHaveBeenCalledWith('/offers');
  });

  it('navigates to gifting page from the bottom nav button', () => {
    renderWithProviders(<MobileBottomNav />);

    fireEvent.click(screen.getByRole('button', { name: bottomNavMessages.labels.gifts }));

    expect(mockNavigate).toHaveBeenCalledWith('/gifting');
    expect(mockPush).toHaveBeenCalledWith('/gifting');
  });

  it('marks gifts as the current page on /gifting', () => {
    mockUsePathname.mockReturnValue('/gifting');

    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('button', { name: bottomNavMessages.labels.gifts })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.home })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates to Home from the gifting bottom nav (PW-720)', () => {
    mockUsePathname.mockReturnValue('/gifting');

    renderWithProviders(<MobileBottomNav />);

    fireEvent.click(screen.getByRole('button', { name: bottomNavMessages.labels.home }));

    expect(mockPush).toHaveBeenCalledWith('/', { scroll: true });
  });

  it('links to cart from the trailing cart tab', () => {
    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('link', { name: cartMessages.a11y.openCart })).toHaveAttribute(
      'href',
      '/cart',
    );
  });

  it('marks silver home as the current page on the default route', () => {
    renderWithProviders(<MobileBottomNav />);

    expect(screen.getByRole('button', { name: bottomNavMessages.labels.home })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: bottomNavMessages.labels.demifine })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('navigates to demifine via category query from the demifine tab button', () => {
    mockUsePathname.mockReturnValue('/');
    mockUseSearchParams.mockReturnValue(new URLSearchParams());

    renderWithProviders(<MobileBottomNav />);

    fireEvent.click(screen.getByRole('button', { name: bottomNavMessages.labels.demifine }));

    expect(mockPush).toHaveBeenCalledWith('/?category=demifine', { scroll: true });
  });

  it('does not render outside configured routes', () => {
    mockUsePathname.mockReturnValue('/products/ring');

    renderWithProviders(<MobileBottomNav />);

    expect(screen.queryByTestId('mobile-bottom-nav')).not.toBeInTheDocument();
    expect(document.body.classList.contains('has-mobile-bottom-nav')).toBe(false);
  });

  it('adds body padding class while visible', () => {
    renderWithProviders(<MobileBottomNav />);

    expect(document.body.classList.contains('has-mobile-bottom-nav')).toBe(true);
  });
});
