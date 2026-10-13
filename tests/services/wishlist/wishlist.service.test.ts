import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import {
  addToWishlist,
  clearWishlist,
  enrichWishlistCatalogFields,
  getWishlist,
  removeWishlistItem,
} from '@/services/wishlist.service';
import type { WishlistItem } from '@/types/wishlist';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock('@/services/product.service', () => ({
  getProduct: jest.fn(),
}));

jest.mock('@/lib/product/related-product-ratings', () => ({
  withRelatedProductRatings: jest.fn(async (products: unknown[]) => products),
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('wishlist.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getWishlist fetches and transforms items', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          items: [
            {
              product_id: '123',
              variant_id: '456',
              name: 'Ring',
              handle: 'ring',
              imageUrl: 'https://cdn.shopify.com/ring.jpg',
              product_category: 'demifine',
              price: 1000,
              variants: [],
            },
          ],
        },
      },
    });

    const items = await getWishlist();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.wishlist.list);
    expect(items).toHaveLength(1);
    expect(items[0]?.productId).toBe('123');
  });

  it('getWishlist does not backfill catalog offers', async () => {
    const { withRelatedProductRatings } = jest.requireMock(
      '@/lib/product/related-product-ratings',
    ) as {
      withRelatedProductRatings: jest.Mock;
    };

    mockApi.get.mockResolvedValue({
      data: {
        data: {
          items: [
            {
              product_id: '123',
              variant_id: '456',
              name: 'Ring',
              handle: 'ring',
              imageUrl: 'https://cdn.shopify.com/ring.jpg',
              product_category: 'demifine',
              price: 1000,
              variants: [],
            },
          ],
        },
      },
    });

    await getWishlist();

    expect(withRelatedProductRatings).not.toHaveBeenCalled();
  });

  it('enrichWishlistCatalogFields backfills catalog offers on wishlist products', async () => {
    const { withRelatedProductRatings } = jest.requireMock(
      '@/lib/product/related-product-ratings',
    ) as {
      withRelatedProductRatings: jest.Mock;
    };

    const items: WishlistItem[] = [
      {
        productId: '123',
        variantId: '456',
        product: {
          id: '123',
          handle: 'ring',
          name: 'Ring',
          description: '',
          price: 1000,
          image: 'https://cdn.shopify.com/ring.jpg',
          images: [],
          category: 'demifine',
          productCategory: 'demifine',
          variants: [],
          offers: [],
        },
      },
    ];

    withRelatedProductRatings.mockImplementationOnce(async (products: Array<{ id: string }>) =>
      products.map((product) => ({
        ...product,
        offers: [
          {
            key: 'EXTRA10',
            name: 'Extra 10% off',
            description: '',
            code: 'EXTRA10',
            type: 'DISCOUNT',
            discountValue: 10,
            placeholder: [],
          },
        ],
      })),
    );

    const enriched = await enrichWishlistCatalogFields(items);

    const { getProduct } = jest.requireMock('@/services/product.service') as {
      getProduct: jest.Mock;
    };

    expect(withRelatedProductRatings).toHaveBeenCalledWith(expect.any(Array), getProduct);
    expect(enriched[0]?.product.offers[0]?.name).toBe('Extra 10% off');
  });

  it('clearWishlist deletes the wishlist endpoint', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });

    await clearWishlist();

    expect(mockApi.delete).toHaveBeenCalledWith(ENDPOINTS.wishlist.clear);
  });

  it('addToWishlist posts productId to the add endpoint', async () => {
    mockApi.post.mockResolvedValue({ data: {} });

    await addToWishlist('product-123');

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.wishlist.add, {
      productId: 'product-123',
    });
  });

  it('addToWishlist normalises API errors', async () => {
    mockApi.post.mockRejectedValue(new Error('network'));

    await expect(addToWishlist('product-123')).rejects.toMatchObject({
      message: expect.any(String),
    });
  });

  it('removeWishlistItem deletes product without query params', async () => {
    mockApi.delete.mockResolvedValue({ data: {} });

    await removeWishlistItem('1234');

    expect(mockApi.delete).toHaveBeenCalledWith(ENDPOINTS.wishlist.removeProduct('1234'));
  });
});
