import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { ChooseOptionsSheet } from '@/components/product/ChooseOptionsSheet';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { productTheme } from '@/config/product/product.config';
import type { Product } from '@/types/product';

const mockAddItem = jest.fn();
const mockCreateAndCheckout = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt }: { alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} />
  ),
}));

const mockPathname = jest.fn(() => '/');
const mockPlayAddToCartFlight = jest.fn();
const mockPulseCartFlyTarget = jest.fn();

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}));

jest.mock('@/lib/cart/add-to-cart-flight', () => ({
  isCollectionAddToCartFlightPath: (pathname: string) =>
    pathname === '/' || pathname === '/collections' || pathname.startsWith('/collections/'),
  playAddToCartFlight: (...args: unknown[]) => mockPlayAddToCartFlight(...args),
  pulseCartFlyTarget: (...args: unknown[]) => mockPulseCartFlyTarget(...args),
}));

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({ actions: { addItem: mockAddItem } }),
}));

jest.mock('@/hooks/cart/useBuyNow', () => ({
  useBuyNow: () => ({ createAndCheckout: mockCreateAndCheckout, loading: false }),
}));

const mockTrackProductAddToCartClicked = jest.fn();
const mockTrackProductAddedToCart = jest.fn();
const mockTrackProductBuyNowClicked = jest.fn();

jest.mock('@/lib/analytics/track-product-cart-events', () => ({
  trackProductAddToCartClicked: (...args: unknown[]) => mockTrackProductAddToCartClicked(...args),
  trackProductAddedToCart: (...args: unknown[]) => mockTrackProductAddedToCart(...args),
  trackProductBuyNowClicked: (...args: unknown[]) => mockTrackProductBuyNowClicked(...args),
}));

const product: Product = {
  id: 'product-1',
  handle: 'test-ring',
  name: 'Test Ring',
  description: '',
  price: 1000,
  compareAtPrice: 1500,
  image: 'https://cdn.example.com/ring.jpg',
  images: ['https://cdn.example.com/ring.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'variant-gold',
      title: 'Gold',
      price: 1000,
      compareAtPrice: 1500,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal Colour', value: 'Gold' }],
    },
    {
      id: 'variant-rose',
      title: 'Rose Gold',
      price: 1200,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal Colour', value: 'Rose Gold' }],
    },
  ],
};

