import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { StickyAddToCartBar } from '@/components/product/StickyAddToCartBar';
import {
  cartMessages,
  formatStickyAddToCartA11y,
  formatStickyAddToCartLabel,
} from '@/config/cart/cart.config';
import { productMessages, productTheme } from '@/config/product/product.config';
import type { Product } from '@/types/product';

const mockAddItem = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();
const mockCreateAndCheckout = jest.fn();
const mockPush = jest.fn();

const mockPulseCartFlyTarget = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/lib/cart/add-to-cart-flight', () => ({
  pulseCartFlyTarget: (...args: unknown[]) => mockPulseCartFlyTarget(...args),
}));

jest.mock('@/hooks/navigation/useAppNavigate', () => ({
  useAppNavigate: () => ({ navigate: mockPush }),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    actions: {
      addItem: mockAddItem,
      updateQuantity: mockUpdateQuantity,
      removeItem: mockRemoveItem,
    },
    isMutating: false,
    updatingLineId: null,
    removingLineId: null,
  }),
}));

jest.mock('@/hooks/cart/useBuyNow', () => ({
  useBuyNow: () => ({
    createAndCheckout: mockCreateAndCheckout,
    loading: false,
  }),
}));

const mockOpenChooseOptions = jest.fn();
const mockUseProductCartState = jest.fn();
const mockTrackProductAddToCartClicked = jest.fn();
const mockTrackProductAddedToCart = jest.fn();
const mockTrackProductBuyNowClicked = jest.fn();

jest.mock('@/lib/analytics/track-product-cart-events', () => ({
  trackProductAddToCartClicked: (...args: unknown[]) => mockTrackProductAddToCartClicked(...args),
  trackProductAddedToCart: (...args: unknown[]) => mockTrackProductAddedToCart(...args),
  trackProductBuyNowClicked: (...args: unknown[]) => mockTrackProductBuyNowClicked(...args),
}));

jest.mock('@/hooks/cart/useProductCartState', () => ({
  useProductCartState: (...args: unknown[]) => mockUseProductCartState(...args),
}));

const mockUsePdpHeaderPriceVisibility = jest.fn();

jest.mock('@/hooks/product/usePdpHeaderPriceVisibility', () => ({
  usePdpHeaderPriceVisibility: () => mockUsePdpHeaderPriceVisibility(),
}));

jest.mock('@/providers/product/ChooseOptionsProvider', () => ({
  useChooseOptions: () => ({
    isOpen: false,
    params: null,
    openChooseOptions: mockOpenChooseOptions,
    closeChooseOptions: jest.fn(),
  }),
}));

const defaultVariant = {
  id: 'variant-1',
  title: 'Gold',
  price: 1000,
  availableForSale: true,
  selectedOptions: [{ name: 'Metal', value: 'Gold' }],
} as const satisfies Product['variants'][number];

const product: Product = {
  id: 'prod-1',
  handle: 'test-ring',
  name: 'Test Ring',
  description: '',
  price: 1000,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [defaultVariant],
};

