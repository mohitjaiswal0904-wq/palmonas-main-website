import { api } from '@/lib/api-client';
import { ENDPOINTS } from '@/lib/endpoints';
import { fetchWalletDetails } from '@/services/user/wallet.service';

jest.mock('@/lib/api-client', () => ({
  api: {
    get: jest.fn(),
  },
}));

const mockApi = api as jest.Mocked<typeof api>;

describe('wallet.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetchWalletDetails calls v2 user wallet endpoint and transforms balance', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: {
          birthdate: null,
          customer_email: 'user@example.com',
          gender: null,
          loyalty_points_balance: 100,
          name: 'Test User',
          phone_number: '9876543210',
          referral_code: 'REF1',
          refund_store_credit_balance: 50,
          shopify_created_at: '2024-01-01',
          shopify_customer_id: 123,
        },
      },
    });

    const wallet = await fetchWalletDetails();

    expect(mockApi.get).toHaveBeenCalledWith(ENDPOINTS.user.wallet);
    expect(wallet.balance).toBe(150);
    expect(wallet.loyaltyPoints).toBe(100);
    expect(wallet.refundCredit).toBe(50);
    expect(wallet.customerEmail).toBe('user@example.com');
  });

  it('normalises API errors from fetchWalletDetails', async () => {
    mockApi.get.mockRejectedValue(new Error('network'));

    await expect(fetchWalletDetails()).rejects.toThrow();
  });

  it('unwraps raw wallet payload without envelope', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        birthdate: null,
        customer_email: 'user@example.com',
        gender: null,
        loyalty_points_balance: 0,
        name: 'Test User',
        phone_number: '9876543210',
        referral_code: 'REF1',
        refund_store_credit_balance: 25,
        shopify_created_at: '2024-01-01',
        shopify_customer_id: 123,
      },
    });

    const wallet = await fetchWalletDetails();
    expect(wallet.balance).toBe(25);
  });

  it('falls back to raw payload when envelope data is undefined', async () => {
    mockApi.get.mockResolvedValue({
      data: {
        data: undefined,
        status: 200,
      },
    });

    const wallet = await fetchWalletDetails();
    expect(wallet.balance).toBe(0);
  });
});
