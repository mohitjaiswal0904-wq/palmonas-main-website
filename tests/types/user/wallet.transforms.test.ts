import { transformWalletResponse } from '@/types/user/wallet.transforms';

describe('transformWalletResponse', () => {
  it('sums loyalty and refund store credit into balance', () => {
    const result = transformWalletResponse({
      birthdate: null,
      customer_email: 'user@example.com',
      gender: null,
      loyalty_points_balance: 150,
      name: 'Test User',
      phone_number: '9876543210',
      referral_code: 'REF1',
      refund_store_credit_balance: 350,
      shopify_created_at: '2024-01-01',
      shopify_customer_id: 123,
    });

    expect(result).toEqual({
      balance: 500,
      loyaltyPoints: 150,
      refundCredit: 350,
      currency: 'INR',
      customerEmail: 'user@example.com',
      customerName: 'Test User',
      phoneNumber: '9876543210',
      referralCode: 'REF1',
      shopifyCustomerId: 123,
    });
  });

  it('defaults missing balances to zero', () => {
    const result = transformWalletResponse({
      birthdate: null,
      customer_email: 'user@example.com',
      gender: null,
      loyalty_points_balance: undefined as unknown as number,
      name: 'Test User',
      phone_number: '9876543210',
      referral_code: 'REF1',
      refund_store_credit_balance: undefined as unknown as number,
      shopify_created_at: '2024-01-01',
      shopify_customer_id: 123,
    });

    expect(result.balance).toBe(0);
  });
});