describe('StickyAddToCartBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPulseCartFlyTarget.mockClear();
    mockAddItem.mockResolvedValue(undefined);
    mockUpdateQuantity.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockCreateAndCheckout.mockResolvedValue(undefined);
    mockUseProductCartState.mockReturnValue({
      showInCart: false,
      quantity: 0,
      lineId: undefined,
      markAddedLocally: jest.fn(),
      resolvedVariantId: 'variant-1',
    });
    mockUsePdpHeaderPriceVisibility.mockReturnValue({
      isHeaderPriceVisible: true,
      price: 1000,
      compareAtPrice: 1500,
    });
  });

  it('adds to cart when add button is clicked', async () => {
    render(<StickyAddToCartBar product={product} />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
      expect(mockTrackProductAddedToCart).toHaveBeenCalledWith(product, 'variant-1');
    });
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(product);
  });

  it('plays added motion immediately without a loader', async () => {
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    render(<StickyAddToCartBar product={product} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.getByRole('button', { name: cartMessages.a11y.addedToCart })).toBeDisabled();
    expect(screen.getByText(cartMessages.added)).toBeInTheDocument();
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();

    await act(async () => {
      resolveAdd?.();
    });
  });

  it('does not show a loader when add to cart fails', async () => {
    mockAddItem.mockRejectedValue(new Error('failed'));

    render(<StickyAddToCartBar product={product} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
    });
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalled();
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: cartMessages.a11y.addedToCart })).not.toBeInTheDocument();
  });

  it('plays the full added motion then returns to add to cart', async () => {
    render(<StickyAddToCartBar product={product} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addedToCart })).toBeDisabled();
      expect(screen.getByText(cartMessages.added)).toBeInTheDocument();
    });
    expect(screen.queryByTestId('product-pdp-quantity-stepper')).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
      },
      { timeout: productTheme.stickyBarAdded.durationMs + 500 },
    );
    expect(screen.queryByTestId('product-pdp-quantity-stepper')).not.toBeInTheDocument();
    expect(mockPulseCartFlyTarget).toHaveBeenCalled();
  });

  it('starts buy-now flow when buy now is clicked', async () => {
    render(<StickyAddToCartBar product={product} />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.buyNow }));

    await Promise.resolve();
    expect(mockTrackProductBuyNowClicked).toHaveBeenCalledWith(product);
    expect(mockCreateAndCheckout).toHaveBeenCalledWith('variant-1', 1, false);
  });

  it('keeps add to cart instead of a quantity stepper when the item is already in cart', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 2,
      lineId: 'line-1',
      markAddedLocally: jest.fn(),
      resolvedVariantId: 'variant-1',
    });

    render(<StickyAddToCartBar product={product} />);

    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: formatStickyAddToCartA11y(2) }),
    ).toBeInTheDocument();
    expect(screen.getByText(formatStickyAddToCartLabel(2))).toBeInTheDocument();
    expect(screen.queryByTestId('product-pdp-quantity-stepper')).not.toBeInTheDocument();
  });

  it('uses demifine ink CTA background', () => {
    render(<StickyAddToCartBar product={product} />);
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toHaveStyle({
      backgroundColor: '#151515',
    });
  });

  it('uses gold burgundy CTA background for gold products', () => {
    render(
      <StickyAddToCartBar product={{ ...product, productCategory: 'gold', handle: 'gold-ring' }} />,
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toHaveStyle({
      backgroundColor: '#502C3A',
    });
  });

  it('applies Figma sticky bar shadow on parent frame', () => {
    render(<StickyAddToCartBar product={product} />);
    expect(screen.getByRole('region', { name: cartMessages.a11y.addToCartActions })).toHaveStyle({
      boxShadow: '0px -2px 6px rgba(0, 0, 0, 0.15)',
      backgroundColor: '#F7F7F7',
    });
  });

  it('adds the provided PDP variant without opening choose options', async () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-2',
          title: 'Rose / 7',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal Color', value: 'Rose' },
            { name: 'Ring Size', value: '7' },
          ],
        },
      ],
    };
    mockUseProductCartState.mockReturnValue({
      showInCart: false,
      quantity: 0,
      lineId: undefined,
      markAddedLocally: jest.fn(),
      resolvedVariantId: 'variant-2',
    });

    render(<StickyAddToCartBar product={multiVariant} variantId="variant-2" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await Promise.resolve();
    expect(mockOpenChooseOptions).not.toHaveBeenCalled();
    expect(mockAddItem).toHaveBeenCalledWith('variant-2', 1);
  });

  it('buys the provided PDP variant without opening choose options', async () => {
    render(<StickyAddToCartBar product={product} variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.buyNow }));

    await Promise.resolve();
    expect(mockOpenChooseOptions).not.toHaveBeenCalled();
    expect(mockCreateAndCheckout).toHaveBeenCalledWith('variant-1', 1, false);
  });

  it('hides buy now and shows a disabled out-of-stock CTA when unavailable', () => {
    const outOfStockProduct: Product = {
      ...product,
      variants: [{ ...defaultVariant, availableForSale: false }],
    };

    render(<StickyAddToCartBar product={outOfStockProduct} variantId="variant-1" />);

    const region = screen.getByRole('region', { name: cartMessages.a11y.addToCartActions });
    const outOfStockCta = screen.getByRole('button', { name: cartMessages.outOfStockCta });

    expect(region).toHaveAttribute('data-out-of-stock', 'true');
    expect(screen.queryByRole('button', { name: cartMessages.a11y.buyNow })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: cartMessages.a11y.addToCart })).not.toBeInTheDocument();
    expect(outOfStockCta).toBeDisabled();
    expect(outOfStockCta).toHaveTextContent(cartMessages.outOfStockCta);
    expect(outOfStockCta).toHaveClass('opacity-40', 'cursor-not-allowed');
  });

  it('shows out-of-stock CTA when the API marks the product unavailable with no variants', () => {
    const outOfStockProduct: Product = {
      ...product,
      availableForSale: false,
      variants: [],
    };

    render(<StickyAddToCartBar product={outOfStockProduct} />);

    expect(screen.getByRole('region', { name: cartMessages.a11y.addToCartActions })).toHaveAttribute(
      'data-out-of-stock',
      'true',
    );
    expect(screen.queryByRole('button', { name: cartMessages.a11y.buyNow })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.outOfStockCta })).toBeDisabled();
  });

  it('does not add or buy when the selected variant is out of stock', async () => {
    const outOfStockProduct: Product = {
      ...product,
      variants: [{ ...defaultVariant, availableForSale: false }],
    };

    render(<StickyAddToCartBar product={outOfStockProduct} variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.outOfStockCta }));

    await Promise.resolve();
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(mockCreateAndCheckout).not.toHaveBeenCalled();
    expect(mockTrackProductAddToCartClicked).not.toHaveBeenCalled();
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
    expect(mockTrackProductBuyNowClicked).not.toHaveBeenCalled();
  });

  it('keeps gold product actions enabled even when availableForSale is false', () => {
    const goldOutOfStock: Product = {
      ...product,
      productCategory: 'gold',
      handle: 'gold-ring',
      variants: [{ ...defaultVariant, availableForSale: false }],
    };

    render(<StickyAddToCartBar product={goldOutOfStock} variantId="variant-1" />);

    expect(
      screen.getByRole('region', { name: cartMessages.a11y.addToCartActions }),
    ).not.toHaveAttribute('data-out-of-stock');
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeInTheDocument();
  });

  it('hides buy now and the quantity stepper when out of stock even if item was in cart', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 1,
      lineId: 'line-1',
      markAddedLocally: jest.fn(),
      resolvedVariantId: 'variant-1',
    });

    const outOfStockProduct: Product = {
      ...product,
      variants: [{ ...defaultVariant, availableForSale: false }],
    };

    render(<StickyAddToCartBar product={outOfStockProduct} variantId="variant-1" />);

    expect(screen.queryByRole('button', { name: cartMessages.a11y.buyNow })).not.toBeInTheDocument();
    expect(screen.queryByTestId('product-pdp-quantity-stepper')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.outOfStockCta })).toBeDisabled();
  });

  it('hides the sticky price while the header price is still in view', () => {
    const { container } = render(<StickyAddToCartBar product={product} />);

    expect(screen.queryByLabelText(productMessages.a11y.stickyBarPrice)).not.toBeInTheDocument();
    expect(container.querySelector('[data-visible="false"]')).toHaveClass('sticky-bar-price-reveal');
  });

  it('shows selling and compare prices when the header price is scrolled out of view', () => {
    mockUsePdpHeaderPriceVisibility.mockReturnValue({
      isHeaderPriceVisible: false,
      price: 1000,
      compareAtPrice: 1500,
    });

    render(<StickyAddToCartBar product={product} />);

    const stickyPrice = screen.getByLabelText(productMessages.a11y.stickyBarPrice);
    expect(stickyPrice).toHaveAttribute('data-visible', 'true');
    expect(stickyPrice).toHaveClass('sticky-bar-price-reveal', 'shrink-0', 'laptop:ml-auto');
    expect(stickyPrice).toHaveTextContent('₹1,000');
    expect(stickyPrice).toHaveTextContent('₹1,500');
    expect(stickyPrice.textContent?.replace(/\s+/g, '')).toMatch(/^₹1,500₹1,000/);
    expect(screen.getByText('₹1,500')).toHaveClass('sticky-bar-compare', 'whitespace-nowrap');
    expect(screen.getByText('₹1,000')).toHaveClass('sticky-bar-selling-inner');
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toHaveClass(
      'sticky-bar-atc-shine',
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toHaveClass(
      'whitespace-nowrap',
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow }).parentElement).toHaveClass(
      'min-w-0',
      'flex-1',
      'laptop:flex-none',
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeInTheDocument();
  });

  it('omits compare-at on the sticky bar when it is not higher than selling price', () => {
    mockUsePdpHeaderPriceVisibility.mockReturnValue({
      isHeaderPriceVisible: false,
      price: 1000,
      compareAtPrice: 900,
    });

    const { container } = render(<StickyAddToCartBar product={product} />);

    expect(screen.getByLabelText(productMessages.a11y.stickyBarPrice)).toHaveTextContent('₹1,000');
    expect(container.querySelector('.sticky-bar-compare')).toBeNull();
  });

  it('does not show a sticky price when the header amount is missing', () => {
    mockUsePdpHeaderPriceVisibility.mockReturnValue({
      isHeaderPriceVisible: false,
      price: null,
      compareAtPrice: null,
    });

    render(<StickyAddToCartBar product={product} />);

    expect(screen.queryByLabelText(productMessages.a11y.stickyBarPrice)).not.toBeInTheDocument();
  });
});
