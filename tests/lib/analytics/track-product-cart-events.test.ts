import {
  trackAddToCart,
  trackAddToCartClicked,
  trackBuyNowClicked,
} from '@/lib/analytics/analytics-trackers';
import {
  trackProductAddedToCart,
  trackProductAddToCartClicked,
  trackProductBuyNowClicked,
} from '@/lib/analytics/track-product-cart-events';

jest.mock('@/lib/analytics/analytics-trackers', () => ({
  trackAddToCartClicked: jest.fn(),
  trackAddToCart: jest.fn(),
  trackBuyNowClicked: jest.fn(),
}));

const product = {
  handle: 'test-ring',
  name: 'Test Ring',
  price: 1000,
};

describe('track-product-cart-events', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('tracks add-to-cart click with product handle and quantity', () => {
    trackProductAddToCartClicked(product, 2);

    expect(trackAddToCartClicked).toHaveBeenCalledWith({
      product_id: 'test-ring',
      price: 1000,
      quantity: 2,
    });
  });

  it('defaults add-to-cart click quantity to 1', () => {
    trackProductAddToCartClicked(product);

    expect(trackAddToCartClicked).toHaveBeenCalledWith({
      product_id: 'test-ring',
      price: 1000,
      quantity: 1,
    });
  });

  it('tracks add-to-cart conversion with variant and commerce value', () => {
    trackProductAddedToCart(product, 'variant-1', 1);

    expect(trackAddToCart).toHaveBeenCalledWith(
      {
        product_id: 'test-ring',
        product_name: 'Test Ring',
        variant_id: 'variant-1',
        price: 1000,
        quantity: 1,
        currency: 'INR',
      },
      { value: 1000, currency: 'INR' },
    );
  });

  it('tracks buy-now click with product handle and price', () => {
    trackProductBuyNowClicked(product);

    expect(trackBuyNowClicked).toHaveBeenCalledWith({
      product_id: 'test-ring',
      price: 1000,
    });
  });
});
