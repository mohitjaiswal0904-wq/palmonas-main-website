import { act, fireEvent, render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import { HeaderDesktopUtilityBar } from '@/components/layout/Header/components/HeaderDesktopUtilityBar';
import { getSearchDraftQuery, setSearchDraftQuery } from '@/lib/search/search-draft-query';
import type { SearchSuggestions } from '@/types/search-suggestions';

let mockComponentHydrated = true;
let mockPincode: string | null = null;
let mockShowPincode = false;
let mockShowBackNav = false;
let mockShowMobileSearchField = false;
let mockShowCart = false;
let mockShowWishlist = false;
let mockShowSearchIcon = false;
const mockRouterBack = jest.fn();
const mockRouterPush = jest.fn();
const mockRouterReplace = jest.fn();
let mockPathname = '/';
let mockSearchParams = new URLSearchParams();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    width,
    height,
    className,
  }: {
    alt: string;
    width: number;
    height: number;
    className?: string;
  }) => <img alt={alt} width={width} height={height} className={className} />,
}));

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mockRouterPush, back: mockRouterBack, replace: mockRouterReplace }),
  useSearchParams: () => mockSearchParams,
}));

jest.mock('@/hooks/useSearchAutocomplete', () => ({
  useSearchAutocomplete: () => ({ products: [], isLoading: false, error: null }),
}));

