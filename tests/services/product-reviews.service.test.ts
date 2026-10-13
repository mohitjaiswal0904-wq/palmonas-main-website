import { api } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { createProductReview, getProductReviews } from '@/services/product-reviews.service';

jest.mock('@/lib/api', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockGet = api.get as jest.MockedFunction<typeof api.get>;
const mockPost = api.post as jest.MockedFunction<typeof api.post>;

const reviewRow = {
  id: 1,
  product_id: 1,
  variant_id: null,
  customer_id: null,
  rating: 5,
  title: 'Meera R.',
  body: 'Lovely piece overall',
  status: 'visible',
  is_verified_purchase: true,
  helpful_count: 1,
  not_helpful_count: 0,
  report_count: 0,
  created_at: '2026-07-31T09:52:03.103146Z',
  updated_at: '2026-07-31T09:52:03.103146Z',
};

const reviewsPayload = {
  product_id: 1,
  reviews: [reviewRow],
  stats: {
    product_id: 1,
    reviews_count: 10,
    rating_count: 10,
    average_rating: 4.8,
    rating_distribution: null,
  },
  count: 1,
  page: 1,
  page_size: 4,
  total_count: 10,
  has_next: true,
};

describe('getProductReviews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches Most Relevant reviews as five-star rating', async () => {
    mockGet.mockResolvedValue({ data: { data: reviewsPayload } } as never);

    await getProductReviews('8417236779265', {
      page: 1,
      pageSize: 4,
      filter: { kind: 'relevant' },
    });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.products.reviews('8417236779265'), {
      params: { rating: 5, page: 1, page_size: 4 },
    });
  });

  it('fetches reviews with period filter only', async () => {
    mockGet.mockResolvedValue({ data: { data: reviewsPayload } } as never);

    await getProductReviews('8417236779265', {
      page: 1,
      pageSize: 4,
      filter: { kind: 'period', period: 'most_recent' },
    });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.products.reviews('8417236779265'), {
      params: { period: 'most_recent', page: 1, page_size: 4 },
    });
  });

  it('sends only rating param when star filter is active', async () => {
    mockGet.mockResolvedValue({ data: { data: reviewsPayload } } as never);

    await getProductReviews('7759111586049', {
      page: 1,
      pageSize: 20,
      filter: { kind: 'rating', rating: 5 },
    });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.products.reviews('7759111586049'), {
      params: { rating: 5, page: 1, page_size: 20 },
    });
  });

  it('sends only period param for non-default period filter', async () => {
    mockGet.mockResolvedValue({ data: { data: reviewsPayload } } as never);

    await getProductReviews('7759111586049', {
      page: 1,
      pageSize: 20,
      filter: { kind: 'period', period: 'all' },
    });

    expect(mockGet).toHaveBeenCalledWith(ENDPOINTS.products.reviews('7759111586049'), {
      params: { period: 'all', page: 1, page_size: 20 },
    });
  });

  it('throws normalised error when API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network down'));

    await expect(
      getProductReviews('1', {
        page: 1,
        pageSize: 4,
        filter: { kind: 'period', period: 'most_recent' },
      }),
    ).rejects.toMatchObject({ code: expect.any(String) });
  });
});

describe('createProductReview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts JSON when no image is attached', async () => {
    mockPost.mockResolvedValue({ data: { data: reviewRow } } as never);

    const result = await createProductReview('8417236779265', {
      rating: 5,
      body: 'Lovely piece overall',
    });

    expect(mockPost).toHaveBeenCalledWith(ENDPOINTS.products.reviews('8417236779265'), {
      rating: 5,
      body: 'Lovely piece overall',
    });
    expect(result.reviewerName).toBe('Meera R.');
    expect(result.body).toBe('Lovely piece overall');
  });

  it('posts multipart FormData when an image is attached', async () => {
    mockPost.mockResolvedValue({ data: { data: reviewRow } } as never);
    const file = new File(['img'], 'shot.jpg', { type: 'image/jpeg' });

    await createProductReview('8417236779265', {
      rating: 4,
      body: 'Nice quality and finish',
      image: file,
    });

    expect(mockPost).toHaveBeenCalledTimes(1);
    const [, body, config] = mockPost.mock.calls[0] ?? [];
    expect(body).toBeInstanceOf(FormData);
    expect((body as FormData).get('rating')).toBe('4');
    expect((body as FormData).get('body')).toBe('Nice quality and finish');
    expect((body as FormData).get('image')).toBe(file);
    expect(config).toMatchObject({
      headers: { 'Content-Type': undefined },
    });
  });

  it('throws normalised error on 401', async () => {
    mockPost.mockRejectedValue({
      isAxiosError: true,
      response: { status: 401, data: { message: 'Not authenticated' } },
      message: 'Request failed',
    });

    await expect(
      createProductReview('1', { rating: 5, body: 'Enough characters here' }),
    ).rejects.toMatchObject({ code: 'UNAUTHORISED' });
  });

  it('throws normalised error on network failure', async () => {
    mockPost.mockRejectedValue(new Error('Network down'));

    await expect(
      createProductReview('1', { rating: 5, body: 'Enough characters here' }),
    ).rejects.toMatchObject({ code: expect.any(String) });
  });
});
