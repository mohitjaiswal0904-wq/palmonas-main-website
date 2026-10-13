import {
  getWishlistCategoryExploreCta,
  wishlistMessages,
} from '@/config/wishlist/wishlist.config';

describe('getWishlistCategoryExploreCta', () => {
  it('returns the gold collection CTA', () => {
    expect(getWishlistCategoryExploreCta('gold')).toEqual({
      href: '/collections/9kt-fine-gold',
      label: wishlistMessages.labels.exploreGold,
      ariaLabel: wishlistMessages.a11y.exploreGold,
    });
  });

  it('returns the demifine collection CTA', () => {
    expect(getWishlistCategoryExploreCta('demifine')).toEqual({
      href: '/collections/shop-by-category',
      label: wishlistMessages.labels.exploreDemifine,
      ariaLabel: wishlistMessages.a11y.exploreDemifine,
    });
  });

  it('returns the all collection CTA', () => {
    expect(getWishlistCategoryExploreCta('all')).toEqual({
      href: '/collections/best-sellers',
      label: wishlistMessages.labels.exploreAll,
      ariaLabel: wishlistMessages.a11y.exploreAll,
    });
  });

  it('returns null for silver', () => {
    expect(getWishlistCategoryExploreCta('silver')).toBeNull();
  });
});
