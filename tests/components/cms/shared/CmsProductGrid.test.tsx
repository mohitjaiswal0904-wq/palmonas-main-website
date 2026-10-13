import { render, screen } from '@testing-library/react';

import { CmsProductGrid } from '@/components/cms/shared/CmsProductGrid';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({ className }: { className?: string }) => (
    <article className={className} data-testid="product-card" />
  ),
}));

const product: Product = {
  id: 'product-1',
  handle: 'product-1',
  name: 'Product One',
  description: '',
  price: 1000,
  image: '',
  images: [],
  category: 'rings',
  productCategory: 'demifine',
  offers: [],
  variants: [],
};

describe('CmsProductGrid', () => {
  it('stretches cards consistently in horizontal home sections', () => {
    render(<CmsProductGrid products={[product]} />);

    const card = screen.getByTestId('product-card');

    expect(card).toHaveClass('h-full');
    expect(card.parentElement).toHaveClass('flex');
  });

  it('preserves the fixed-width wrapper while stretching grid cards', () => {
    render(<CmsProductGrid products={[product]} layout="grid" />);

    expect(screen.getByTestId('product-card').parentElement).toHaveClass(
      'flex',
      'w-44',
      'shrink-0',
    );
  });
});
