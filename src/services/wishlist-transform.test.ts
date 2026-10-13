import { transformWishlistResponse } from '@/services/wishlist-transform';

describe('transformWishlistResponse', () => {
  it('maps nested data.items into wishlist items', () => {
    const result = transformWishlistResponse({
      data: {
        items: [
          {
            product_id: '9043668861185',
            variant_id: '48169982296321',
            name: 'Textured Disc Open Ring',
            handle: 'textured-disc-open-ring',
            imageUrl: 'https://cdn.shopify.com/image.jpg',
            product_category: 'demifine',
            price: 2379,
            originalPrice: 2854,
            variants: [
              {
                id: '48169982296321',
                title: 'GOLD',
                price: 2379,
                availableForSale: true,
                selectedOptions: [],
              },
            ],
          },
        ],
      },
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.productId).toBe('9043668861185');
    expect(result[0]?.variantId).toBe('48169982296321');
    expect(result[0]?.product.name).toBe('Textured Disc Open Ring');
    expect(result[0]?.product.productCategory).toBe('demifine');
  });

  it('supports top-level products arrays', () => {
    const result = transformWishlistResponse({
      products: [
        {
          id: '123',
          variant_id: '456',
          name: 'Silver Ring',
          handle: 'silver-ring',
          imageUrl: 'https://cdn.shopify.com/silver.jpg',
          product_category: 'demifine',
          price: 999,
          variants: [],
        },
      ],
    });

    expect(result[0]?.productId).toBe('123');
    expect(result[0]?.variantId).toBe('456');
  });

  it('returns an empty variant id when none is available', () => {
    const result = transformWishlistResponse({
      products: [
        {
          id: '123',
          name: 'Ring',
          handle: 'ring',
          imageUrl: 'https://cdn.shopify.com/ring.jpg',
          product_category: 'demifine',
          price: 999,
          variants: [],
        },
      ],
    });

    expect(result[0]?.variantId).toBe('');
  });
});
