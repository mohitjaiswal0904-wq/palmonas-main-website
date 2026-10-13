import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { AddToCartButton } from '@/components/product/AddToCartButton';
import { cartMessages } from '@/config/cart/cart.config';
import type { Product } from '@/types/product';

const mockAddItem = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockRemoveItem = jest.fn();
const mockCreateAndCheckout = jest.fn();
const mockMarkAddedLocally = jest.fn();
const mockUseProductCartState = jest.fn();

const mockPathname = jest.fn(() => '/');
const mockPlayAddToCartFlight = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/cart/add-to-cart-flight', () => ({
  isCollectionAddToCartFlightPath: (pathname: string) =>
    pathname === '/' || pathname === '/collections' || pathname.startsWith('/collections/'),
  playAddToCartFlight: (...args: unknown[]) => mockPlayAddToCartFlight(...args),
  subscribeAddToCartFlight: () => () => undefined,
}));

jest.mock('@/hooks/navigation/useAppNavigate', () => ({
  useAppNavigate: () => ({ navigate: jest.fn() }),
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
  }),
}));

jest.mock('@/hooks/cart/useProductCartState', () => ({
  useProductCartState: (...args: unknown[]) => mockUseProductCartState(...args),
}));

const mockOpenChooseOptions = jest.fn();
const mockTrackProductAddToCartClicked = jest.fn();
const mockTrackProductAddedToCart = jest.fn();
const mockTrackProductBuyNowClicked = jest.fn();

jest.mock('@/lib/analytics/track-product-cart-events', () => ({
  trackProductAddToCartClicked: (...args: unknown[]) => mockTrackProductAddToCartClicked(...args),
  trackProductAddedToCart: (...args: unknown[]) => mockTrackProductAddedToCart(...args),
  trackProductBuyNowClicked: (...args: unknown[]) => mockTrackProductBuyNowClicked(...args),
}));

jest.mock('@/providers/product/ChooseOptionsProvider', () => ({
  useChooseOptions: () => ({
    isOpen: false,
    params: null,
    openChooseOptions: mockOpenChooseOptions,
    closeChooseOptions: jest.fn(),
  }),
}));

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
  variants: [
    {
      id: 'variant-1',
      title: 'Gold',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal', value: 'Gold' }],
    },
  ],
};

