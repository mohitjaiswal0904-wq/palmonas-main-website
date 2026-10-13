import axios from 'axios';

import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { getProductBundles, getProductByHandle, getRelatedProducts } from '@/services/product.service';
import { transformProductBundles } from '@/services/product-transform';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

jest.mock('@/services/product-transform', () => ({
  transformProductList: jest.fn((data: unknown) => data),
  transformProductBundles: jest.fn((data: unknown) => data),
  transformProductDetail: jest.fn((data: unknown) => data),
}));

const mockApi = api as jest.Mocked<typeof api>;
const mockTransformProductBundles = transformProductBundles as jest.MockedFunction<
  typeof transformProductBundles
>;

function makeAxiosError(status: number, message: string) {
  return new axios.AxiosError(message, undefined, undefined, undefined, {
    status,
    data: { message },
    statusText: 'Error',
    headers: {},
    config: { headers: {} },
  } as never);
}

describe('product.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getRelatedProducts returns recommendations without product search enrichment', async () => {
    const items = [{ id: 'p1', handle: 'ring-1', offers: [] }];
    mockApi.get.mockResolvedValue({
      data: { items, total: 1, page: 1, totalPages: 1, hasNext: false },
    });

    const result = await getRelatedProducts('8031388041473');

    expect(mockApi.get).toHaveBeenCalledTimes(1);
    expect(mockApi.get).toHaveBeenCalledWith(
      ENDPOINTS.products.recommendations('8031388041473'),
    );
    expect(result).toEqual(items);
  });

  it('getProductBundles calls the handle bundles endpoint', async () => {
    const bundles = [{ key: 'shop_the_look', title: 'Shop the Look', products: [] }];
    mockApi.get.mockResolvedValue({ data: { bundles } });
    mockTransformProductBundles.mockReturnValue(bundles);

    const result = await getProductBundles('hearts-all-over-bracelet-18k-gold-plated-88883');

    expect(mockApi.get).toHaveBeenCalledWith(
      ENDPOINTS.products.bundles('hearts-all-over-bracelet-18k-gold-plated-88883'),
    );
    expect(mockTransformProductBundles).toHaveBeenCalledWith({ bundles });
    expect(result).toEqual(bundles);
  });

  it('getProductBundles normalises request failures', async () => {
    mockApi.get.mockRejectedValue(new Error('network down'));

    await expect(getProductBundles('missing-handle')).rejects.toMatchObject({
      message: 'network down',
    });
  });

  it('retries getProductByHandle once after a 502', async () => {
    const product = { id: '1', handle: 'ring' };
    mockApi.get
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'))
      .mockResolvedValueOnce({ data: product });

    await expect(getProductByHandle('ring')).resolves.toEqual(product);
    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });

  it('does not retry getProductByHandle on 404', async () => {
    mockApi.get.mockRejectedValue(makeAxiosError(404, 'missing'));

    await expect(getProductByHandle('gone')).rejects.toMatchObject({ code: 'NOT_FOUND' });
    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });

  it('throws when getProductByHandle 502 retry fails', async () => {
    mockApi.get
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'))
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'));

    await expect(getProductByHandle('ring')).rejects.toMatchObject({ code: 'SERVER_ERROR' });
    expect(mockApi.get).toHaveBeenCalledTimes(2);
  });
});
