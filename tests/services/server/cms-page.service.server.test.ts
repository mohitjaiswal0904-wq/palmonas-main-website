import { getCmsPageChunk, getCmsPageShell } from '@/services/server/cms-page.service.server';

const mockGet = jest.fn();
const mockCreatePublicServerApi = jest.fn(() => ({ get: mockGet }));
const mockIsNextProductionRuntime = jest.fn(() => false);

jest.mock('@/lib/server-api', () => ({
  createPublicServerApi: () => mockCreatePublicServerApi(),
  createServerApi: jest.fn(),
}));

jest.mock('@/lib/is-next-production', () => ({
  isNextProductionRuntime: () => mockIsNextProductionRuntime(),
}));

jest.mock('@/lib/env', () => ({
  getApiBaseUrl: () => 'https://api.example.test',
}));

jest.mock('next/cache', () => ({
  unstable_cache: (fn: () => unknown) => () => fn(),
}));

const shellPayload = {
  page: { id: 'p1', slug: 'home-page', name: 'Home', is_active: true },
  version: { id: 'v1', version_number: 1, environment: 'production' },
  layouts: {
    announcement_bars: [],
    header: null,
    footer: null,
    bottom_nav: null,
  },
  chunks: {
    chunk_ids: [1],
    total_chunks: 1,
    total_sections: 1,
    manifest: [],
  },
};

const chunkPayload = {
  page: { id: 'p1', slug: 'home-page', name: 'Home', is_active: true },
  version: { id: 'v1', version_number: 1, environment: 'production' },
  environment: 'production',
  chunk_ids: [1],
  sections: [],
};

describe('cms-page.service.server', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockCreatePublicServerApi.mockClear();
    mockIsNextProductionRuntime.mockReset();
    mockIsNextProductionRuntime.mockReturnValue(false);
  });

  it('uses the public client for the shell outside production so home skips cookies', async () => {
    mockGet.mockResolvedValueOnce({ data: shellPayload });

    const result = await getCmsPageShell('home-page');

    expect(result.page.slug).toBe('home-page');
    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v2/cms/pages/slug/home-page-web/app/shell', {
      params: { platform: 'web' },
    });
  });

  it('uses the public client for the shell in production so the response is cache-safe', async () => {
    mockIsNextProductionRuntime.mockReturnValue(true);
    mockGet.mockResolvedValueOnce({ data: shellPayload });

    await getCmsPageShell('home-page');

    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
  });

  it('normalises a failed shell request', async () => {
    mockGet.mockRejectedValueOnce(new Error('cms down'));

    await expect(getCmsPageShell('home-page')).rejects.toMatchObject({
      message: expect.stringMatching(/cms down/i),
    });
  });

  it('rejects an invalid shell payload', async () => {
    mockGet.mockResolvedValueOnce({ data: { page: { slug: 'broken' } } });

    await expect(getCmsPageShell('home-page')).rejects.toBeDefined();
  });

  it('uses the public client for a chunk outside production', async () => {
    mockGet.mockResolvedValueOnce({ data: chunkPayload });

    const result = await getCmsPageChunk('home-page', 1);

    expect(result.chunk_ids).toEqual([1]);
    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
    expect(mockGet).toHaveBeenCalledWith('/api/v2/cms/pages/slug/home-page-web/app/chunks/1', {
      params: {
        products_per_collection: 12,
        platform: 'react-web',
      },
    });
  });

  it('uses the public client for a chunk in production', async () => {
    mockIsNextProductionRuntime.mockReturnValue(true);
    mockGet.mockResolvedValueOnce({ data: chunkPayload });

    await getCmsPageChunk('home-page', 1);

    expect(mockCreatePublicServerApi).toHaveBeenCalledTimes(1);
  });

  it('normalises a failed chunk request', async () => {
    mockGet.mockRejectedValueOnce(new Error('chunk down'));

    await expect(getCmsPageChunk('home-page', 1)).rejects.toMatchObject({
      message: expect.stringMatching(/chunk down/i),
    });
  });

  it('rejects an invalid chunk payload', async () => {
    mockGet.mockResolvedValueOnce({ data: { sections: [] } });

    await expect(getCmsPageChunk('home-page', 1)).rejects.toBeDefined();
  });
});
