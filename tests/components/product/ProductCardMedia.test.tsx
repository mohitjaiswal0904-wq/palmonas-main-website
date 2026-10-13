import { render, screen } from '@testing-library/react';

import { ProductCardMedia } from '@/components/product/ProductCardMedia';
import type { Product } from '@/types/product';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, ...rest }: { alt: string } & Record<string, unknown>) => (
    // eslint-disable-next-line @next/next/no-img-element -- test stub
    <img alt={alt} {...rest} />
  ),
}));

jest.mock('@/components/product/WishlistButton', () => ({
  WishlistButton: () => <button type="button" aria-label="Add to wishlist" />,
}));

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'prod-1',
    handle: 'demo-ring',
    name: 'Demo Ring',
    description: '',
    price: 1000,
    image: 'https://cdn.example.com/img.jpg',
    images: ['https://cdn.example.com/img.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [],
    ...overrides,
  };
}

describe('ProductCardMedia', () => {
  it('aligns swatches and rating in a shared overlay row', () => {
    render(
      <ProductCardMedia
        product={makeProduct({
          avgRating: 4.5,
          reviewCount: 125,
          variants: [
            {
              id: 'gold',
              title: 'Gold',
              price: 1000,
              availableForSale: true,
              selectedOptions: [{ name: 'Color', value: 'Gold' }],
            },
            {
              id: 'silver',
              title: 'Silver',
              price: 1000,
              availableForSale: true,
              selectedOptions: [{ name: 'Color', value: 'Silver' }],
            },
          ],
        })}
      />,
    );

    const rating = screen.getByTestId('product-card-rating');
    expect(rating.parentElement).toHaveClass(
      'pointer-events-none',
      'flex',
      'items-center',
      'justify-between',
    );
    expect(screen.getByLabelText(/^Available colors:/)).toBeInTheDocument();
  });

  it('keeps rating on the right when color swatches are missing', () => {
    render(
      <ProductCardMedia
        product={makeProduct({
          avgRating: 4.5,
          reviewCount: 10,
          variants: [
            {
              id: 'gold',
              title: 'Gold',
              price: 1000,
              availableForSale: true,
              selectedOptions: [{ name: 'Color', value: 'Gold' }],
            },
          ],
        })}
      />,
    );

    const rating = screen.getByTestId('product-card-rating');
    expect(rating.parentElement).toHaveClass('justify-end');
    expect(rating.parentElement).not.toHaveClass('justify-between');
    expect(screen.queryByLabelText(/^Available colors:/)).not.toBeInTheDocument();
  });

  it('hides the overlay when rating is below 4 and only one color exists', () => {
    render(
      <ProductCardMedia
        product={makeProduct({
          avgRating: 3.9,
          reviewCount: 10,
          colors: ['gold'],
        })}
      />,
    );

    expect(screen.queryByTestId('product-card-rating')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Available colors:/)).not.toBeInTheDocument();
  });

  it('hides the overlay when there is no rating and no color chips', () => {
    render(<ProductCardMedia product={makeProduct({ colors: [] })} />);

    expect(screen.queryByTestId('product-card-rating')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^Available colors:/)).not.toBeInTheDocument();
  });
});
