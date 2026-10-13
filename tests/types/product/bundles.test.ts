import { PRODUCT_BUNDLE_KEYS } from '@/types/product/bundles';

describe('PRODUCT_BUNDLE_KEYS', () => {
  it('exposes Complete Look key', () => {
    expect(PRODUCT_BUNDLE_KEYS.COMPLETE_LOOK).toBe('complete_look_product');
  });

  it('exposes Shop the Look and Save with the Set keys', () => {
    expect(PRODUCT_BUNDLE_KEYS.SHOP_THE_LOOK).toBe('shop_the_look');
    expect(PRODUCT_BUNDLE_KEYS.SAVE_WITH_THE_SET).toBe('save_with_the_set');
  });

  it('does not alias similar-products as a bundle rail', () => {
    expect(PRODUCT_BUNDLE_KEYS).not.toHaveProperty('SIMILAR_PRODUCTS');
  });

  it('keeps exactly the three PDP bundle rails', () => {
    expect(Object.keys(PRODUCT_BUNDLE_KEYS)).toHaveLength(3);
  });
});
