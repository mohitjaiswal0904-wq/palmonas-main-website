import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import { RemoveCartVariantSheet } from '@/components/product/RemoveCartVariantSheet';
import { cartMessages, cartTheme } from '@/config/cart/cart.config';
import { productMessages } from '@/config/product/product.config';
import type { ProductCartMatchingLine } from '@/hooks/cart/useProductCartState';
import type { Product } from '@/types/product';

const mockUpdateQuantity = jest.fn();
const mockAddItem = jest.fn();
const mockRemoveItem = jest.fn();
const mockAddWishlist = jest.fn();
const mockGuardApi = jest.fn((fn: () => Promise<unknown>) => fn());
const mockShowSuccess = jest.fn();
const mockShowError = jest.fn();
let mockLines: ProductCartMatchingLine[] = [];

jest.mock('@/hooks/useCart', () => ({
  useCart: () => ({
    actions: {
      updateQuantity: mockUpdateQuantity,
      addItem: mockAddItem,
      removeItem: mockRemoveItem,
    },
    isMutating: false,
    updatingLineId: null,
    removingLineId: null,
  }),
}));

jest.mock('@/hooks/cart/useProductCartState', () => ({
  useProductCartState: () => ({ matchingLines: mockLines }),
}));

jest.mock('@/hooks/auth/useAuth', () => ({
  useRequireAuth: () => ({ guardApi: mockGuardApi }),
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showSuccess: mockShowSuccess, showError: mockShowError }),
}));

jest.mock('@/hooks/wishlist/useWishlistMutations', () => ({
  useAddWishlistItemMutation: () => ({ mutateAsync: mockAddWishlist }),
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
      title: '6',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: '6' }],
    },
    {
      id: 'variant-2',
      title: '7',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: '7' }],
    },
    {
      id: 'variant-3',
      title: '8',
      price: 1000,
      availableForSale: true,
      selectedOptions: [{ name: 'Size', value: '8' }],
    },
  ],
};

const lines: ProductCartMatchingLine[] = [
  { id: 'line-1', quantity: 2, variantId: 'variant-1', variantTitle: '6' },
  { id: 'line-2', quantity: 1, variantId: 'variant-2', variantTitle: '7' },
];

describe('RemoveCartVariantSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLines = lines;
    mockRemoveItem.mockResolvedValue(undefined);
    mockAddWishlist.mockResolvedValue(undefined);
  });

  it('decrements a variant from the quantity stepper without closing', () => {
    const onClose = jest.fn();
    render(
      <RemoveCartVariantSheet open onClose={onClose} product={product} matchingLines={lines} />,
    );

    expect(screen.getByText(cartMessages.removeVariantTitle)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.inCartVariants)).toBeInTheDocument();
    expect(screen.getByText(cartMessages.addAnotherVariant)).toBeInTheDocument();
    expect(screen.getAllByTestId('cart-quantity-stepper')).toHaveLength(2);
    expect(
      screen.getAllByTestId('cart-quantity-stepper').every((node) => !node.querySelector('svg')),
    ).toBe(true);
    fireEvent.click(screen.getAllByRole('button', { name: cartMessages.a11y.decreaseQuantity })[0]!);
    expect(mockUpdateQuantity).toHaveBeenCalledWith('line-1', 1);
    expect(mockRemoveItem).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('opens the remove-or-wishlist modal before deleting the last unit', () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    expect(mockRemoveItem).not.toHaveBeenCalled();
    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
  });

  it('removes the pending line after confirm', async () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.removeConfirm.remove }));

    await waitFor(() => {
      expect(mockRemoveItem).toHaveBeenCalledWith('line-2');
    });
  });

  it('moves the product to wishlist then removes the pending line', async () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    fireEvent.click(
      screen.getByRole('button', { name: cartMessages.removeConfirm.moveToWishlist }),
    );

    await waitFor(() => {
      expect(mockAddWishlist).toHaveBeenCalledWith('prod-1');
      expect(mockRemoveItem).toHaveBeenCalledWith('line-2');
      expect(mockShowSuccess).toHaveBeenCalledWith(cartMessages.toasts.moveToWishlist);
    });
  });

  it('does not render when closed', () => {
    render(
      <RemoveCartVariantSheet
        open={false}
        onClose={jest.fn()}
        product={product}
        matchingLines={lines}
      />,
    );

    expect(screen.queryByText(cartMessages.removeVariantTitle)).not.toBeInTheDocument();
  });

  it('falls back to unknown variant copy when a line has no options', () => {
    mockLines = [{ id: 'line-9', quantity: 1, variantId: 'missing' }];
    render(
      <RemoveCartVariantSheet
        open
        onClose={jest.fn()}
        product={product}
        matchingLines={mockLines}
      />,
    );

    expect(screen.getByText(cartMessages.unknownVariant)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeInTheDocument();
  });

  it('uses the Figma dialog chrome from tab up and a bottom sheet below', () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    const dialog = screen.getByRole('dialog', { name: cartMessages.removeVariantTitle });
    expect(dialog.className).toContain('tab:max-w-[396px]');
    expect(dialog.className).toContain('rounded-t-[20px]');
    expect(dialog).toHaveClass(...cartTheme.chooseOptionsOverlay.shellClass.split(' '));
  });

  it('closes from the header without removing a line', () => {
    const onClose = jest.fn();
    render(
      <RemoveCartVariantSheet open onClose={onClose} product={product} matchingLines={lines} />,
    );

    const closeButtons = screen.getAllByRole('button', { name: cartMessages.a11y.closeSheet });
    expect(closeButtons.length).toBeGreaterThan(0);
    for (const button of closeButtons) {
      fireEvent.click(button);
    }
    expect(onClose).toHaveBeenCalled();
    expect(mockRemoveItem).not.toHaveBeenCalled();
  });

  it('shows a variant picker and adds a size that is not in cart', () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    expect(screen.getByLabelText(productMessages.a11y.chooseVariant)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select size 8' }));
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));
    expect(mockAddItem).toHaveBeenCalledWith('variant-3', 1);
    expect(mockUpdateQuantity).not.toHaveBeenCalled();
  });

  it('increments the existing line when add is used for a size already in cart', () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));
    expect(mockUpdateQuantity).toHaveBeenCalledWith('line-1', 3);
    expect(mockAddItem).not.toHaveBeenCalled();
  });

  it('disables add when every demifine variant is out of stock', () => {
    mockLines = [];
    const unavailable: Product = {
      ...product,
      variants: product.variants.map((variant) => ({ ...variant, availableForSale: false })),
    };
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={unavailable} matchingLines={[]} />,
    );

    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeDisabled();
  });

  it('does not add a variant while the remove confirm is open', () => {
    render(
      <RemoveCartVariantSheet open onClose={jest.fn()} product={product} matchingLines={lines} />,
    );

    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.removeItem }));
    expect(screen.getByText(cartMessages.removeConfirm.title)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: cartMessages.a11y.addToCart })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: cartMessages.a11y.addToCart }));
    expect(mockAddItem).not.toHaveBeenCalled();
  });
});
