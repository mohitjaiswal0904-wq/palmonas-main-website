import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';

import { WishlistItemCard } from '@/components/wishlist/WishlistItemCard';
import { wishlistMessages } from '@/config/wishlist';
import type { WishlistItem } from '@/types/wishlist';

const mockShowWarning = jest.fn();

jest.mock('@/components/navigation/AppLink', () => ({
  AppLink: ({ href, children, ...rest }: { href: string; children?: ReactNode }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

jest.mock('@/components/product/ProductCardMedia', () => ({
  ProductCardMedia: () => <div data-testid="media" />,
}));

jest.mock('@/components/product/PriceBlock', () => ({
  PriceBlock: ({
    disabled,
    statusLabel,
  }: {
    disabled?: boolean;
    statusLabel?: string;
  }) => (
    <div data-testid="price" data-disabled={disabled ? 'true' : undefined}>
      {statusLabel ? <span data-testid="wishlist-out-of-stock">{statusLabel}</span> : null}
    </div>
  ),
}));

jest.mock('@/components/product/AddToCartButton', () => ({
  AddToCartButton: () => <button type="button">Add</button>,
}));

jest.mock('@/components/wishlist/WishlistRemoveButton', () => ({
  WishlistRemoveButton: () => <button type="button">Remove</button>,
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showWarning: mockShowWarning }),
}));

function makeItem(availableForSale: boolean): WishlistItem {
  return {
    productId: 'p1',
    variantId: 'v1',
    product: {
      id: 'p1',
      handle: 'lunar-ring',
      name: 'Lunar Ring',
      description: '',
      price: 1999,
      image: 'https://cdn.example.com/lunar.jpg',
      images: ['https://cdn.example.com/lunar.jpg'],
      category: 'rings',
      productCategory: 'demifine',
      offers: [],
      variants: [
        {
          id: 'v1',
          title: 'Default',
          price: 1999,
          availableForSale,
          selectedOptions: [],
        },
      ],
    },
  };
}

describe('WishlistItemCard', () => {
  beforeEach(() => {
    mockShowWarning.mockClear();
  });

  it('renders the product name with product-card typography', () => {
    render(<WishlistItemCard item={makeItem(true)} onRemoveRequest={jest.fn()} />);

    const name = screen.getByText('Lunar Ring');
    expect(name).toHaveClass('text-xxs', 'tab:text-xs', 'truncate', 'capitalize');
    expect(name).not.toHaveClass('font-nunito-sans', 'text-sm', 'laptop:text-base');
  });

  it('links to the product detail page', () => {
    render(<WishlistItemCard item={makeItem(true)} onRemoveRequest={jest.fn()} />);

    expect(screen.getByRole('link', { name: 'View Lunar Ring' })).toHaveAttribute(
      'href',
      '/products/lunar-ring',
    );
  });

  it('keeps compact card padding like product cards', () => {
    render(<WishlistItemCard item={makeItem(true)} onRemoveRequest={jest.fn()} />);

    expect(screen.getByTestId('wishlist-item-card')).toHaveClass('pb-3', 'gap-0');
  });

  it('exposes media and price chrome for the card body', () => {
    render(<WishlistItemCard item={makeItem(true)} onRemoveRequest={jest.fn()} />);

    expect(screen.getByTestId('media')).toBeInTheDocument();
    expect(screen.getByTestId('price')).toBeInTheDocument();
  });

  it('shows out of stock status when the wishlist variant is unavailable', () => {
    render(<WishlistItemCard item={makeItem(false)} onRemoveRequest={jest.fn()} />);

    expect(screen.getByTestId('wishlist-out-of-stock')).toHaveTextContent(
      wishlistMessages.labels.outOfStock,
    );
    expect(screen.getByTestId('price')).toHaveAttribute('data-disabled', 'true');
    expect(screen.getByText('Lunar Ring')).toHaveClass('opacity-50');
    expect(screen.getByTestId('wishlist-item-card')).toHaveAttribute('data-out-of-stock', 'true');
    expect(screen.queryByRole('button', { name: 'Add' })).not.toBeInTheDocument();
  });

  it('toasts when add is pressed on an out of stock wishlist item', async () => {
    const user = userEvent.setup();
    render(<WishlistItemCard item={makeItem(false)} onRemoveRequest={jest.fn()} />);

    await user.click(screen.getByRole('button', { name: wishlistMessages.a11y.outOfStock }));

    expect(mockShowWarning).toHaveBeenCalledWith(wishlistMessages.toasts.outOfStock);
  });

  it('keeps the normal add control when the variant is in stock', () => {
    render(<WishlistItemCard item={makeItem(true)} onRemoveRequest={jest.fn()} />);

    expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
    expect(screen.queryByTestId('wishlist-out-of-stock')).not.toBeInTheDocument();
    expect(screen.getByText('Lunar Ring')).not.toHaveClass('opacity-50');
    expect(screen.getByTestId('price')).not.toHaveAttribute('data-disabled');
  });
});
