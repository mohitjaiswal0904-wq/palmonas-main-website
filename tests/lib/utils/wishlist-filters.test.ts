import {
  filterWishlistItems,
  getVisibleWishlistCategorySections,
  groupWishlistItemsByCategory,
} from '@/lib/utils/wishlist-filters';
import { PRODUCT_CATEGORY } from '@/types/product';
import type { WishlistItem } from '@/types/wishlist';

function createWishlistItem(
  productId: string,
  productCategory: (typeof PRODUCT_CATEGORY)[keyof typeof PRODUCT_CATEGORY],
  categoryLabel: string,
  name = `Product ${productId}`,
): WishlistItem {
  return {
    productId,
    variantId: `${productId}-variant`,
    product: {
      id: productId,
      handle: productId,
      name,
      description: '',
      price: 999,
      compareAtPrice: 1299,
      image: 'https://example.com/product.jpg',
      images: ['https://example.com/product.jpg'],
      category: categoryLabel,
      productCategory,
      offers: [],
      variants: [],
    },
  };
}

describe('wishlist-filters grouping', () => {
  const items: WishlistItem[] = [
    createWishlistItem('1', PRODUCT_CATEGORY.DEMIFINE, 'Rings'),
    createWishlistItem('2', PRODUCT_CATEGORY.GOLD, 'Gold Necklace'),
    createWishlistItem('3', PRODUCT_CATEGORY.DEMIFINE, 'Silver Ring'),
    createWishlistItem('4', PRODUCT_CATEGORY.DEMIFINE, 'Other'),
  ];

  it('groups wishlist items into vertical category sections', () => {
    const groups = groupWishlistItemsByCategory(items);

    expect(groups.demifine).toHaveLength(2);
    expect(groups.gold).toHaveLength(1);
    expect(groups.silver).toHaveLength(1);
    expect(groups.other).toHaveLength(0);
  });

  it('returns only sections that contain items', () => {
    const groups = groupWishlistItemsByCategory(items);

    expect(getVisibleWishlistCategorySections(groups)).toEqual(['demifine', 'gold', 'silver']);
  });

  it('still filters items for legacy tab filtering', () => {
    expect(filterWishlistItems(items, 'gold')).toHaveLength(1);
  });

  it('groups 9KT fine-gold titles under gold instead of demifine', () => {
    // Wishlist payloads that omit `product_category` default to demifine, which used to
    // strand fine-gold products on the Demifine tab.
    const withFineGold = [
      ...items,
      createWishlistItem(
        '5',
        PRODUCT_CATEGORY.DEMIFINE,
        'pendants',
        'Sleek Bar 9KT Gold Laboratory Grown Diamond Pendant',
      ),
    ];

    const groups = groupWishlistItemsByCategory(withFineGold);

    expect(groups.gold).toHaveLength(2);
    expect(groups.demifine).toHaveLength(2);
    expect(filterWishlistItems(withFineGold, 'gold')).toHaveLength(2);
  });
});
