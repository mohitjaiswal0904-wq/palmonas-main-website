import { render, screen } from '@testing-library/react';

import { RelatedProducts } from '@/components/product/RelatedProducts';
import { productMessages } from '@/config/product/product.config';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductCard', () => ({
  ProductCard: ({
    product,
    showOfferPromo = true,
  }: {
    product: Product;
    showOfferPromo?: boolean;
  }) => (
    <div data-testid={`card-${product.id}`} data-show-offer-promo={String(showOfferPromo)}>
      {product.name}
    </div>
  ),
}));

const products: Product[] = [
  {
    id: 'p1',
    handle: 'ring-a',
    name: 'Ring A',
    description: '',
    price: 1000,
    image: 'https://cdn.example.com/a.jpg',
    images: ['https://cdn.example.com/a.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [
      {
        id: 'v1',
        title: 'Default',
        price: 1000,
        availableForSale: true,
        selectedOptions: [],
      },
    ],
  },
  {
    id: 'p2',
    handle: 'ring-b',
    name: 'Ring B',
    description: '',
    price: 2000,
    image: 'https://cdn.example.com/b.jpg',
    images: ['https://cdn.example.com/b.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    offers: [],
    variants: [
      {
        id: 'v2',
        title: 'Default',
        price: 2000,
        availableForSale: true,
        selectedOptions: [],
      },
    ],
  },
];

describe('RelatedProducts', () => {
  it('renders Similar Products heading from product config', () => {
    render(<RelatedProducts products={products} />);
    expect(
      screen.getByRole('heading', { name: productMessages.similarProducts }),
    ).toBeInTheDocument();
  });

  it('exposes horizontal scroll region with similar-products a11y label', () => {
    render(<RelatedProducts products={products} />);
    expect(
      screen.getByRole('region', { name: productMessages.a11y.similarProducts }),
    ).toBeInTheDocument();
  });

  it('renders product cards in the carousel', () => {
    render(<RelatedProducts products={products} />);
    expect(screen.getByTestId('card-p1')).toBeInTheDocument();
    expect(screen.getByTestId('card-p2')).toBeInTheDocument();
  });

  it('shows offer promo on similar-product cards by default', () => {
    render(<RelatedProducts products={products} />);

    expect(screen.getByTestId('card-p1')).toHaveAttribute('data-show-offer-promo', 'true');
    expect(screen.getByTestId('card-p2')).toHaveAttribute('data-show-offer-promo', 'true');
  });

  it('hides offer promo when showOfferPromo is false', () => {
    render(<RelatedProducts products={products} showOfferPromo={false} />);

    expect(screen.getByTestId('card-p1')).toHaveAttribute('data-show-offer-promo', 'false');
    expect(screen.getByTestId('card-p2')).toHaveAttribute('data-show-offer-promo', 'false');
  });

  it('centers Similar Products heading classes for laptop', () => {
    render(<RelatedProducts products={products} />);
    const heading = screen.getByRole('heading', { name: productMessages.similarProducts });
    expect(heading.className).toContain('laptop:text-center');
    expect(heading.className).not.toContain('laptop:px-8');
  });

  it('pads the similar-products section equally on desktop so gutters do not scroll away', () => {
    const { container } = render(<RelatedProducts products={products} />);
    const section = container.querySelector('section');
    const region = screen.getByRole('region', { name: productMessages.a11y.similarProducts });

    expect(section?.className).toContain('laptop:px-8');
    expect(region.className).not.toContain('laptop:px-6');
  });

  it('uses viewport-based laptop card width inside the padded section', () => {
    const { container } = render(<RelatedProducts products={products} />);
    const item = container.querySelector('li');

    expect(item?.className).toContain('laptop:w-[20vw]');
  });

  it('renders nothing when products list is empty', () => {
    const { container } = render(<RelatedProducts products={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders an override title for bundle rails', () => {
    render(
      <RelatedProducts
        products={products}
        title="Complete Look"
        headingId="product-bundle-complete_look_product"
        ariaLabel="Complete Look"
      />,
    );

    const heading = screen.getByRole('heading', { name: 'Complete Look' });
    expect(heading).toHaveAttribute('id', 'product-bundle-complete_look_product');
    expect(heading.closest('section')).toHaveAttribute(
      'aria-labelledby',
      'product-bundle-complete_look_product',
    );
  });

  it('uses a chapter-sized gap above Similar Products', () => {
    const { container } = render(<RelatedProducts products={products} />);
    const section = container.querySelector('section');

    expect(section?.className).toContain('pt-8');
    expect(section?.className).not.toContain('pt-2');
  });
});
