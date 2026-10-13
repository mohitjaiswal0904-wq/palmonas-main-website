import { api } from '@/lib/api';
import { getCollectionProducts } from '@/services/collection.service';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockGet = api.get as jest.MockedFunction<typeof api.get>;

describe('getCollectionProducts', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('requests collection products for the handle', async () => {
    mockGet.mockResolvedValueOnce({
      data: {
        data: {
          products: [],
          page: 1,
          page_size: 24,
          total: 0,
          total_pages: 0,
          has_next: false,
        },
      },
    } as never);

    const result = await getCollectionProducts('best-sellers', { page: 1, limit: 24 });

    expect(result.items).toEqual([]);
    expect(mockGet).toHaveBeenCalledWith(
      '/api/v2/shopify/collections/best-sellers/products',
      expect.objectContaining({
        params: expect.objectContaining({ page: 1, page_size: 24 }),
      }),
    );
  });

  it('hydrates empty demifine listing discounts from product detail', async () => {
    mockGet
      .mockResolvedValueOnce({
        data: {
          data: {
            products: [
              {
                id: 'gid://shopify/Product/7759111586049',
                name: 'Hearts All Over Bracelet',
                product_category: 'demifine',
                price: 999,
                discounts: [],
              },
            ],
            page: 1,
            page_size: 24,
            total: 1,
            total_pages: 1,
            has_next: false,
          },
        },
      } as never)
      .mockResolvedValueOnce({
        data: {
          data: {
            product: {
              id: '7759111586049',
              name: 'Hearts All Over Bracelet',
              product_category: 'demifine',
              price: 999,
              offers: [
                {
                  key: 'MONSOON3',
                  name: 'Get any 3 for ₹2699',
                  code: 'MONSOON3',
                  type: 'DISCOUNT',
                },
              ],
            },
            discount_info: [
              {
                key: 'MONSOON2',
                name: 'Get any 2 for ₹1899',
                code: 'MONSOON2',
                type: 'DISCOUNT',
              },
            ],
          },
        },
      } as never);

    const result = await getCollectionProducts('best-sellers');

    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v2/product/id/7759111586049');
    expect(result.items[0]?.offers.map((offer) => offer.code)).toEqual(['MONSOON3', 'MONSOON2']);
    expect(result.offers).toEqual(['Get any 3 for ₹2699', 'Get any 2 for ₹1899']);
  });

  it('propagates normalised API failures', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'));

    await expect(getCollectionProducts('missing')).rejects.toBeTruthy();
  });
});