jest.mock('@/components/ui/AppLink', () => ({
  AppLink: ({
    href,
    children,
    prefetch: _prefetch,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: ReactNode;
    prefetch?: boolean;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/icons', () => ({
  CollectionGridIcon: () => null,
  HeartMenu: () => <span data-testid="wishlist-icon" />,
  MapPincode: () => null,
  MenuIcon: () => null,
  SearchIcon: () => <span data-testid="search-icon" />,
  StoreHeader: () => null,
}));

jest.mock('@/components/icons/cart-icons', () => ({
  CartBackIcon: () => <span data-testid="pdp-back-icon" />,
}));

jest.mock('@/hooks/cart/useCartStats', () => ({
  useCartStats: () => ({
    cartCount: 0,
    cartCountHydrated: true,
    wishlistCount: 0,
    wishlistCountHydrated: true,
  }),
}));

jest.mock('@/hooks/useAfterHydration', () => ({
  useAfterHydration: () => mockComponentHydrated,
}));

jest.mock('@/hooks/useMediaQuery', () => ({
  useMediaQuery: () => false,
}));

jest.mock('@/providers/PincodeProvider', () => ({
  useDeliveryPincode: () => ({
    pincode: mockPincode,
    pincodeHydrated: true,
    openModal: jest.fn(),
  }),
}));

const mockMobileSearchVisible = jest.fn(() => false);

jest.mock('@/lib/layout/header-utility-bar', () => {
  const actual = jest.requireActual(
    '@/lib/layout/header-utility-bar',
  ) as typeof import('@/lib/layout/header-utility-bar');

  return {
    ...actual,
    resolveHeaderUtilityBarVisibility: () => ({
      mobile: {
        showStoreLocator: false,
        showCart: mockShowCart,
        showWishlist: mockShowWishlist,
        showAccount: false,
        showPincode: mockShowPincode,
        showSearchIcon: mockShowSearchIcon,
        showSearch: mockMobileSearchVisible(),
        showBackNav: mockShowBackNav,
        showMobileSearchField: mockShowMobileSearchField,
      },
      laptop: {
        showStoreLocator: false,
        showCart: false,
        showWishlist: false,
        showAccount: false,
        showPincode: mockShowPincode,
        showSearchIcon: false,
        showSearch: false,
        showBackNav: false,
        showMobileSearchField: false,
      },
    }),
  };
});

jest.mock('@/components/layout/HeaderSearch', () => ({
  HeaderSearch: ({ className }: { className?: string }) => (
    <div data-testid="header-search" className={className}>
      <label htmlFor="header-search">Search products and collections</label>
      <input id="header-search" />
      <div role="listbox" aria-label="Search suggestions" />
    </div>
  ),
}));

const suggestions: SearchSuggestions = {
  popularTerms: [],
  recentSearchTerms: [],
  headerPopularTerms: [],
  popularCollections: [],
  exploreTerms: [],
};

describe('HeaderDesktopUtilityBar', () => {
  beforeEach(() => {
    mockMobileSearchVisible.mockReturnValue(false);
    mockComponentHydrated = true;
    mockPincode = null;
    mockShowPincode = false;
    mockShowBackNav = false;
    mockShowMobileSearchField = false;
    mockShowCart = false;
    mockShowWishlist = false;
    mockShowSearchIcon = false;
    mockRouterBack.mockReset();
    mockRouterPush.mockReset();
    mockRouterReplace.mockReset();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
    window.sessionStorage.clear();
    setSearchDraftQuery('');
  });

  it('keeps the bottom border on the home header', () => {
    const { container } = render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    expect(container.firstChild).toHaveClass('border-b');
  });

  it('preserves the logo aspect ratio across mobile and desktop headers', () => {
    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    const logos = screen.getAllByRole('img', { name: 'Palmonas' });

    expect(logos).toHaveLength(2);
    logos.forEach((logo) => {
      expect(logo).toHaveAttribute('width', '833');
      expect(logo).toHaveAttribute('height', '83');
      expect(logo).toHaveClass('h-auto', 'w-full', 'object-contain');
    });
  });

  it('gives the mobile logo a stable responsive width', () => {
    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    expect(screen.getAllByLabelText('Palmonas home')[0]).toHaveClass(
      'w-[137px]',
      'max-w-full',
      'shrink-0',
    );
  });

  describe('mobile search entry', () => {
    it('opens the search page from the homepage mobile search field', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const entry = screen.getByRole('link', { name: 'Search products and collections' });

      expect(entry).toHaveAttribute('href', '/search');
      expect(entry).toHaveTextContent('Search products...');
    });

    it('does not render the desktop dropdown on the mobile search entry', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      expect(screen.queryByRole('listbox', { name: 'Search suggestions' })).not.toBeInTheDocument();
      expect(screen.queryByTestId('header-search')).not.toBeInTheDocument();
    });

    it('renders home search placeholder at 13px on mobile', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const entry = screen.getByRole('link', { name: 'Search products and collections' });
      expect(entry).not.toHaveClass('text-base');
      expect(entry.querySelector('span')).toHaveClass('text-[13px]', 'text-[#c7c7c7]');
      expect(entry).toHaveTextContent('Search products...');
    });

    it('keeps the mobile search row expanded when searchChromeVisibility is 1', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      render(<HeaderDesktopUtilityBar suggestions={suggestions} searchChromeVisibility={1} />);

      const collapse = screen.getByTestId('header-mobile-search-collapse');
      expect(collapse).toHaveClass('grid-rows-[1fr]');
      expect(collapse.firstElementChild).toHaveClass('opacity-100');
      expect(collapse).not.toHaveAttribute('aria-hidden', 'true');
      expect(screen.getByRole('link', { name: 'Search products and collections' })).toBeVisible();
    });

    it('collapses the mobile search row when searchChromeVisibility is 0', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      render(<HeaderDesktopUtilityBar suggestions={suggestions} searchChromeVisibility={0} />);

      const collapse = screen.getByTestId('header-mobile-search-collapse');
      expect(collapse).toHaveClass('grid-rows-[0fr]');
      expect(collapse.firstElementChild).toHaveClass('opacity-0');
      expect(collapse).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('keeps the mobile logo left-aligned beside the menu button', () => {
    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    const brandRow = screen.getAllByLabelText('Palmonas home')[0]?.parentElement;

    expect(brandRow).toHaveClass('flex', 'flex-1', 'items-center', 'gap-1.5');
    expect(brandRow).not.toHaveClass('justify-center');
    expect(brandRow?.firstElementChild).toHaveAttribute(
      'aria-controls',
      'header-mobile-navigation',
    );
  });

  it('keeps the expanded mobile search entry visible', () => {
    mockMobileSearchVisible.mockReturnValue(true);
    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    const entry = screen.getByRole('link', { name: 'Search products and collections' });
    const searchShell = entry.parentElement;

    expect(searchShell).toHaveClass('relative', 'px-4', 'pb-2.5');
    expect(entry).toBeVisible();
  });

  it('hides a stored pincode until this header has hydrated', () => {
    mockComponentHydrated = false;
    mockPincode = '221007';
    mockShowPincode = true;

    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    expect(screen.getAllByRole('button', { name: 'Enter delivery pincode' })).toHaveLength(2);
    expect(screen.queryByText('221007')).not.toBeInTheDocument();
  });

  it('shows a stored pincode after this header has hydrated', () => {
    mockPincode = '221007';
    mockShowPincode = true;

    render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

    expect(screen.getAllByRole('button', { name: 'Update delivery pincode' })).toHaveLength(2);
    expect(screen.getAllByText('221007')).toHaveLength(2);
  });

  describe('mobile PDP header', () => {
    it('replaces the hamburger and logo with back navigation and title', () => {
      mockShowBackNav = true;
      mockShowCart = true;
      mockShowWishlist = true;
      mockShowSearchIcon = true;

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Palmonas home')).toBeTruthy();
      expect(screen.getAllByLabelText('Palmonas home')).toHaveLength(1);
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Wishlist')).toBeInTheDocument();
      expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
      expect(screen.getByLabelText('Open cart')).toHaveAttribute('id', 'cart-fly-target');
      expect(screen.getByLabelText('Open cart')).toHaveAttribute('data-cart-fly-target', 'header');
    });

    it('keeps the PDP back nav without a title', () => {
      mockShowBackNav = true;

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(screen.queryByText('Title')).not.toBeInTheDocument();
      expect(screen.queryByText('₹4,147')).not.toBeInTheDocument();
    });

    it('navigates back when the PDP back button is pressed', () => {
      mockShowBackNav = true;
      Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    it('falls back to home when there is no history to go back to', () => {
      mockShowBackNav = true;
      Object.defineProperty(window.history, 'length', { configurable: true, value: 1 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterPush).toHaveBeenCalledWith('/');
    });
  });

  describe('mobile wishlist header', () => {
    it('matches the back, title, search, and cart Figma layout', () => {
      mockPathname = '/wishlist';
      mockShowBackNav = true;
      mockShowCart = true;
      mockShowSearchIcon = true;

      const { container } = render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      const title = screen.getByText('Wishlist');
      expect(title).toHaveClass('text-base');
      expect(title.closest('.pt-5')).not.toBeNull();
      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
      expect(screen.queryByTestId('wishlist-icon')).not.toBeInTheDocument();
      expect(container.firstChild).not.toHaveClass('border-b');
    });
  });

  describe('mobile search header', () => {
    it('replaces the hamburger and logo with back navigation and a search field', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockShowCart = true;
      mockShowWishlist = true;
      mockPathname = '/search';

      const { container } = render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const input = screen.getByLabelText('Search products and collections');
      expect(screen.getByRole('button', { name: 'Go back' })).toBeInTheDocument();
      expect(input).toHaveValue('');
      expect(input).toHaveClass('text-[13px]');
      expect(input).toHaveClass('placeholder:text-[13px]');
      expect(screen.queryByLabelText('Open menu')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Wishlist')).toBeInTheDocument();
      expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
      expect(container.firstChild).not.toHaveClass('border-b');
      expect(input.closest('.pt-5')).not.toBeNull();
    });

    it('publishes the typed value so the search page can show suggestions', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const input = screen.getByRole('searchbox', { name: 'Search products and collections' });
      fireEvent.change(input, { target: { value: 'gold' } });

      expect(getSearchDraftQuery()).toBe('gold');
    });

    it('fills the field when a suggestion writes the draft query', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      act(() => {
        setSearchDraftQuery('Gold Ring');
      });

      expect(
        screen.getByRole('searchbox', { name: 'Search products and collections' }),
      ).toHaveValue('Gold Ring');
    });

    it('keeps the 13px search field when a query is in the URL', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockShowCart = true;
      mockShowWishlist = true;
      mockPathname = '/search';
      mockSearchParams = new URLSearchParams('q=diamond');

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const input = screen.getByLabelText('Search products and collections');
      expect(input).toHaveValue('diamond');
      expect(input).toHaveClass('text-[13px]');
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
      expect(screen.queryByText('diamond')).not.toBeInTheDocument();
      expect(screen.getByLabelText('Wishlist')).toBeInTheDocument();
      expect(screen.getByLabelText('Open cart')).toBeInTheDocument();
    });

    it('leaves search from results back instead of clearing the field', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';
      mockSearchParams = new URLSearchParams('q=diamond');
      window.sessionStorage.setItem('palmonas:search-return-path', '/');
      Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterBack).toHaveBeenCalledTimes(1);
      expect(mockRouterReplace).not.toHaveBeenCalledWith('/search');
    });

    it('auto-focuses the search field when the search header mounts', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';

      const pending: FrameRequestCallback[] = [];
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
        pending.push(callback);
        return pending.length;
      });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);

      const input = screen.getByLabelText('Search products and collections');
      expect(input).toHaveFocus();

      act(() => {
        pending.shift()?.(0);
      });

      expect(input).toHaveFocus();
    });

    it('clears a typed query and returns to /search', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.change(screen.getByLabelText('Search products and collections'), {
        target: { value: 'xyz' },
      });
      fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));

      expect(mockRouterReplace).toHaveBeenCalledWith('/search');
    });

    it('returns to home when search was opened from the homepage', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';
      window.sessionStorage.setItem('palmonas:search-return-path', '/');
      Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    it('returns to the PDP when search was opened from a product page', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';
      window.sessionStorage.setItem('palmonas:search-return-path', '/products/celeste-ring');
      Object.defineProperty(window.history, 'length', { configurable: true, value: 2 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterBack).toHaveBeenCalledTimes(1);
    });

    it('falls back to the stored return path when there is no history', () => {
      mockShowBackNav = true;
      mockShowMobileSearchField = true;
      mockPathname = '/search';
      window.sessionStorage.setItem('palmonas:search-return-path', '/products/celeste-ring');
      Object.defineProperty(window.history, 'length', { configurable: true, value: 1 });

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('button', { name: 'Go back' }));

      expect(mockRouterReplace).toHaveBeenCalledWith('/products/celeste-ring');
    });

    it('stores the current path when opening search from the homepage entry', () => {
      mockMobileSearchVisible.mockReturnValue(true);
      mockPathname = '/';
      window.history.replaceState({}, '', '/');

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByRole('link', { name: 'Search products and collections' }));

      expect(window.sessionStorage.getItem('palmonas:search-return-path')).toBe('/');
    });

    it('stores the PDP path when opening search from the product search icon', () => {
      mockShowBackNav = true;
      mockShowSearchIcon = true;
      mockPathname = '/products/celeste-ring';
      window.history.replaceState({}, '', '/products/celeste-ring');

      render(<HeaderDesktopUtilityBar suggestions={suggestions} />);
      fireEvent.click(screen.getByLabelText('Search'));

      expect(window.sessionStorage.getItem('palmonas:search-return-path')).toBe(
        '/products/celeste-ring',
      );
    });
  });
});
