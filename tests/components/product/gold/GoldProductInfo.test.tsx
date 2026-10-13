import { render, screen } from '@testing-library/react';

import { GoldProductInfo } from '@/components/product/gold/GoldProductInfo';
import { productMessages } from '@/config/product/product.config';
import type { MtoPrice } from '@/types/mto-price';
import type { Product } from '@/types/product';

const mockUseMtoPrice = jest.fn();

jest.mock('@/hooks/useMtoPrice', () => ({
  useMtoPrice: () => mockUseMtoPrice(),
}));

jest.mock('@/components/product/ProductWishlistIcon', () => ({
  ProductWishlistIcon: () => null,
}));

jest.mock('@/components/product/PincodeChecker', () => ({
  PincodeChecker: () => null,
}));

jest.mock('@/components/product/ProductAccordion', () => ({
  ProductAccordion: () => null,
}));

jest.mock('@/components/product/ProductUsp', () => ({
  ProductUsp: () => null,
}));

jest.mock('@/components/product/VariantSelector', () => ({
  VariantSelector: () => null,
}));

const goldProduct: Product = {
  id: 'gold-1',
  handle: 'crescent-bond',
  name: 'Crescent Bond 9KT Gold Laboratory Grown Diamond Mangalsutra',
  description: '',
  price: 123,
  compareAtPrice: 123,
  image: 'https://cdn.example.com/gold.jpg',
  images: ['https://cdn.example.com/gold.jpg'],
  category: 'mangalsutra',
  productCategory: 'gold',
  offers: [],
  variants: [
    {
      id: 'variant-1',
      title: 'Yellow / 16',
      sku: 'GOLD-A',
      price: 123,
      compareAtPrice: 123,
      availableForSale: true,
      selectedOptions: [
        { name: 'Colour', value: 'Yellow' },
        { name: 'Size', value: '16' },
      ],
    },
  ],
};

function mtoResult(totalPrice: number, totalPriceWithoutMaking = 0) {
  return {
    price: {
      totalPrice,
      totalPriceWithoutMaking,
      pricePerGram: 5500,
      goldWeightGrams: 2.5,
      showCalculation: true,
    } as MtoPrice,
    isLoading: false,
    error: null,
  };
}

describe('GoldProductInfo', () => {
  beforeEach(() => {
    mockUseMtoPrice.mockReturnValue(mtoResult(41192));
  });

  it('renders the live MTO total instead of the catalog listing mismatch', () => {
    render(<GoldProductInfo product={goldProduct} />);

    expect(screen.getByText('₹41,192')).toBeInTheDocument();
    expect(screen.queryByText('₹123')).not.toBeInTheDocument();
  });

  it('renders the MTO total as-is below ₹20k instead of a frontend discount', () => {
    mockUseMtoPrice.mockReturnValue(mtoResult(10_000));

    render(<GoldProductInfo product={goldProduct} />);

    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.queryByText('₹8,500')).not.toBeInTheDocument();
  });

  it('strikes through total_price when it is greater than total_price_without_making', () => {
    mockUseMtoPrice.mockReturnValue(mtoResult(12807.65, 10886.5));

    render(<GoldProductInfo product={goldProduct} />);

    expect(screen.getByText('₹10,887')).toBeInTheDocument();
    const compareAt = screen.getByText('₹12,808');
    expect(compareAt).toHaveClass('line-through');
  });

  it('hides strikethrough when catalog MRP is not higher than the live selling price', () => {
    const { container } = render(<GoldProductInfo product={goldProduct} />);
    const header = container.querySelector('header');

    expect(header?.querySelector('.line-through')).toBeNull();
  });

  it('shows catalog MRP as strikethrough when it is higher than the live selling price', () => {
    render(
      <GoldProductInfo
        product={{
          ...goldProduct,
          compareAtPrice: 50_000,
          variants: goldProduct.variants.map((variant) => ({
            ...variant,
            compareAtPrice: 50_000,
          })),
        }}
      />,
    );

    const compareAt = screen.getByText('₹50,000');
    expect(compareAt).toBeInTheDocument();
    expect(compareAt).toHaveClass('line-through');
  });

  it('does not show the free gift banner on gold PDPs', () => {
    render(<GoldProductInfo product={goldProduct} />);

    expect(screen.queryByTestId('pdp-free-gift-banner')).not.toBeInTheDocument();
  });

  it('uses the shared PDP section stack gap', () => {
    const { container } = render(<GoldProductInfo product={goldProduct} />);
    const stack = container.querySelector('section');

    expect(stack?.className).toContain('gap-6');
    expect(stack?.className).toContain('laptop:gap-8');
    expect(stack?.className).not.toContain('gap-4');
  });

  it('keeps the original selling-fast pill under the title on gold', () => {
    render(
      <GoldProductInfo
        product={{
          ...goldProduct,
          productTags: [{ name: 'badge', value: 'Selling Fast' }],
          offers: [
            {
              key: 'GOLD3000',
              name: 'Flat 15% off on MRP',
              description: 'Flat 15% off on orders below Rs 20k/-',
              code: 'GOLD3000',
              type: 'DISCOUNT',
              discountValue: 3000,
              placeholder: [{ text: 'Limited deal', style: 'normal' }],
            },
          ],
        }}
      />,
    );

    const heading = screen.getByRole('heading', { name: goldProduct.name, level: 1 });
    const sellingFast = screen.getByText(productMessages.sellingFast);
    const offer = screen.getByText('Flat 15%');

    expect(heading.closest('header')).toContainElement(sellingFast);
    expect(heading.closest('header')).not.toContainElement(offer);
    expect(screen.queryByText(productMessages.shipsIn24Hours)).not.toBeInTheDocument();
  });
});
