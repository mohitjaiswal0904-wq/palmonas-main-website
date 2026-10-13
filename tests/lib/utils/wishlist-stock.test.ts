import { extractNumericId } from '@/types/cart';
import { isWishlistItemInStock } from '@/lib/utils/wishlist-stock';
import type { WishlistItem } from '@/types/wishlist';
import type { ProductVariant } from '@/types/product';

function makeVariant(
  id: string,
  availableForSale: boolean,
): ProductVariant {
  return {
    id,
    title: 'Default',
    price: 1000,
    availableForSale,
    selectedOptions: [],
  };
}

function makeItem(variants: ProductVariant[], variantId: string): WishlistItem {
  return {
    productId: 'p1',
    variantId,
    product: {
      id: 'p1',
      handle: 'ring',
      name: 'Ring',
      description: '',
      price: 1000,
      image: '',
      images: [],
      category: 'rings',
      productCategory: 'demifine',
      offers: [],
      variants,
    },
  };
}

describe('isWishlistItemInStock', () => {
  it('returns true when the matched variant is available', () => {
    const item = makeItem([makeVariant('v1', true), makeVariant('v2', false)], 'v1');
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('returns false when the matched variant is out of stock', () => {
    const item = makeItem([makeVariant('v1', false), makeVariant('v2', true)], 'v1');
    expect(isWishlistItemInStock(item)).toBe(false);
  });

  it('matches Shopify GIDs to numeric variant ids', () => {
    const gid = 'gid://shopify/ProductVariant/123';
    const item = makeItem([makeVariant(gid, false)], '123');
    expect(extractNumericId(gid)).toBe('123');
    expect(isWishlistItemInStock(item)).toBe(false);
  });

  it('falls back to any in-stock variant when the line variant is missing', () => {
    const item = makeItem([makeVariant('v1', false), makeVariant('v2', true)], 'missing');
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('treats demifine products without variants as out of stock', () => {
    expect(isWishlistItemInStock(makeItem([], 'v1'))).toBe(false);
  });

  it('treats gold products without variants as in stock', () => {
    const item = makeItem([], 'v1');
    item.product.productCategory = 'gold';
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('blocks demifine products marked unavailable even with no variants', () => {
    const item = makeItem([], 'v1');
    item.product.availableForSale = false;
    expect(isWishlistItemInStock(item)).toBe(false);
  });

  it('treats gold variants as purchasable even when availableForSale is false', () => {
    const item = makeItem([makeVariant('v1', false)], 'v1');
    item.product.productCategory = 'gold';
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('treats 9KT title gold as purchasable when productCategory defaulted to demifine', () => {
    const item = makeItem([makeVariant('v1', false)], 'v1');
    item.product.name = 'Sleek Bar 9KT Gold Pendant';
    item.product.availableForSale = false;
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('treats gold category-label items as purchasable when productCategory is demifine', () => {
    const item = makeItem([makeVariant('v1', false)], 'v1');
    item.product.category = 'Gold Jewellery';
    item.product.availableForSale = false;
    expect(isWishlistItemInStock(item)).toBe(true);
  });

  it('treats demifine variants with zero quantity as out of stock', () => {
    const item = makeItem(
      [{ ...makeVariant('v1', true), quantityAvailable: 0 }],
      'v1',
    );
    expect(isWishlistItemInStock(item)).toBe(false);
  });

  it('treats demifine variants with untracked quantity as in stock when availableForSale', () => {
    const item = makeItem([makeVariant('v1', true)], 'v1');
    expect(isWishlistItemInStock(item)).toBe(true);
  });
});
