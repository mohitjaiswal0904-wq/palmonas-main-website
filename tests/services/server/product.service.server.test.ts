import axios from 'axios';

import { ENDPOINTS } from '@/lib/endpoints';
import { AppError } from '@/lib/errors';
import { getProductByHandle } from '@/services/server/product.service.server';

const mockGet = jest.fn();

jest.mock('@/lib/server-api', () => ({
  createServerApi: jest.fn(async () => ({ get: mockGet })),
}));

jest.mock('@/services/product-transform', () => ({
  transformProductDetail: jest.fn((data: unknown) => data),
  transformProductList: jest.fn((data: unknown) => data),
}));

function makeAxiosError(status: number, message: string) {
  return new axios.AxiosError(message, undefined, undefined, undefined, {
    status,
    data: { message },
    statusText: 'Error',
    headers: {},
    config: { headers: {} },
  } as never);
}

describe('getProductByHandle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the product on the first successful fetch', async () => {
    const product = { id: '1', handle: 'ring' };
    mockGet.mockResolvedValue({ data: product });

    await expect(getProductByHandle('ring')).resolves.toEqual(product);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.products.detailFromRouteParam('ring'));
  });

  it('retries once after a 502 and succeeds', async () => {
    const product = { id: '1', handle: '9299764412673' };
    mockGet
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'))
      .mockResolvedValueOnce({ data: product });

    await expect(getProductByHandle('9299764412673')).resolves.toEqual(product);
    expect(mockGet).toHaveBeenCalledTimes(2);
  });

  it('does not retry a 404', async () => {
    mockGet.mockRejectedValue(makeAxiosError(404, 'missing'));

    await expect(getProductByHandle('gone')).rejects.toBeInstanceOf(AppError);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('throws after a second 502', async () => {
    mockGet
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'))
      .mockRejectedValueOnce(makeAxiosError(502, 'Failed to retrieve product'));

    await expect(getProductByHandle('ring')).rejects.toMatchObject({
      code: 'SERVER_ERROR',
      statusCode: 502,
    });
    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
