import { render, screen } from '@testing-library/react';

import { DemifineProductPage } from '@/components/product/DemifineProductPage';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductDetailLayout', () => ({
  ProductDetailLayout: () => <div data-testid="pdp-layout" />,
}));

jest.mock('@/components/product/StickyAddToCartBar', () => ({
  StickyAddToCartBar: () => null,
}));

jest.mock('@/components/product/ProductRelatedProductsLoader', () => ({
  ProductRelatedProductsLoader: () => <div data-testid="similar-products" />,
}));

jest.mock('@/components/product/ProductBundlesLoader', () => ({
  ProductBundlesLoader: ({ productHandle }: { productHandle: string }) => (
    <div data-testid="product-bundles" data-handle={productHandle} />
  ),
}));

jest.mock('@/components/product/ProductShopByOffers', () => ({
  ProductShopByOffers: () => <div data-testid="shop-by-offers" />,
}));

jest.mock('@/components/product/ProductReviewsLoader', () => ({
  ProductReviewsLoader: () => <div data-testid="product-reviews" />,
}));

const product: Product = {
  id: 'p1',
  handle: 'hearts-all-over-bracelet-18k-gold-plated-88883',
  name: 'Hearts Bracelet',
  description: '',
  price: 1999,
  image: '',
  images: [],
  category: 'bracelets',
  productCategory: 'demifine',
  offers: [],
  variants: [
    {
      id: 'v1',
      title: 'Default',
      price: 1999,
      availableForSale: true,
      selectedOptions: [],
    },
  ],
};

describe('DemifineProductPage bundle placement', () => {
  it('renders Shop By Offers above similar products', () => {
    render(<DemifineProductPage product={product} />);

    const shopByOffers = screen.getByTestId('shop-by-offers');
    const similar = screen.getByTestId('similar-products');
    const bundles = screen.getByTestId('product-bundles');
    const reviews = screen.getByTestId('product-reviews');

    expect(
      shopByOffers.compareDocumentPosition(similar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(similar.compareDocumentPosition(bundles) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bundles.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bundles).toHaveAttribute(
      'data-handle',
      'hearts-all-over-bracelet-18k-gold-plated-88883',
    );
  });

  it('keeps similar products above reviews when bundles are present', () => {
    render(<DemifineProductPage product={product} />);

    const similar = screen.getByTestId('similar-products');
    const reviews = screen.getByTestId('product-reviews');

    expect(similar.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
