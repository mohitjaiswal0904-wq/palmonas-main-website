import { normalizeWishlistProductId } from '@/lib/utils/wishlist-product-id';

describe('normalizeWishlistProductId', () => {
  it('extracts numeric id from Shopify product GID', () => {
    expect(normalizeWishlistProductId('gid://shopify/Product/9043668861185')).toBe('9043668861185');
  });

  it('returns opaque ids unchanged', () => {
    expect(normalizeWishlistProductId('product-2')).toBe('product-2');
    expect(normalizeWishlistProductId('9043668861185')).toBe('9043668861185');
  });
});
