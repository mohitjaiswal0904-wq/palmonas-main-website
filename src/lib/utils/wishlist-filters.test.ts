import {
  formatWishlistItemCount,
  filterWishlistItems,
  getWishlistItemCategory,
} from '@/lib/utils/wishlist-filters';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistItem } from '@/types/wishlist';

function makeItem(
  category: string,
  productCategory: 'demifine' | 'gold',
  handle = 'test-product',
  name = 'Test Product',
): WishlistItem {
  return {
    productId: `${category}-${productCategory}`,
    variantId: '1',
    product: {
      id: `${category}-${productCategory}`,
      handle,
      name,
      description: '',
      price: 1000,
      image: '',
      images: [],
      category,
      productCategory,
      offers: [],
      variants: [],
    },
  };
}

describe('getWishlistItemCategory', () => {
  it('prioritises silver label over demifine enum', () => {
    expect(getWishlistItemCategory(makeItem('silver jewellery', PRODUCT_CATEGORY.DEMIFINE))).toBe(
      'silver',
    );
  });

  it('classifies gold from category label when enum defaults to demifine', () => {
    expect(getWishlistItemCategory(makeItem('Gold Jewellery', PRODUCT_CATEGORY.DEMIFINE))).toBe(
      'gold',
    );
  });

  it('classifies gold from productCategory enum', () => {
    expect(getWishlistItemCategory(makeItem('rings', PRODUCT_CATEGORY.GOLD))).toBe('gold');
  });

  it('classifies demifine when label and enum are demifine', () => {
    expect(getWishlistItemCategory(makeItem('rings', PRODUCT_CATEGORY.DEMIFINE))).toBe('demifine');
  });

  it('classifies 9KT titles as gold when the payload omitted product_category', () => {
    expect(
      getWishlistItemCategory(
        makeItem(
          'pendants',
          PRODUCT_CATEGORY.DEMIFINE,
          'sleek-bar-pendant',
          'Sleek Bar 9KT Gold Laboratory Grown Diamond Pendant',
        ),
      ),
    ).toBe('gold');
  });

  it('classifies a spaced "9 Kt" title as gold', () => {
    expect(
      getWishlistItemCategory(
        makeItem('earrings', PRODUCT_CATEGORY.DEMIFINE, 'stud', 'Heart Cluster 9 Kt Stud Earring'),
      ),
    ).toBe('gold');
  });

  it('keeps demifine titles that merely contain a number before "kt"', () => {
    expect(
      getWishlistItemCategory(
        makeItem('rings', PRODUCT_CATEGORY.DEMIFINE, 'ring', 'Retro 19KTX Anti Tarnish Ring'),
      ),
    ).toBe('demifine');
  });

  it('keeps ordinary demifine titles out of gold', () => {
    expect(
      getWishlistItemCategory(
        makeItem('rings', PRODUCT_CATEGORY.DEMIFINE, 'ring', 'Everyday Stacking Ring'),
      ),
    ).toBe('demifine');
  });
});

describe('filterWishlistItems', () => {
  const items = [
    makeItem('rings', PRODUCT_CATEGORY.DEMIFINE),
    makeItem('gold rings', PRODUCT_CATEGORY.GOLD),
    makeItem('silver jewellery', PRODUCT_CATEGORY.DEMIFINE),
    makeItem('incomplete', PRODUCT_CATEGORY.DEMIFINE, ''),
  ];

  it('filters demifine products without silver-labelled overlap', () => {
    expect(filterWishlistItems(items, 'demifine')).toHaveLength(1);
  });

  it('filters gold products', () => {
    expect(filterWishlistItems(items, 'gold')).toHaveLength(1);
  });

  it('filters silver products by category label', () => {
    expect(filterWishlistItems(items, 'silver')).toHaveLength(1);
  });

  it('returns all renderable items for all tab', () => {
    expect(filterWishlistItems(items, 'all')).toHaveLength(3);
  });
});

describe('formatWishlistItemCount', () => {
  it('formats singular and plural counts', () => {
    expect(formatWishlistItemCount(1)).toBe('1 item saved');
    expect(formatWishlistItemCount(3)).toBe('3 items saved');
  });
});
