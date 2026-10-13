import {
  GIFTING_BESTSELLERS,
  GIFTING_BY_PRICE,
  GIFTING_CATEGORY_COLLECTION_HANDLE,
  GIFTING_CATEGORY_FILTERS,
  GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE,
  GIFTING_FREE_GIFTS,
  GIFTING_GIFT_CARDS,
  GIFTING_HERO,
  GIFTING_OCCASIONS,
  GIFTING_PALMONAS_GIFTS,
  GIFTING_RELATIONSHIPS,
} from '@/config/gifting/gifting.config';

describe('gifting.config', () => {
  it('exposes hero copy and CTA for the gifting landing page', () => {
    expect(GIFTING_HERO.title).toBe('Thoughtful Gifts, Curated with Love');
    expect(GIFTING_HERO.ctaHref).toBe('/collections/all');
    expect(GIFTING_HERO.mobileImageSrc).toContain('First_Banner.jpg');
    expect(GIFTING_HERO.desktopImageSrc).toContain('First_Hero_Banner.png');
  });

  it('includes three Palmonas gift categories', () => {
    expect(GIFTING_PALMONAS_GIFTS).toHaveLength(3);
    expect(GIFTING_PALMONAS_GIFTS.map((card) => card.title)).toEqual([
      'Palmonas Jewellery',
      'Gift Bundles',
      'Budget Gifts',
    ]);
    expect(GIFTING_PALMONAS_GIFTS.map((card) => card.mobileImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Palmonas_jewellery.png'),
        expect.stringContaining('Gift_Bundles.png'),
        expect.stringContaining('Budget_Gifts.png'),
      ]),
    );
    expect(GIFTING_PALMONAS_GIFTS.map((card) => card.desktopImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Palmonas_jewellery_18ac2344'),
        expect.stringContaining('Gift_Bundle.png'),
        expect.stringContaining('Budget_Gifts_b3749d10'),
      ]),
    );
  });

  it('includes four occasion tiles', () => {
    expect(GIFTING_OCCASIONS).toHaveLength(4);
    expect(GIFTING_OCCASIONS[0]?.title).toBe('Anniversary');
    expect(GIFTING_OCCASIONS.map((occasion) => occasion.mobileImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Anniversary.png'),
        expect.stringContaining('Birthday_'),
        expect.stringContaining('Festive.png'),
        expect.stringContaining('Just_Because.png'),
      ]),
    );
    expect(GIFTING_OCCASIONS.map((occasion) => occasion.desktopImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Anniversary_16497408'),
        expect.stringContaining('Birthday_03a61ebd'),
        expect.stringContaining('Festive_f32221a9'),
        expect.stringContaining('Just_Because_f1020874'),
      ]),
    );
  });

  it('starts category filters with All', () => {
    expect(GIFTING_CATEGORY_FILTERS[0]?.id).toBe('all');
    expect(GIFTING_CATEGORY_FILTERS.length).toBeGreaterThanOrEqual(4);
    expect(GIFTING_CATEGORY_COLLECTION_HANDLE).toBe('best-sellers');
    expect(GIFTING_CATEGORY_PRODUCTS_PAGE_SIZE).toBeGreaterThan(0);
    expect(GIFTING_CATEGORY_FILTERS.map((filter) => filter.collectionHandle)).toEqual([
      'best-sellers',
      'rings',
      'earrings',
      'necklaces',
      'bracelets',
    ]);
  });

  it('includes relationship and price discovery cards', () => {
    expect(GIFTING_RELATIONSHIPS.cards).toHaveLength(3);
    expect(GIFTING_RELATIONSHIPS.cards.map((card) => card.mobileImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('For_Her.png'),
        expect.stringContaining('For_Him.png'),
        expect.stringContaining('For_Friend.png'),
      ]),
    );
    expect(GIFTING_RELATIONSHIPS.cards.map((card) => card.desktopImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('For_Her_a970e03f'),
        expect.stringContaining('For_Him_a3202c65'),
        expect.stringContaining('For_Friend_2b62d658'),
      ]),
    );
    expect(GIFTING_BY_PRICE).toHaveLength(4);
    expect(GIFTING_BY_PRICE.map((card) => card.mobileImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('/2k.png'),
        expect.stringContaining('/5k.png'),
        expect.stringContaining('/10k.png'),
        expect.stringContaining('Premium_Gifts.png'),
      ]),
    );
    expect(GIFTING_BY_PRICE.map((card) => card.desktopImageSrc)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('2k_da69e4e8'),
        expect.stringContaining('5k_86a49a6d'),
        expect.stringContaining('10k_cb0c7a25'),
        expect.stringContaining('Premium_Gifts_28fa9e5e'),
      ]),
    );
    expect(GIFTING_BESTSELLERS.collectionHandle).toBe('new-arrivals');
    expect(GIFTING_BESTSELLERS.title).toBe('Demifine Bestsellers');
  });

  it('fails closed when required hero fields are missing', () => {
    expect(GIFTING_HERO.offerLabel).toBeTruthy();
    expect(GIFTING_HERO.ctaLabel).toBeTruthy();
  });

  it('uses the supplied complete mobile free-gifts banner', () => {
    expect(GIFTING_FREE_GIFTS.mobileImageSrc).toContain('Free_Gifts.png');
    expect(GIFTING_FREE_GIFTS.desktopImageSrc).toContain('Free_Gifts_df481433');
    expect(GIFTING_FREE_GIFTS.ctaHref).toBe('/collections/all');
  });

  it('uses the supplied complete mobile gift-card banner', () => {
    expect(GIFTING_GIFT_CARDS.mobileImageSrc).toContain('Gift_Card.png');
    expect(GIFTING_GIFT_CARDS.desktopImageSrc).toContain('Gift_Cards.png');
    expect(GIFTING_GIFT_CARDS.ctaHref).toBe('/cart/gift-cards');
  });
});
