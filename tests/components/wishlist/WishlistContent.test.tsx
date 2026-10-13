import { render, screen } from '@testing-library/react';

import { WishlistContent } from '@/components/wishlist/WishlistContent';
import { useWishlistPage } from '@/hooks/useWishlistPage';
import { AppError } from '@/lib/errors';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistItem } from '@/types/wishlist';

jest.mock('@/hooks/useWishlistPage', () => ({
  useWishlistPage: jest.fn(),
}));

jest.mock('@/components/wishlist/WishlistCategoryPanel', () => ({
  WishlistCategoryPanel: () => <div data-testid="wishlist-category-panel" />,
}));

jest.mock('@/components/wishlist/WishlistRemoveConfirmModal', () => ({
  WishlistRemoveConfirmModal: () => null,
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children?: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

const mockUseWishlistPage = useWishlistPage as jest.MockedFunction<typeof useWishlistPage>;

function makeItem(name: string): WishlistItem {
  return {
    productId: name,
    variantId: `${name}-variant`,
    product: {
      id: name,
      handle: name,
      name,
      description: '',
      price: 999,
      image: 'https://example.com/product.jpg',
      images: ['https://example.com/product.jpg'],
      category: PRODUCT_CATEGORY.GOLD,
      productCategory: PRODUCT_CATEGORY.GOLD,
      offers: [],
      variants: [],
    },
  };
}

function authenticatedPage(
  overrides: Partial<ReturnType<typeof useWishlistPage>> = {},
): ReturnType<typeof useWishlistPage> {
  return {
    items: [makeItem('a'), makeItem('b'), makeItem('c')],
    filteredItems: [makeItem('a'), makeItem('b'), makeItem('c')],
    itemCount: 3,
    activeFilter: 'all',
    availableFilters: ['demifine', 'gold', 'all'],
    setActiveFilter: jest.fn(),
    isLoading: false,
    isClearing: false,
    removingProductId: null,
    error: null,
    isAuthenticated: true,
    openLogin: jest.fn(),
    clearAll: jest.fn(),
    removeItem: jest.fn(),
    refetch: jest.fn(),
    ...overrides,
  };
}

describe('WishlistContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('hides the page heading on mobile and tablet', () => {
    mockUseWishlistPage.mockReturnValue(authenticatedPage());

    render(<WishlistContent />);

    const heading = screen.getByRole('heading', { name: /my wishlist/i });
    expect(heading.parentElement).toHaveClass('hidden', 'laptop:block');
    expect(screen.getByTestId('wishlist-category-panel')).toBeInTheDocument();
  });

  it('keeps the heading in the DOM for desktop', () => {
    mockUseWishlistPage.mockReturnValue(authenticatedPage({ itemCount: 3 }));

    render(<WishlistContent />);

    expect(screen.getByRole('heading', { name: /my wishlist/i })).toBeInTheDocument();
    expect(screen.getByText('3 items saved')).toBeInTheDocument();
  });

  it('shows the sign-in empty state when unauthenticated', () => {
    mockUseWishlistPage.mockReturnValue(
      authenticatedPage({
        isAuthenticated: false,
        items: [],
        filteredItems: [],
        itemCount: 0,
      }),
    );

    render(<WishlistContent />);

    expect(screen.getByRole('heading', { name: /sign in to view your wishlist/i })).toBeInTheDocument();
    expect(screen.queryByTestId('wishlist-category-panel')).not.toBeInTheDocument();
  });

  it('shows the error message when wishlist load fails', () => {
    mockUseWishlistPage.mockReturnValue(
      authenticatedPage({
        error: new AppError('NETWORK', 'Network failed'),
        filteredItems: [],
      }),
    );

    render(<WishlistContent />);

    expect(screen.getByText('Network failed')).toBeInTheDocument();
    expect(screen.queryByTestId('wishlist-category-panel')).not.toBeInTheDocument();
  });
});
