import { api } from '@/lib/api-client';
import { AppError } from '@/lib/errors';
import { ENDPOINTS } from '@/lib/endpoints';
import { createPopSubscription, getPopSubscriptionDetail, listPopSubscriptions } from '@/services/pop.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

const details = {
  name: 'Pranav Arya',
  phone: '9833290022',
  email: 'pranavleo22@gmail.com',
  addressLine1: 'CHS',
  addressLine2: '',
  city: 'Navi Mumbai',
  pincode: '400614',
  enrollmentMethod: 'online' as const,
  storeId: '',
  autopay: true,
  acceptedTerms: true,
};

describe('createPopSubscription', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('posts the mapped payload to /api/v2/pop/subscriptions', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        data: {
          id: 'sub_1',
          payment_url: 'https://pay.example/abc',
        },
      },
    });

    const result = await createPopSubscription({
      amount: 3000,
      details,
      callbackUrl: 'https://palmonas.com/pop',
    });

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.pop.subscriptions, {
      amount: 3000,
      source: 'online',
      payment_type: 'automatic',
      callback_url: 'https://palmonas.com/pop',
      custom_data: expect.objectContaining({
        name: 'Pranav Arya',
        phone: '9833290022',
        store_id: null,
      }),
    });
    expect(result.paymentUrl).toBe('https://pay.example/abc');
    expect(result.id).toBe('sub_1');
  });

  it('throws a normalised AppError when the request fails', async () => {
    mockApi.post.mockRejectedValue(new Error('network down'));

    await expect(
      createPopSubscription({
        amount: 1000,
        details,
        callbackUrl: 'https://palmonas.com/pop',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});

describe('listPopSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches subscriptions with default pagination', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'POP subscriptions fetched successfully',
        data: {
          count: 1,
          total: 1,
          limit: 50,
          offset: 0,
          items: [{ id: 1, amount_paise: 300000, status: 'active', razorpay_subscription_id: 'sub_1' }],
        },
      },
    });

    const result = await listPopSubscriptions();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.pop.subscriptions, {
      params: { limit: 50, offset: 0 },
    });
    expect(result.plans).toHaveLength(1);
    expect(result.plans[0]?.monthlyAmount).toBe(3000);
    expect(result.total).toBe(1);
  });

  it('throws a normalised AppError when the request fails', async () => {
    mockApi.get.mockRejectedValue(new Error('network down'));

    await expect(listPopSubscriptions()).rejects.toBeInstanceOf(AppError);
  });
});

describe('getPopSubscriptionDetail', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches instalments with count and skip params', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        data: {
          subscription: { id: 9, amount_paise: 300000, paid_count: 1, total_count: 5 },
          items: [{ id: 1, instalment_number: 1, status: 'paid', amount_paise: 300000 }],
        },
      },
    });

    const result = await getPopSubscriptionDetail('sub_RaNdOmId123', { count: 6, skip: 0 });

    expect(mockApi.get).toHaveBeenCalledWith('/api/v2/pop/subscriptions/sub_RaNdOmId123', {
      params: { count: 6, skip: 0 },
    });
    expect(result.subscriptionId).toBe('sub_RaNdOmId123');
    expect(result.instalments.length).toBeGreaterThan(0);
  });

  it('throws a normalised AppError when the request fails', async () => {
    mockApi.get.mockRejectedValue(new Error('network down'));

    await expect(getPopSubscriptionDetail('9')).rejects.toBeInstanceOf(AppError);
  });
});
