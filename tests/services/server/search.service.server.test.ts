import { ENDPOINTS } from '@/lib/endpoints';
import { searchProductsList } from '@/services/server/search.service.server';

const mockPublicGet = jest.fn();
const mockAuthGet = jest.fn();

jest.mock('@/lib/server-api', () => ({
  createPublicServerApi: () => ({ get: mockPublicGet }),
  createServerApi: jest.fn(async () => ({ get: mockAuthGet })),
}));

jest.mock('@/lib/is-next-production', () => ({
  isNextProductionRuntime: jest.fn(),
}));

const { isNextProductionRuntime } = jest.requireMock('@/lib/is-next-production') as {
  isNextProductionRuntime: jest.Mock;
};

describe('searchProductsList (server)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockPublicGet.mockResolvedValue({
      data: {
        data: {
          products: [{ id: 'gid://shopify/Product/1', name: 'Ring', price: 999 }],
          count: 1,
          has_next: false,
        },
      },
    });
    mockAuthGet.mockResolvedValue({
      data: {
        data: {
          products: [{ id: 'gid://shopify/Product/2', name: 'Band', price: 799 }],
          count: 1,
          has_next: false,
        },
      },
    });
  });

  it('uses the public server client in production runtime', async () => {
    isNextProductionRuntime.mockReturnValue(true);

    const response = await searchProductsList({ query: 'rin', limit: 20 });

    expect(mockPublicGet).toHaveBeenCalledWith(ENDPOINTS.search.products, {
      params: expect.objectContaining({ q: 'rin', page_size: 20 }),
    });
    expect(mockPublicGet.mock.calls[0]?.[1]?.params).not.toHaveProperty('available');
    expect(mockAuthGet).not.toHaveBeenCalled();
    expect(response.items[0]?.name).toBe('Ring');
  });

  it('uses the authenticated server client in non-production runtime', async () => {
    isNextProductionRuntime.mockReturnValue(false);

    const response = await searchProductsList({ query: 'rin', limit: 20 });

    expect(mockAuthGet).toHaveBeenCalledWith(ENDPOINTS.search.products, {
      params: expect.objectContaining({ q: 'rin', page_size: 20 }),
    });
    expect(mockAuthGet.mock.calls[0]?.[1]?.params).not.toHaveProperty('available');
    expect(mockPublicGet).not.toHaveBeenCalled();
    expect(response.items[0]?.name).toBe('Band');
  });
});
