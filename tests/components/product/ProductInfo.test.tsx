import { render, screen } from '@testing-library/react';

import { ProductInfo } from '@/components/product/ProductInfo';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));
import { productMessages } from '@/config/product/product.config';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductWishlistIcon', () => ({
  ProductWishlistIcon: () => null,
}));

jest.mock('@/components/product/PincodeChecker', () => ({
  PincodeChecker: () => <div data-testid="pdp-delivery-section">Delivery</div>,
}));

jest.mock('@/hooks/useToast', () => ({
  useToast: () => ({ showSuccess: jest.fn() }),
}));

const mockApiOffers: Product['offers'] = [
  {
    key: 'api-offer-1',
    name: 'Buy 1 Get 1 Free',
    description: 'Note: You need to add minimum 2 products to avail this discount.',
    code: 'B1G1',
    type: 'FREEBIE',
    discountValue: 3266,
    placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
  },
  {
    key: 'api-offer-2',
    name: 'Extra 10% Off',
    description: 'Use code at checkout.',
    code: 'EXTRA10',
    type: 'DISCOUNT',
    discountValue: 10,
    placeholder: [{ text: 'Limited Time Offer', style: 'normal' }],
  },
];

const mockProduct: Product = {
  id: 'product-1',
  handle: 'test-ring',
  name: 'Test Ring',
  description: 'Test description',
  price: 3266,
  compareAtPrice: 4500,
  image: 'https://cdn.example.com/img.jpg',
  images: ['https://cdn.example.com/img.jpg'],
  category: 'rings',
  productCategory: 'demifine',
  productTags: [{ name: 'badge', value: 'Selling Fast' }],
  variants: [
    {
      id: 'variant-1',
      title: 'Gold',
      price: 3266,
      availableForSale: true,
      selectedOptions: [{ name: 'Metal', value: 'Gold' }],
    },
  ],
  offers: mockApiOffers,
};

describe('ProductInfo', () => {
  it('renders pre-deals section and API offer badges below the header', () => {
    render(<ProductInfo product={mockProduct} />);

    expect(screen.getByRole('heading', { name: 'Test Ring', level: 1 })).toHaveClass('text-base');
    expect(screen.getByRole('img', { name: productMessages.usps.anti_tarnish })).toBeInTheDocument();
    expect(screen.getByText('B1G1')).toBeInTheDocument();
    expect(screen.getByText('EXTRA10')).toBeInTheDocument();
    expect(screen.getByText(/Note: You need to add minimum 2 products/)).toBeInTheDocument();
  });

  it('places the rating after the product title', () => {
    render(
      <ProductInfo
        product={{
          ...mockProduct,
          reviews: { avgRating: 4.7, reviewCount: 599 },
        }}
      />,
    );

    const title = screen.getByRole('heading', { name: 'Test Ring', level: 1 });
    const rating = screen.getByRole('button', { name: /jump to 599 reviews/i });

    expect(title.compareDocumentPosition(rating) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('groups ships-in-24h with the USP strip instead of under the title', () => {
    render(<ProductInfo product={mockProduct} />);

    const trust = screen.getByRole('region', { name: productMessages.a11y.demifineTrustPills });
    expect(trust).toContainElement(screen.getByText(productMessages.shipsIn24Hours));
    expect(trust).toContainElement(screen.getByRole('img', { name: productMessages.usps.anti_tarnish }));
    expect(trust.className).toContain('gap-2');
  });

  it('anchors the header price for the sticky bar', () => {
    const { container } = render(<ProductInfo product={mockProduct} />);
    const price = container.querySelector('#product-pdp-price');

    expect(price).toHaveAttribute('data-selling-price', '3266');
    expect(price).toHaveAttribute('data-compare-at-price', '4500');
  });

  it('places the free gift banner before the delivery section', () => {
    render(<ProductInfo product={mockProduct} />);

    const delivery = screen.getByTestId('pdp-delivery-section');
    const giftBanner = screen.getByTestId('pdp-free-gift-banner');

    expect(giftBanner.compareDocumentPosition(delivery) & Node.DOCUMENT_POSITION_FOLLOWING).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(giftBanner).toHaveTextContent(/Plain Ball Stud Earrings/);
    expect(giftBanner).toHaveTextContent(/₹1,495/);
    expect(giftBanner).toHaveTextContent(/Free/);
  });

  it('uses a loose stack gap between unrelated PDP groups', () => {
    const { container } = render(<ProductInfo product={mockProduct} />);
    const stack = container.querySelector('section');

    expect(stack?.className).toContain('gap-6');
    expect(stack?.className).toContain('laptop:gap-8');
    expect(stack?.className).not.toContain('space-y-4');
  });

  it('renders API usps on the demifine trust strip', () => {
    render(
      <ProductInfo
        product={{
          ...mockProduct,
          usps: ['anti_tarnish', 'skin_safe_jewellery', 'gold_plated_14k'],
        }}
      />,
    );

    expect(screen.getByRole('img', { name: productMessages.usps.gold_plated_14k })).toBeInTheDocument();
    expect(screen.getAllByRole('list', { name: productMessages.a11y.productBenefits })).toHaveLength(
      1,
    );
  });

  it('does not render deals when API returns no offers', () => {
    render(<ProductInfo product={{ ...mockProduct, offers: [] }} />);

    expect(screen.queryByText('B1G1')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(productMessages.deals)).not.toBeInTheDocument();
  });

  it('still shows coupon and placeholder when description is omitted', () => {
    render(
      <ProductInfo
        product={{
          ...mockProduct,
          offers: [
            {
              key: 'api-offer-1',
              name: 'Buy 1 Get 1 Free',
              code: 'B1G1',
              type: 'FREEBIE',
              placeholder: [{ text: 'Perfect Time to Stock Up', style: 'normal' }],
            } as Product['offers'][number],
          ],
        }}
      />,
    );

    expect(screen.getByText('B1G1')).toBeInTheDocument();
    expect(screen.getByText('Perfect Time to Stock Up')).toBeInTheDocument();
  });

  it('hides deals when remaining offers have no displayable fields', () => {
    render(
      <ProductInfo
        product={{
          ...mockProduct,
          offers: [
            {
              key: '',
              name: '',
              description: '',
              code: '',
              type: 'DISCOUNT',
              placeholder: [],
            },
          ],
        }}
      />,
    );

    expect(screen.queryByLabelText(productMessages.deals)).not.toBeInTheDocument();
  });
});
