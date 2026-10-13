import { fireEvent, render, screen } from '@testing-library/react';

import { ProductShopByOffers } from '@/components/product/ProductShopByOffers';
import { productMessages } from '@/config/product/product.config';
import { useShopByOfferProducts } from '@/hooks/useProducts';
import { AppError } from '@/lib/errors';
import type { Product, ProductOffer } from '@/types/product';

jest.mock('@/hooks/useProducts', () => ({
  useShopByOfferProducts: jest.fn(),
}));

jest.mock('@/components/global/product-listing', () => ({
  ProductCarousel: ({
    products,
    ariaLabel,
  }: {
    products: Array<{ name: string }>;
    ariaLabel?: string;
  }) => (
    <div role="region" aria-label={ariaLabel}>
      {products.map((product) => (
        <p key={product.name}>{product.name}</p>
      ))}
    </div>
  ),
}));

const mockUseShopByOfferProducts = useShopByOfferProducts as jest.MockedFunction<
  typeof useShopByOfferProducts
>;

const bday6: ProductOffer = {
  key: 'BDAY6',
  name: 'Buy 6 At ₹4999',
  description: 'Note: You need to add minimum 6 products',
  code: 'BDAY6',
  type: 'DISCOUNT',
  discountValue: 4999,
  placeholder: [],
  collections: [
    {
      id: 'gid://shopify/Collection/479178326273',
      title: 'MONSOON SALE POS',
      handle: 'monsoon-sale-pos',
      image: null,
    },
  ],
};

const monsoon4: ProductOffer = {
  key: 'MONSOON4',
  name: 'Buy 4 At ₹2999',
  description: 'Special discount on purchase of 4 items',
  code: 'MONSOON4',
  type: 'DISCOUNT',
  discountValue: null,
  placeholder: [],
  collections: [{ id: null, title: null, handle: 'monsoon-sale', image: null }],
};

const b1g1: ProductOffer = {
  key: 'B1G1',
  name: 'Buy 1 Get 1',
  description: 'Note: You need to add minimum 2 products.',
  code: 'B1G1',
  type: 'FREEBIE',
  discountValue: null,
  placeholder: [],
};

const product: Product = {
  id: 'p1',
  handle: 'hearts-bracelet',
  name: 'Hearts Bracelet',
  description: '',
  price: 1999,
  image: '',
  images: [],
  category: 'bracelets',
  productCategory: 'demifine',
  offers: [bday6, monsoon4, b1g1],
  variants: [],
};

const offerProduct: Product = {
  ...product,
  id: 'p2',
  handle: 'offer-ring',
  name: 'Offer Ring',
};

const monsoonProduct: Product = {
  ...product,
  id: 'p3',
  handle: 'monsoon-ring',
  name: 'Monsoon Ring',
};

describe('ProductShopByOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseShopByOfferProducts.mockImplementation((handle) => ({
      products: handle === 'monsoon-sale' ? [monsoonProduct] : [offerProduct],
      isLoading: false,
      error: null,
    }));
  });

  it('renders offer tabs and collection products', () => {
    render(<ProductShopByOffers product={product} />);

    expect(screen.getByRole('heading', { name: productMessages.shopByOffers })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Buy 6 At ₹4999' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: 'Buy 4 At ₹2999' })).toHaveAttribute(
      'aria-selected',
      'false',
    );
    expect(screen.queryByRole('tab', { name: 'Buy 1 Get 1' })).not.toBeInTheDocument();
    expect(screen.getByText('Offer Ring')).toBeInTheDocument();
    expect(mockUseShopByOfferProducts).toHaveBeenCalledWith('monsoon-sale-pos', 'p1');
    expect(screen.getByRole('tab', { name: 'Buy 6 At ₹4999' }).className).toContain('shrink-0');
    expect(screen.getByRole('tab', { name: 'Buy 6 At ₹4999' }).className).toContain('h-9');
    expect(screen.getByRole('tab', { name: 'Buy 6 At ₹4999' }).className).not.toContain('flex-1');
  });

  it('loads products for the selected offer collection', () => {
    render(<ProductShopByOffers product={product} />);

    expect(screen.getByText('Offer Ring')).toBeInTheDocument();
    expect(screen.queryByText('Monsoon Ring')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: 'Buy 4 At ₹2999' }));

    expect(screen.getByRole('tab', { name: 'Buy 4 At ₹2999' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(mockUseShopByOfferProducts).toHaveBeenLastCalledWith('monsoon-sale', 'p1');
    expect(screen.getByText('Monsoon Ring')).toBeInTheDocument();
    expect(screen.queryByText('Offer Ring')).not.toBeInTheDocument();
  });

  it('renders nothing when no discount has a collection', () => {
    const { container } = render(
      <ProductShopByOffers product={{ ...product, offers: [b1g1] }} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('keeps tabs and hides the rail when the collection has no products', () => {
    mockUseShopByOfferProducts.mockReturnValue({
      products: [],
      isLoading: false,
      error: new AppError('NETWORK', 'Failed'),
    });

    render(<ProductShopByOffers product={product} />);

    expect(screen.getByRole('tablist', { name: productMessages.a11y.shopByOffersTabs })).toBeInTheDocument();
    expect(
      screen.queryByRole('region', { name: productMessages.a11y.shopByOffersProducts }),
    ).not.toBeInTheDocument();
  });
});
