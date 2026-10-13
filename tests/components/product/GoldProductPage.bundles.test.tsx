import { render, screen } from '@testing-library/react';

import { GoldProductPage } from '@/components/product/GoldProductPage';
import type { Product } from '@/types/product';

jest.mock('@/components/product/ProductDetailLayout', () => ({
  ProductDetailLayout: () => <div data-testid="pdp-layout" />,
}));

jest.mock('@/components/product/StickyAddToCartBar', () => ({
  StickyAddToCartBar: () => null,
}));

jest.mock('@/components/product/gold/GoldProductInfo', () => ({
  GoldProductInfo: () => null,
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
  id: 'g1',
  handle: 'gold-ring',
  name: 'Gold Ring',
  description: '',
  price: 19999,
  image: '',
  images: [],
  category: 'rings',
  productCategory: 'gold',
  offers: [],
  variants: [
    {
      id: 'v1',
      title: 'Default',
      price: 19999,
      availableForSale: true,
      selectedOptions: [],
    },
  ],
};

describe('GoldProductPage bundle placement', () => {
  it('renders Shop By Offers above similar products', () => {
    render(<GoldProductPage product={product} />);

    const shopByOffers = screen.getByTestId('shop-by-offers');
    const similar = screen.getByTestId('similar-products');
    const bundles = screen.getByTestId('product-bundles');

    expect(
      shopByOffers.compareDocumentPosition(similar) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(similar.compareDocumentPosition(bundles) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(bundles).toHaveAttribute('data-handle', 'gold-ring');
  });

  it('keeps reviews below the bundle rails', () => {
    render(<GoldProductPage product={product} />);

    const shopByOffers = screen.getByTestId('shop-by-offers');
    const bundles = screen.getByTestId('product-bundles');
    const reviews = screen.getByTestId('product-reviews');

    expect(
      shopByOffers.compareDocumentPosition(bundles) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(bundles.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });
});
