import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ShraddhasFavouriteShopByLookAddButton } from '@/components/shraddhas-favourite/ShraddhasFavouriteShopByLookAddButton';
import { cartMessages } from '@/config/cart/cart.config';
import type { Product } from '@/types/product';

const mockAddItem = jest.fn();
const mockShowError = jest.fn();
const mockMarkAddedLocally = jest.fn();
const mockUseProductCartState = jest.fn();
const mockUseAuth = jest.fn();
const mockFetchQuery = jest.fn();
const mockTrackProductAddToCartClicked = jest.fn();
const mockTrackProductAddedToCart = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ fetchQuery: mockFetchQuery }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({ actions: { addItem: mockAddItem } }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showError: mockShowError }),
}));

jest.mock('@/hooks/cart/useProductCartState', () => ({
  useProductCartState: (...args: unknown[]) => mockUseProductCartState(...args),
}));

jest.mock('@/lib/analytics/track-product-cart-events', () => ({
  trackProductAddToCartClicked: (...args: unknown[]) => mockTrackProductAddToCartClicked(...args),
  trackProductAddedToCart: (...args: unknown[]) => mockTrackProductAddedToCart(...args),
}));

const product: Product = {
  id: 'prod-1',
  handle: 'look-ring',
  name: 'Look Ring',
  description: '',
  price: 2500,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-1',
      title: 'Gold',
      price: 2500,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal', value: 'Gold' }],
    },
  ],
};

describe('ShraddhasFavouriteShopByLookAddButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddItem.mockResolvedValue(undefined);
    mockFetchQuery.mockResolvedValue(product);
    mockUseAuth.mockReturnValue({ session: { userId: 'user-1' }, isLoading: false });
    mockUseProductCartState.mockReturnValue({
      showInCart: false,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });
  });

  it('adds the resolved variant and tracks add-to-cart analytics', async () => {
    render(<ShraddhasFavouriteShopByLookAddButton product={product} />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
      expect(mockTrackProductAddedToCart).toHaveBeenCalledWith(product, 'variant-1');
    });
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(product);
    expect(mockMarkAddedLocally).toHaveBeenCalled();
  });

  it('fetches product detail when the list payload has no variant id', async () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: false,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: undefined,
    });
    mockFetchQuery.mockResolvedValue(product);

    render(
      <ShraddhasFavouriteShopByLookAddButton product={{ ...product, variants: [] }} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockFetchQuery).toHaveBeenCalled();
      expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
      expect(mockTrackProductAddedToCart).toHaveBeenCalledWith(
        { ...product, variants: [] },
        'variant-1',
      );
    });
  });

  it('does not track analytics when the shopper is not signed in', () => {
    mockUseAuth.mockReturnValue({ session: null, isLoading: false });

    render(<ShraddhasFavouriteShopByLookAddButton product={product} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(mockShowError).toHaveBeenCalledWith(cartMessages.errors.addItem);
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(mockTrackProductAddToCartClicked).not.toHaveBeenCalled();
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
  });

  it('tracks click but not conversion when add to cart fails', async () => {
    mockAddItem.mockRejectedValue(new Error('failed'));

    render(<ShraddhasFavouriteShopByLookAddButton product={product} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
    });
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(product);
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
  });
});