describe('AddToCartButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddItem.mockResolvedValue(undefined);
    mockUpdateQuantity.mockResolvedValue(undefined);
    mockRemoveItem.mockResolvedValue(undefined);
    mockCreateAndCheckout.mockResolvedValue(undefined);
    mockOpenChooseOptions.mockClear();
    mockPathname.mockReturnValue('/');
    mockPlayAddToCartFlight.mockClear();
    mockUseProductCartState.mockReturnValue({
      showInCart: false,
      quantity: 0,
      lineQuantity: 0,
      lineId: undefined,
      matchingLines: [],
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });
  });

  it('calls addItem for single-variant product', async () => {
    render(<AddToCartButton product={product} variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
      expect(mockMarkAddedLocally).toHaveBeenCalled();
      expect(mockTrackProductAddedToCart).toHaveBeenCalledWith(product, 'variant-1');
    });
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(product);
  });

  it('shows a loader on the default add-to-cart button while adding', async () => {
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    render(<AddToCartButton product={product} variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.getByRole('button', { name: cartMessages.addingToCart })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    await act(async () => {
      resolveAdd?.();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
    });
  });

  it('shows a loader on the look-card add-to-cart button while adding', async () => {
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    render(<AddToCartButton product={product} variant="look-card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.getByRole('button', { name: cartMessages.addingToCart })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    await act(async () => {
      resolveAdd?.();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
    });
  });

  it('shows a loader on the card add-to-cart button while adding', async () => {
    mockPathname.mockReturnValue('/wishlist');
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.getByRole('button', { name: cartMessages.addingToCart })).toBeDisabled();
    expect(screen.getByRole('status', { name: 'Loading' })).toBeInTheDocument();

    await act(async () => {
      resolveAdd?.();
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
    });
  });

  it('flies to cart after a collection card add', async () => {
    mockPathname.mockReturnValue('/collections/rings');
    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockPlayAddToCartFlight).toHaveBeenCalledWith(
        expect.objectContaining({
          imageUrl: product.image,
          productHandle: product.handle,
        }),
      );
    });
  });

  it('flies to cart after a homepage card add', async () => {
    mockPathname.mockReturnValue('/');
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );
    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(mockPlayAddToCartFlight).toHaveBeenCalledWith(
      expect.objectContaining({
        imageUrl: product.image,
        productHandle: product.handle,
      }),
    );
    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();

    await act(async () => {
      resolveAdd?.();
    });
  });

  it('does not fly to cart from a non-collection card add', async () => {
    mockPathname.mockReturnValue('/wishlist');
    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled();
    });
    expect(mockPlayAddToCartFlight).not.toHaveBeenCalled();
  });

  it('presses the card CTA then reveals the stepper after add', async () => {
    mockPathname.mockReturnValue('/wishlist');
    let resolveAdd: (() => void) | undefined;
    mockAddItem.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAdd = resolve;
        }),
    );

    const { rerender } = render(
      <AddToCartButton product={product} variant="card" variantId="variant-1" />,
    );
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.getByRole('button', { name: cartMessages.addingToCart })).toHaveClass(
      'card-atc-press',
    );

    await act(async () => {
      resolveAdd?.();
    });
    await waitFor(() => {
      expect(mockMarkAddedLocally).toHaveBeenCalled();
    });

    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 1,
      lineQuantity: 1,
      lineId: 'line-1',
      matchingLines: [{ id: 'line-1', quantity: 1, variantId: 'variant-1' }],
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });
    rerender(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveClass('a2c-qty-reveal');
  });

  it('does not show a loader when choose-options is required', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };

    render(<AddToCartButton product={multiVariant} />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    expect(screen.queryByRole('status', { name: 'Loading' })).not.toBeInTheDocument();
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('renders card variant with bag icon', () => {
    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toHaveClass(
      'size-[22px]',
    );
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart }).className).not.toContain(
      'w-[14%]',
    );
  });

  it('shows a quantity stepper on the card when the product is in cart', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 2,
      lineQuantity: 2,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveTextContent('2');
    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveClass('h-[22px]');
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('line-1', 3);
  });

  it('shows a loader on the card stepper while quantity updates', async () => {
    let resolveUpdate: (() => void) | undefined;
    mockUpdateQuantity.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveUpdate = resolve;
        }),
    );
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 2,
      lineQuantity: 2,
      lineId: 'line-1',
      matchingLines: [{ id: 'line-1', quantity: 2, variantId: 'variant-1' }],
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));

    expect(screen.getByRole('status', { name: cartMessages.a11y.updatingQuantity })).toBeInTheDocument();

    await act(async () => {
      resolveUpdate?.();
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('status', { name: cartMessages.a11y.updatingQuantity }),
      ).not.toBeInTheDocument();
    });
  });

  it('does not show a stepper loader when plus opens the variant chooser', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 3,
      lineQuantity: 1,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={multiVariant} variant="card" />);

    expect(screen.getByTestId('product-card-quantity-stepper')).toHaveTextContent('3');
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('status', { name: cartMessages.a11y.updatingQuantity }),
    ).not.toBeInTheDocument();
    expect(mockOpenChooseOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        product: multiVariant,
        intent: 'addToCart',
      }),
    );
  });

  it('opens the quantity picker when increasing a multi-variant card with in-cart lines', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };
    const matchingLines = [
      { id: 'line-1', quantity: 1, variantId: 'variant-1' },
      { id: 'line-2', quantity: 2, variantId: 'variant-3' },
    ];
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 3,
      lineQuantity: 1,
      lineId: 'line-1',
      matchingLines,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={multiVariant} variant="card" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
    expect(mockOpenChooseOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        product: multiVariant,
        intent: 'removeFromCart',
        matchingLines,
      }),
    );
  });

  it('opens a remove picker when decreasing a multi-variant card with several lines', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };
    const matchingLines = [
      { id: 'line-1', quantity: 1, variantId: 'variant-1' },
      { id: 'line-2', quantity: 2, variantId: 'variant-3' },
    ];
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 3,
      lineQuantity: 1,
      lineId: 'line-1',
      matchingLines,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={multiVariant} variant="card" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(mockRemoveItem).not.toHaveBeenCalled();
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
    expect(mockOpenChooseOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        product: multiVariant,
        intent: 'removeFromCart',
        matchingLines,
      }),
    );
  });

  it('opens the remove sheet for a multi-variant card with a single in-cart line', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };
    const matchingLines = [{ id: 'line-1', quantity: 2, variantId: 'variant-1' }];
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 2,
      lineQuantity: 2,
      lineId: 'line-1',
      matchingLines,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={multiVariant} variant="card" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
    expect(mockOpenChooseOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        intent: 'removeFromCart',
        matchingLines,
      }),
    );
  });

  it('removes the matched line when decreasing a summed card quantity whose line is one', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 3,
      lineQuantity: 1,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(mockRemoveItem).toHaveBeenCalledWith('line-1');
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  it('removes the cart line when the card stepper decreases from one', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 1,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(mockRemoveItem).toHaveBeenCalledWith('line-1');
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  it('adds again from the card stepper when cart quantity is known without a line id', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 1,
      lineId: undefined,
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variant="card" variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(mockAddItem).toHaveBeenCalledWith('variant-1', 1);
    expect(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity })).toBeDisabled();
  });

  it('shows a PDP quantity stepper when the product is already in cart', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 2,
      lineQuantity: 2,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variantId="variant-1" />);

    expect(screen.getByTestId('product-pdp-quantity-stepper')).toHaveTextContent('2');
    expect(screen.queryByRole('button', { name: cartMessages.goToCart })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.increaseQuantity }));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('line-1', 3);
  });

  it('removes the cart line when the PDP stepper decreases from one', () => {
    mockUseProductCartState.mockReturnValue({
      showInCart: true,
      quantity: 1,
      lineId: 'line-1',
      markAddedLocally: mockMarkAddedLocally,
      resolvedVariantId: 'variant-1',
    });

    render(<AddToCartButton product={product} variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.decreaseQuantity }));
    expect(mockRemoveItem).toHaveBeenCalledWith('line-1');
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  it('opens choose-options sheet for multi-variant product', () => {
    const multiVariant: Product = {
      ...product,
      variants: [
        ...product.variants,
        {
          id: 'variant-3',
          title: 'Rose',
          price: 1100,
          availableForSale: true,
          selectedOptions: [
            { name: 'Metal', value: 'Gold' },
            { name: 'Size', value: '7' },
          ],
        },
      ],
    };

    render(<AddToCartButton product={multiVariant} />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));
    expect(mockAddItem).not.toHaveBeenCalled();
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(multiVariant);
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
    expect(mockOpenChooseOptions).toHaveBeenCalledWith(
      expect.objectContaining({
        product: multiVariant,
        intent: 'addToCart',
      }),
    );
  });

  it('runs buy now for single variant product', async () => {
    render(<AddToCartButton product={product} variantId="variant-1" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.buyItNow }));

    await Promise.resolve();
    expect(mockTrackProductBuyNowClicked).toHaveBeenCalledWith(product);
    expect(mockCreateAndCheckout).toHaveBeenCalledWith('variant-1', 1, false);
  });
});