describe('ChooseOptionsSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPathname.mockReturnValue('/');
    mockAddItem.mockResolvedValue(undefined);
    mockCreateAndCheckout.mockResolvedValue(undefined);
  });

  it('shows product details, stock, and both actions for add-to-cart intent', () => {
    render(
      <ChooseOptionsSheet
        open
        onClose={jest.fn()}
        product={product}
        intent="addToCart"
      />,
    );

    expect(screen.getByRole('img', { name: product.name })).toBeInTheDocument();
    expect(screen.getByText(cartMessages.inStock, { exact: false })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: cartMessages.a11y.addToCart }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeInTheDocument();
  });

  it('adds the selected variant, plays the CTA motion, then closes the sheet', async () => {
    const onClose = jest.fn();
    const onAddedToCart = jest.fn();
    render(
      <ChooseOptionsSheet
        open
        onClose={onClose}
        product={product}
        intent="addToCart"
        onAddedToCart={onAddedToCart}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Select Rose Gold' }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => expect(mockAddItem).toHaveBeenCalledWith('variant-rose', 1));
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalledWith(product);
    expect(mockTrackProductAddedToCart).toHaveBeenCalledWith(product, 'variant-rose');
    expect(onAddedToCart).toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addedToCart })).toBeDisabled();
    });
    expect(screen.getByText(cartMessages.added)).toBeInTheDocument();

    await waitFor(
      () => {
        expect(onClose).toHaveBeenCalled();
      },
      { timeout: productTheme.stickyBarAdded.durationMs + 500 },
    );
    expect(mockPulseCartFlyTarget).toHaveBeenCalled();
  });

  it('shows only Buy Now for buy-now intent and starts checkout', async () => {
    render(
      <ChooseOptionsSheet open onClose={jest.fn()} product={product} intent="buyNow" />,
    );

    expect(
      screen.queryByRole('button', { name: cartMessages.a11y.addToCart }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.buyNow }));

    await waitFor(() =>
      expect(mockCreateAndCheckout).toHaveBeenCalledWith('variant-gold', 1, false),
    );
    expect(mockTrackProductBuyNowClicked).toHaveBeenCalledWith(product);
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
  });

  it('disables actions when every variant is out of stock', () => {
    const unavailableProduct: Product = {
      ...product,
      variants: product.variants.map((variant) => ({
        ...variant,
        availableForSale: false,
      })),
    };
    render(
      <ChooseOptionsSheet
        open
        onClose={jest.fn()}
        product={unavailableProduct}
        intent="addToCart"
      />,
    );

    expect(screen.getByText(cartMessages.outOfStock)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeDisabled();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeDisabled();
  });

  it('keeps gold purchasable when catalog marks variants out of stock', () => {
    const goldUnavailable: Product = {
      ...product,
      productCategory: 'gold',
      variants: product.variants.map((variant) => ({
        ...variant,
        availableForSale: false,
        quantityAvailable: 0,
      })),
    };
    render(
      <ChooseOptionsSheet
        open
        onClose={jest.fn()}
        product={goldUnavailable}
        intent="addToCart"
      />,
    );

    expect(screen.getByText(cartMessages.inStock, { exact: false })).toBeInTheDocument();
    expect(screen.queryByText(cartMessages.outOfStock)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeEnabled();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
  });

  it('disables actions when gold product has no variants', () => {
    const goldNoVariants: Product = {
      ...product,
      productCategory: 'gold',
      variants: [],
    };
    render(
      <ChooseOptionsSheet
        open
        onClose={jest.fn()}
        product={goldNoVariants}
        intent="addToCart"
      />,
    );

    expect(screen.getByRole('button', { name: cartMessages.a11y.buyNow })).toBeDisabled();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeDisabled();
  });

  it('keeps the sheet open when adding fails', async () => {
    const onClose = jest.fn();
    mockAddItem.mockRejectedValueOnce(new Error('Request failed'));
    render(
      <ChooseOptionsSheet open onClose={onClose} product={product} intent="addToCart" />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => expect(mockAddItem).toHaveBeenCalled());
    expect(mockTrackProductAddToCartClicked).toHaveBeenCalled();
    expect(mockTrackProductAddedToCart).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeEnabled();
    });
  });

  it('flies to cart after a collection sheet add', async () => {
    mockPathname.mockReturnValue('/collections/rings');
    render(<ChooseOptionsSheet open onClose={jest.fn()} product={product} intent="addToCart" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockPlayAddToCartFlight).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: product.image }),
      );
    });
  });

  it('flies to cart after a homepage sheet add', async () => {
    mockPathname.mockReturnValue('/');
    render(<ChooseOptionsSheet open onClose={jest.fn()} product={product} intent="addToCart" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockPlayAddToCartFlight).toHaveBeenCalledWith(
        expect.objectContaining({ imageUrl: product.image }),
      );
    });
  });

  it('does not fly to cart when the sheet is not on a collection', async () => {
    mockPathname.mockReturnValue('/wishlist');
    render(<ChooseOptionsSheet open onClose={jest.fn()} product={product} intent="addToCart" />);
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));

    await waitFor(() => {
      expect(mockAddItem).toHaveBeenCalled();
    });
    expect(mockPlayAddToCartFlight).not.toHaveBeenCalled();
  });

  it('uses the Figma dialog chrome from tab up and a bottom sheet below', () => {
    render(<ChooseOptionsSheet open onClose={jest.fn()} product={product} intent="addToCart" />);

    const dialog = screen.getByRole('dialog', { name: cartMessages.chooseOptions });
    expect(dialog).toHaveClass(...cartTheme.chooseOptionsOverlay.shellClass.split(' '));
    expect(dialog.className).toContain('tab:max-w-[396px]');
    expect(dialog.className).toContain('rounded-t-[20px]');
    expect(dialog.parentElement).toHaveClass(
      ...cartTheme.chooseOptionsOverlay.backdropClass.split(' '),
    );
  });

  it('closes from the header and the backdrop', () => {
    const onClose = jest.fn();
    render(<ChooseOptionsSheet open onClose={onClose} product={product} intent="addToCart" />);

    const closeButtons = screen.getAllByRole('button', {
      name: cartMessages.a11y.closeSheet,
    });
    expect(closeButtons).toHaveLength(2);
    for (const button of closeButtons) {
      fireEvent.click(button);
    }
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ChooseOptionsSheet open={false} onClose={jest.fn()} product={product} intent="addToCart" />,
    );

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not close while add-to-cart is in flight', async () => {
    const onClose = jest.fn();
    mockAddItem.mockReturnValue(new Promise(() => undefined));
    render(<ChooseOptionsSheet open onClose={onClose} product={product} intent="addToCart" />);

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));
    await waitFor(() => expect(mockAddItem).toHaveBeenCalled());

    for (const button of screen.getAllByRole('button', { name: cartMessages.a11y.closeSheet })) {
      fireEvent.click(button);
    }
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });
});
