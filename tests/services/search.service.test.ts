import { SEARCH_HISTORY_LIMIT } from '@/config/search/search.config';
import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { AppError } from '@/lib/errors';
import { getSearchHistory } from '@/services/search.service';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('getSearchHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns query strings from the history envelope', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'Search history retrieved successfully',
        data: {
          queries: [
            { query: 'Mangalsutra', created_at: '2025-12-19T13:42:35.261660+00:00' },
            { query: 'Diamond', created_at: '2025-12-19T13:39:59.888264+00:00' },
          ],
          count: 2,
        },
      },
    });

    await expect(getSearchHistory()).resolves.toEqual(['Mangalsutra', 'Diamond']);
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.search.history, {
      params: { limit: SEARCH_HISTORY_LIMIT },
    });
  });

  it('respects an explicit limit and slices results', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          queries: [{ query: 'A' }, { query: 'B' }, { query: 'C' }],
          count: 3,
        },
      },
    });

    await expect(getSearchHistory(2)).resolves.toEqual(['A', 'B']);
    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.search.history, {
      params: { limit: 2 },
    });
  });

  it('returns an empty list when history is empty', async () => {
    mockApi.get.mockResolvedValue({
      data: { data: { queries: [], count: 0 } },
    });

    await expect(getSearchHistory()).resolves.toEqual([]);
  });

  it('throws a normalised AppError when the request fails', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(getSearchHistory()).rejects.toBeInstanceOf(AppError);
  });
});
