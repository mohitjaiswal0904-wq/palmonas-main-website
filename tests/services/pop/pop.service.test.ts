import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import {
  createPopSubscriptionFromAccount,
  getPopSubscriptionById,
  getPopSubscriptions,
} from '@/services/pop.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('pop.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getPopSubscriptions fetches and transforms list', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          count: 1,
          total: 1,
          limit: 50,
          offset: 0,
          items: [
            {
              id: 22,
              amount_paise: 100000,
              created_at: '2026-03-27T05:58:44.771595Z',
              updated_at: '2026-03-27T05:58:44.771595Z',
              custom_data: null,
              external_application_id: 1,
              paid_count: 0,
              phone_number: '+919098393937',
              razorpay_plan_id: 'plan_test',
              razorpay_subscription_id: 'sub_test',
              reference: 'pop-ref',
              remaining_count: 4,
              status: 'created',
              total_count: 5,
            },
          ],
        },
      },
    });

    const page = await getPopSubscriptions({ limit: 10, offset: 0 });

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.pop.subscriptions, {
      params: { limit: 10, offset: 0 },
    });
    expect(page.items[0]?.subscriptionId).toBe('sub_test');
  });

  it('createPopSubscriptionFromAccount posts amount and returns payment url', async () => {
    mockApi.post.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          billing_mode: 'automatic',
          custom_data: null,
          oms_reference: 'P-POP-3957',
          payment_mode: 'automatic',
          payment_url: 'https://rzp.io/rzp/test',
          plan_id: 'plan_test',
          reference: '2',
          status: 'created',
          subscription_id: 'sub_test',
          total_months: 5,
        },
      },
    });

    const result = await createPopSubscriptionFromAccount({ amount: 1000 });

    expect(mockApi.post).toHaveBeenCalledWith(ENDPOINTS.pop.subscriptions, { amount: 1000 });
    expect(result.paymentUrl).toContain('rzp.io');
  });

  it('getPopSubscriptionById tracks subscription by razorpay id', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        status: 200,
        message: 'ok',
        data: {
          billing_mode: 'automatic',
          payment_mode: 'automatic',
          oms_reference: 'P-POP-3957',
          phone_number: '9098393937',
          subscription_id: 'sub_test',
          status: 'created',
          total_months: 5,
          invoices: { count: 0, items: [] },
        },
      },
    });

    const detail = await getPopSubscriptionById('sub_test');

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.pop.subscriptionDetail('sub_test'), {
      params: { count: 50, skip: 0 },
    });
    expect(detail.subscriptionId).toBe('sub_test');
  });

  it('getPopSubscriptions normalises API errors', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(getPopSubscriptions()).rejects.toMatchObject({
      message: expect.any(String),
    });
  });
});
