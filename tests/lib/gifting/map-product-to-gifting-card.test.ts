import { formatPrice } from '@/lib/format-price';
import { mapProductToGiftingCard } from '@/lib/gifting/map-product-to-gifting-card';
import type { Product } from '@/types/product';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    handle: 'test-ring',
    name: 'Test Ring',
    description: 'Test description',
    price: 3266,
    compareAtPrice: 4500,
    image: 'https://cdn.example.com/img.jpg',
    images: ['https://cdn.example.com/img.jpg'],
    category: 'rings',
    productCategory: 'demifine',
    variants: [],
    offers: [
      {
        key: 'offer-1',
        name: 'Extra 25% OFF',
        description: 'Limited time',
        code: 'EXTRA25',
        type: 'DISCOUNT',
        discountValue: 25,
        placeholder: [],
      },
    ],
    avgRating: 4.5,
    reviewCount: 125,
    ...overrides,
  };
}

describe('mapProductToGiftingCard', () => {
  it('maps catalog fields into gifting card view model', () => {
    const card = mapProductToGiftingCard(makeProduct());

    expect(card).toEqual(
      expect.objectContaining({
        id: 'product-1',
        name: 'Test Ring',
        href: '/products/test-ring',
        imageSrc: 'https://cdn.example.com/img.jpg',
        priceLabel: formatPrice(3266),
        compareAtPriceLabel: formatPrice(4500),
        rating: '4.5',
        reviewCount: '125',
        offerLabel: 'Extra 25% OFF',
      }),
    );
  });

  it('falls back when rating and compare-at price are missing', () => {
    const card = mapProductToGiftingCard(
      makeProduct({
        compareAtPrice: undefined,
        avgRating: undefined,
        reviewCount: undefined,
        reviews: undefined,
        offers: [],
      }),
    );

    expect(card.compareAtPriceLabel).toBe('');
    expect(card.rating).toBe('—');
    expect(card.reviewCount).toBe('0');
    expect(card.offerLabel).toBe('');
  });

  it('omits compare-at label when MRP matches selling price', () => {
    const card = mapProductToGiftingCard(makeProduct({ price: 29844, compareAtPrice: 29844 }));

    expect(card.priceLabel).toBe(formatPrice(29844));
    expect(card.compareAtPriceLabel).toBe('');
  });

  it('marks bestsellers from badge or product tags', () => {
    expect(mapProductToGiftingCard(makeProduct({ badgeLabel: 'Bestseller' })).isBestseller).toBe(
      true,
    );
    expect(
      mapProductToGiftingCard(
        makeProduct({
          badgeLabel: undefined,
          productTags: [{ name: 'tag', value: 'bestseller' }],
        }),
      ).isBestseller,
    ).toBe(true);
  });

  it('does not mark ordinary products as bestsellers', () => {
    expect(mapProductToGiftingCard(makeProduct({ badgeLabel: 'New' })).isBestseller).toBe(false);
  });
});
