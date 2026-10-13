import axios from 'axios';

import {
  getCollectionByHandle,
  getCollectionProducts,
} from '@/services/server/collection.service.server';

const mockGet = jest.fn();
const mockCreatePublicServerApi = jest.fn(() => ({ get: mockGet }));
const mockCreateServerApi = jest.fn(async () => ({ get: mockGet }));
const mockIsNextProductionRuntime = jest.fn(() => false);

jest.mock('@/lib/server-api', () => ({
  createPublicServerApi: () => mockCreatePublicServerApi(),
  createServerApi: () => mockCreateServerApi(),
}));

jest.mock('@/lib/is-next-production', () => ({
  isNextProductionRuntime: () => mockIsNextProductionRuntime(),
}));

jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => () => fn(),
}));

const collectionEnvelope = {
  status: 200,
  message: 'ok',
  data: {
    id: '1',
    handle: 'best-sellers',
    title: 'Best Sellers',
  },
};

const productsEnvelope = {
  status: 200,
  message: 'ok',
  data: {
    products: [],
    page: 1,
    page_size: 24,
    total: 0,
    total_pages: 0,
    has_next: false,
  },
};

describe('collection.service.server', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockCreatePublicServerApi.mockClear();
    mockCreateServerApi.mockClear();
    mockIsNextProductionRuntime.mockReset();
    mockIsNextProductionRuntime.mockReturnValue(false);
  });

  it('uses the public client outside production so metadata skips cookies', async () => {
    mockGet.mockResolvedValueOnce({ data: collectionEnvelope });

    const result = await getCollectionByHandle('best-sellers');

    expect(result.handle).toBe('best-sellers');
    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
    expect(mockCreateServerApi).not.toHaveBeenCalled();
  });

  it('uses the public client in production so the response is cache-safe', async () => {
    mockIsNextProductionRuntime.mockReturnValue(true);
    mockGet.mockResolvedValueOnce({ data: collectionEnvelope });

    await getCollectionByHandle('best-sellers');

    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
    expect(mockCreateServerApi).not.toHaveBeenCalled();
  });

  it('uses the public client for products outside production', async () => {
    mockGet.mockResolvedValueOnce({ data: productsEnvelope });

    await getCollectionProducts('best-sellers', { page: 1, limit: 24 });

    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
    expect(mockCreateServerApi).not.toHaveBeenCalled();
  });

  it('requests products with the serialised query params', async () => {
    mockGet.mockResolvedValueOnce({ data: productsEnvelope });

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
          status: 200,
          message: 'ok',
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
            has_next: false,
          },
        },
      })
      .mockResolvedValueOnce({
        data: {
          status: 200,
          message: 'ok',
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
          },
        },
      });

    const result = await getCollectionProducts('best-sellers', { page: 1, limit: 24 });

    expect(mockGet).toHaveBeenNthCalledWith(2, '/api/v2/product/id/7759111586049');
    expect(result.items[0]?.offers[0]?.name).toBe('Get any 3 for ₹2699');
  });

  it('propagates a normalised upstream failure for products', async () => {
    mockGet.mockRejectedValueOnce(new Error('network down'));

    await expect(getCollectionProducts('missing')).rejects.toBeTruthy();
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('retries collection products once after a 502', async () => {
    mockGet
      .mockRejectedValueOnce(
        new axios.AxiosError('Failed to retrieve collection products', undefined, undefined, undefined, {
          status: 502,
          data: { message: 'Failed to retrieve collection products' },
          statusText: 'Bad Gateway',
          headers: {},
          config: { headers: {} },
        } as never),
      )
      .mockResolvedValueOnce({ data: productsEnvelope });

    const result = await getCollectionProducts('best-sellers', { page: 1, limit: 24 });

    expect(result.items).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('does not retry collection products on 404', async () => {
    mockGet.mockRejectedValue(
      new axios.AxiosError('missing', undefined, undefined, undefined, {
        status: 404,
        data: { message: 'missing' },
        statusText: 'Not Found',
        headers: {},
        config: { headers: {} },
      } as never),
    );

    await expect(getCollectionProducts('gone')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockGet).toHaveBeenCalledTimes(1);
  });
});
